const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('✗ Email configuration error:', error.message);
  } else {
    console.log('✓ Email service ready');
  }
});

// Email templates
const emailTemplates = {
  applicationSubmitted: (data) => ({
    subject: `LibaraNHS: Application Submitted - ${data.jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #84cc16; color: white; padding: 20px; text-align: center; }
          .content { background: #f8fafc; padding: 30px; }
          .details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #84cc16; }
          .details h3 { margin-top: 0; color: #84cc16; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
          .btn { display: inline-block; padding: 12px 24px; background: #84cc16; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Submitted Successfully!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.firstName},</p>
            <p>Great news! We've successfully submitted your application.</p>

            <div class="details">
              <h3>Application Details</h3>
              <p><strong>Position:</strong> ${data.jobTitle}</p>
              <p><strong>Employer:</strong> ${data.employer}</p>
              <p><strong>Portal:</strong> NHS ${data.portal}</p>
              <p><strong>Reference:</strong> ${data.jobReference}</p>
              <p><strong>Submitted:</strong> ${data.submissionDate}</p>
            </div>

            <h3>What's Next?</h3>
            <ul>
              <li>Keep an eye on your email for responses from the employer</li>
              <li>Log into your NHS portal to track your application status</li>
              <li>Check your LibaraNHS dashboard for more application opportunities</li>
            </ul>

            <p style="text-align: center;">
              <a href="${process.env.APP_URL}/dashboard" class="btn">View Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>Good luck with your application!</p>
            <p>&copy; ${new Date().getFullYear()} LibaraNHS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  applicationFailed: (data) => ({
    subject: `LibaraNHS: Application Issue - ${data.jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { background: #f8fafc; padding: 30px; }
          .details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .details h3 { margin-top: 0; color: #ef4444; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
          .btn { display: inline-block; padding: 12px 24px; background: #84cc16; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Issue</h1>
          </div>
          <div class="content">
            <p>Hi ${data.firstName},</p>
            <p>We encountered an issue while submitting your application.</p>

            <div class="details">
              <h3>Details</h3>
              <p><strong>Position:</strong> ${data.jobTitle}</p>
              <p><strong>Portal:</strong> NHS ${data.portal}</p>
              <p><strong>Error:</strong> ${data.errorMessage}</p>
            </div>

            <h3>What You Can Do</h3>
            <ul>
              <li>Try applying manually through the NHS portal</li>
              <li>Check your NHS credentials in Settings</li>
              <li>Contact us if this issue persists</li>
            </ul>

            <p style="text-align: center;">
              <a href="${process.env.APP_URL}/dashboard/settings" class="btn">Check Settings</a>
            </p>

            <p>We apologize for the inconvenience.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LibaraNHS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  welcome: (data) => ({
    subject: 'Welcome to LibaraNHS!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #84cc16; color: white; padding: 20px; text-align: center; }
          .content { background: #f8fafc; padding: 30px; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
          .btn { display: inline-block; padding: 12px 24px; background: #84cc16; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LibaraNHS!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.firstName},</p>
            <p>Thank you for joining LibaraNHS. We're excited to help you automate your NHS job applications!</p>

            <h3>Get Started:</h3>
            <ol>
              <li>Upload your resume</li>
              <li>Configure your job preferences</li>
              <li>Add your NHS portal credentials</li>
              <li>Let us handle the applications!</li>
            </ol>

            <p style="text-align: center;">
              <a href="${process.env.APP_URL}/dashboard" class="btn">Go to Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LibaraNHS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](data);
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@libaranhs.com',
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    console.log(`✓ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = {
  transporter,
  sendEmail,
  emailTemplates
};
