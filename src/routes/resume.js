const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const textResumeController = require('../controllers/textResumeController');
const { isAuthenticated } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Resume routes - all require authentication
router.use(isAuthenticated);

// File resume routes
router.get('/', resumeController.index);
router.post('/upload', upload.single('resume'), handleUploadError, resumeController.upload);
router.get('/:id/preview', resumeController.preview);
router.get('/:id/download', resumeController.download);
router.post('/:id/set-default', resumeController.setDefault);
router.delete('/:id', resumeController.delete);

// Text resume routes
router.get('/text-resumes', textResumeController.getAll);
router.get('/text-resumes/:id', textResumeController.getById);
router.post('/text-resumes', textResumeController.create);
router.put('/text-resumes/:id', textResumeController.update);
router.delete('/text-resumes/:id', textResumeController.delete);
router.post('/text-resumes/:id/set-default', textResumeController.setDefault);

module.exports = router;
