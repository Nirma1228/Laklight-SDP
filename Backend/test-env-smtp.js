const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('--- SMTP Env Diagnostic ---');
console.log('Host:', process.env.EMAIL_HOST || 'smtp-relay.brevo.com');
console.log('Port:', process.env.EMAIL_PORT || 587);
console.log('User:', process.env.EMAIL_USER);
console.log('Password length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function test() {
    try {
        console.log('\n🔍 Verifying transporter...');
        await transporter.verify();
        console.log('✅ Transporter verified!');

        console.log('\n📧 Sending test mail...');
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Laklight Test'}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Laklight SMTP Test',
            text: 'If you see this, SMTP is working with .env credentials.'
        });
        console.log('✅ Send successful! ID:', info.messageId);
    } catch (err) {
        console.error('\n❌ SMTP Test Failed');
        console.error('Code:', err.code);
        console.error('Response:', err.response);
        console.error('Message:', err.message);
    }
}

test();
