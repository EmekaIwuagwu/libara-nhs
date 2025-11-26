const ApplicationConfig = require('../models/ApplicationConfig');
const Resume = require('../models/Resume');

exports.create = async (req, res) => {
  try {
    const userId = req.session.userId;
    const resumes = await Resume.findByUserId(userId);

    res.render('dashboard/config', {
      title: 'Create Configuration - LibaraNHS',
      page: 'config',
      resumes,
      errors: req.session.errors || [],
      oldInput: req.session.oldInput || {}
    });

    // Clear session data
    delete req.session.errors;
    delete req.session.oldInput;
  } catch (error) {
    console.error('Config create page error:', error);
    res.status(500).send('An error occurred');
  }
};

exports.store = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { config_name, job_title, job_location, skills, min_salary, max_salary, profile_summary } = req.body;

    const configId = await ApplicationConfig.create({
      user_id: userId,
      config_name,
      job_title,
      job_location,
      skills,
      min_salary,
      max_salary,
      profile_summary
    });

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        success: true,
        message: 'Configuration created successfully',
        configId
      });
    }

    req.session.successMessage = 'Configuration created successfully';
    res.redirect('/dashboard/saved-config');
  } catch (error) {
    console.error('Config store error:', error);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while saving the configuration'
      });
    }

    req.session.errorMessage = 'An error occurred while saving the configuration';
    res.redirect('/dashboard/config');
  }
};

exports.savedConfigs = async (req, res) => {
  try {
    const userId = req.session.userId;
    const configs = await ApplicationConfig.findByUserId(userId);

    res.render('dashboard/saved-config', {
      title: 'Saved Configurations - LibaraNHS',
      page: 'saved-config',
      configs,
      successMessage: req.session.successMessage || null,
      errorMessage: req.session.errorMessage || null
    });

    // Clear session messages
    delete req.session.successMessage;
    delete req.session.errorMessage;
  } catch (error) {
    console.error('Saved configs error:', error);
    res.status(500).send('An error occurred while loading configurations');
  }
};

exports.edit = async (req, res) => {
  try {
    const configId = req.params.id;
    const userId = req.session.userId;

    const config = await ApplicationConfig.findById(configId);

    if (!config || config.user_id !== userId) {
      req.session.errorMessage = 'Configuration not found';
      return res.redirect('/dashboard/saved-config');
    }

    const resumes = await Resume.findByUserId(userId);

    res.render('dashboard/config', {
      title: 'Edit Configuration - LibaraNHS',
      page: 'config',
      resumes,
      config,
      errors: req.session.errors || [],
      oldInput: req.session.oldInput || {}
    });

    // Clear session data
    delete req.session.errors;
    delete req.session.oldInput;
  } catch (error) {
    console.error('Config edit error:', error);
    res.status(500).send('An error occurred');
  }
};

exports.update = async (req, res) => {
  try {
    const configId = req.params.id;
    const userId = req.session.userId;
    const { config_name, job_title, job_location, skills, min_salary, max_salary, profile_summary } = req.body;

    await ApplicationConfig.update(configId, userId, {
      config_name,
      job_title,
      job_location,
      skills,
      min_salary,
      max_salary,
      profile_summary
    });

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        success: true,
        message: 'Configuration updated successfully'
      });
    }

    req.session.successMessage = 'Configuration updated successfully';
    res.redirect('/dashboard/saved-config');
  } catch (error) {
    console.error('Config update error:', error);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while updating the configuration'
      });
    }

    req.session.errorMessage = 'An error occurred while updating the configuration';
    res.redirect('/dashboard/saved-config');
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const configId = req.params.id;
    const userId = req.session.userId;

    await ApplicationConfig.toggleActive(configId, userId);

    res.json({
      success: true,
      message: 'Configuration status updated'
    });
  } catch (error) {
    console.error('Config toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred'
    });
  }
};

exports.duplicate = async (req, res) => {
  try {
    const configId = req.params.id;
    const userId = req.session.userId;

    const newConfigId = await ApplicationConfig.duplicate(configId, userId);

    if (!newConfigId) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Configuration duplicated successfully',
      configId: newConfigId
    });
  } catch (error) {
    console.error('Config duplicate error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred'
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const configId = req.params.id;
    const userId = req.session.userId;

    await ApplicationConfig.delete(configId, userId);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        success: true,
        message: 'Configuration deleted successfully'
      });
    }

    req.session.successMessage = 'Configuration deleted successfully';
    res.redirect('/dashboard/saved-config');
  } catch (error) {
    console.error('Config delete error:', error);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while deleting the configuration'
      });
    }

    req.session.errorMessage = 'An error occurred while deleting the configuration';
    res.redirect('/dashboard/saved-config');
  }
};

module.exports = exports;
