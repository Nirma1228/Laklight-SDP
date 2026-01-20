const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all suppliers
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM suppliers WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY rating DESC, farm_name ASC';

    const [suppliers] = await db.query(query, params);

    res.json({
      success: true,
      count: suppliers.length,
      suppliers
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch suppliers', error: error.message });
  }
});

// Get supplier details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const supplierId = req.params.id;

    const [suppliers] = await db.query('SELECT * FROM suppliers WHERE id = ?', [supplierId]);

    if (suppliers.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      success: true,
      supplier: suppliers[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch supplier details', error: error.message });
  }
});

// Add supplier (Admin/Employee)
router.post('/', verifyToken, checkRole('administrator', 'employee'), async (req, res) => {
  try {
    const { farmName, ownerName, location, phone, email, productTypes, licenseNumber, farmSize, capacity } = req.body;

    const [result] = await db.query(
      `INSERT INTO suppliers (farm_name, owner_name, location, phone, email, product_types, license_number, farm_size, capacity, applied_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
      [farmName, ownerName, location, phone, email || null, productTypes || null, licenseNumber || null, farmSize || null, capacity || null, 'Active']
    );

    res.status(201).json({
      success: true,
      message: 'Supplier added successfully',
      supplierId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add supplier', error: error.message });
  }
});

// Update supplier (Admin/Employee)
router.put('/:id', verifyToken, checkRole('administrator', 'employee'), async (req, res) => {
  try {
    const supplierId = req.params.id;
    const { farmName, ownerName, location, phone, email, productTypes, licenseNumber, status } = req.body;

    const [result] = await db.query(
      `UPDATE suppliers 
       SET farm_name = ?, owner_name = ?, location = ?, phone = ?, email = ?, product_types = ?, license_number = ?, status = ?
       WHERE id = ?`,
      [farmName, ownerName, location, phone, email, productTypes, licenseNumber, status, supplierId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      success: true,
      message: 'Supplier updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update supplier', error: error.message });
  }
});

// Delete supplier (Admin)
router.delete('/:id', verifyToken, checkRole('administrator'), async (req, res) => {
  try {
    const supplierId = req.params.id;

    const [result] = await db.query('DELETE FROM suppliers WHERE id = ?', [supplierId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete supplier', error: error.message });
  }
});

// Get supplier performance
router.get('/:id/performance', verifyToken, checkRole('administrator', 'employee'), async (req, res) => {
  try {
    const supplierId = req.params.id;

    const [deliveries] = await db.query(
      'SELECT * FROM supply_history WHERE supplier_id = ? ORDER BY supply_date DESC',
      [supplierId]
    );

    const [supplier] = await db.query('SELECT * FROM suppliers WHERE id = ?', [supplierId]);

    if (supplier.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      success: true,
      supplier: supplier[0],
      deliveries,
      performance: {
        totalDeliveries: deliveries.length,
        rating: supplier[0].rating
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch supplier performance', error: error.message });
  }
});

// Rate supplier (Admin/Employee)
router.post('/:id/rating', verifyToken, checkRole('administrator', 'employee'), async (req, res) => {
  try {
    const supplierId = req.params.id;
    const { rating } = req.body;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    const [result] = await db.query(
      'UPDATE suppliers SET rating = ? WHERE id = ?',
      [rating, supplierId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      success: true,
      message: 'Rating updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update rating', error: error.message });
  }
});

module.exports = router;
