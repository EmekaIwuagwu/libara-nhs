const Resume = require('../models/Resume');
const path = require('path');
const fs = require('fs').promises;
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

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

    console.log('[RESUME] Processing file:', file.originalname);

    // Read the file as buffer
    const fileBuffer = await fs.readFile(file.path);
    console.log('[RESUME] File size:', fileBuffer.length, 'bytes');

    // Compress with gzip
    const compressedBuffer = await gzip(fileBuffer);
    console.log('[RESUME] Compressed size:', compressedBuffer.length, 'bytes',
                `(${Math.round((compressedBuffer.length / fileBuffer.length) * 100)}% of original)`);

    // Convert to base64
    const base64Data = compressedBuffer.toString('base64');
    console.log('[RESUME] Base64 encoded successfully');

    // Delete local temp file
    try {
      await fs.unlink(file.path);
      console.log('[RESUME] Local temp file deleted');
    } catch (error) {
      console.error('[RESUME] Error deleting temp file:', error);
    }

    // Create resume record in database with base64 data
    const resumeId = await Resume.create({
      user_id: userId,
      filename: `resume-${Date.now()}`,
      original_name: file.originalname,
      file_path: null,
      file_size: file.size,
      mime_type: file.mimetype,
      base64_data: base64Data,
      compression_type: 'gzip'
    });

    console.log('[RESUME] Resume record created with base64 storage:', resumeId);

    res.json({
      success: true,
      message: 'Resume uploaded successfully and stored securely',
      resume: {
        id: resumeId,
        filename: file.originalname,
        size: file.size,
        compressed_size: compressedBuffer.length
    console.log('[RESUME UPLOAD] File uploaded:', file.originalname);
    console.log('[RESUME UPLOAD] Stored at:', file.path);
    console.log('[RESUME UPLOAD] Size:', file.size, 'bytes');

    // Create resume record in database (file already saved by multer)
    const resumeId = await Resume.create({
      user_id: userId,
      filename: file.filename,
      original_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype
    });

    console.log('[RESUME UPLOAD] Resume record created with ID:', resumeId);

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
    console.error('[RESUME UPLOAD] Error:', error);

    // Clean up uploaded file if database insert failed
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
        console.log('[RESUME UPLOAD] Cleaned up file after error');
      } catch (cleanupError) {
        console.error('[RESUME UPLOAD] Cleanup error:', cleanupError);
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
      console.log('[RESUME DOWNLOAD] Resume not found or unauthorized');
      return res.status(404).send('Resume not found');
    }

    // If stored as base64, decode and send
    if (resume.base64_data) {
      console.log('[RESUME] Decoding base64 data for download');

      // Decode from base64
      const compressedBuffer = Buffer.from(resume.base64_data, 'base64');

      // Decompress
      const fileBuffer = await gunzip(compressedBuffer);

      console.log('[RESUME] Decompressed successfully, sending file');

      // Set headers for download
      res.setHeader('Content-Type', resume.mime_type);
      res.setHeader('Content-Disposition', `attachment; filename="${resume.original_name}"`);
      res.setHeader('Content-Length', fileBuffer.length);

      return res.send(fileBuffer);
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

    // If stored as base64, decode and display inline
    if (resume.base64_data) {
      console.log('[RESUME] Decoding base64 data for preview');

      // Decode from base64
      const compressedBuffer = Buffer.from(resume.base64_data, 'base64');

      // Decompress
      const fileBuffer = await gunzip(compressedBuffer);

      console.log('[RESUME] Decompressed successfully, displaying inline');

      // Set headers for inline display
      res.setHeader('Content-Type', resume.mime_type);
      res.setHeader('Content-Disposition', `inline; filename="${resume.original_name}"`);
      res.setHeader('Content-Length', fileBuffer.length);

      return res.send(fileBuffer);
    if (!resume.file_path) {
      console.log('[RESUME DOWNLOAD] No file path for resume:', resumeId);
      return res.status(404).send('Resume file not found');
    }

    console.log('[RESUME DOWNLOAD] Downloading file:', resume.file_path);

    // Check if file exists
    try {
      await fs.access(resume.file_path);
    } catch (error) {
      console.error('[RESUME DOWNLOAD] File not found on disk:', resume.file_path);
      return res.status(404).send('Resume file not found on server');
    }

    // Send file for download
    res.download(resume.file_path, resume.original_name, (err) => {
      if (err) {
        console.error('[RESUME DOWNLOAD] Error sending file:', err);
      } else {
        console.log('[RESUME DOWNLOAD] File sent successfully');
      }
    });
  } catch (error) {
    console.error('[RESUME DOWNLOAD] Error:', error);
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
