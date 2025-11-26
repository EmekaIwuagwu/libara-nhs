const { query } = require('../config/database');

class Subscription {
  static async create(userId, plan = 'free') {
    const limits = {
      free: 5,
      pro: 50,
      max: 999999
    };

    const sql = `
      INSERT INTO subscriptions (user_id, plan, status, applications_limit, applications_used)
      VALUES (?, ?, 'active', ?, 0)
    `;

    const result = await query(sql, [userId, plan, limits[plan]]);
    return result.insertId;
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT * FROM subscriptions
      WHERE user_id = ? AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const results = await query(sql, [userId]);
    return results[0] || null;
  }

  static async updatePlan(userId, newPlan) {
    const limits = {
      free: 5,
      pro: 50,
      max: 999999
    };

    const sql = `
      UPDATE subscriptions
      SET plan = ?, applications_limit = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND status = 'active'
    `;

    await query(sql, [newPlan, limits[newPlan], userId]);
    return true;
  }

  static async incrementUsage(userId) {
    const sql = `
      UPDATE subscriptions
      SET applications_used = applications_used + 1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND status = 'active'
    `;

    await query(sql, [userId]);
    return true;
  }

  static async resetMonthlyUsage(userId) {
    const sql = `
      UPDATE subscriptions
      SET applications_used = 0, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND status = 'active'
    `;

    await query(sql, [userId]);
    return true;
  }

  static async canApply(userId) {
    const subscription = await this.findByUserId(userId);
    if (!subscription) {
      return false;
    }

    return subscription.applications_used < subscription.applications_limit;
  }

  static async getRemainingApplications(userId) {
    const subscription = await this.findByUserId(userId);
    if (!subscription) {
      return 0;
    }

    return Math.max(0, subscription.applications_limit - subscription.applications_used);
  }

  static async cancel(userId) {
    const sql = `
      UPDATE subscriptions
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND status = 'active'
    `;

    await query(sql, [userId]);
    return true;
  }
}

module.exports = Subscription;
