const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { isAuthenticated } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Settings routes - all require authentication
router.use(isAuthenticated);

router.get('/', settingsController.index);

// Profile updates
router.post('/profile', validate('updateProfile'), settingsController.updateProfile);

// Password change
router.post('/password', validate('changePassword'), settingsController.changePassword);

// Account actions
router.post('/disable', settingsController.disableAccount);

// NHS credentials
router.post('/nhs-credentials', validate('nhsCredentials'), settingsController.saveNHSCredentials);
router.post('/nhs-credentials/test', settingsController.testNHSConnection);

// Subscription
router.post('/upgrade', settingsController.upgradePlan);

module.exports = router;
