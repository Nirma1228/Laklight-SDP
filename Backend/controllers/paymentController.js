const db = require('../config/database');

// FR07: Process payment
exports.processPayment = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { orderId, paymentMethod, cardDetails } = req.body;

    // Get order
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    if (order.payment_status === 'Paid') {
      await connection.rollback();
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // Process payment based on method
    let paymentStatus = 'Success';
    let transactionId = `TXN-${Date.now()}`;

    if (paymentMethod === 'Card Payment' || paymentMethod === 'Online Banking') {
      // Simulate payment gateway integration
      // In production, integrate with actual payment gateway (Stripe, PayPal, etc.)
      paymentStatus = 'Success';
    } else if (paymentMethod === 'Cash on Delivery') {
      paymentStatus = 'Pending';
      transactionId = null;
    }

    // Insert payment record
    const [paymentResult] = await connection.query(
      `INSERT INTO payments (order_id, payment_method, card_number_last4, card_name, amount, payment_status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        paymentMethod,
        cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : null,
        cardDetails?.cardName || null,
        order.total_amount,
        paymentStatus,
        transactionId
      ]
    );

    // Update order payment status
    await connection.query(
      'UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?',
      [paymentStatus === 'Success' ? 'Paid' : 'Pending', orderId]
    );

    // Clear cart for this user
    await connection.query(
      'DELETE FROM cart WHERE user_id = ?',
      [order.customer_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        paymentId: paymentResult.insertId,
        transactionId,
        status: paymentStatus,
        amount: order.total_amount
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  } finally {
    connection.release();
  }
};

// FR07: Verify payment status
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const [payments] = await db.query(
      'SELECT * FROM payments WHERE transaction_id = ?',
      [transactionId]
    );

    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ 
      success: true,
      payment: payments[0] 
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};

// Get available payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    const methods = [
      {
        id: 'card',
        name: 'Card Payment',
        description: 'Pay with Credit/Debit Card',
        icon: '💳',
        enabled: true
      },
      {
        id: 'bank',
        name: 'Online Banking',
        description: 'Pay via Online Banking',
        icon: '🏦',
        enabled: true
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive',
        icon: '💵',
        enabled: true
      }
    ];

    res.json({ 
      success: true,
      methods 
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Failed to fetch payment methods', error: error.message });
  }
};

// Card payment (specific endpoint)
exports.processCardPayment = async (req, res) => {
  try {
    const { orderId, cardNumber, expiryDate, cvv, cardName } = req.body;

    // Simulate card validation
    if (!cardNumber || cardNumber.length < 13) {
      return res.status(400).json({ message: 'Invalid card number' });
    }

    // Process payment
    const paymentResult = await exports.processPayment(req, res);
    
  } catch (error) {
    console.error('Card payment error:', error);
    res.status(500).json({ message: 'Card payment failed', error: error.message });
  }
};

// Get payment history for user
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [payments] = await db.query(`
      SELECT p.*, o.order_number, o.order_date
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE o.customer_id = ?
      ORDER BY p.payment_date DESC
    `, [userId]);

    res.json({ 
      success: true,
      count: payments.length,
      payments 
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history', error: error.message });
  }
};
