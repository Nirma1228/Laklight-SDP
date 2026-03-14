const db = require('./config/database');

async function seedSupplyHistory() {
    try {
        const [suppliers] = await db.query('SELECT supplier_id FROM suppliers LIMIT 4');

        if (suppliers.length === 0) {
            console.log('No suppliers found. Seed suppliers first.');
            process.exit(1);
        }

        const products = ['Lime Cordial', 'Mango Juice', 'Mixed Fruit Jam', 'Honey'];

        for (const s of suppliers) {
            // Add 2-3 history records for each supplier
            const count = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < count; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const qty = Math.floor(Math.random() * 500) + 100;
                const price = (Math.random() * 500 + 200).toFixed(2);

                await db.query(`
          INSERT INTO supply_history (supplier_id, product_name, quantity, price, supply_date)
          VALUES (?, ?, ?, ?, DATE_SUB(CURDATE(), INTERVAL ? DAY))
        `, [s.supplier_id, product, qty, price, i * 7]);

                console.log(`Added history for supplier ${s.supplier_id}: ${product}`);
            }
        }

        console.log('✅ Supply history seeding complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding supply history:', err);
        process.exit(1);
    }
}

seedSupplyHistory();
