const db = require('./config/database');

async function seedProducts() {
    const products = [
        {
            name: 'Lime Mix',
            category_id: 1, // beverages
            price: 150.00,
            description: 'Refreshing lime cordial made from fresh lime extracts. Perfect for mixing with water or soda. 350ml bottle.',
            stock: 100,
            unit_id: 3, // bottle
            img: '/images/Lime Mix.png'
        },
        {
            name: 'Wood Apple Juice',
            category_id: 1, // beverages
            price: 100.00,
            description: 'Traditional Sri Lankan wood apple juice rich in nutrients. Naturally sweet and tangy. 200ml liter bottle.',
            stock: 150,
            unit_id: 3, // bottle
            img: '/images/Wood Apple Juice.png'
        },
        {
            name: 'Mango Jelly',
            category_id: 2, // desserts
            price: 200.00,
            description: 'Premium mango jelly made from fresh mangoes. Great for desserts and breakfast spreads. 100g pack.',
            stock: 0,
            unit_id: 4, // pack
            img: '/images/Mango Jelly.png'
        },
        {
            name: 'Custard powder',
            category_id: 2, // desserts
            price: 300.00,
            description: 'High-quality custard powder for delicious desserts. Rich vanilla flavor. Perfect for puddings and trifles. 100g pack.',
            stock: 80,
            unit_id: 4, // pack
            img: '/images/Custard powder.png'
        }
    ];

    try {
        for (const p of products) {
            // Check if product already exists
            const [existing] = await db.query('SELECT product_id FROM products WHERE name = ?', [p.name]);

            const is_available = p.stock > 0 ? 1 : 0;

            if (existing.length > 0) {
                // Update existing product
                await db.query(`
          UPDATE products 
          SET category_id = ?, description = ?, price = ?, stock_quantity = ?, unit_id = ?, image_url = ?, is_available = ? 
          WHERE name = ?
        `, [p.category_id, p.description, p.price, p.stock, p.unit_id, p.img, is_available, p.name]);
                console.log(`Updated: ${p.name}`);
            } else {
                // Insert new product
                await db.query(`
          INSERT INTO products (name, category_id, description, price, stock_quantity, unit_id, image_url, is_available) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [p.name, p.category_id, p.description, p.price, p.stock, p.unit_id, p.img, is_available]);
                console.log(`Added: ${p.name}`);
            }
        }
        console.log('✅ All products processed successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding products:', err);
        process.exit(1);
    }
}

seedProducts();
