const { query } = require('../config/database');

class TextResume {
  /**
   * Find all text resumes for a user
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} Array of text resumes
   */
  static async findByUserId(userId) {
    const sql = `
      SELECT * FROM text_resumes
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `;
    const results = await query(sql, [userId]);
    return results;
  }

  /**
   * Find a single text resume by ID
   * @param {number} id - The resume ID
   * @param {number} userId - The user ID
   * @returns {Promise<Object|null>} The text resume or null
   */
  static async findById(id, userId) {
    const sql = 'SELECT * FROM text_resumes WHERE id = ? AND user_id = ?';
    const results = await query(sql, [id, userId]);
    return results[0] || null;
  }

  /**
   * Find the default text resume for a user
   * @param {number} userId - The user ID
   * @returns {Promise<Object|null>} The default text resume or null
   */
  static async findDefault(userId) {
    const sql = `
      SELECT * FROM text_resumes
      WHERE user_id = ? AND is_default = TRUE
      LIMIT 1
    `;
    const results = await query(sql, [userId]);
    return results[0] || null;
  }

  /**
   * Create a new text resume
   * @param {Object} data - The resume data
   * @returns {Promise<number>} The inserted resume ID
   */
  static async create(data) {
    const {
      user_id,
      resume_name,
      personal_statement,
      work_experience,
      education,
      skills,
      certifications,
      references_text,
      full_cv_text,
      is_default
    } = data;

    // Check if this is the user's first text resume
    const existingResumes = await this.findByUserId(user_id);
    const shouldBeDefault = existingResumes.length === 0 || is_default;

    // If setting as default, unset all others first
    if (shouldBeDefault) {
      await query('UPDATE text_resumes SET is_default = FALSE WHERE user_id = ?', [user_id]);
    }

    const sql = `
      INSERT INTO text_resumes
      (user_id, resume_name, personal_statement, work_experience, education,
       skills, certifications, references_text, full_cv_text, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      user_id,
      resume_name || 'My Text Resume',
      personal_statement || null,
      work_experience || null,
      education || null,
      skills || null,
      certifications || null,
      references_text || null,
      full_cv_text,
      shouldBeDefault
    ]);

    console.log('[TEXT RESUME MODEL] Created text resume with ID:', result.insertId);
    return result.insertId;
  }

  /**
   * Update a text resume
   * @param {number} id - The resume ID
   * @param {number} userId - The user ID
   * @param {Object} data - The updated resume data
   * @returns {Promise<boolean>} Success status
   */
  static async update(id, userId, data) {
    const {
      resume_name,
      personal_statement,
      work_experience,
      education,
      skills,
      certifications,
      references_text,
      full_cv_text
    } = data;

    const sql = `
      UPDATE text_resumes SET
        resume_name = ?,
        personal_statement = ?,
        work_experience = ?,
        education = ?,
        skills = ?,
        certifications = ?,
        references_text = ?,
        full_cv_text = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    const result = await query(sql, [
      resume_name,
      personal_statement || null,
      work_experience || null,
      education || null,
      skills || null,
      certifications || null,
      references_text || null,
      full_cv_text,
      id,
      userId
    ]);

    const success = result.affectedRows > 0;
    console.log('[TEXT RESUME MODEL] Update completed, success:', success);
    return success;
  }

  /**
   * Delete a text resume
   * @param {number} id - The resume ID
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id, userId) {
    console.log('[TEXT RESUME MODEL] Delete called - ID:', id, 'User:', userId);

    // Get the resume first
    const resume = await this.findById(id, userId);

    if (!resume) {
      console.log('[TEXT RESUME MODEL] Text resume not found');
      return false;
    }

    // Delete from database
    const sql = 'DELETE FROM text_resumes WHERE id = ? AND user_id = ?';
    const result = await query(sql, [id, userId]);

    console.log('[TEXT RESUME MODEL] Database delete result, affected rows:', result.affectedRows);

    // If this was the default, set another one as default
    if (resume.is_default) {
      console.log('[TEXT RESUME MODEL] Was default resume, reassigning...');
      const remainingResumes = await this.findByUserId(userId);
      if (remainingResumes.length > 0) {
        await this.setDefault(remainingResumes[0].id, userId);
        console.log('[TEXT RESUME MODEL] Set new default resume:', remainingResumes[0].id);
      }
    }

    const success = result.affectedRows > 0;
    console.log('[TEXT RESUME MODEL] Delete completed, success:', success);
    return success;
  }

  /**
   * Set a text resume as default
   * @param {number} id - The resume ID
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} Success status
   */
  static async setDefault(id, userId) {
    console.log('[TEXT RESUME MODEL] Setting default resume:', id, 'for user:', userId);

    // First, unset all defaults for this user
    await query('UPDATE text_resumes SET is_default = FALSE WHERE user_id = ?', [userId]);

    // Then set the new default
    const sql = 'UPDATE text_resumes SET is_default = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
    const result = await query(sql, [id, userId]);

    const success = result.affectedRows > 0;
    console.log('[TEXT RESUME MODEL] Default resume updated successfully, success:', success);
    return success;
  }

  /**
   * Count text resumes for a user
   * @param {number} userId - The user ID
   * @returns {Promise<number>} Count of text resumes
   */
  static async count(userId) {
    const sql = 'SELECT COUNT(*) as count FROM text_resumes WHERE user_id = ?';
    const results = await query(sql, [userId]);
    return results[0].count;
  }
}

module.exports = TextResume;
