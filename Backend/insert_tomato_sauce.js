const db = require('./config/database');

async function insertTomatoSauce() {
    try {
        console.log('Starting Tomato Sauce insertion...');

        const p = {
            name: 'Tomato Sauce (400g)',
            category_name: 'sauces',
            price: 250.00,
            description: 'Laklight Super Tomato Sauce. Delicious and high-quality tomato sauce. 400g pouch.',
            stock: 300,
            unit_name: 'unit',
            img: '/images/Tomato sause.png'
        };

        // 1. Get Category ID (ensure it exists)
        const [categories] = await db.query('SELECT category_id FROM product_categories WHERE category_name = ?', [p.category_name]);
        let categoryId;
        if (categories.length === 0) {
            console.log('Creating "sauces" category...');
            const [catResult] = await db.query('INSERT INTO product_categories (category_name) VALUES (?)', [p.category_name]);
            categoryId = catResult.insertId;
        } else {
            categoryId = categories[0].category_id;
        }

        // 2. Get Unit ID
        const [units] = await db.query('SELECT unit_id FROM measurement_units WHERE unit_name = ?', [p.unit_name]);
        const unitId = units.length > 0 ? units[0].unit_id : 3; // Default to 'bottle' or first found

        // 3. Check if product already exists
        const [existing] = await db.query('SELECT product_id FROM products WHERE name = ?', [p.name]);

        if (existing.length > 0) {
            await db.query(`
                UPDATE products 
                SET category_id = ?, description = ?, price = ?, stock_quantity = ?, unit_id = ?, image_url = ?, is_available = 1 
                WHERE name = ?
            `, [categoryId, p.description, p.price, p.stock, unitId, p.img, p.name]);
            console.log(`✅ Updated existing product: ${p.name}`);
        } else {
            await db.query(`
                INSERT INTO products (name, category_id, description, price, stock_quantity, unit_id, image_url, is_available) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            `, [p.name, categoryId, p.description, p.price, p.stock, unitId, p.img]);
            console.log(`✅ Inserted new product: ${p.name}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating/inserting product:', err);
        process.exit(1);
    }
}

insertTomatoSauce();
