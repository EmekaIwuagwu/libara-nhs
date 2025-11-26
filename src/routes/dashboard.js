const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');

// Dashboard routes - all require authentication
router.use(isAuthenticated);

router.get('/', dashboardController.index);

module.exports = router;
