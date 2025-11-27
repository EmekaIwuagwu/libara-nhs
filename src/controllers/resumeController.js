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

    console.log('[RESUME] Processing upload:', file.originalname);
    console.log('[RESUME] Original file size:', file.size, 'bytes');

    // Read the file as buffer
    const fileBuffer = await fs.readFile(file.path);

    // Compress the file using gzip
    console.log('[RESUME] Compressing file...');
    const compressedBuffer = await gzip(fileBuffer, { level: 9 });
    console.log('[RESUME] Compressed size:', compressedBuffer.length, 'bytes');
    console.log('[RESUME] Compression ratio:', ((1 - compressedBuffer.length / file.size) * 100).toFixed(2) + '%');

    // Convert compressed buffer to base64
    const base64Data = compressedBuffer.toString('base64');
    console.log('[RESUME] Base64 length:', base64Data.length, 'characters');

    // Delete local temp file
    try {
      await fs.unlink(file.path);
      console.log('[RESUME] Local temp file deleted');
    } catch (error) {
      console.error('[RESUME] Error deleting temp file:', error);
    }

    // Create resume record in database with compressed base64 data
    const resumeId = await Resume.create({
      user_id: userId,
      filename: `resume-${userId}-${Date.now()}`,
      original_name: file.originalname,
      file_path: null,
      file_size: file.size,
      mime_type: file.mimetype,
      file_data: base64Data,
      is_compressed: true
    });

    console.log('[RESUME] Resume record created:', resumeId);

    res.json({
      success: true,
      message: 'Resume uploaded and compressed successfully',
      resume: {
        id: resumeId,
        filename: file.originalname,
        size: file.size,
        compressed_size: compressedBuffer.length,
        compression_ratio: ((1 - compressedBuffer.length / file.size) * 100).toFixed(2) + '%'
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

    console.log('[RESUME] Preview request for resume ID:', resumeId);

    // If stored as base64 in database
    if (resume.file_data) {
      console.log('[RESUME] Serving from base64 database storage');

      try {
        // Convert base64 back to buffer
        const compressedBuffer = Buffer.from(resume.file_data, 'base64');
        console.log('[RESUME] Compressed buffer size:', compressedBuffer.length);

        // Decompress if compressed
        let fileBuffer;
        if (resume.is_compressed) {
          console.log('[RESUME] Decompressing file...');
          fileBuffer = await gunzip(compressedBuffer);
          console.log('[RESUME] Decompressed size:', fileBuffer.length);
        } else {
          fileBuffer = compressedBuffer;
        }

        // Set proper headers for inline PDF viewing
        res.setHeader('Content-Type', resume.mime_type || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${resume.original_name}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        res.setHeader('Cache-Control', 'public, max-age=31536000');

        return res.send(fileBuffer);
      } catch (error) {
        console.error('[RESUME] Error processing base64 data:', error);
        return res.status(500).send('Error processing resume data');
      }
    }

    // Fallback to local file (for old resumes)
    if (resume.file_path) {
      console.log('[RESUME] Serving local file:', resume.file_path);
      res.setHeader('Content-Type', resume.mime_type || 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + resume.original_name + '"');
      const fileBuffer = await fs.readFile(resume.file_path);
      return res.send(fileBuffer);
    }

    console.log('[RESUME] No file data found for resume');
    return res.status(404).send('Resume file not found');
  } catch (error) {
    console.error('[RESUME] Preview error:', error);
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

    console.log('[RESUME] Download request for resume ID:', resumeId);

    // If stored as base64 in database
    if (resume.file_data) {
      console.log('[RESUME] Serving download from base64 database storage');

      try {
        // Convert base64 back to buffer
        const compressedBuffer = Buffer.from(resume.file_data, 'base64');

        // Decompress if compressed
        let fileBuffer;
        if (resume.is_compressed) {
          fileBuffer = await gunzip(compressedBuffer);
        } else {
          fileBuffer = compressedBuffer;
        }

        // Set proper headers for download
        res.setHeader('Content-Type', resume.mime_type || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${resume.original_name}"`);
        res.setHeader('Content-Length', fileBuffer.length);

        return res.send(fileBuffer);
      } catch (error) {
        console.error('[RESUME] Error processing base64 data:', error);
        return res.status(500).send('Error processing resume data');
      }
    }

    // Fallback to local file (for old resumes)
    if (resume.file_path) {
      console.log('[RESUME] Serving local file download:', resume.file_path);
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

    console.log('[RESUME DELETE] SUCCESS - Resume ID', resumeId, 'deleted from database');
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
