const Application = require('../models/Application');
const ApplicationConfig = require('../models/ApplicationConfig');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { automateApplication } = require('../services/puppeteer/nhsEngland');
const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const gunzip = promisify(zlib.gunzip);

/**
 * Show automation dashboard
 */
exports.index = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get user's active configs
    const configs = await ApplicationConfig.findByUserId(userId);
    const activeConfigs = configs.filter(c => c.is_active);

    // Get user's resumes
    const resumes = await Resume.findByUserId(userId);

    // Get recent applications
    const recentApplications = await Application.getRecentApplications(userId, 20);

    res.render('dashboard/automation', {
      title: 'Automation - LibaraNHS',
      page: 'automation',
      configs: activeConfigs,
      resumes,
      applications: recentApplications,
      successMessage: req.session.successMessage || null,
      errorMessage: req.session.errorMessage || null
    });

    // Clear session messages
    delete req.session.successMessage;
    delete req.session.errorMessage;
  } catch (error) {
    console.error('[AUTOMATION] Index error:', error);
    res.status(500).send('An error occurred while loading automation dashboard');
  }
};

/**
 * Start automation process
 */
exports.start = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { configId, resumeId, portal } = req.body;

    console.log('[AUTOMATION] Starting automation for user:', userId);
    console.log('[AUTOMATION] Config ID:', configId, 'Resume ID:', resumeId, 'Portal:', portal);

    // Validate inputs
    if (!configId || !resumeId || !portal) {
      return res.status(400).json({
        success: false,
        message: 'Please select both a configuration and a resume'
      });
    }

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get config
    const config = await ApplicationConfig.findById(configId);
    if (!config || config.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    // Get resume
    const resume = await Resume.findById(resumeId);
    if (!resume || resume.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check if resume has base64 data
    if (!resume.base64_data) {
      return res.status(400).json({
        success: false,
        message: 'Selected resume does not have data. Please upload a new resume.'
      });
    }

    console.log('[AUTOMATION] All validations passed, preparing resume file...');

    // Decode and decompress resume to temporary file
    const tempDir = path.join(__dirname, '../../temp');
    await fs.mkdir(tempDir, { recursive: true });

    const tempFilePath = path.join(tempDir, `resume-${userId}-${Date.now()}.pdf`);

    // Decode from base64
    const compressedBuffer = Buffer.from(resume.base64_data, 'base64');

    // Decompress
    const fileBuffer = await gunzip(compressedBuffer);

    // Write to temp file
    await fs.writeFile(tempFilePath, fileBuffer);

    console.log('[AUTOMATION] Resume file prepared at:', tempFilePath);

    // Get NHS credentials from user
    const credentials = {
      username: user.nhs_username || user.email,
      password: user.nhs_password || ''
    };

    if (!credentials.password) {
      // Clean up temp file
      await fs.unlink(tempFilePath);

      return res.status(400).json({
        success: false,
        message: 'NHS login credentials not configured. Please update your profile.'
      });
    }

    // Generate cover letter using AI (if available)
    let coverLetter = config.cover_letter_template || '';

    // TODO: Integrate with Gemini AI to generate personalized cover letter
    // coverLetter = await generateCoverLetter(config, user);

    console.log('[AUTOMATION] Starting automation process...');

    // Start automation (this will run in background)
    const automationPromise = automateApplication(
      { id: userId, email: user.email, first_name: user.first_name },
      credentials,
      config,
      tempFilePath,
      coverLetter
    );

    // Don't await - let it run in background
    automationPromise
      .then(async (results) => {
        console.log('[AUTOMATION] Completed:', results);

        // Clean up temp file
        try {
          await fs.unlink(tempFilePath);
          console.log('[AUTOMATION] Temp file cleaned up');
        } catch (err) {
          console.error('[AUTOMATION] Error cleaning temp file:', err);
        }
      })
      .catch(async (error) => {
        console.error('[AUTOMATION] Error:', error);

        // Clean up temp file
        try {
          await fs.unlink(tempFilePath);
        } catch (err) {
          console.error('[AUTOMATION] Error cleaning temp file:', err);
        }
      });

    // Return immediately
    res.json({
      success: true,
      message: 'Automation started! Check the applications list for updates.',
      info: 'The automation is running in the background. You will receive email notifications for each application.'
    });

  } catch (error) {
    console.error('[AUTOMATION] Start error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while starting automation: ' + error.message
    });
  }
};

/**
 * Get automation status
 */
exports.status = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get recent applications
    const applications = await Application.getRecentApplications(userId, 50);

    res.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('[AUTOMATION] Status error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching status'
    });
  }
};

module.exports = exports;
