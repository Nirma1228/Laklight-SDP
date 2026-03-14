const mysql = require('mysql2/promise');
require('dotenv').config({ path: './Backend/.env' });

async function updateProducts() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'nnb1228',
            database: process.env.DB_NAME || 'laklight_food_products'
        });

        console.log('Updating product names and images...');

        const updates = [
            { id: 1, name: 'Mango Jelly', img: '/images/Mango Jelly.png', desc: 'Premium mango jelly 100g' },
            { id: 2, name: 'Wood Apple Juice', img: '/images/Wood Apple Juice.png', desc: 'Traditional wood apple nectar 200ml' },
            { id: 3, name: 'Custard Powder', img: '/images/Custard powder.png', desc: 'Mango flavored custard powder 100g' },
            { id: 4, name: 'Lime Mix', img: '/images/Lime Mix.png', desc: 'Refreshing lime cordial 350ml' }
        ];

        for (const p of updates) {
            await db.query(
                'UPDATE products SET name = ?, image_url = ?, description = ? WHERE product_id = ?',
                [p.name, p.img, p.desc, p.id]
            );
            console.log(`Updated ID ${p.id}: ${p.name}`);
        }

        await db.end();
        console.log('✅ Database updated successfully!');
    } catch (err) {
        console.error('❌ Update failed:', err.message);
    }
}

updateProducts();
