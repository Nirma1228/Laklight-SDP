const db = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


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
      SELECT p.*, o.order_id, s.status_name as status 
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

// FR07: Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, orderId, successUrl, cancelUrl } = req.body;

    // Use URLs from request if provided (dynamic origin), otherwise fallback to .env
    const finalSuccessUrl = successUrl 
      ? `${successUrl}${successUrl.includes('?') ? '&' : '?'}payment=success&session_id={CHECKOUT_SESSION_ID}`
      : `${process.env.STRIPE_SUCCESS_URL}&session_id={CHECKOUT_SESSION_ID}`;
      
    const finalCancelUrl = cancelUrl || process.env.STRIPE_CANCEL_URL;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: 'Laklight Food Products',
            },
            unit_amount: Math.round(amount * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: { orderId: orderId?.toString() }
    });

    res.json({
      sessionId: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ message: 'Stripe session creation failed', error: error.message });
  }
};

// New: Confirm Stripe Payment
exports.confirmStripePayment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { sessionId } = req.body;

    if (!sessionId) return res.status(400).json({ message: 'Session ID is required' });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    const orderId = session.metadata.orderId;
    const amount = session.amount_total / 100;

    // Check if payment already recorded
    const [existing] = await connection.query('SELECT * FROM payments WHERE transaction_id = ?', [sessionId]);
    if (existing.length > 0) {
      return res.json({ success: true, message: 'Payment already recorded', transactionId: sessionId });
    }

    // Status IDs
    const [paidStatus] = await connection.query('SELECT payment_status_id FROM payment_statuses WHERE status_name = "paid"');
    const [processingStatus] = await connection.query('SELECT order_status_id FROM order_statuses WHERE status_name = "Processing"');

    const pStatusId = paidStatus[0].payment_status_id;
    const oStatusId = processingStatus[0].order_status_id;

    // Insert into payments
    await connection.query(
      'INSERT INTO payments (order_id, transaction_id, amount, status_id, payment_method) VALUES (?, ?, ?, ?, ?)',
      [orderId, sessionId, amount, pStatusId, 'Stripe Card']
    );

    // Update order
    await connection.query(
      'UPDATE orders SET payment_status_id = ?, order_status_id = ? WHERE order_id = ?',
      [pStatusId, oStatusId, orderId]
    );

    // Get customer_id to clear cart
    const [[order]] = await connection.query('SELECT customer_id FROM orders WHERE order_id = ?', [orderId]);
    if (order) {
      await connection.query('DELETE FROM cart WHERE user_id = ?', [order.customer_id]);
    }

    await connection.commit();
    res.json({ success: true, transactionId: sessionId });
  } catch (error) {
    await connection.rollback();
    console.error('Confirmation Error:', error);
    res.status(500).json({ message: 'Payment confirmation failed', error: error.message });
  } finally { connection.release(); }
};
