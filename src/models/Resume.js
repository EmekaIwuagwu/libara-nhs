const { query } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class Resume {
  static async create(resumeData) {
    const {
      user_id,
      filename,
      original_name,
      file_path,
      file_size,
      mime_type
    } = resumeData;

    // Check if this is the user's first resume, make it default
    const existingResumes = await this.findByUserId(user_id);
    const isDefault = existingResumes.length === 0;

    const sql = `
      INSERT INTO resumes (
        user_id, filename, original_name, file_path, file_size, mime_type, is_default
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      user_id,
      filename,
      original_name,
      file_path,
      file_size,
      mime_type,
      isDefault
    ]);

    console.log('[RESUME MODEL] Created resume with ID:', result.insertId);
    return result.insertId;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM resumes WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT * FROM resumes
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `;
    const results = await query(sql, [userId]);
    return results;
  }

  static async findDefaultByUserId(userId) {
    const sql = `
      SELECT * FROM resumes
      WHERE user_id = ? AND is_default = TRUE
      LIMIT 1
    `;
    const results = await query(sql, [userId]);
    return results[0] || null;
  }

  static async setDefault(id, userId) {
    // First, unset all defaults for this user
    await query('UPDATE resumes SET is_default = FALSE WHERE user_id = ?', [userId]);

    // Then set the new default
    const sql = 'UPDATE resumes SET is_default = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
    await query(sql, [id, userId]);
    return true;
  }

  static async delete(id, userId) {
    console.log('[RESUME MODEL] Delete called - ID:', id, 'User:', userId);

    // Get the resume
    const resume = await this.findById(id);

    if (!resume) {
      console.log('[RESUME MODEL] Resume not found');
      return false;
    }

    if (resume.user_id !== userId) {
      console.log('[RESUME MODEL] User ID mismatch. Resume belongs to:', resume.user_id, 'Requested by:', userId);
      return false;
    }

    console.log('[RESUME MODEL] Resume found, deleting file:', resume.file_path);

    // Delete the local file if it exists
    if (resume.file_path) {
      try {
        await fs.unlink(resume.file_path);
        console.log('[RESUME MODEL] File deleted successfully');
      } catch (error) {
        console.error('[RESUME MODEL] Error deleting file:', error.message);
        // Continue even if file delete fails (file might already be gone)
      }
    }

    // Delete from database
    console.log('[RESUME MODEL] Deleting from database...');
    const sql = 'DELETE FROM resumes WHERE id = ? AND user_id = ?';
    const result = await query(sql, [id, userId]);

    console.log('[RESUME MODEL] Database delete result, affected rows:', result.affectedRows);

    // If this was the default, set another one as default
    if (resume.is_default) {
      console.log('[RESUME MODEL] Was default resume, reassigning...');
      const remainingResumes = await this.findByUserId(userId);
      if (remainingResumes.length > 0) {
        await this.setDefault(remainingResumes[0].id, userId);
        console.log('[RESUME MODEL] Set new default resume:', remainingResumes[0].id);
      }
    }

    const success = result.affectedRows > 0;
    console.log('[RESUME MODEL] Delete completed, success:', success);
    return success;
  }

  static async count(userId) {
    const sql = 'SELECT COUNT(*) as count FROM resumes WHERE user_id = ?';
    const results = await query(sql, [userId]);
    return results[0].count;
  }
}

module.exports = Resume;
