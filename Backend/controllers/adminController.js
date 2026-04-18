const db = require('../config/database');
const bcrypt = require('bcryptjs');

const getId = async (table, pk, col, val) => {
  const [rows] = await db.query(`SELECT ${pk} FROM ${table} WHERE ${col} = ?`, [val]);
  return rows.length > 0 ? rows[0][pk] : null;
};

// FR15: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.user_id as id, u.full_name, u.email, u.phone, u.address, u.city, u.postal_code, u.district, r.role_name as user_type, s.status_name as status, u.join_date 
      FROM users u
      JOIN user_roles r ON u.role_id = r.role_id
      JOIN account_statuses s ON u.status_id = s.status_id
      ORDER BY u.join_date DESC
    `);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

// Update status
exports.changeUserStatus = async (req, res) => {
  try {
    const statusId = await getId('account_statuses', 'status_id', 'status_name', req.body.status);
    if (!statusId) return res.status(400).json({ message: 'Invalid status' });
    await db.query('UPDATE users SET status_id = ? WHERE user_id = ?', [statusId, req.params.id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// FR16: Analytics Dashboard
exports.getAnalyticsDashboard = async (req, res) => {
  try {
    const [[userStats]] = await db.query(`
      SELECT COUNT(*) as total_users,
      SUM(CASE WHEN r.role_name = 'customer' THEN 1 ELSE 0 END) as customers,
      SUM(CASE WHEN r.role_name = 'farmer' THEN 1 ELSE 0 END) as farmers
      FROM users u JOIN user_roles r ON u.role_id = r.role_id`);

    const [[orderStats]] = await db.query(`
      SELECT COUNT(*) as total_orders, SUM(net_amount) as total_revenue
      FROM orders`);

    const [recentOrders] = await db.query(`
      SELECT o.*, o.order_id as id, u.full_name as customer_name, os.status_name as status
      FROM orders o
      JOIN users u ON o.customer_id = u.user_id
      JOIN order_statuses os ON o.order_status_id = os.order_status_id
      ORDER BY o.order_date DESC LIMIT 5`);

    // Fetch pending user registrations
    const [pendingUsers] = await db.query(`
      SELECT u.user_id as id, u.full_name, u.email, u.join_date, r.role_name as user_type 
      FROM users u
      JOIN user_roles r ON u.role_id = r.role_id
      JOIN account_statuses s ON u.status_id = s.status_id
      WHERE s.status_name = 'pending'
      ORDER BY u.join_date DESC LIMIT 5
    `);

    res.json({ success: true, dashboard: { users: userStats, orders: orderStats, recentOrders, pendingUsers } });
  } catch (error) {
    res.status(500).json({ message: 'Analytics failed', error: error.message });
  }
};

// --- System Settings ---
exports.getSystemSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key as `key`, setting_value as value FROM system_settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ success: true, settings });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db.query('INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, value, value]);
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) { res.status(500).json({ message: 'Update failed', error: error.message }); }
};

exports.deleteUser = async (req, res) => {
  if (parseInt(req.params.id) === req.user.userId) return res.status(400).json({ message: 'Self-delete blocked' });
  await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
  res.json({ success: true, message: 'User removed' });
};
// FR15: Admin User Management
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, address, city, postalCode, district } = req.body;
    const roleId = await getId('user_roles', 'role_id', 'role_name', role);
    const activeStatusId = await getId('account_statuses', 'status_id', 'status_name', 'active');
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id, address, city, postal_code, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [fullName, email, phone, hash, roleId, activeStatusId, address, city, postalCode, district]
    );
    res.status(201).json({ success: true, message: 'User created' });
  } catch (error) { res.status(500).json({ message: 'Create failed', error: error.message }); }
};

exports.getUserDetails = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT u.*, r.role_name as role, s.status_name as status FROM users u JOIN user_roles r ON u.role_id = r.role_id JOIN account_statuses s ON u.status_id = s.status_id WHERE u.user_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user: rows[0] });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const { fullName, phone, address, city, postalCode, district } = req.body;
    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ?, city = ?, postal_code = ?, district = ? WHERE user_id = ?', 
      [fullName, phone, address, city, postalCode, district, req.params.id]
    );
    res.json({ success: true, message: 'User updated' });
  } catch (error) { res.status(500).json({ message: 'Update failed', error: error.message }); }
};

exports.changeUserRole = async (req, res) => {
  try {
    const roleId = await getId('user_roles', 'role_id', 'role_name', req.body.role);
    if (!roleId) return res.status(400).json({ message: 'Invalid role' });
    await db.query('UPDATE users SET role_id = ? WHERE user_id = ?', [roleId, req.params.id]);
    res.json({ success: true, message: 'Role changed' });
  } catch (error) { res.status(500).json({ message: 'Update failed', error: error.message }); }
};

// --- Analytics ---
exports.getSalesAnalytics = async (req, res) => {
  try {
    const [sales] = await db.query('SELECT DATE(order_date) as date, SUM(net_amount) as total FROM orders GROUP BY DATE(order_date) ORDER BY date DESC');
    res.json({ success: true, sales });
  } catch (error) { res.status(500).json({ message: 'Sales failed', error: error.message }); }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const [revenue] = await db.query('SELECT MONTHNAME(order_date) as month, SUM(net_amount) as total FROM orders GROUP BY month ORDER BY MIN(order_date)');
    res.json({ success: true, revenue });
  } catch (error) { res.status(500).json({ message: 'Revenue failed', error: error.message }); }
};

exports.getCustomerAnalytics = async (req, res) => {
  try {
    const [customers] = await db.query('SELECT u.full_name, COUNT(o.order_id) as order_count, SUM(o.net_amount) as total_spent FROM users u JOIN orders o ON u.user_id = o.customer_id GROUP BY u.user_id ORDER BY total_spent DESC');
    res.json({ success: true, customers });
  } catch (error) { res.status(500).json({ message: 'Customer stats failed', error: error.message }); }
};

exports.getProductAnalytics = async (req, res) => {
  try {
    const [products] = await db.query('SELECT p.name, COUNT(oi.order_item_id) as sales_count, SUM(oi.subtotal) as total_revenue FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id ORDER BY total_revenue DESC');
    res.json({ success: true, products });
  } catch (error) { res.status(500).json({ message: 'Product stats failed', error: error.message }); }
};

// --- Feedback ---
exports.getAllFeedback = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT f.*, f.feedback_id as id, u.full_name as customer_name FROM feedback f JOIN users u ON f.customer_id = u.user_id ORDER BY f.created_at DESC');
    res.json({ success: true, feedback: rows });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.getFeedbackDetails = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT f.*, u.full_name as customer_name, o.order_number FROM feedback f JOIN users u ON f.customer_id = u.user_id JOIN orders o ON f.order_id = o.order_id WHERE f.feedback_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ success: true, feedback: rows[0] });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.getComplaints = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM feedback WHERE product_quality <= 2 OR customer_service <= 2 ORDER BY created_at DESC');
    res.json({ success: true, complaints: rows });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.getCompliments = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM feedback WHERE product_quality >= 4 AND customer_service >= 4 ORDER BY created_at DESC');
    res.json({ success: true, compliments: rows });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

// --- Database Maintenance ---
exports.seedMaintenanceData = async (req, res) => {
  try {
    // Disable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 0');

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

    // Re-enable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. Restore Admin User
    const [[adminRole]] = await db.query("SELECT role_id FROM user_roles WHERE role_name = 'admin'");
    const [[activeStatus]] = await db.query("SELECT status_id FROM account_statuses WHERE status_name = 'active'");

    await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id, address, city, postal_code, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['System Administrator', 'admin@laklight.lk', '0112223344', '$2a$10$89W1h/I3A2J1o7B9G/3.O.gUvVlU.vN0P0E1I0E0E0E0E0E0E0E0E', adminRole.role_id, activeStatus.status_id, 'No. 45, Main St, Colombo', 'Colombo', '00100', 'colombo']
    );

    // 2. Seed Fruit Products (Updated to match available images)
    const fruitProducts = [
      { name: 'Mango Jelly', price: 350.00, desc: 'Deliciously sweet and smooth mango jelly.', img: '/images/Mango Jelly.png' },
      { name: 'Wood Apple Juice', price: 280.00, desc: 'Refreshingly traditional wood apple juice.', img: '/images/Wood Apple Juice.png' },
      { name: 'Custard Powder', price: 450.00, desc: 'Premium custard powder for perfect desserts.', img: '/images/Custard powder.png' },
      { name: 'Lime Mix', price: 320.00, desc: 'Pure lime concentrate mix.', img: '/images/Lime Mix.png' },
      { name: 'Fresh Mixed Fruit', price: 550.00, desc: 'Hand-picked premium mixed fruit jam.', img: '/images/placeholder.png' },
      { name: 'Guava Juice', price: 300.00, desc: 'Pure natural guava juice.', img: '/images/Guawa juice.png' }
    ];

    const [[category]] = await db.query("SELECT category_id FROM product_categories LIMIT 1");
    const [[unit]] = await db.query("SELECT unit_id FROM measurement_units LIMIT 1");
    const [[grade]] = await db.query("SELECT grade_id FROM quality_grades LIMIT 1");

    const productIds = [];
    for (const prod of fruitProducts) {
      const [res] = await db.query(
        'INSERT INTO products (name, category_id, description, price, unit_id, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [prod.name, category.category_id, prod.desc, prod.price, unit.unit_id, 200, prod.img]
      );
      productIds.push({ id: res.insertId, name: prod.name, price: prod.price });
    }

    // 3. Seed 5 Sri Lankan Customers & Orders
    const slCustomers = [
      { name: 'Nimal Perera', email: 'nimal@example.lk', phone: '0711111111', address: 'Colombo 07' },
      { name: 'Kumari Fernando', email: 'kumari@example.lk', phone: '0722222222', address: 'Peradeniya, Kandy' },
      { name: 'Sunil Jayasinghe', email: 'sunil@example.lk', phone: '0773333333', address: 'Galle Face, Colombo' },
      { name: 'Priyantha Silva', email: 'priyantha@example.lk', phone: '0754444444', address: 'Main Street, Matara' },
      { name: 'Amara Wickramasinghe', email: 'amara@example.lk', phone: '0765555555', address: 'Anuradhapura Central' }
    ];

    const [[customerRole]] = await db.query("SELECT role_id FROM user_roles WHERE role_name = 'customer'");
    const [[paidStatus]] = await db.query("SELECT payment_status_id FROM payment_statuses WHERE status_name = 'paid'");
    const [[deliveredStatus]] = await db.query("SELECT order_status_id FROM order_statuses WHERE status_name = 'Delivered'");

    for (let i = 0; i < slCustomers.length; i++) {
      const cust = slCustomers[i];
      const [userRes] = await db.query(
        'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id, address, city, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [cust.name, cust.email, cust.phone, '$2a$10$89W1h/I3A2J1o7B9G/3.O.gUvVlU.vN0P0E1I0E0E0E0E0E0E0E0E', customerRole.role_id, activeStatus.status_id, cust.address, cust.address.split(',')[0], 'colombo']
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

    // 5. Seed Fruit Suppliers for Performance Report
    const suppliers = [
      { name: 'Kandyan Fresh Harvest', loc: 'Kandy', products: 'Mangoes, Pineapple', rating: 4.8 },
      { name: 'Ruhuna Tropicals', loc: 'Matara', products: 'Woodapple, Guava', rating: 4.2 },
      { name: 'Wayamba Fruit Farm', loc: 'Kurunegala', products: 'Mixed Fruits', rating: 4.5 },
      { name: 'Uva Organic Heights', loc: 'Badulla', products: 'Mountain Fruits', rating: 3.9 },
      { name: 'Lanka Agro Exports', loc: 'Colombo', products: 'Bulk Fruit Puree', rating: 4.7 }
    ];

    for (const sup of suppliers) {
      // Use correct schema columns: owner_name instead of contact_person
      const [supRes] = await db.query(
        'INSERT INTO suppliers (farm_name, owner_name, phone, email, location, product_types, rating, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [sup.name, `${sup.name.split(' ')[0]} Manager`, '0115556677', `info@${sup.name.toLowerCase().replace(/ /g, '')}.lk`, sup.loc, sup.products, sup.rating, 'Active']
      );

      // Use correct supply_history columns: product_name, quantity (string), price
      await db.query(
        'INSERT INTO supply_history (supplier_id, product_name, quantity, price, supply_date) VALUES (?, ?, ?, ?, ?)',
        [supRes.insertId, sup.products.split(',')[0], '500kg', 75000.00, '2026-03-12']
      );
    }

    // 6. Add Pending Farmer for Alert Testing
    const [[farmerRole]] = await db.query("SELECT role_id FROM user_roles WHERE role_name = 'farmer'");
    const [[pendingStatus]] = await db.query("SELECT status_id FROM account_statuses WHERE status_name = 'pending'");
    await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Rathnayake Bandara', 'rathna@farmer.lk', '0789998888', 'hashed_pass_here', farmerRole.role_id, pendingStatus.status_id, 'Kuruwita, Ratnapura']
    );

    res.json({ success: true, message: 'Database reset and fruit data seeded successfully. IDs start from 1.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Maintenance failed', error: error.message });
  }
};
