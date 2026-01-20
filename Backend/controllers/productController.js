const db = require('../config/database');

// FR04: Browse product catalog
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT * FROM products WHERE availability != ? ORDER BY category, name',
      ['out-of-stock']
    );

    res.json({ 
      success: true,
      count: products.length,
      products 
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// FR04: Get single product details
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ 
      success: true,
      product: products[0] 
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

// FR03: Search products
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const [products] = await db.query(
      `SELECT * FROM products 
       WHERE (name LIKE ? OR description LIKE ?) 
       AND availability != ?
       ORDER BY name`,
      [`%${query}%`, `%${query}%`, 'out-of-stock']
    );

    res.json({ 
      success: true,
      count: products.length,
      products 
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

// FR03: Filter products by category and availability
exports.filterProducts = async (req, res) => {
  try {
    const { category, availability, minPrice, maxPrice } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (availability && availability !== 'all') {
      query += ' AND availability = ?';
      params.push(availability);
    }

    if (minPrice) {
      query += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }

    query += ' ORDER BY category, name';

    const [products] = await db.query(query, params);

    res.json({ 
      success: true,
      count: products.length,
      products 
    });
  } catch (error) {
    console.error('Filter products error:', error);
    res.status(500).json({ message: 'Filter failed', error: error.message });
  }
};

// FR03: Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const [products] = await db.query(
      'SELECT * FROM products WHERE category = ? AND availability != ? ORDER BY name',
      [category, 'out-of-stock']
    );

    res.json({ 
      success: true,
      category,
      count: products.length,
      products 
    });
  } catch (error) {
    console.error('Get category products error:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// FR22: Add new product (Admin only)
exports.addProduct = async (req, res) => {
  try {
    const { name, category, description, price, unit, stock, availability, imageUrl } = req.body;

    const [result] = await db.query(
      `INSERT INTO products (name, category, description, price, unit, stock, availability, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category, description || null, price, unit, stock || 0, availability || 'in-stock', imageUrl || null]
    );

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
};

// FR22: Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, category, description, price, unit, stock, availability, imageUrl } = req.body;

    const [result] = await db.query(
      `UPDATE products 
       SET name = ?, category = ?, description = ?, price = ?, unit = ?, 
           stock = ?, availability = ?, image_url = ?
       WHERE id = ?`,
      [name, category, description, price, unit, stock, availability, imageUrl, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// FR22: Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const [result] = await db.query('DELETE FROM products WHERE id = ?', [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

// Update product stock
exports.updateStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const { stock } = req.body;

    // Update stock and availability based on stock level
    let availability = 'in-stock';
    if (stock === 0) {
      availability = 'out-of-stock';
    } else if (stock < 50) {
      availability = 'low-stock';
    }

    const [result] = await db.query(
      'UPDATE products SET stock = ?, availability = ? WHERE id = ?',
      [stock, availability, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      newStock: stock,
      availability
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Failed to update stock', error: error.message });
  }
};
