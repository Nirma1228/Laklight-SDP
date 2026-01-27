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
      SELECT u.user_id as id, u.full_name, u.email, u.phone, r.role_name as user_type, s.status_name as status, u.join_date 
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

// System Settings
exports.updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body; // { key1: val1, key2: val2 }
    for (const [key, value] of Object.entries(settings)) {
      await db.query('INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, value, value]);
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  if (parseInt(req.params.id) === req.user.userId) return res.status(400).json({ message: 'Self-delete blocked' });
  await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
  res.json({ success: true, message: 'User removed' });
};
// FR15: Admin User Management
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const roleId = await getId('user_roles', 'role_id', 'role_name', role);
    const activeStatusId = await getId('account_statuses', 'status_id', 'status_name', 'active');
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id) VALUES (?, ?, ?, ?, ?, ?)', [fullName, email, phone, hash, roleId, activeStatusId]);
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
    const { fullName, phone } = req.body;
    await db.query('UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?', [fullName, phone, req.params.id]);
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
