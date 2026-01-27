const db = require('./config/database');

async function checkOtps() {
    try {
        console.log('--- Recent OTPs ---');
        const [rows] = await db.query('SELECT id, email, otp, flow_type, verified, created_at, expires_at FROM otp_verifications ORDER BY created_at DESC LIMIT 5');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkOtps();
