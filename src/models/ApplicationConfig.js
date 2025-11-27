const { query } = require('../config/database');

class ApplicationConfig {
  static async create(configData) {
    const {
      user_id,
      config_name,
      job_title,
      job_location,
      skills,
      min_salary,
      max_salary,
      profile_summary
    } = configData;

    const sql = `
      INSERT INTO application_configs
      (user_id, config_name, job_title, job_location, skills, min_salary, max_salary, profile_summary, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `;

    const result = await query(sql, [
      user_id,
      config_name,
      job_title,
      job_location,
      skills,
      min_salary || null,
      max_salary || null,
      profile_summary || null
    ]);

    return result.insertId;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM application_configs WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findByUserId(userId, activeOnly = false) {
    let sql = `
      SELECT * FROM application_configs
      WHERE user_id = ?
    `;

    if (activeOnly) {
      sql += ' AND is_active = TRUE';
    }

    sql += ' ORDER BY created_at DESC';

    const results = await query(sql, [userId]);
    return results;
  }

  static async update(id, userId, configData) {
    const {
      config_name,
      job_title,
      job_location,
      skills,
      min_salary,
      max_salary,
      profile_summary
    } = configData;

    const sql = `
      UPDATE application_configs
      SET
        config_name = ?,
        job_title = ?,
        job_location = ?,
        skills = ?,
        min_salary = ?,
        max_salary = ?,
        profile_summary = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    await query(sql, [
      config_name,
      job_title,
      job_location,
      skills,
      min_salary || null,
      max_salary || null,
      profile_summary || null,
      id,
      userId
    ]);

    return true;
  }

  static async toggleActive(id, userId) {
    const sql = `
      UPDATE application_configs
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    await query(sql, [id, userId]);
    return true;
  }

  static async delete(id, userId) {
    console.log('[CONFIG MODEL] Delete called - ID:', id, 'User:', userId);

    // First check if config exists and belongs to user
    const config = await this.findById(id);
    if (!config) {
      console.log('[CONFIG MODEL] Config not found');
      return false;
    }

    if (config.user_id !== userId) {
      console.log('[CONFIG MODEL] User ID mismatch. Config belongs to:', config.user_id, 'Requested by:', userId);
      return false;
    }

    // Delete from database
    const sql = 'DELETE FROM application_configs WHERE id = ? AND user_id = ?';
    const result = await query(sql, [id, userId]);

    const success = result.affectedRows > 0;
    console.log('[CONFIG MODEL] Delete completed, affected rows:', result.affectedRows, 'success:', success);
    return success;
  }

  static async duplicate(id, userId) {
    const config = await this.findById(id);
    if (!config || config.user_id !== userId) {
      return null;
    }

    const newConfigData = {
      user_id: userId,
      config_name: `${config.config_name} (Copy)`,
      job_title: config.job_title,
      job_location: config.job_location,
      skills: config.skills,
      min_salary: config.min_salary,
      max_salary: config.max_salary,
      profile_summary: config.profile_summary
    };

    return await this.create(newConfigData);
  }

  static async count(userId) {
    const sql = 'SELECT COUNT(*) as count FROM application_configs WHERE user_id = ?';
    const results = await query(sql, [userId]);
    return results[0].count;
  }

  static async getActiveConfigs(userId) {
    return await this.findByUserId(userId, true);
  }
}

module.exports = ApplicationConfig;
