const db = require('./config/database');

async function totalCleanupAndFruitSeed() {
    try {
        console.log('Starting total cleanup (Resetting IDs to 1)...');

        // Disable foreign key checks to allow truncation/reset
        await db.query("SET FOREIGN_KEY_CHECKS = 0");

        const tablesToReset = [
            'feedback', 'payments', 'order_items', 'orders', 'cart',
            'deliveries', 'inventory_finished', 'inventory_raw',
            'farmer_submissions', 'farmer_bank_details', 'farmer_profiles',
            'supply_history', 'suppliers', 'users', 'products'
        ];

        for (const table of tablesToReset) {
            await db.query(`DELETE FROM ${table}`);
            await db.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        }
        console.log('- Cleared all tables and reset Auto-Increment counters to 1.');

        // Re-enable foreign key checks
        await db.query("SET FOREIGN_KEY_CHECKS = 1");

        // 1. Restore Admin User (ID will be 1)
        const [[adminRole]] = await db.query("SELECT role_id FROM user_roles WHERE role_name = 'admin'");
        const [[activeStatus]] = await db.query("SELECT status_id FROM account_statuses WHERE status_name = 'active'");

        await db.query(
            'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id) VALUES (?, ?, ?, ?, ?, ?)',
            ['System Administrator', 'admin@laklight.lk', '0112223344', '$2a$10$89W1h/I3A2J1o7B9G/3.O.gUvVlU.vN0P0E1I0E0E0E0E0E0E0E0E', adminRole.role_id, activeStatus.status_id]
        );
        console.log('- Restored Admin User at ID 1.');

        // 2. Seed Fruit Products (IDs 1-5)
        const fruitProducts = [
            { name: 'Fresh Mango Jam', price: 650.00, desc: 'Natural mango jam' },
            { name: 'Pineapple Juice (500ml)', price: 350.00, desc: 'Pure tropical juice' },
            { name: 'Woodapple Nectar', price: 420.00, desc: 'Traditional nectar' },
            { name: 'Mixed Fruit Cordial', price: 850.00, desc: 'Premium cordial' },
            { name: 'Guava Juice (100% Pure)', price: 380.00, desc: 'Fresh guava juice' }
        ];

        const [[category]] = await db.query("SELECT category_id FROM product_categories LIMIT 1");
        const [[unit]] = await db.query("SELECT unit_id FROM measurement_units LIMIT 1");
        const [[grade]] = await db.query("SELECT grade_id FROM quality_grades LIMIT 1");

        const productIds = [];
        for (const prod of fruitProducts) {
            const [res] = await db.query(
                'INSERT INTO products (name, category_id, description, price, unit_id, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [prod.name, category.category_id, prod.desc, prod.price, unit.unit_id, 200, `${prod.name.toLowerCase().replace(/ /g, '_')}.jpg`]
            );
            productIds.push({ id: res.insertId, name: prod.name, price: prod.price });
        }
        console.log('- Seeded 5 fruit products starting from ID 1.');

        // 3. Seed 5 Sri Lankan Customers
        const slCustomers = [
            { name: 'Nimal Perera', email: 'nimal@example.lk', phone: '0711111111', address: 'Colombo 07' },
            { name: 'Kumari Fernando', email: 'kumari@example.lk', phone: '0722222222', address: 'Peradeniya, Kandy' },
            { name: 'Sunil Jayasinghe', email: 'sunil@example.lk', phone: '0773333333', address: 'Galle Face, Colombo' },
            { name: 'Priyantha Silva', email: 'priyantha@example.lk', phone: '0754444444', address: 'Main Street, Matara' },
            { name: 'Amara Wickramasinghe', email: 'amara@example.lk', phone: '0765555555', address: 'Anuradhapura Central' }
        ];

        const [[custRole]] = await db.query("SELECT role_id FROM user_roles WHERE role_name = 'customer'");
        const [[paidStatus]] = await db.query("SELECT payment_status_id FROM payment_statuses WHERE status_name = 'paid'");
        const [[deliveredStatus]] = await db.query("SELECT order_status_id FROM order_statuses WHERE status_name = 'Delivered'");

        for (let i = 0; i < slCustomers.length; i++) {
            const cust = slCustomers[i];
            const [userRes] = await db.query(
                'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [cust.name, cust.email, cust.phone, 'hashed_pass_here', custRole.role_id, activeStatus.status_id, cust.address]
            );
            const userId = userRes.insertId;

            const product = productIds[i % productIds.length];
            const orderNumber = `FR-ORD-${1000 + i}`;
            const quantity = 3;
            const amount = product.price * quantity;

            const [orderRes] = await db.query(
                'INSERT INTO orders (order_number, customer_id, total_amount, discount_amount, net_amount, payment_status_id, order_status_id, payment_method, delivery_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [orderNumber, userId, amount, 0.00, amount, paidStatus.payment_status_id, deliveredStatus.order_status_id, 'Stripe', cust.address]
            );
            const orderId = orderRes.insertId;
            console.log(`- Created Order ID: ${orderId} (${orderNumber})`);

            await db.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, subtotal) VALUES (?, ?, ?, ?, ?)',
                [orderId, product.id, quantity, product.price, amount]
            );

            await db.query(
                'INSERT INTO feedback (customer_id, order_id, product_quality, packaging, delivery_time, customer_service, value_for_money, feedback_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, orderId, 5, 5, 5, 5, 5, `Excellent ${product.name}! Highly recommended.`]
            );
        }

        // 4. Seed Inventory
        await db.query(
            'INSERT INTO inventory_raw (material_name, grade_id, quantity_units, unit_id, received_date, expiry_date, storage_location) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['Fresh Green Mangoes', grade.grade_id, 1000, unit.unit_id, '2026-03-10', '2026-03-25', 'Cold Storage A']
        );

        for (const prod of productIds) {
            await db.query(
                'INSERT INTO inventory_finished (product_id, batch_number, manufactured_date, expiry_date, quantity_units, storage_location) VALUES (?, ?, ?, ?, ?, ?)',
                [prod.id, `BATCH-${1000 + prod.id}`, '2026-03-01', '2027-03-01', 150, 'Warehouse Shelf C']
            );
        }

        // 5. Add Pending Farmer
        const [[farmerRole]] = await db.query("SELECT role_id FROM user_roles WHERE role_name = 'farmer'");
        const [[pendingStatus]] = await db.query("SELECT status_id FROM account_statuses WHERE status_name = 'pending'");
        await db.query(
            'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['Rathnayake Bandara', 'rathna@farmer.lk', '0789998888', 'hashed_pass_here', farmerRole.role_id, pendingStatus.status_id, 'Kuruwita, Ratnapura']
        );

        console.log('✅ Success! All IDs (including Order ID) have been reset to start from 1.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

totalCleanupAndFruitSeed();
