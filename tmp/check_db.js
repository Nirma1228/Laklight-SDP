const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'laklight_food_products'
    });

    try {
        const [suppliers] = await db.query('SELECT * FROM suppliers');
        console.log('Suppliers:', JSON.stringify(suppliers, null, 2));
        const [history] = await db.query('SELECT * FROM supply_history');
        console.log('History:', JSON.stringify(history, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

check();
