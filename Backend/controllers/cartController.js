const db = require('../config/database');

// FR06: Get cart items
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    // For simplicity, we'll store cart in a session or database
    // Here's a basic implementation using a cart table
    const [cartItems] = await db.query(`
      SELECT c.*, p.name, p.price, p.image_url, p.stock, p.availability
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ 
      success: true,
      count: cartItems.length,
      items: cartItems,
      total
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
};

// FR06: Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    // Verify product exists and has stock
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ? AND availability != ?',
      [productId, 'out-of-stock']
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or out of stock' });
    }

    const product = products[0];

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.stock}` 
      });
    }

    // Check if item already in cart
    const [existingItem] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existingItem.length > 0) {
      // Update quantity
      const newQuantity = existingItem[0].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          message: `Cannot add more items. Maximum available: ${product.stock}` 
        });
      }

      await db.query(
        'UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, existingItem[0].id]
      );

      res.json({
        success: true,
        message: 'Cart updated successfully',
        quantity: newQuantity
      });
    } else {
      // Add new item
      await db.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );

      res.status(201).json({
        success: true,
        message: 'Item added to cart successfully'
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add to cart', error: error.message });
  }
};

// FR06: Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const itemId = req.params.itemId;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Get cart item
    const [cartItems] = await db.query(
      'SELECT c.*, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?',
      [itemId, userId]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const cartItem = cartItems[0];

    if (quantity > cartItem.stock) {
      return res.status(400).json({ 
        message: `Cannot update quantity. Maximum available: ${cartItem.stock}` 
      });
    }

    await db.query(
      'UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [quantity, itemId]
    );

    res.json({
      success: true,
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
};

// FR06: Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const itemId = req.params.itemId;

    const [result] = await db.query(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Failed to remove from cart', error: error.message });
  }
};

// FR06: Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
};

// Get cart count
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [result] = await db.query(
      'SELECT COUNT(*) as count, SUM(quantity) as totalItems FROM cart WHERE user_id = ?',
      [userId]
    );

    res.json({ 
      success: true,
      count: result[0].count,
      totalItems: result[0].totalItems || 0
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ message: 'Failed to get cart count', error: error.message });
  }
};
