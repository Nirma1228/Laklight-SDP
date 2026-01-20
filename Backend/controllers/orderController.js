const db = require('../config/database');
const discountService = require('../services/discountService');

// FR02: Place Order with FR05: Wholesale Discount
exports.placeOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Calculate order total with wholesale discount
    let subtotal = 0;
    let totalDiscount = 0;
    const processedItems = [];

    for (const item of items) {
      // Verify product exists and has enough stock
      const [products] = await connection.query(
        'SELECT * FROM products WHERE id = ?',
        [item.productId]
      );

      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      const product = products[0];

      if (product.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      // FR05: Apply 10% wholesale discount for 12+ items
      const discount = discountService.calculateWholesaleDiscount(item.quantity);
      const discountedPrice = discountService.applyDiscountToPrice(product.price, item.quantity);
      const itemSubtotal = discountedPrice * item.quantity;
      const discountAmount = (product.price - discountedPrice) * item.quantity;
      
      subtotal += itemSubtotal;
      totalDiscount += discountAmount;
      
      processedItems.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        originalPrice: product.price,
        discountedPrice: discountedPrice,
        subtotal: itemSubtotal,
        discountApplied: discount > 0,
        discountPercentage: discount * 100
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_number, customer_id, total_amount, payment_status, 
       order_status, payment_method, delivery_address) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, userId, subtotal, 'Pending', 'Pending', paymentMethod, deliveryAddress]
    );

    const orderId = orderResult.insertId;

    // Insert order items and update stock
    for (const item of processedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.name, item.quantity, item.discountedPrice, item.subtotal]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );

      // Update availability based on new stock
      await connection.query(
        `UPDATE products 
         SET availability = CASE 
           WHEN stock = 0 THEN 'out-of-stock'
           WHEN stock < 50 THEN 'low-stock'
           ELSE 'in-stock'
         END
         WHERE id = ?`,
        [item.productId]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        orderId,
        orderNumber,
        total: subtotal,
        totalDiscount,
        itemsWithDiscount: processedItems.filter(i => i.discountApplied).length,
        items: processedItems
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  } finally {
    connection.release();
  }
};

// Get customer orders
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [orders] = await db.query(
      `SELECT o.*, u.full_name as customer_name, u.phone, u.email 
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       WHERE o.customer_id = ?
       ORDER BY o.order_date DESC`,
      [userId]
    );

    res.json({ 
      success: true,
      count: orders.length,
      orders 
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get order details with items
exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;
    const userType = req.user.userType;

    // Admin and employee can see all orders
    let query = `SELECT o.*, u.full_name, u.phone, u.email, u.address
                 FROM orders o
                 JOIN users u ON o.customer_id = u.id
                 WHERE o.id = ?`;
    const params = [orderId];

    // Customer can only see their own orders
    if (userType === 'customer') {
      query += ' AND o.customer_id = ?';
      params.push(userId);
    }

    const [orders] = await db.query(query, params);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const [items] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    res.json({ 
      success: true,
      order: orders[0],
      items 
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Failed to fetch order details', error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const orderId = req.params.id;
    const userId = req.user.userId;

    // Get order
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND customer_id = ?',
      [orderId, userId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Can only cancel pending orders
    if (order.order_status !== 'Pending') {
      await connection.rollback();
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${order.order_status}` 
      });
    }

    // Get order items
    const [items] = await connection.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    // Restore stock for each item
    for (const item of items) {
      await connection.query(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );

      // Update availability
      await connection.query(
        `UPDATE products 
         SET availability = CASE 
           WHEN stock = 0 THEN 'out-of-stock'
           WHEN stock < 50 THEN 'low-stock'
           ELSE 'in-stock'
         END
         WHERE id = ?`,
        [item.product_id]
      );
    }

    // Update order status
    await connection.query(
      'UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?',
      ['Cancelled', orderId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  } finally {
    connection.release();
  }
};

// Track order by order number
exports.trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const [orders] = await db.query(
      `SELECT o.*, u.full_name, u.phone 
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       WHERE o.order_number = ?`,
      [orderNumber]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ 
      success: true,
      order: orders[0] 
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Failed to track order', error: error.message });
  }
};

// Get all orders (Admin/Employee)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    let query = `SELECT o.*, u.full_name as customer_name, u.phone, u.email 
                 FROM orders o
                 JOIN users u ON o.customer_id = u.id
                 WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND o.order_status = ?';
      params.push(status);
    }

    if (startDate) {
      query += ' AND o.order_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND o.order_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY o.order_date DESC';

    const [orders] = await db.query(query, params);

    res.json({ 
      success: true,
      count: orders.length,
      orders 
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Update order status (Admin/Employee)
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const [result] = await db.query(
      'UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If status is Delivered, update delivery date
    if (status === 'Delivered') {
      await db.query(
        'UPDATE orders SET delivery_date = NOW() WHERE id = ?',
        [orderId]
      );
    }

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// Get order statistics (Admin/Employee)
exports.getOrderStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN order_status = 'Processing' THEN 1 ELSE 0 END) as processing_orders,
        SUM(CASE WHEN order_status = 'Shipped' THEN 1 ELSE 0 END) as shipped_orders,
        SUM(CASE WHEN order_status = 'Delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN payment_status = 'Paid' THEN total_amount ELSE 0 END) as total_revenue,
        AVG(total_amount) as average_order_value
      FROM orders
    `);

    res.json({ 
      success: true,
      stats: stats[0] 
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Failed to fetch order statistics', error: error.message });
  }
};
