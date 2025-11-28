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

        // Start automation (this will run asynchronously)
        const result = await startAutomation(userId, parseInt(configId), {
            maxApplications: parseInt(maxApplications) || 5,
            headless: true
        });

        if (result.success) {
            res.json({
                success: true,
                message: `Automation completed! ${result.summary.successful} applications submitted.`,
                summary: result.summary
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('[APPLYBOX] Automation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred during automation'
        });
    }
};
