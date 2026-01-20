const db = require('../config/database');
const bcrypt = require('bcryptjs');

// FR15: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { userType, status } = req.query;

    let query = 'SELECT id, full_name, email, phone, user_type, address, status, join_date, last_login FROM users WHERE 1=1';
    const params = [];

    if (userType) {
      query += ' AND user_type = ?';
      params.push(userType);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY join_date DESC';

    const [users] = await db.query(query, params);

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// FR15: Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await db.query(
      'SELECT id, full_name, email, phone, user_type, address, status, join_date, last_login FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Failed to fetch user details', error: error.message });
  }
};

// FR15: Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, phone, address, email } = req.body;

    const [result] = await db.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ?, email = ? WHERE id = ?',
      [fullName, phone, address, email, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

// FR15: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting own account
    if (parseInt(userId) === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// FR15: Change user role
exports.changeUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { userType } = req.body;

    const validRoles = ['customer', 'farmer', 'employee', 'administrator'];
    if (!validRoles.includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    const [result] = await db.query(
      'UPDATE users SET user_type = ? WHERE id = ?',
      [userType, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ message: 'Failed to change user role', error: error.message });
  }
};

// FR15: Change user status (activate/deactivate)
exports.changeUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['active', 'inactive', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Change user status error:', error);
    res.status(500).json({ message: 'Failed to change user status', error: error.message });
  }
};

// FR15: Create new user
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, userType, address } = req.body;

    // Check if email exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fullName, email, phone, passwordHash, userType, address || null, 'active']
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

