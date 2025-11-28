const { query } = require('../config/database');
const crypto = require('crypto');
require('dotenv').config();

class NHSCredential {
  // Get or generate a valid 32-byte encryption key
  static getEncryptionKey() {
    let key = process.env.ENCRYPTION_KEY;

    // If no key is set, use a default
    if (!key || key.length === 0) {
      console.warn('[ENCRYPTION] No ENCRYPTION_KEY found in .env, using default key. Please set a secure 32-character key in production!');
      key = 'default-32-char-key-change-me!';
    }

    // Convert to buffer
    let keyBuffer = Buffer.from(key, 'utf8');

    // Ensure it's exactly 32 bytes for AES-256
    if (keyBuffer.length < 32) {
      // Pad with zeros if too short
      const paddedKey = Buffer.alloc(32);
      keyBuffer.copy(paddedKey);
      return paddedKey;
    } else if (keyBuffer.length > 32) {
      // Truncate if too long
      return keyBuffer.slice(0, 32);
    }

    return keyBuffer;
  }

  // Encryption helper functions
  static encrypt(text) {
    const algorithm = 'aes-256-gcm';
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  static decrypt(encryptedText) {
    try {
      const algorithm = 'aes-256-gcm';
      const key = this.getEncryptionKey();

      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  static async save(userId, portal, username, password) {
    const encryptedUsername = this.encrypt(username);
    const encryptedPassword = this.encrypt(password);

    const sql = `
      INSERT INTO nhs_credentials (user_id, portal, username_encrypted, password_encrypted)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        username_encrypted = VALUES(username_encrypted),
        password_encrypted = VALUES(password_encrypted),
        is_verified = FALSE,
        updated_at = CURRENT_TIMESTAMP
    `;

    await query(sql, [userId, portal, encryptedUsername, encryptedPassword]);
    return true;
  }

  static async findByUserIdAndPortal(userId, portal) {
    const sql = `
      SELECT * FROM nhs_credentials
      WHERE user_id = ? AND portal = ?
    `;

    const results = await query(sql, [userId, portal]);
    return results[0] || null;
  }

  static async getCredentials(userId, portal) {
    const credential = await this.findByUserIdAndPortal(userId, portal);
    if (!credential) {
      return null;
    }

    return {
      id: credential.id,
      portal: credential.portal,
      username: this.decrypt(credential.username_encrypted),
      password: this.decrypt(credential.password_encrypted),
      is_verified: credential.is_verified,
      last_login: credential.last_login
    };
  }

  static async markAsVerified(userId, portal) {
    const sql = `
      UPDATE nhs_credentials
      SET is_verified = TRUE, last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND portal = ?
    `;

    await query(sql, [userId, portal]);
    return true;
  }

  static async markAsUnverified(userId, portal) {
    const sql = `
      UPDATE nhs_credentials
      SET is_verified = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND portal = ?
    `;

    await query(sql, [userId, portal]);
    return true;
  }

  static async delete(userId, portal) {
    const sql = 'DELETE FROM nhs_credentials WHERE user_id = ? AND portal = ?';
    await query(sql, [userId, portal]);
    return true;
  }

  static async getAllForUser(userId) {
    const sql = `
      SELECT portal, is_verified, last_login, created_at
      FROM nhs_credentials
      WHERE user_id = ?
    `;

    const results = await query(sql, [userId]);
    return results;
  }

  static async hasCredentials(userId, portal) {
    const credential = await this.findByUserIdAndPortal(userId, portal);
    return credential !== null;
  }
}

module.exports = NHSCredential;
