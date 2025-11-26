const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { isAuthenticated } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Application config routes - all require authentication
router.use(isAuthenticated);

// Create new config
router.get('/create', configController.create);
router.post('/create', validate('applicationConfig'), configController.store);

// Saved configurations
router.get('/saved', configController.savedConfigs);

// Edit config
router.get('/:id/edit', configController.edit);
router.post('/:id/update', validate('applicationConfig'), configController.update);

// Toggle active status
router.post('/:id/toggle', configController.toggleActive);

// Duplicate config
router.post('/:id/duplicate', configController.duplicate);

// Delete config
router.delete('/:id', configController.delete);

module.exports = router;
