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
      const [rows] = await connection.query('SELECT * FROM products WHERE id = ?', [item.productId]);
      if (rows.length === 0) throw new Error('Product not found');
      const product = rows[0];

      if (product.stock_quantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const discountedPrice = discountService.applyDiscountToPrice(product.price, item.quantity);
      const itemSubtotal = discountedPrice * item.quantity;
      subtotal += itemSubtotal;

      processedItems.push({ ...item, name: product.name, price: discountedPrice, subtotal: itemSubtotal });
    }

    const orderNumber = `ORD-${Date.now()}`;
    const pendingStatusId = await getStatusId('order_statuses', 'status_name', 'Pending');
    const unpaidStatusId = await getStatusId('payment_statuses', 'status_name', 'unpaid');

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
      await connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.productId]);
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
      SELECT o.*, os.status_name as order_status, ps.status_name as payment_status
      FROM orders o
      JOIN order_statuses os ON o.order_status_id = os.id
      JOIN payment_statuses ps ON o.payment_status_id = ps.id
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
    const statusId = await getStatusId('order_statuses', 'status_name', status);
    if (!statusId) return res.status(400).json({ message: 'Invalid status' });

    await db.query('UPDATE orders SET order_status_id = ? WHERE id = ?', [statusId, req.params.id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};
// FR02: Get Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, os.status_name as order_status, ps.status_name as payment_status, u.full_name as customer_name
      FROM orders o
      JOIN order_statuses os ON o.order_status_id = os.id
      JOIN payment_statuses ps ON o.payment_status_id = ps.id
      JOIN users u ON o.customer_id = u.id
      WHERE o.id = ?`, [req.params.id]);

    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

    const [items] = await db.query(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
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
      SELECT o.*, os.status_name as order_status, ps.status_name as payment_status, u.full_name as customer_name
      FROM orders o
      JOIN order_statuses os ON o.order_status_id = os.id
      JOIN payment_statuses ps ON o.payment_status_id = ps.id
      JOIN users u ON o.customer_id = u.id
      ORDER BY o.order_date DESC`);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const cancelStatusId = await getStatusId('order_statuses', 'status_name', 'Cancelled');
    const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' });

    await db.query('UPDATE orders SET order_status_id = ? WHERE id = ?', [cancelStatusId, req.params.id]);
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
      JOIN order_statuses os ON o.order_status_id = os.id
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
