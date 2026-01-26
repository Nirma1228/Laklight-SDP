const nodemailer = require('nodemailer');
require('dotenv').config();

// Debug logs for initialization
console.log('📧 Email Service Initializing...');
console.log('   Host:', process.env.EMAIL_HOST || 'smtp-relay.brevo.com');
console.log('   User:', process.env.EMAIL_USER || 'Not set');

// Brevo SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: parseInt(process.env.EMAIL_PORT) === 465, // True for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  // High-reliability settings for restricted networks
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 45000,
  debug: true,
  logger: true,
  tls: {
    // Required for some local network environments
    rejectUnauthorized: false
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, fullName, otp) => {
  console.log(`✉️ Attempting to send OTP to: ${email}...`);
  try {
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'Laklight Food Products';

    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to: email,
      subject: '🔐 Email Verification - Laklight Food Products',
    };
    console.log(`📡 Sending SMTP from: ${mailOptions.from} to: ${mailOptions.to}`);

    mailOptions.html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f9fafb; padding-bottom: 40px; }
            .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #1f2937; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            .header { background-color: #ffffff; padding: 32px; text-align: center; border-bottom: 1px solid #f3f4f6; }
            .logo { height: 48px; width: auto; }
            .content { padding: 40px 32px; text-align: center; }
            .title { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 16px; }
            .subtitle { font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 32px; }
            .otp-container { background-color: #f0fdf4; border: 2px solid #2e7d32; border-radius: 12px; padding: 24px; margin: 32px 0; }
            .otp-code { font-size: 40px; font-weight: 800; color: #166534; letter-spacing: 12px; font-family: monospace; margin: 0; }
            .expiry { font-size: 14px; color: #15803d; font-weight: 500; margin-top: 8px; }
            .button { display: inline-block; padding: 14px 32px; background-color: #2e7d32; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; }
            .footer { padding: 32px; background-color: #f9fafb; text-align: center; font-size: 13px; color: #6b7280; line-height: 20px; }
            .warning { font-size: 12px; color: #9ca3af; margin-top: 24px; padding: 16px; background-color: #fffbeb; border-radius: 8px; border: 1px solid #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <center class="wrapper">
            <table class="main">
              <tr>
                <td class="header">
                  <h1 style="margin:0; color:#2e7d32; font-size:28px;">🌿 Laklight</h1>
                  <p style="margin:4px 0 0 0; color:#6b7280; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Food Products</p>
                </td>
              </tr>
              <tr>
                <td class="content">
                  <h2 class="title">Verify your email address</h2>
                  <p class="subtitle">Hi ${fullName}, thank you for joining Laklight! Please use the following code to complete your registration.</p>
                  
                  <div class="otp-container">
                    <p style="margin:0 0 8px 0; font-size:14px; font-weight:600; color:#166534; text-transform:uppercase;">Your Verification Code</p>
                    <p class="otp-code">${otp}</p>
                    <p class="expiry">Expires in 10 minutes</p>
                  </div>

                  <p style="font-size:14px; color:#6b7280;">If you didn't request this code, you can safely ignore this email.</p>
                  
                  <div class="warning">
                    <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code via phone or email.
                  </div>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p style="margin-bottom:16px;">
                    <strong>Laklight Food Products</strong><br>
                    Fresh, Organic & Quality Products directly from farmers.
                  </p>
                  <p style="margin-bottom:0;">
                    © ${new Date().getFullYear()} Laklight. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </center>
        </body>
        </html>
      `;

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent successfully! Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);

    if (error.code === 'EAUTH') {
      console.error('   ⚠️ AUTHENTICATION FAILED: Check your EMAIL_PASSWORD in .env');
    }

    throw error;
  }
};

// Send Welcome Email (after successful verification)
const sendWelcomeEmail = async (email, fullName, userType) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Laklight Food Products'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to Laklight Food Products!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f9fafb; padding-bottom: 40px; }
            .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #1f2937; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            .header { background-color: #2e7d32; padding: 40px; text-align: center; color: #ffffff; }
            .content { padding: 40px 32px; text-align: center; }
            .title { font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 16px; }
            .welcome-box { background-color: #f0fdf4; border: 1px solid #bcf0da; border-radius: 12px; padding: 24px; margin: 32px 0; }
            .footer { padding: 32px; background-color: #f9fafb; text-align: center; font-size: 13px; color: #6b7280; }
          </style>
        </head>
        <body>
          <center class="wrapper">
            <table class="main">
              <tr>
                <td class="header">
                  <h1 style="margin:0; font-size:32px;">🌿 Laklight</h1>
                  <p style="margin:8px 0 0 0; opacity:0.9; text-transform:uppercase; letter-spacing:1px; font-size:12px;">Quality You Can Trust</p>
                </td>
              </tr>
              <tr>
                <td class="content">
                  <h2 class="title">Welcome to the family!</h2>
                  <p style="font-size:16px; color:#4b5563; line-height:24px;">Hi ${fullName}, we're so excited to have you join Laklight Food Products. Your journey to fresh, organic living starts here.</p>
                  
                  <div class="welcome-box">
                    <h3 style="margin:0 0 8px 0; color:#166534;">✅ Account Activated</h3>
                    <p style="margin:0; color:#374151;">Your ${userType} account is now fully verified and ready to use.</p>
                  </div>

                  <p style="font-size:14px; color:#6b7280; margin-top:32px;">You can now login to your dashboard and start exploring.</p>
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display:inline-block; padding:14px 32px; background-color:#2e7d32; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; margin-top:16px;">Go to Dashboard</a>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p>Developed with ❤️ for Laklight Food Products</p>
                  <p>© ${new Date().getFullYear()} Laklight. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </center>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send a generic email with custom subject and body
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} title - Main heading in the email
 * @param {string} body - HTML body content
 */
const sendGenericEmail = async (to, subject, title, body) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Laklight Food Products'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
            .main { background-color: #ffffff; margin: 20px auto; width: 100%; max-width: 600px; border-radius: 8px; overflow: hidden; }
            .header { background-color: #2e7d32; padding: 20px; color: white; text-align: center; }
            .content { padding: 32px; color: #374151; line-height: 1.6; }
            .footer { padding: 20px; background-color: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="main">
            <div class="header">
              <h2 style="margin:0;">🌿 Laklight</h2>
            </div>
            <div class="content">
              <h1 style="font-size: 20px; color: #111827; margin-top: 0;">${title}</h1>
              ${body}
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Laklight Food Products</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending generic email:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  sendGenericEmail
};
