const db = require('../config/database');

// FR06: Get cart items
exports.getCart = async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT c.*, p.name, p.price, p.image_url, p.stock_quantity, p.is_available
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?`, [req.user.userId]);

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.json({ success: true, count: items.length, items, total });
  } catch (error) {
    res.status(500).json({ message: 'Cart fetch failed', error: error.message });
  }
};

// FR06: Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    const [products] = await db.query('SELECT * FROM products WHERE id = ? AND is_available = TRUE', [productId]);
    if (products.length === 0) return res.status(404).json({ message: 'Product unavailable' });

    if (products[0].stock_quantity < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    const [existing] = await db.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (existing.length > 0) {
      await db.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
    } else {
      await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity]);
    }

    res.json({ success: true, message: 'Added to cart' });
  } catch (error) {
    res.status(500).json({ message: 'Add failed', error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.itemId, req.user.userId]);
    res.json({ success: true, message: 'Removed' });
  } catch (error) {
    res.status(500).json({ message: 'Remove failed', error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.userId]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Clear failed', error: error.message });
  }
};
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    await db.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.itemId, req.user.userId]);
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.getCartCount = async (req, res) => {
  try {
    const [[result]] = await db.query('SELECT SUM(quantity) as count FROM cart WHERE user_id = ?', [req.user.userId]);
    res.json({ success: true, count: result.count || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Count failed', error: error.message });
  }
};
