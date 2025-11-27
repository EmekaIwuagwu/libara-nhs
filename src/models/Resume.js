const { query } = require('../config/database');

class Resume {
  static async create(resumeData) {
    const {
      user_id,
      filename,
      original_name,
      file_path,
      file_size,
      mime_type,
      base64_data,
      compression_type,
      cloudinary_url,
      cloudinary_public_id,
      cloudinary_secure_url
    } = resumeData;

    // Check if this is the user's first resume, make it default
    const existingResumes = await this.findByUserId(user_id);
    const isDefault = existingResumes.length === 0;

    const sql = `
      INSERT INTO resumes (
        user_id, filename, original_name, file_path, file_size, mime_type,
        base64_data, compression_type,
        cloudinary_url, cloudinary_public_id, cloudinary_secure_url, is_default
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      user_id,
      filename,
      original_name,
      file_path || null,
      file_size,
      mime_type,
      base64_data || null,
      compression_type || 'gzip',
      cloudinary_url || null,
      cloudinary_public_id || null,
      cloudinary_secure_url || null,
      isDefault
    ]);

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
    // Get the resume
    const resume = await this.findById(id);
    if (!resume || resume.user_id !== userId) {
      return false;
    }

    // Delete from database (base64 data is stored in DB, so this removes everything)
    const sql = 'DELETE FROM resumes WHERE id = ? AND user_id = ?';
    await query(sql, [id, userId]);

    console.log('[RESUME] Deleted resume from database:', id);

    // If this was the default, set another one as default
    if (resume.is_default) {
      const remainingResumes = await this.findByUserId(userId);
      if (remainingResumes.length > 0) {
        await this.setDefault(remainingResumes[0].id, userId);
      }
    }

    return true;
  }

  static async count(userId) {
    const sql = 'SELECT COUNT(*) as count FROM resumes WHERE user_id = ?';
    const results = await query(sql, [userId]);
    return results[0].count;
  }
}

module.exports = Resume;
