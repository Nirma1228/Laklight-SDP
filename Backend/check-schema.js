const db = require('./config/database');

async function checkSchema() {
    try {
        const [rows] = await db.query('SHOW COLUMNS FROM otp_verifications');
        console.log('--- OTP Table Schema ---');
        rows.forEach(r => {
            console.log(`${r.Field} - ${r.Type}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
