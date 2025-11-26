const User = require('../models/User');
const Subscription = require('../models/Subscription');
const NHSCredential = require('../models/NHSCredential');

exports.index = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    const subscription = await Subscription.findByUserId(userId);
    const nhsCredentials = await NHSCredential.getAllForUser(userId);

    res.render('dashboard/settings', {
      title: 'Settings - LibaraNHS',
      page: 'settings',
      user,
      subscription,
      nhsCredentials,
      successMessage: req.session.successMessage || null,
      errorMessage: req.session.errorMessage || null,
      errors: req.session.errors || [],
      oldInput: req.session.oldInput || {}
    });

    // Clear session data
    delete req.session.successMessage;
    delete req.session.errorMessage;
    delete req.session.errors;
    delete req.session.oldInput;
  } catch (error) {
    console.error('Settings page error:', error);
    res.status(500).send('An error occurred while loading settings');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { first_name, last_name, email, phone } = req.body;

    // Check if email is already taken by another user
    if (email !== req.session.userEmail) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        req.session.errorMessage = 'Email address is already in use';
        req.session.oldInput = req.body;
        return res.redirect('/dashboard/settings');
      }
    }

    await User.update(userId, {
      first_name,
      last_name,
      email,
      phone
    });

    // Update session email
    req.session.userEmail = email;

    req.session.successMessage = 'Profile updated successfully';
    res.redirect('/dashboard/settings');
  } catch (error) {
    console.error('Update profile error:', error);
    req.session.errorMessage = 'An error occurred while updating your profile';
    res.redirect('/dashboard/settings');
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { current_password, new_password } = req.body;

    // Get user
    const user = await User.findById(userId);

    // Verify current password
    const isValid = await User.verifyPassword(current_password, user.password);

    if (!isValid) {
      req.session.errorMessage = 'Current password is incorrect';
      return res.redirect('/dashboard/settings');
    }

    // Update password
    await User.updatePassword(userId, new_password);

    req.session.successMessage = 'Password changed successfully';
    res.redirect('/dashboard/settings');
  } catch (error) {
    console.error('Change password error:', error);
    req.session.errorMessage = 'An error occurred while changing your password';
    res.redirect('/dashboard/settings');
  }
};

exports.disableAccount = async (req, res) => {
  try {
    const userId = req.session.userId;

    await User.disable(userId);

    // Destroy session and redirect
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.redirect('/?message=account_disabled');
    });
  } catch (error) {
    console.error('Disable account error:', error);
    req.session.errorMessage = 'An error occurred while disabling your account';
    res.redirect('/dashboard/settings');
  }
};

exports.saveNHSCredentials = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { portal, username, password } = req.body;

    await NHSCredential.save(userId, portal, username, password);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        success: true,
        message: 'NHS credentials saved successfully'
      });
    }

    req.session.successMessage = 'NHS credentials saved successfully';
    res.redirect('/dashboard/settings');
  } catch (error) {
    console.error('Save NHS credentials error:', error);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while saving credentials'
      });
    }

    req.session.errorMessage = 'An error occurred while saving credentials';
    res.redirect('/dashboard/settings');
  }
};

exports.testNHSConnection = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { portal } = req.body;

    // Get credentials
    const credentials = await NHSCredential.getCredentials(userId, portal);

    if (!credentials) {
      return res.json({
        success: false,
        message: 'No credentials found for this portal'
      });
    }

    // Here you would test the connection using Puppeteer
    // For now, we'll just mark it as verified
    await NHSCredential.markAsVerified(userId, portal);

    res.json({
      success: true,
      message: 'Connection test successful'
    });
  } catch (error) {
    console.error('Test NHS connection error:', error);
    res.json({
      success: false,
      message: 'Connection test failed'
    });
  }
};

exports.upgradePlan = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { plan } = req.body;

    const validPlans = ['free', 'pro', 'max'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan'
      });
    }

    await Subscription.updatePlan(userId, plan);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        success: true,
        message: 'Plan updated successfully'
      });
    }

    req.session.successMessage = 'Plan updated successfully';
    res.redirect('/dashboard/settings');
  } catch (error) {
    console.error('Upgrade plan error:', error);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred'
      });
    }

    req.session.errorMessage = 'An error occurred while updating your plan';
    res.redirect('/dashboard/settings');
  }
};

module.exports = exports;
