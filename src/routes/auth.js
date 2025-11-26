const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { isGuest } = require('../middleware/auth');

// Authentication routes
router.get('/login', isGuest, authController.showLogin);
router.post('/login', isGuest, validate('login'), authController.login);

router.get('/register', isGuest, authController.showRegister);
router.post('/register', isGuest, validate('register'), authController.register);

router.get('/logout', authController.logout);

module.exports = router;
