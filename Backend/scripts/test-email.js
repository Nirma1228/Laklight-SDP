require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing SMTP Configuration...\n');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');
console.log('EMAIL_FROM_ADDRESS:', process.env.EMAIL_FROM_ADDRESS);
console.log('\n');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true, // Enable debug output
  logger: true // Enable logging
});

async function testEmail() {
  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    console.log('Sending test email...');
    const testEmail = process.env.EMAIL_FROM_ADDRESS || 'nirmanethmini@gmail.com';
    
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Laklight OTP'}" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: 'Test Email from Laklight - ' + new Date().toLocaleString(),
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2e7d32;">✅ SMTP Test Successful!</h2>
          <p>This is a test email from Laklight Food Products.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${process.env.EMAIL_HOST}</li>
            <li>Port: ${process.env.EMAIL_PORT}</li>
            <li>User: ${process.env.EMAIL_USER}</li>
          </ul>
          <p style="color: #666; font-size: 12px;">If you received this email, your SMTP configuration is working correctly.</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n📧 Check your inbox at:', testEmail);
    console.log('⚠️  If you don\'t see it, check your spam/junk folder.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    if (error.code) {
      console.error('Error Code:', error.code);
    }
  }
}

testEmail();
