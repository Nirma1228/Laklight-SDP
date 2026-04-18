const db = require('./config/database');
const discountService = require('./services/discountService');

async function debugOrder() {
  const connection = await db.getConnection();
  try {
    console.log('Starting transaction...');
    await connection.beginTransaction();

    const items = [{ productId: 1, quantity: 13 }];
    const deliveryAddress = 'Test Address, Test City, 12345';
    const paymentMethod = 'Card Payment';
    const userId = 1; // Assuming admin@laklight.com is ID 1

    let subtotal = 0;
    const processedItems = [];
    const deliveryCharge = 400;

    for (const item of items) {
      console.log(`Processing item ${item.productId}...`);
      const [rows] = await connection.query('SELECT * FROM products WHERE product_id = ?', [item.productId]);
      if (rows.length === 0) throw new Error('Product not found');
      const product = rows[0];
      console.log(`Product found: ${product.name}, price: ${product.price}, stock: ${product.stock_quantity}`);

      if (product.stock_quantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const discountedPrice = discountService.applyDiscountToPrice(product.price, item.quantity);
      const itemSubtotal = discountedPrice * item.quantity;
      subtotal += itemSubtotal;
      console.log(`Discounted price: ${discountedPrice}, Item subtotal: ${itemSubtotal}`);

      processedItems.push({ ...item, name: product.name, price: discountedPrice, subtotal: itemSubtotal });
    }

    const netAmount = subtotal + deliveryCharge;
    console.log(`Calculation: Subtotal ${subtotal}, Delivery ${deliveryCharge}, NetAmount ${netAmount}`);

    const [pendingStatuses] = await connection.query('SELECT order_status_id FROM order_statuses WHERE status_name = "Pending"');
    const [unpaidStatuses] = await connection.query('SELECT payment_status_id FROM payment_statuses WHERE status_name = "unpaid"');
    
    if (pendingStatuses.length === 0) throw new Error('Pending status not found in DB');
    if (unpaidStatuses.length === 0) throw new Error('Unpaid status not found in DB');

    const pendingStatusId = pendingStatuses[0].order_status_id;
    const unpaidStatusId = unpaidStatuses[0].payment_status_id;
    console.log(`Status IDs: Pending ${pendingStatusId}, Unpaid ${unpaidStatusId}`);

    console.log('Inserting order...');
    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_id, total_amount, net_amount, payment_status_id, order_status_id, payment_method, delivery_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, subtotal, netAmount, unpaidStatusId, pendingStatusId, paymentMethod, deliveryAddress]
    );

    const orderId = orderResult.insertId;
    console.log(`Order inserted with ID: ${orderId}`);

    for (const item of processedItems) {
      console.log(`Inserting order item ${item.productId}...`);
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price, item.subtotal]
      );
      await connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?', [item.quantity, item.productId]);
    }

    console.log('Rolling back (it is a test)...');
    await connection.rollback();
    console.log('Success (simulated)!');
  } catch (error) {
    console.error('DEBUG ERROR:', error);
    if (connection) await connection.rollback();
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

debugOrder();
