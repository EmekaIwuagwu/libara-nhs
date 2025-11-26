const Resume = require('../models/Resume');
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

    // Create resume record
    const resumeId = await Resume.create({
      user_id: userId,
      filename: file.filename,
      original_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype
    });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: {
        id: resumeId,
        filename: file.originalname,
        size: file.size
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while uploading the resume'
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

    res.download(resume.file_path, resume.original_name);
  } catch (error) {
    console.error('Resume download error:', error);
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
