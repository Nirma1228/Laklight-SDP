const db = require('./config/database');

async function cleanupProducts() {
    try {
        // 1. Delete Premium Coconut Oil specifically
        const [oilProducts] = await db.query("SELECT product_id FROM products WHERE name LIKE '%Coconut Oil%'");

        for (const p of oilProducts) {
            console.log(`Deleting oil product ID: ${p.product_id}`);
            // Clear associations
            await db.query("DELETE FROM feedback WHERE order_id IN (SELECT order_id FROM order_items WHERE product_id = ?)", [p.product_id]);
            await db.query("DELETE FROM order_items WHERE product_id = ?", [p.product_id]);
            await db.query("DELETE FROM inventory_finished WHERE product_id = ?", [p.product_id]);
            await db.query("DELETE FROM products WHERE product_id = ?", [p.product_id]);
        }

        // 2. Ensure exactly 5 fruit products
        const fruitProducts = [
            { name: 'Fresh Mango Jam', price: 650.00, desc: 'Natural mango jam' },
            { name: 'Pineapple Juice (500ml)', price: 350.00, desc: 'Pure tropical juice' },
            { name: 'Woodapple Nectar', price: 420.00, desc: 'Traditional nectar' },
            { name: 'Mixed Fruit Cordial', price: 850.00, desc: 'Premium cordial' },
            { name: 'Guava Juice (100% Pure)', price: 380.00, desc: 'Fresh guava juice' }
        ];

        const [[category]] = await db.query("SELECT category_id FROM product_categories LIMIT 1");
        const [[unit]] = await db.query("SELECT unit_id FROM measurement_units LIMIT 1");

        for (const prod of fruitProducts) {
            const [existing] = await db.query("SELECT product_id FROM products WHERE name = ?", [prod.name]);
            if (existing.length === 0) {
                console.log(`Adding missing fruit product: ${prod.name}`);
                await db.query(
                    'INSERT INTO products (name, category_id, description, price, unit_id, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [prod.name, category.category_id, prod.desc, prod.price, unit.unit_id, 200, `${prod.name.toLowerCase().replace(/ /g, '_')}.jpg`]
                );
            }
        }

        // 3. Delete any OTHER products to keep it strictly 5
        const [all] = await db.query("SELECT product_id, name FROM products");
        for (const p of all) {
            if (!fruitProducts.map(fp => fp.name).includes(p.name)) {
                console.log(`Deleting non-target product: ${p.name}`);
                await db.query("DELETE FROM feedback WHERE order_id IN (SELECT order_id FROM order_items WHERE product_id = ?)", [p.product_id]);
                await db.query("DELETE FROM order_items WHERE product_id = ?", [p.product_id]);
                await db.query("DELETE FROM inventory_finished WHERE product_id = ?", [p.product_id]);
                await db.query("DELETE FROM products WHERE product_id = ?", [p.product_id]);
            }
        }

        console.log('Cleanup complete. Current products:');
        const [final] = await db.query("SELECT name FROM products");
        final.forEach(f => console.log(' - ' + f.name));

        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanupProducts();
