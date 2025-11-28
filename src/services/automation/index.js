// src/services/automation/index.js

const NHSJobsAutomation = require('./nhsJobsAutomation');
const emailService = require('../emailService');
const TextResume = require('../../models/TextResume');
const NHSCredential = require('../../models/NHSCredential');
const ApplicationConfig = require('../../models/ApplicationConfig');
const Application = require('../../models/Application');
const User = require('../../models/User');

/**
 * Start the automation process for a user
 * @param {number} userId - The user ID
 * @param {number} configId - The application config ID to use
 * @param {object} options - Additional options
 */
async function startAutomation(userId, configId, options = {}) {
    console.log(`[ORCHESTRATOR] Starting automation for user ${userId} with config ${configId}`);

    try {
        // Fetch user's NHS credentials
        const nhsCredentials = await NHSCredential.getCredentials(userId, 'england');
        if (!nhsCredentials) {
            throw new Error('NHS England credentials not found. Please save your credentials in Settings.');
        }

        // Fetch user's default text resume
        const textResume = await TextResume.findDefault(userId);
        if (!textResume) {
            throw new Error('No default text resume found. Please create a text resume first.');
        }

        // Fetch application config
        const appConfig = await ApplicationConfig.findById(configId);
        if (!appConfig || appConfig.user_id !== userId) {
            throw new Error('Application configuration not found.');
        }

        // Create automation config
        const automationConfig = {
            username: nhsCredentials.username,
            password: nhsCredentials.password,
            jobTitle: appConfig.job_title,
            location: appConfig.job_location,
            cvText: textResume.full_cv_text,
            maxApplications: options.maxApplications || 5,
            headless: options.headless !== false,
            slowMo: options.slowMo || 50
        };

        // Create and run automation
        const automation = new NHSJobsAutomation(automationConfig);
        const results = await automation.run();

        // Get summary
        const summary = automation.getResultsSummary();

        // Save results to database
        for (const result of results) {
            try {
                await Application.create({
                    user_id: userId,
                    config_id: configId,
                    resume_id: null, // Set to null when using text resume
                    text_resume_id: textResume.id, // Use text_resume_id for text resumes
                    portal: 'england',
                    job_reference: result.referenceNumber,
                    job_title: result.jobTitle,
                    employer: result.employer || null,
                    status: result.success ? 'submitted' : 'failed',
                    error_message: result.error,
                    submission_date: result.success ? new Date() : null
                });
            } catch (dbError) {
                console.log(`[ORCHESTRATOR] Failed to save application to database: ${dbError.message}`);
                // Continue even if database save fails
            }
        }

        // Send email notification
        try {
            const user = await User.findById(userId);
            if (user && user.email) {
                await emailService.sendApplicationSummary(user.email, {
                    firstName: user.first_name,
                    summary,
                    results
                });
            }
        } catch (emailError) {
            console.log(`[ORCHESTRATOR] Failed to send email notification: ${emailError.message}`);
            // Continue even if email fails
        }

        console.log(`[ORCHESTRATOR] Automation completed. ${summary.successful}/${summary.total} applications submitted.`);

        return {
            success: true,
            summary,
            results
        };

    } catch (error) {
        console.log(`[ORCHESTRATOR] Automation failed: ${error.message}`);

        // Send error notification
        try {
            const user = await User.findById(userId);
            if (user && user.email) {
                await emailService.sendAutomationError(user.email, {
                    firstName: user.first_name,
                    error: error.message
                });
            }
        } catch (emailError) {
            console.log(`[ORCHESTRATOR] Failed to send error email: ${emailError.message}`);
        }

        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    startAutomation,
    NHSJobsAutomation
};
