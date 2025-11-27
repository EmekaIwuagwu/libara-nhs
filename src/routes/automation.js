const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');
const { isAuthenticated } = require('../middleware/auth');

// All automation routes require authentication
router.use(isAuthenticated);

// Automation dashboard
router.get('/', automationController.index);

// Start automation
router.post('/start', automationController.start);

// Get status
router.get('/status', automationController.status);

module.exports = router;
