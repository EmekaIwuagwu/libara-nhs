// Authentication middleware

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

const setUserLocals = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.session.userId);
      if (user) {
        res.locals.user = user;
        res.locals.isAuthenticated = true;
      } else {
        res.locals.isAuthenticated = false;
      }
    } catch (error) {
      console.error('Error setting user locals:', error);
      res.locals.isAuthenticated = false;
    }
  } else {
    res.locals.isAuthenticated = false;
  }
  next();
};

module.exports = {
  isAuthenticated,
  isGuest,
  setUserLocals
};
