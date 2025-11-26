const { query } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create(userData) {
    const { first_name, last_name, email, username, password, phone } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const sql = `
      INSERT INTO users (first_name, last_name, email, username, password, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [first_name, last_name, email, username, hashedPassword, phone || null]);

    // Create default subscription
    const Subscription = require('./Subscription');
    await Subscription.create(result.insertId);

    return result.insertId;
  }

  static async findById(id) {
    const sql = `
      SELECT u.*, s.plan, s.applications_limit, s.applications_used
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = ? AND u.is_active = TRUE
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const results = await query(sql, [email]);
    return results[0] || null;
  }

  static async findByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ? AND is_active = TRUE';
    const results = await query(sql, [username]);
    return results[0] || null;
  }

  static async findByUsernameOrEmail(usernameOrEmail) {
    const sql = `
      SELECT * FROM users
      WHERE (username = ? OR email = ?) AND is_active = TRUE
    `;
    const results = await query(sql, [usernameOrEmail, usernameOrEmail]);
    return results[0] || null;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async update(id, userData) {
    const { first_name, last_name, email, phone } = userData;
    const sql = `
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await query(sql, [first_name, last_name, email, phone || null, id]);
    return true;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const sql = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [hashedPassword, id]);
    return true;
  }

  static async disable(id) {
    const sql = 'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [id]);
    return true;
  }

  static async getStats(userId) {
    const sql = `
      SELECT * FROM user_stats WHERE user_id = ?
    `;
    const results = await query(sql, [userId]);
    return results[0] || null;
  }
}

module.exports = User;
