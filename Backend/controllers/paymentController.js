const db = require('../config/database');

const getStatusId = async (table, col, name) => {
  const [rows] = await db.query(`SELECT id FROM ${table} WHERE ${col} = ?`, [name]);
  return rows.length > 0 ? rows[0].id : null;
};

// FR07: Process payment
exports.processPayment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { orderId, paymentMethod } = req.body;

    const [[order]] = await connection.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (!order) throw new Error('Order not found');

    const [paidStatuses] = await connection.query('SELECT payment_status_id FROM payment_statuses WHERE status_name = "paid"');
    const paidStatusId = paidStatuses[0].payment_status_id;
    const txnId = `TXN-${Date.now()}`;

    await connection.query(
      'INSERT INTO payments (order_id, transaction_id, amount, status_id, payment_method) VALUES (?, ?, ?, ?, ?)',
      [orderId, txnId, order.net_amount, paidStatusId, paymentMethod]
    );

    await connection.query('UPDATE orders SET payment_status_id = ? WHERE order_id = ?', [paidStatusId, orderId]);
    await connection.query('DELETE FROM cart WHERE user_id = ?', [order.customer_id]);

    await connection.commit();
    res.json({ success: true, transactionId: txnId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Payment failed', error: error.message });
  } finally { connection.release(); }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT p.*, o.order_number, s.status_name as status 
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      JOIN payment_statuses s ON p.status_id = s.payment_status_id
      WHERE o.customer_id = ?`, [req.user.userId]);
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const [rows] = await db.query('SELECT * FROM payments WHERE transaction_id = ?', [transactionId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ success: true, verified: true, payment: rows[0] });
  } catch (error) { res.status(500).json({ message: 'Verification failed', error: error.message }); }
};

exports.getPaymentMethods = async (req, res) => {
  res.json({ success: true, methods: ['Card Payment', 'Online Banking', 'Cash on Delivery'] });
};

exports.processCardPayment = async (req, res) => {
  // Simulate external card processor
  try {
    const { orderId } = req.body;
    const [paidStatuses] = await db.query('SELECT payment_status_id FROM payment_statuses WHERE status_name = "paid"');
    const paidStatusId = paidStatuses[0].payment_status_id;
    const txnId = `CARD-${Date.now()}`;
    const [[order]] = await db.query('SELECT net_amount FROM orders WHERE order_id = ?', [orderId]);

    await db.query('INSERT INTO payments (order_id, transaction_id, amount, status_id, payment_method) VALUES (?, ?, ?, ?, ?)', [orderId, txnId, order.net_amount, paidStatusId, 'Card Payment']);
    await db.query('UPDATE orders SET payment_status_id = ? WHERE order_id = ?', [paidStatusId, orderId]);

    res.json({ success: true, transactionId: txnId });
  } catch (error) { res.status(500).json({ message: 'Card processing failed', error: error.message }); }
};
