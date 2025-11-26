const { sendEmail } = require('../config/email');

/**
 * Email service wrapper for consistent email sending throughout the application
 */

class EmailService {
  /**
   * Send welcome email to new user
   * @param {string} email - User email
   * @param {string} firstName - User first name
   */
  static async sendWelcomeEmail(email, firstName) {
    return await sendEmail(email, 'welcome', { firstName });
  }

  /**
   * Send application submitted email
   * @param {Object} user - User object
   * @param {Object} application - Application details
   */
  static async sendApplicationSubmittedEmail(user, application) {
    return await sendEmail(user.email, 'applicationSubmitted', {
      firstName: user.first_name,
      jobTitle: application.job_title,
      employer: application.employer,
      portal: application.portal === 'scotland' ? 'Scotland' : 'England',
      jobReference: application.job_reference,
      submissionDate: new Date(application.submission_date).toLocaleString()
    });
  }

  /**
   * Send application failed email
   * @param {Object} user - User object
   * @param {Object} application - Application details
   * @param {string} errorMessage - Error message
   */
  static async sendApplicationFailedEmail(user, application, errorMessage) {
    return await sendEmail(user.email, 'applicationFailed', {
      firstName: user.first_name,
      jobTitle: application.job_title,
      portal: application.portal === 'scotland' ? 'Scotland' : 'England',
      errorMessage: errorMessage || 'Unknown error occurred'
    });
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} firstName - User first name
   * @param {string} resetLink - Password reset link
   */
  static async sendPasswordResetEmail(email, firstName, resetLink) {
    // TODO: Implement password reset email template
    console.log(`Password reset email would be sent to ${email} with link: ${resetLink}`);
  }

  /**
   * Send email verification email
   * @param {string} email - User email
   * @param {string} firstName - User first name
   * @param {string} verificationLink - Email verification link
   */
  static async sendVerificationEmail(email, firstName, verificationLink) {
    // TODO: Implement email verification template
    console.log(`Verification email would be sent to ${email} with link: ${verificationLink}`);
  }
}

module.exports = EmailService;
