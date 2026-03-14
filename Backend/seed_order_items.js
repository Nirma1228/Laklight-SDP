const db = require('./config/database');

async function seedOrderItems() {
    try {
        // 1. Ensure we have a customer (using user_id 9 as found earlier)
        const customer_id = 9;

        // 2. Create a sample order
        const order_number = 'ORD-' + Date.now();
        const [orderResult] = await db.query(`
      INSERT INTO orders (
        order_number, customer_id, total_amount, discount_amount, net_amount, 
        payment_status_id, order_status_id, payment_method, delivery_address, order_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            order_number, customer_id, 400.00, 0.00, 400.00,
            1, 1, 'card', '123 Test Street, Colombo', new Date()
        ]);

        const orderId = orderResult.insertId;
        console.log('Created Order ID:', orderId);

        // 3. Add items to order_items
        const items = [
            { product_id: 1, quantity: 2, price: 150.00 }, // Lime Mix
            { product_id: 2, quantity: 1, price: 100.00 }  // Wood Apple Juice
        ];

        for (const item of items) {
            const subtotal = item.quantity * item.price;
            await db.query(`
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `, [orderId, item.product_id, item.quantity, item.price, subtotal]);
            console.log(`Added Item: Product ${item.product_id}, Quantity ${item.quantity}`);
        }

        console.log('✅ Order items seeded successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding order items:', err);
        process.exit(1);
    }
}

seedOrderItems();
