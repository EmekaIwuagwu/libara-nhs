const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const applyboxController = require('../controllers/applyboxController');
const { isAuthenticated } = require('../middleware/auth');

// Dashboard routes - all require authentication
router.use(isAuthenticated);

router.get('/', dashboardController.index);

// ApplyBox routes
router.get('/applybox', applyboxController.getApplyBox);
router.post('/applybox/start', applyboxController.startAutomation);

module.exports = router;
