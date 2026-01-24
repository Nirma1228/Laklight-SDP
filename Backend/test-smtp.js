const nodemailer = require('nodemailer');

// Test Brevo SMTP Connection
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'a0bfd6001@smtp-brevo.com',
    pass: 'xsmtpsib-c9dfa534219a2d55797fa98ccd115261d6b9ffcdf7228b81b055a8116729916c-Jltr3aO1k4peqzZe'
  }
});

async function testEmail() {
  try {
    console.log('🔍 Testing SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: '"Laklight Food Products" <a0bfd6001@smtp-brevo.com>',
      to: 'nethmini1228@gmail.com',
      subject: '✅ Test Email - Laklight OTP System',
      html: `
        <h2>SMTP Test Successful!</h2>
        <p>This email confirms that your Brevo SMTP configuration is working correctly.</p>
        <p><strong>Test OTP:</strong> 123456</p>
        <p>You can now register and receive OTP emails.</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📧 Check your email: nethmini1228@gmail.com');
    
  } catch (error) {
    console.error('❌ SMTP Test Failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n⚠️  Authentication failed - Your SMTP key may be:');
      console.error('   - Expired');
      console.error('   - Incorrect');
      console.error('   - Disabled in Brevo dashboard');
      console.error('\n💡 Solution: Generate a new SMTP key from Brevo:');
      console.error('   https://app.brevo.com/settings/keys/smtp');
    }
  }
}

testEmail();
