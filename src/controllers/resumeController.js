const Resume = require('../models/Resume');
const { uploadFile } = require('../config/cloudinary');
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

exports.preview = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.session.userId;

    const resume = await Resume.findById(resumeId);

    if (!resume || resume.user_id !== userId) {
      return res.status(404).send('Resume not found');
    }

    // If stored on Cloudinary, use direct secure URL
    // Modern browsers will display PDF inline automatically
    if (resume.cloudinary_secure_url) {
      console.log('[RESUME] Preview URL:', resume.cloudinary_secure_url);
      return res.redirect(resume.cloudinary_secure_url);
    }

    // Fallback to local file (for old resumes)
    if (resume.file_path) {
      return res.sendFile(path.resolve(resume.file_path));
    }

    return res.status(404).send('Resume file not found');
  } catch (error) {
    console.error('[RESUME] Preview error:', error);
    res.status(500).send('An error occurred while previewing the resume');
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
    const resumeId = req.params.id;
    const userId = req.session.userId;

    const success = await Resume.delete(resumeId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        success: true,
        message: 'Resume deleted successfully'
      });
    }

    req.session.successMessage = 'Resume deleted successfully';
    res.redirect('/dashboard/resume');
  } catch (error) {
    console.error('Delete resume error:', error);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while deleting the resume'
      });
    }

    req.session.errorMessage = 'An error occurred while deleting the resume';
    res.redirect('/dashboard/resume');
  }
};

module.exports = exports;
