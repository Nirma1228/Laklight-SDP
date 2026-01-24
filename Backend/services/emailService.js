const nodemailer = require('nodemailer');

// Brevo SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'a0bfd6001@smtp-brevo.com',
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, fullName, otp) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Laklight Food Products'}" <${process.env.EMAIL_USER || 'a0bfd6001@smtp-brevo.com'}>`,
      to: email,
      subject: '🔐 Email Verification - Laklight Food Products',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 30px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 14px;
              opacity: 0.9;
            }
            .content {
              padding: 40px 30px;
              color: #333333;
            }
            .content h2 {
              color: #2e7d32;
              margin-bottom: 20px;
            }
            .otp-box {
              background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
              border-left: 4px solid #2e7d32;
              padding: 25px;
              margin: 30px 0;
              border-radius: 8px;
              text-align: center;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #1b5e20;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
              margin: 10px 0;
            }
            .info-text {
              color: #666;
              font-size: 14px;
              line-height: 1.6;
              margin: 15px 0;
            }
            .warning {
              background-color: #fff3e0;
              border-left: 4px solid #ff9800;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .warning p {
              margin: 0;
              color: #e65100;
              font-size: 13px;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px 30px;
              text-align: center;
              color: #999;
              font-size: 12px;
            }
            .footer a {
              color: #2e7d32;
              text-decoration: none;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #ddd, transparent);
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🌿 Laklight Food Products</h1>
              <p>Quality You Can Trust</p>
            </div>
            
            <div class="content">
              <h2>Hello ${fullName}! 👋</h2>
              <p class="info-text">
                Thank you for registering with <strong>Laklight Food Products</strong>. 
                We're excited to have you join our community!
              </p>
              
              <p class="info-text">
                To complete your registration and verify your email address, please use the 
                One-Time Password (OTP) below:
              </p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
              </div>
              
              <p class="info-text">
                Simply enter this code on the verification page to activate your account 
                and start exploring our fresh, organic products.
              </p>
              
              <div class="divider"></div>
              
              <div class="warning">
                <p>
                  ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. 
                  Our team will never ask for your OTP via phone or email.
                </p>
              </div>
              
              <p class="info-text" style="margin-top: 30px;">
                If you didn't request this verification code, please ignore this email 
                or contact our support team immediately.
              </p>
            </div>
            
            <div class="footer">
              <p>
                <strong>Laklight Food Products</strong><br>
                Providing Fresh, Organic & Quality Products<br>
                📧 <a href="mailto:support@laklight.com">support@laklight.com</a> | 
                📞 +94 XX XXX XXXX
              </p>
              <p style="margin-top: 15px;">
                © ${new Date().getFullYear()} Laklight Food Products. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Send Welcome Email (after successful verification)
const sendWelcomeEmail = async (email, fullName, userType) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Laklight Food Products'}" <${process.env.EMAIL_USER || 'a0bfd6001@smtp-brevo.com'}>`,
      to: email,
      subject: '🎉 Welcome to Laklight Food Products!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 30px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0 0 10px;
              font-size: 32px;
            }
            .content {
              padding: 40px 30px;
              color: #333333;
            }
            .welcome-message {
              background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px 30px;
              text-align: center;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🎉 Welcome to Laklight!</h1>
              <p>Your account is now active</p>
            </div>
            <div class="content">
              <h2>Hello ${fullName}! 👋</h2>
              <div class="welcome-message">
                <h3>✅ Email Verified Successfully!</h3>
                <p>Your ${userType} account is ready to use.</p>
              </div>
              <p>Thank you for joining Laklight Food Products. Start exploring our fresh, organic products today!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Laklight Food Products. All rights reserved.</p>
            </div>
          </div>
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

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
};
