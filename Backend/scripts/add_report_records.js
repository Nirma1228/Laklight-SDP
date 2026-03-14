const db = require('../config/database');

async function seedReportData() {
  try {
    console.log('Starting to add comprehensive records for reports and dashboard...');

    // 1. Get necessary IDs
    const [[customerRole]] = await db.query("SELECT role_id FROM user_roles WHERE role_name = 'customer'");
    const [[farmerRole]] = await db.query("SELECT role_id FROM user_roles WHERE role_name = 'farmer'");
    const [[activeStatus]] = await db.query("SELECT status_id FROM account_statuses WHERE status_name = 'active'");
    const [[pendingStatus]] = await db.query("SELECT status_id FROM account_statuses WHERE status_name = 'pending'");
    const [[paidStatus]] = await db.query("SELECT payment_status_id FROM payment_statuses WHERE status_name = 'paid'");
    const [[deliveredStatus]] = await db.query("SELECT order_status_id FROM order_statuses WHERE status_name = 'Delivered'");
    const [[category]] = await db.query("SELECT category_id FROM product_categories LIMIT 1");
    const [[unit]] = await db.query("SELECT unit_id FROM measurement_units LIMIT 1");
    const [[grade]] = await db.query("SELECT grade_id FROM quality_grades LIMIT 1");

    if (!customerRole || !activeStatus || !paidStatus || !deliveredStatus || !category || !unit) {
      console.error('Missing necessary reference data in tables. Please run the full schema setup first.');
      process.exit(1);
    }

    // 2. Add Sri Lankan Customers (Active)
    const slCustomers = [
      { name: 'Nimal Perera', email: `nimal_${Date.now()}@example.com`, phone: '0711111111', address: 'No 12, Flower Road, Colombo 07' },
      { name: 'Kumari Fernando', email: `kumari_${Date.now()}@example.com`, phone: '0722222222', address: '45/A, Kandy Road, Peradeniya' },
      { name: 'Sunil Jayasinghe', email: `sunil_${Date.now()}@example.com`, phone: '0773333333', address: 'Galle Face Green, Colombo 03' },
      { name: 'Priyantha Silva', email: `priyantha_${Date.now()}@example.com`, phone: '0754444444', address: 'Main Street, Matara' }
    ];

    const customerIds = [];
    for (const cust of slCustomers) {
      const [userRes] = await db.query(
        'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cust.name, cust.email, cust.phone, '$2a$10$89W1h/I3A2J1o7B9G/3.O.gUvVlU.vN0P0E1I0E0E0E0E0E0E0E0E', customerRole.role_id, activeStatus.status_id, cust.address]
      );
      customerIds.push({ id: userRes.insertId, name: cust.name, address: cust.address });
      console.log(`- Added SL customer: ${cust.name}`);
    }

    // 3. Add a Pending User (For Dashboard Alert)
    const pendingEmail = `pending_user_${Date.now()}@example.com`;
    await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Amal Wickramasinghe', pendingEmail, '0778889999', '$2a$10$89W1h/I3A2J1o7B9G/3.O.gUvVlU.vN0P0E1I0E0E0E0E0E0E0E0E', farmerRole.role_id, pendingStatus.status_id, 'Nilambe Road, Kandy']
    );
    console.log(`- Added pending user: Amal Wickramasinghe`);

    // 4. Add Fruit-Based Products
    const fruitProducts = [
      { name: 'Fresh Mango Jam', price: 650.00, desc: 'Natural mango jam from select Sri Lankan mangoes' },
      { name: 'Pineapple Juice (500ml)', price: 350.00, desc: 'Pure tropical pineapple juice with no added sugar' },
      { name: 'Woodapple Nectar', price: 420.00, desc: 'Traditional Sri Lankan woodapple nectar' },
      { name: 'Mixed Fruit Cordial', price: 850.00, desc: 'Premium mixed fruit cordial for a refreshing drink' }
    ];

    const productIds = [];
    for (const prod of fruitProducts) {
      const [productRes] = await db.query(
        'INSERT INTO products (name, category_id, description, price, unit_id, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [prod.name, category.category_id, prod.desc, prod.price, unit.unit_id, 200, `${prod.name.toLowerCase().replace(/ /g, '_')}.jpg`]
      );
      productIds.push({ id: productRes.insertId, name: prod.name, price: prod.price });
      console.log(`- Added fruit product: ${prod.name}`);
    }

    // 5. Add Orders for each new customer with different fruit products
    for (let i = 0; i < customerIds.length; i++) {
      const cust = customerIds[i];
      const product = productIds[i % productIds.length];
      const orderNumber = `FR-ORD-${Date.now()}-${i}`;
      const quantity = i + 2;
      const amount = product.price * quantity;

      const [orderRes] = await db.query(
        'INSERT INTO orders (order_number, customer_id, total_amount, discount_amount, net_amount, payment_status_id, order_status_id, payment_method, delivery_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderNumber, cust.id, amount, 0.00, amount, paidStatus.payment_status_id, deliveredStatus.order_status_id, 'Card', cust.address]
      );
      const orderId = orderRes.insertId;
      console.log(`- Added order ${orderNumber} for ${cust.name} (${product.name})`);

      // Order Items
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, product.id, quantity, product.price, amount]
      );

      // Feedback for some
      if (i % 2 === 0) {
        await db.query(
          'INSERT INTO feedback (customer_id, order_id, product_quality, packaging, delivery_time, customer_service, value_for_money, feedback_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [cust.id, orderId, 5, 5, 5, 5, 5, `The ${product.name} is absolutely delicious! Very fresh.`]
        );
      }
    }

    // 10. Add a Supplier (Suppliers table)
    await db.query(
      'INSERT INTO suppliers (farm_name, owner_name, location, phone, email, product_types, status, rating, total_deliveries) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['Rajarata Organics', 'Bandara Herath', 'Anuradhapura', '0252223344', 'bandara@rajarata.com', 'Rice, Grains', 'Active', 4.9, 25]
    );
    console.log(`- Added supplier record: Rajarata Organics`);

    // 11. Add final Feedback using the first generated customer and order
    const firstCust = customerIds[0];
    const [lastOrders] = await db.query('SELECT order_id FROM orders WHERE customer_id = ? ORDER BY order_id DESC LIMIT 1', [firstCust.id]);
    const firstOrderId = lastOrders[0].order_id;

    await db.query(
      'INSERT INTO feedback (customer_id, order_id, product_quality, packaging, delivery_time, customer_service, value_for_money, feedback_text, improvements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [firstCust.id, firstOrderId, 5, 5, 4, 5, 5, 'The coconut oil is very pure and fresh. Great Sri Lankan product!', JSON.stringify(['Bulk purchase options'])]
    );
    console.log(`- Added final feedback record`);

    console.log('✅ All report and dashboard records added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding report data:', error);
    process.exit(1);
  }
}

seedReportData();
