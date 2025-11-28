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

  /**
   * Send application summary email after automation completes
   * @param {string} email - User email
   * @param {Object} data - Summary data
   * @param {string} data.firstName - User first name
   * @param {Object} data.summary - Summary object with total, successful, failed counts
   * @param {Array} data.results - Array of application results
   */
  static async sendApplicationSummary(email, data) {
    const { firstName, summary, results } = data;

    console.log(`[EMAIL] Application summary email would be sent to ${email}`);
    console.log(`[EMAIL] Summary: ${summary.successful}/${summary.total} applications submitted`);

    // TODO: Implement proper email template with summary details
    // For now, just log the summary
    if (results && results.length > 0) {
      console.log('[EMAIL] Application results:');
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.jobTitle} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
        if (result.referenceNumber) {
          console.log(`     Reference: ${result.referenceNumber}`);
        }
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      });
    }
  }

  /**
   * Send automation error email when automation fails
   * @param {string} email - User email
   * @param {Object} data - Error data
   * @param {string} data.firstName - User first name
   * @param {string} data.error - Error message
   */
  static async sendAutomationError(email, data) {
    const { firstName, error } = data;

    console.log(`[EMAIL] Automation error email would be sent to ${email}`);
    console.log(`[EMAIL] Error: ${error}`);

    // TODO: Implement proper email template for automation errors
  }
}

module.exports = EmailService;
