// src/controllers/applyboxController.js

const { startAutomation } = require('../services/automation');
const ApplicationConfig = require('../models/ApplicationConfig');
const TextResume = require('../models/TextResume');
const NHSCredential = require('../models/NHSCredential');

/**
 * Render the ApplyBox page
 */
exports.getApplyBox = async (req, res) => {
    try {
        const userId = req.session.userId;

        // Get user's saved configurations
        const configs = await ApplicationConfig.findByUserId(userId);

        // Get user's text resumes
        const textResumes = await TextResume.findByUserId(userId);

        // Check if NHS credentials are saved
        const nhsEnglandCreds = await NHSCredential.findByUserIdAndPortal(userId, 'england');
        const nhsScotlandCreds = await NHSCredential.findByUserIdAndPortal(userId, 'scotland');

        res.render('dashboard/applybox', {
            title: 'Apply Box - Start Automation',
            page: 'applybox',
            configs,
            textResumes,
            hasNHSEnglandCredentials: !!nhsEnglandCreds,
            hasNHSScotlandCredentials: !!nhsScotlandCreds,
            successMessage: req.session.successMessage || null,
            errorMessage: req.session.errorMessage || null
        });

        // Clear session messages
        delete req.session.successMessage;
        delete req.session.errorMessage;

    } catch (error) {
        console.error('[APPLYBOX] Error loading ApplyBox:', error);
        req.session.errorMessage = 'Failed to load ApplyBox page';
        res.redirect('/dashboard');
    }
};

/**
 * Start the automation process
 */
exports.startAutomation = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { configId, portal, maxApplications } = req.body;

        console.log('[APPLYBOX] Starting automation:', { userId, configId, portal, maxApplications });

        // Validate inputs
        if (!configId) {
            return res.status(400).json({
                success: false,
                error: 'Please select an application configuration'
            });
        }

        if (portal !== 'england') {
            return res.status(400).json({
                success: false,
                error: 'Currently only NHS England automation is supported'
            });
        }

        // Start automation in background (fire-and-forget)
        // Don't await - let it run asynchronously
        startAutomation(userId, parseInt(configId), {
            maxApplications: parseInt(maxApplications) || 5,
            headless: true
        })
        .then(result => {
            console.log('[APPLYBOX] Automation completed:', result.success ? 'SUCCESS' : 'FAILED');
            if (result.success) {
                console.log(`[APPLYBOX] ${result.summary.successful}/${result.summary.total} applications submitted`);
            } else {
                console.error('[APPLYBOX] Automation error:', result.error);
            }
        })
        .catch(error => {
            console.error('[APPLYBOX] Automation exception:', error);
        });

        // Return immediately - don't wait for automation to complete
        res.json({
            success: true,
            message: 'Automation started successfully!',
            info: 'The automation is running in the background. You can close this window. Check your email for results when complete.'
        });

    } catch (error) {
        console.error('[APPLYBOX] Automation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred during automation'
        });
    }
};
