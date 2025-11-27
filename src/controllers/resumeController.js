const Resume = require('../models/Resume');
const { uploadFile, getSignedUrl } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs').promises;

exports.index = async (req, res) => {
  try {
    const userId = req.session.userId;
    const resumes = await Resume.findByUserId(userId);

    res.render('dashboard/resume', {
      title: 'Manage Resumes - LibaraNHS',
      page: 'resume',
      resumes,
      successMessage: req.session.successMessage || null,
      errorMessage: req.session.errorMessage || null
    });

    // Clear session messages
    delete req.session.successMessage;
    delete req.session.errorMessage;
  } catch (error) {
    console.error('Resume index error:', error);
    res.status(500).send('An error occurred while loading resumes');
  }
};

exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.session.userId;
    const file = req.file;

    console.log('[RESUME] Uploading to Cloudinary:', file.originalname);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadFile(file.path, {
      folder: 'libaranhs/resumes',
      public_id: `user-${userId}-${Date.now()}`
    });

    console.log('[RESUME] Cloudinary upload successful:', cloudinaryResult.public_id);

    // Delete local temp file
    try {
      await fs.unlink(file.path);
      console.log('[RESUME] Local temp file deleted');
    } catch (error) {
      console.error('[RESUME] Error deleting temp file:', error);
    }

    // Create resume record in database
    const resumeId = await Resume.create({
      user_id: userId,
      filename: cloudinaryResult.public_id,
      original_name: file.originalname,
      file_path: null, // No longer storing locally
      file_size: cloudinaryResult.bytes,
      mime_type: file.mimetype,
      cloudinary_url: cloudinaryResult.url,
      cloudinary_public_id: cloudinaryResult.public_id,
      cloudinary_secure_url: cloudinaryResult.secure_url
    });

    console.log('[RESUME] Resume record created:', resumeId);

    res.json({
      success: true,
      message: 'Resume uploaded successfully to cloud storage',
      resume: {
        id: resumeId,
        filename: file.originalname,
        size: cloudinaryResult.bytes,
        url: cloudinaryResult.secure_url
      }
    });
  } catch (error) {
    console.error('[RESUME] Upload error:', error);

    // Clean up temp file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('[RESUME] Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred while uploading the resume: ' + error.message
    });
  }
};

exports.preview = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.session.userId;

    const resume = await Resume.findById(resumeId);

    if (!resume || resume.user_id !== userId) {
      return res.status(404).send('Resume not found');
    }

    console.log('[RESUME PREVIEW] ========================================');
    console.log('[RESUME PREVIEW] Resume ID:', resumeId);
    console.log('[RESUME PREVIEW] User ID:', userId);
    console.log('[RESUME PREVIEW] Cloudinary public_id:', resume.cloudinary_public_id);
    console.log('[RESUME PREVIEW] Cloudinary URL:', resume.cloudinary_secure_url);

    // If stored on Cloudinary
    if (resume.cloudinary_public_id) {
      console.log('[RESUME PREVIEW] Generating signed URL for:', resume.cloudinary_public_id);

      // Generate a signed URL that will work for raw resources
      const signedUrl = getSignedUrl(resume.cloudinary_public_id, 'raw');

      if (signedUrl) {
        console.log('[RESUME PREVIEW] Redirecting to signed URL');
        console.log('[RESUME PREVIEW] ========================================');
        return res.redirect(signedUrl);
      } else {
        console.error('[RESUME PREVIEW] Failed to generate signed URL');
        return res.status(500).send('Error generating preview URL');
      }
    }

    // Fallback to local file
    if (resume.file_path) {
      console.log('[RESUME PREVIEW] Serving local file:', resume.file_path);
      res.setHeader('Content-Type', resume.mime_type || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${resume.original_name}"`);
      const fileBuffer = await fs.readFile(resume.file_path);
      return res.send(fileBuffer);
    }

    console.log('[RESUME PREVIEW] No file found');
    console.log('[RESUME PREVIEW] ========================================');
    return res.status(404).send('Resume file not found');
  } catch (error) {
    console.error('[RESUME PREVIEW] ERROR:', error);
    console.error('[RESUME PREVIEW] ========================================');
    res.status(500).send('An error occurred while previewing the resume');
  }
};

// Alias for backward compatibility
exports.view = exports.preview;

exports.download = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.session.userId;

    const resume = await Resume.findById(resumeId);

    if (!resume || resume.user_id !== userId) {
      return res.status(404).send('Resume not found');
    }

    // If stored on Cloudinary, redirect to secure URL
    if (resume.cloudinary_secure_url) {
      return res.redirect(resume.cloudinary_secure_url);
    }

    // Fallback to local file (for old resumes)
    if (resume.file_path) {
      return res.download(resume.file_path, resume.original_name);
    }

    return res.status(404).send('Resume file not found');
  } catch (error) {
    console.error('[RESUME] Download error:', error);
    res.status(500).send('An error occurred while downloading the resume');
  }
};

exports.setDefault = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.session.userId;

    await Resume.setDefault(resumeId, userId);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        success: true,
        message: 'Default resume updated'
      });
    }

    req.session.successMessage = 'Default resume updated successfully';
    res.redirect('/dashboard/resume');
  } catch (error) {
    console.error('Set default resume error:', error);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred'
      });
    }

    req.session.errorMessage = 'An error occurred while updating default resume';
    res.redirect('/dashboard/resume');
  }
};

exports.delete = async (req, res) => {
  try {
    const resumeId = parseInt(req.params.id);
    const userId = req.session.userId;

    console.log('[RESUME DELETE] ========================================');
    console.log('[RESUME DELETE] Request received');
    console.log('[RESUME DELETE] Resume ID:', resumeId, '(type:', typeof resumeId, ')');
    console.log('[RESUME DELETE] User ID:', userId, '(type:', typeof userId, ')');
    console.log('[RESUME DELETE] ========================================');

    if (!resumeId || isNaN(resumeId)) {
      console.log('[RESUME DELETE] Invalid resume ID');
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      });
    }

    if (!userId) {
      console.log('[RESUME DELETE] No user ID in session - not authenticated');
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    console.log('[RESUME DELETE] Calling Resume.delete() method...');
    const success = await Resume.delete(resumeId, userId);
    console.log('[RESUME DELETE] Resume.delete() returned:', success);

    if (!success) {
      console.log('[RESUME DELETE] FAILED - resume not found or unauthorized');
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({
        success: false,
        message: 'Resume not found or you do not have permission to delete it'
      });
    }

    console.log('[RESUME DELETE] SUCCESS - Resume ID', resumeId, 'deleted');
    console.log('[RESUME DELETE] ========================================');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('[RESUME DELETE] ========================================');
    console.error('[RESUME DELETE] EXCEPTION:', error);
    console.error('[RESUME DELETE] Stack:', error.stack);
    console.error('[RESUME DELETE] ========================================');
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the resume: ' + error.message
    });
  }
};

module.exports = exports;