// FR16: Get analytics dashboard data
exports.getAnalyticsDashboard = async (req, res) => {
  try {
    // Get various statistics
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN user_type = 'customer' THEN 1 ELSE 0 END) as customers,
        SUM(CASE WHEN user_type = 'farmer' THEN 1 ELSE 0 END) as farmers,
        SUM(CASE WHEN user_type = 'employee' THEN 1 ELSE 0 END) as employees,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users
      FROM users
    `);

    const [orderStats] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN order_status = 'Delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN payment_status = 'Paid' THEN total_amount ELSE 0 END) as total_revenue,
        AVG(total_amount) as avg_order_value
      FROM orders
    `);

    const [productStats] = await db.query(`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock) as total_stock,
        SUM(CASE WHEN availability = 'low-stock' THEN 1 ELSE 0 END) as low_stock_products,
        SUM(CASE WHEN availability = 'out-of-stock' THEN 1 ELSE 0 END) as out_of_stock_products
      FROM products
    `);

    const [recentOrders] = await db.query(`
      SELECT o.*, u.full_name as customer_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      ORDER BY o.order_date DESC
      LIMIT 10
    `);

    const [monthlyRevenue] = await db.query(`
      SELECT 
        DATE_FORMAT(order_date, '%Y-%m') as month,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
      FROM orders
      WHERE payment_status = 'Paid'
      AND order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(order_date, '%Y-%m')
      ORDER BY month DESC
    `);

    res.json({
      success: true,
      dashboard: {
        users: userStats[0],
        orders: orderStats[0],
        products: productStats[0],
        recentOrders,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

// FR16: Get sales analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        DATE(order_date) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE payment_status = 'Paid'
    `;
    const params = [];

    if (startDate) {
      query += ' AND order_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND order_date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY DATE(order_date) ORDER BY date DESC';

    const [salesData] = await db.query(query, params);

    res.json({
      success: true,
      count: salesData.length,
      salesData
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch sales analytics', error: error.message });
  }
};

// FR16: Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const [revenue] = await db.query(`
      SELECT 
        SUM(CASE WHEN order_date >= CURDATE() THEN total_amount ELSE 0 END) as today,
        SUM(CASE WHEN order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN total_amount ELSE 0 END) as this_week,
        SUM(CASE WHEN order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN total_amount ELSE 0 END) as this_month,
        SUM(CASE WHEN YEAR(order_date) = YEAR(CURDATE()) THEN total_amount ELSE 0 END) as this_year,
        SUM(total_amount) as all_time
      FROM orders
      WHERE payment_status = 'Paid'
    `);

    res.json({
      success: true,
      revenue: revenue[0]
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch revenue analytics', error: error.message });
  }
};

// FR16: Get customer analytics
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const [topCustomers] = await db.query(`
      SELECT 
        u.id, u.full_name, u.email,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_spent
      FROM users u
      JOIN orders o ON u.id = o.customer_id
      WHERE u.user_type = 'customer' AND o.payment_status = 'Paid'
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    const [customerStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT customer_id) as total_customers,
        COUNT(*) as total_orders,
        AVG(order_count) as avg_orders_per_customer
      FROM (
        SELECT customer_id, COUNT(*) as order_count
        FROM orders
        GROUP BY customer_id
      ) as customer_orders
    `);

    res.json({
      success: true,
      topCustomers,
      stats: customerStats[0]
    });
  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch customer analytics', error: error.message });
  }
};

// FR16: Get product performance
exports.getProductAnalytics = async (req, res) => {
  try {
    const [topProducts] = await db.query(`
      SELECT 
        p.id, p.name, p.category,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'Paid'
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      topProducts
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch product analytics', error: error.message });
  }
};

// FR20: Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const [feedback] = await db.query(`
      SELECT f.*, u.full_name, u.email
      FROM feedback f
      JOIN users u ON f.customer_id = u.id
      ORDER BY f.submitted_at DESC
    `);

    // Calculate average ratings
    const [avgRatings] = await db.query(`
      SELECT 
        AVG(product_quality) as avg_product_quality,
        AVG(packaging) as avg_packaging,
        AVG(delivery_time) as avg_delivery_time,
        AVG(customer_service) as avg_customer_service,
        AVG(value_for_money) as avg_value_for_money
      FROM feedback
    `);

    res.json({
      success: true,
      count: feedback.length,
      feedback,
      averageRatings: avgRatings[0]
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
};

// FR20: Get specific feedback
exports.getFeedbackDetails = async (req, res) => {
  try {
    const feedbackId = req.params.id;

    const [feedback] = await db.query(`
      SELECT f.*, u.full_name, u.email, u.phone
      FROM feedback f
      JOIN users u ON f.customer_id = u.id
      WHERE f.id = ?
    `, [feedbackId]);

    if (feedback.length === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      success: true,
      feedback: feedback[0]
    });
  } catch (error) {
    console.error('Get feedback details error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback details', error: error.message });
  }
};

// FR20: Get complaints
exports.getComplaints = async (req, res) => {
  try {
    // Complaints are feedback with low ratings (1-2 stars) or negative text
    const [complaints] = await db.query(`
      SELECT f.*, u.full_name, u.email
      FROM feedback f
      JOIN users u ON f.customer_id = u.id
      WHERE (product_quality <= 2 OR packaging <= 2 OR delivery_time <= 2 OR customer_service <= 2)
      OR feedback_text LIKE '%complaint%' OR feedback_text LIKE '%problem%' OR feedback_text LIKE '%issue%'
      ORDER BY f.submitted_at DESC
    `);

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Failed to fetch complaints', error: error.message });
  }
};

// FR20: Get compliments
exports.getCompliments = async (req, res) => {
  try {
    // Compliments are feedback with high ratings (4-5 stars)
    const [compliments] = await db.query(`
      SELECT f.*, u.full_name, u.email
      FROM feedback f
      JOIN users u ON f.customer_id = u.id
      WHERE product_quality >= 4 AND packaging >= 4 AND delivery_time >= 4 AND customer_service >= 4
      ORDER BY f.submitted_at DESC
    `);

    res.json({
      success: true,
      count: compliments.length,
      compliments
    });
  } catch (error) {
    console.error('Get compliments error:', error);
    res.status(500).json({ message: 'Failed to fetch compliments', error: error.message });
  }
};
