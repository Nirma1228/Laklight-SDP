const mysql = require('mysql2/promise');
require('dotenv').config({ path: './Backend/.env' });

async function check() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'laklight_food_products'
        });

        const [suppliers] = await db.query('SELECT * FROM suppliers');
        console.log(`Suppliers count: ${suppliers.length}`);
        if (suppliers.length > 0) {
            console.log('First supplier:', suppliers[0].farm_name);
        }
        await db.end();
    } catch (err) {
        console.error('Check failed:', err.message);
    }
}

check();
