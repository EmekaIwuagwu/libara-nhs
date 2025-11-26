const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { validate } = require('../middleware/validation');

// Public website routes
router.get('/', publicController.home);
router.get('/about', publicController.about);
router.get('/services', publicController.services);
router.get('/contact', publicController.contact);
router.post('/contact', validate('contact'), publicController.submitContact);

module.exports = router;
