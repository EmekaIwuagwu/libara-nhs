const User = require('../models/User');
const Application = require('../models/Application');
const Subscription = require('../models/Subscription');

exports.index = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get user data
    const user = await User.findById(userId);

    // Get application stats
    const stats = await Application.getStatsByUserId(userId);

    // Get recent applications
    const recentApplications = await Application.getRecentApplications(userId, 10);

    // Get subscription info
    const subscription = await Subscription.findByUserId(userId);
    const remainingApplications = await Subscription.getRemainingApplications(userId);

    res.render('dashboard/index', {
      title: 'Dashboard - LibaraNHS',
      page: 'dashboard',
      user,
      stats,
      recentApplications,
      subscription,
      remainingApplications,
      successMessage: req.session.successMessage || null,
      errorMessage: req.session.errorMessage || null
    });

    // Clear session messages
    delete req.session.successMessage;
    delete req.session.errorMessage;
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('An error occurred while loading the dashboard');
  }
};

module.exports = exports;
