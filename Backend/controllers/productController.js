const db = require('../config/database');

// Helpers for Name to ID mapping
const getCategoryId = async (name) => {
  const [rows] = await db.query('SELECT category_id FROM product_categories WHERE category_name = ?', [name]);
  return rows.length > 0 ? rows[0].category_id : null;
};

const getUnitId = async (name) => {
  const [rows] = await db.query('SELECT unit_id FROM measurement_units WHERE unit_name = ?', [name]);
  return rows.length > 0 ? rows[0].unit_id : null;
};

// FR04: Browse product catalog
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, p.product_id as id, c.category_name as category, u.unit_name as unit 
      FROM products p
      JOIN product_categories c ON p.category_id = c.category_id
      JOIN measurement_units u ON p.unit_id = u.unit_id
      WHERE p.is_available = TRUE 
      ORDER BY c.category_name, p.name
    `);

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// FR04: Get single product
exports.getProductById = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, p.product_id as id, c.category_name as category, u.unit_name as unit 
      FROM products p
      JOIN product_categories c ON p.category_id = c.category_id
      JOIN measurement_units u ON p.unit_id = u.unit_id
      WHERE p.product_id = ?`, [req.params.id]);

    if (products.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, product: products[0] });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

// FR03: Search
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const [products] = await db.query(`
      SELECT p.*, p.product_id as id, c.category_name as category, u.unit_name as unit 
      FROM products p
      JOIN product_categories c ON p.category_id = c.category_id
      JOIN measurement_units u ON p.unit_id = u.unit_id
      WHERE (p.name LIKE ? OR p.description LIKE ?) AND p.is_available = TRUE`,
      [`%${query}%`, `%${query}%`]);

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

// FR22: Add (Admin)
exports.addProduct = async (req, res) => {
  try {
    const { name, category, description, price, unit, stock, is_featured } = req.body;
    const categoryId = await getCategoryId(category);
    const unitId = await getUnitId(unit);

    if (!categoryId || !unitId) return res.status(400).json({ message: 'Invalid category or unit' });

    const [result] = await db.query(
      'INSERT INTO products (name, category_id, description, price, unit_id, stock_quantity, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, categoryId, description, price, unitId, stock || 0, is_featured || false]
    );

    res.status(201).json({ success: true, productId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Add failed', error: error.message });
  }
};

// FR22: Update (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, description, price, unit, stock, availability, is_featured } = req.body;
    const items = [];
    const params = [];

    if (name) { items.push('name = ?'); params.push(name); }
    if (category) { items.push('category_id = ?'); params.push(await getCategoryId(category)); }
    if (unit) { items.push('unit_id = ?'); params.push(await getUnitId(unit)); }
    if (price !== undefined) { items.push('price = ?'); params.push(price); }
    if (stock !== undefined) { items.push('stock_quantity = ?'); params.push(stock); }
    if (description) { items.push('description = ?'); params.push(description); }
    if (availability !== undefined) { items.push('is_available = ?'); params.push(availability === 'In Stock'); }
    if (is_featured !== undefined) { items.push('is_featured = ?'); params.push(is_featured); }

    if (items.length === 0) return res.status(400).json({ message: 'No fields to update' });

    params.push(req.params.id);
    await db.query(`UPDATE products SET ${items.join(', ')} WHERE product_id = ?`, params);
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE product_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};
// FR04: Filter Products
exports.filterProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    let query = `
      SELECT p.*, p.product_id as id, c.category_name as category, u.unit_name as unit 
      FROM products p
      JOIN product_categories c ON p.category_id = c.category_id
      JOIN measurement_units u ON p.unit_id = u.unit_id
      WHERE p.is_available = TRUE`;
    const params = [];

    if (category) { query += ' AND c.category_name = ?'; params.push(category); }
    if (minPrice) { query += ' AND p.price >= ?'; params.push(minPrice); }
    if (maxPrice) { query += ' AND p.price <= ?'; params.push(maxPrice); }

    const [products] = await db.query(query, params);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: 'Filter failed', error: error.message });
  }
};

// Get by Category
exports.getProductsByCategory = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, p.product_id as id, c.category_name as category, u.unit_name as unit 
      FROM products p
      JOIN product_categories c ON p.category_id = c.category_id
      JOIN measurement_units u ON p.unit_id = u.unit_id
      WHERE c.category_name = ? AND p.is_available = TRUE`, [req.params.category]);
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

// Update stock (Employee/Admin)
exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    await db.query('UPDATE products SET stock_quantity = ? WHERE product_id = ?', [quantity, req.params.id]);
    res.json({ success: true, message: 'Stock updated' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};
