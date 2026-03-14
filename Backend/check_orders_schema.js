const db = require('./config/database');

async function checkSchema() {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM orders");
        console.log(JSON.stringify(columns, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
