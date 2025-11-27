const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { isGuest } = require('../middleware/auth');

// Rate limiter for POST requests only (actual login/register attempts)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 POST attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Authentication routes
router.get('/login', isGuest, authController.showLogin);
router.post('/login', isGuest, authLimiter, validate('login'), authController.login);

router.get('/register', isGuest, authController.showRegister);
router.post('/register', isGuest, authLimiter, validate('register'), authController.register);

router.get('/logout', authController.logout);

module.exports = router;
