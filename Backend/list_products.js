const mysql = require('mysql2/promise');
require('dotenv').config({ path: './Backend/.env' });

async function check() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'nnb1228',
            database: process.env.DB_NAME || 'laklight_food_products'
        });

        const [products] = await db.query('SELECT product_id, name, image_url FROM products');
        console.log('Current Products:');
        products.forEach(p => console.log(`${p.product_id}: ${p.name} -> ${p.image_url}`));
        await db.end();
    } catch (err) {
        console.error('Check failed:', err.message);
    }
}

check();
