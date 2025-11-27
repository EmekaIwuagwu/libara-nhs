const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { isAuthenticated } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Resume routes - all require authentication
router.use(isAuthenticated);

router.get('/', resumeController.index);
router.post('/upload', upload.single('resume'), handleUploadError, resumeController.upload);
router.get('/:id/preview', resumeController.preview);
router.get('/:id/download', resumeController.download);
router.post('/:id/set-default', resumeController.setDefault);
router.delete('/:id', resumeController.delete);

module.exports = router;
