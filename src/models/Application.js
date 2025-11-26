const { query } = require('../config/database');

class Application {
  static async create(applicationData) {
    const {
      user_id,
      config_id,
      resume_id,
      portal,
      job_reference,
      job_title,
      employer,
      cover_letter
    } = applicationData;

    const sql = `
      INSERT INTO applications
      (user_id, config_id, resume_id, portal, job_reference, job_title, employer, cover_letter, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    const result = await query(sql, [
      user_id,
      config_id,
      resume_id,
      portal,
      job_reference || null,
      job_title,
      employer || null,
      cover_letter || null
    ]);

    return result.insertId;
  }

  static async findById(id) {
    const sql = `
      SELECT a.*, u.first_name, u.last_name, u.email,
             ac.config_name, r.original_name as resume_name
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN application_configs ac ON a.config_id = ac.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE a.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findByUserId(userId, limit = null) {
    let sql = `
      SELECT a.*, ac.config_name, r.original_name as resume_name
      FROM applications a
      LEFT JOIN application_configs ac ON a.config_id = ac.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `;

    if (limit) {
      sql += ` LIMIT ${parseInt(limit)}`;
    }

    const results = await query(sql, [userId]);
    return results;
  }

  static async updateStatus(id, status, errorMessage = null) {
    let sql = `
      UPDATE applications
      SET status = ?, updated_at = CURRENT_TIMESTAMP
    `;

    const params = [status];

    if (status === 'submitted') {
      sql += ', submission_date = CURRENT_TIMESTAMP';
    }

    if (errorMessage) {
      sql += ', error_message = ?';
      params.push(errorMessage);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await query(sql, params);
    return true;
  }

  static async getStatsByUserId(userId) {
    const sql = `
      SELECT
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as successful_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_applications,
        SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn_applications
      FROM applications
      WHERE user_id = ?
    `;

    const results = await query(sql, [userId]);
    return results[0];
  }

  static async getRecentApplications(userId, limit = 10) {
    const sql = `
      SELECT a.*, ac.config_name
      FROM applications a
      LEFT JOIN application_configs ac ON a.config_id = ac.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT ?
    `;

    const results = await query(sql, [userId, limit]);
    return results;
  }

  static async getApplicationsByPortal(userId, portal) {
    const sql = `
      SELECT a.*, ac.config_name, r.original_name as resume_name
      FROM applications a
      LEFT JOIN application_configs ac ON a.config_id = ac.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE a.user_id = ? AND a.portal = ?
      ORDER BY a.created_at DESC
    `;

    const results = await query(sql, [userId, portal]);
    return results;
  }

  static async getApplicationsByStatus(userId, status) {
    const sql = `
      SELECT a.*, ac.config_name, r.original_name as resume_name
      FROM applications a
      LEFT JOIN application_configs ac ON a.config_id = ac.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE a.user_id = ? AND a.status = ?
      ORDER BY a.created_at DESC
    `;

    const results = await query(sql, [userId, status]);
    return results;
  }

  static async withdraw(id, userId) {
    const sql = `
      UPDATE applications
      SET status = 'withdrawn', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    await query(sql, [id, userId]);
    return true;
  }

  static async delete(id, userId) {
    const sql = 'DELETE FROM applications WHERE id = ? AND user_id = ?';
    await query(sql, [id, userId]);
    return true;
  }
}

module.exports = Application;
