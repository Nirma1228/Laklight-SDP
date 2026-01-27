const db = require('../config/database');
const discountService = require('../services/discountService');

// Helpers for Status IDs
const getStatusId = async (table, col, name) => {
  const [rows] = await db.query(`SELECT id FROM ${table} WHERE ${col} = ?`, [name]);
  return rows.length > 0 ? rows[0].id : null;
};

// FR02: Place Order
exports.placeOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { items, deliveryAddress, paymentMethod } = req.body;

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const [rows] = await connection.query('SELECT * FROM products WHERE product_id = ?', [item.productId]);
      if (rows.length === 0) throw new Error('Product not found');
      const product = rows[0];

      if (product.stock_quantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const discountedPrice = discountService.applyDiscountToPrice(product.price, item.quantity);
      const itemSubtotal = discountedPrice * item.quantity;
      subtotal += itemSubtotal;

      processedItems.push({ ...item, name: product.name, price: discountedPrice, subtotal: itemSubtotal });
    }

    const orderNumber = `ORD-${Date.now()}`;
    const [pendingStatuses] = await connection.query('SELECT order_status_id FROM order_statuses WHERE status_name = "Pending"');
    const [unpaidStatuses] = await connection.query('SELECT payment_status_id FROM payment_statuses WHERE status_name = "unpaid"');
    const pendingStatusId = pendingStatuses[0].order_status_id;
    const unpaidStatusId = unpaidStatuses[0].payment_status_id;

    const [orderResult] = await connection.query(
      'INSERT INTO orders (order_number, customer_id, total_amount, net_amount, payment_status_id, order_status_id, payment_method, delivery_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [orderNumber, req.user.userId, subtotal, subtotal, unpaidStatusId, pendingStatusId, paymentMethod, deliveryAddress]
    );

    const orderId = orderResult.insertId;
    for (const item of processedItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price, item.subtotal]
      );
      await connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?', [item.quantity, item.productId]);
    }

    await connection.commit();
    res.status(201).json({ success: true, orderNumber });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Order failed', error: error.message });
  } finally {
    connection.release();
  }
};

// Get customer orders
exports.getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, o.order_id as id, os.status_name as order_status, ps.status_name as payment_status
      FROM orders o
      JOIN order_statuses os ON o.order_status_id = os.order_status_id
      JOIN payment_statuses ps ON o.payment_status_id = ps.payment_status_id
      WHERE o.customer_id = ? ORDER BY o.order_date DESC`, [req.user.userId]);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

// Update status (Admin/Employee)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const [statuses] = await db.query('SELECT order_status_id FROM order_statuses WHERE status_name = ?', [status]);
    if (statuses.length === 0) return res.status(400).json({ message: 'Invalid status' });
    const statusId = statuses[0].order_status_id;

    await db.query('UPDATE orders SET order_status_id = ? WHERE order_id = ?', [statusId, req.params.id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};
// FR02: Get Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, o.order_id as id, os.status_name as order_status, ps.status_name as payment_status, u.full_name as customer_name
      FROM orders o
      JOIN order_statuses os ON o.order_status_id = os.order_status_id
      JOIN payment_statuses ps ON o.payment_status_id = ps.payment_status_id
      JOIN users u ON o.customer_id = u.user_id
      WHERE o.order_id = ?`, [req.params.id]);

    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

    const [items] = await db.query(`
      SELECT oi.*, oi.order_item_id as id, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?`, [req.params.id]);

    res.json({ success: true, order: orders[0], items });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, o.order_id as id, os.status_name as order_status, ps.status_name as payment_status, u.full_name as customer_name
      FROM orders o
      JOIN order_statuses os ON o.order_status_id = os.order_status_id
      JOIN payment_statuses ps ON o.payment_status_id = ps.payment_status_id
      JOIN users u ON o.customer_id = u.user_id
      ORDER BY o.order_date DESC`);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const [cancelStatuses] = await db.query('SELECT order_status_id FROM order_statuses WHERE status_name = "Cancelled"');
    if (cancelStatuses.length === 0) return res.status(500).json({ message: 'Status config error' });
    const cancelStatusId = cancelStatuses[0].order_status_id;

    const [order] = await db.query('SELECT * FROM orders WHERE order_id = ?', [req.params.id]);
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' });

    await db.query('UPDATE orders SET order_status_id = ? WHERE order_id = ?', [cancelStatusId, req.params.id]);
    res.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Cancel failed', error: error.message });
  }
};

// Tracking
exports.trackOrder = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.order_number, os.status_name as status, o.order_date
      FROM orders o
      JOIN order_statuses os ON o.order_status_id = os.order_status_id
      WHERE o.order_number = ?`, [req.params.orderNumber]);
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, tracking: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Track failed', error: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT COUNT(*) as total, SUM(net_amount) as revenue FROM orders`);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ message: 'Stats failed', error: error.message });
  }
};
