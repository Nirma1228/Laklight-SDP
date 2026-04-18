const db = require('./config/database');

async function checkCols() {
    try {
        const [cols] = await db.query('SHOW COLUMNS FROM farmer_submissions');
        cols.forEach(c => console.log('COL: ' + c.Field));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkCols();
