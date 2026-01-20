const db = require('../config/database');

// FR11: Get pending applications for review
exports.getPendingApplications = async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT fs.*, u.full_name as farmer_name, u.email, u.phone 
       FROM farmer_submissions fs
       JOIN users u ON fs.farmer_id = u.id
       WHERE fs.status = 'under-review'
       ORDER BY fs.submission_date ASC`
    );

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

// FR11: View application details
exports.getApplicationDetails = async (req, res) => {
  try {
    const applicationId = req.params.id;

    const [applications] = await db.query(
      `SELECT fs.*, u.full_name as farmer_name, u.email, u.phone, u.address 
       FROM farmer_submissions fs
       JOIN users u ON fs.farmer_id = u.id
       WHERE fs.id = ?`,
      [applicationId]
    );

    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({
      success: true,
      application: applications[0]
    });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({ message: 'Failed to fetch application details', error: error.message });
  }
};

// FR11: Approve application
exports.approveApplication = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const applicationId = req.params.id;
    const { notes } = req.body;

    // Update submission status
    const [result] = await connection.query(
      'UPDATE farmer_submissions SET status = ?, notes = ? WHERE id = ? AND status = ?',
      ['selected', notes || null, applicationId, 'under-review']
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Application not found or already processed' });
    }

    // Get submission details
    const [submissions] = await connection.query(
      'SELECT * FROM farmer_submissions WHERE id = ?',
      [applicationId]
    );

    const submission = submissions[0];

    // Create delivery record
    const deliveryNumber = `DEL-${Date.now()}`;
    await connection.query(
      `INSERT INTO deliveries (delivery_number, submission_id, farmer_id, product_name, quantity, proposed_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        deliveryNumber,
        applicationId,
        submission.farmer_id,
        submission.product_name,
        `${submission.quantity}${submission.unit}`,
        submission.delivery_date || submission.harvest_date,
        'pending'
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Application approved successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Approve application error:', error);
    res.status(500).json({ message: 'Failed to approve application', error: error.message });
  } finally {
    connection.release();
  }
};

// FR11: Reject application
exports.rejectApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const [result] = await db.query(
      'UPDATE farmer_submissions SET status = ?, rejection_reason = ? WHERE id = ? AND status = ?',
      ['not-selected', rejectionReason, applicationId, 'under-review']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Application not found or already processed' });
    }

    res.json({
      success: true,
      message: 'Application rejected'
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ message: 'Failed to reject application', error: error.message });
  }
};

// FR13: Get all inventory
exports.getInventory = async (req, res) => {
  try {
    const { type, status } = req.query;

    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY expiry_date ASC, name ASC';

    const [inventory] = await db.query(query, params);

    res.json({
      success: true,
      count: inventory.length,
      inventory
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory', error: error.message });
  }
};

// FR13: Get inventory item
exports.getInventoryItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    const [items] = await db.query('SELECT * FROM inventory WHERE id = ?', [itemId]);

    if (items.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({
      success: true,
      item: items[0]
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory item', error: error.message });
  }
};

// FR13: Update inventory
exports.updateInventory = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { name, type, stock, unit, location, expiryDate, status, batchNumber } = req.body;

    const [result] = await db.query(
      `UPDATE inventory 
       SET name = ?, type = ?, stock = ?, unit = ?, location = ?, expiry_date = ?, status = ?, batch_number = ?
       WHERE id = ?`,
      [name, type, stock, unit, location, expiryDate, status, batchNumber, itemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({
      success: true,
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Failed to update inventory', error: error.message });
  }
};

// FR14: Search inventory by location
exports.searchByLocation = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ message: 'Location parameter is required' });
    }

    const [items] = await db.query(
      'SELECT * FROM inventory WHERE location LIKE ? ORDER BY name',
      [`%${location}%`]
    );

    res.json({
      success: true,
      count: items.length,
      location,
      items
    });
  } catch (error) {
    console.error('Search by location error:', error);
    res.status(500).json({ message: 'Failed to search inventory', error: error.message });
  }
};

// FR14: Find by exact location
exports.getByLocation = async (req, res) => {
  try {
    const { location } = req.params;

    const [items] = await db.query(
      'SELECT * FROM inventory WHERE location = ? ORDER BY name',
      [location]
    );

    res.json({
      success: true,
      count: items.length,
      location,
      items
    });
  } catch (error) {
    console.error('Get by location error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory by location', error: error.message });
  }
};

// FR12: Get alerts (low stock and expiring products)
exports.getAlerts = async (req, res) => {
  try {
    const alertService = require('../services/alertService');
    const alerts = await alertService.getCurrentAlerts();

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message });
  }
};

// Add inventory item
exports.addInventoryItem = async (req, res) => {
  try {
    const { name, type, stock, unit, location, expiryDate, status, batchNumber } = req.body;

    const [result] = await db.query(
      `INSERT INTO inventory (name, type, stock, unit, location, expiry_date, status, batch_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, stock, unit, location || null, expiryDate || null, status || 'good', batchNumber || null]
    );

    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      itemId: result.insertId
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ message: 'Failed to add inventory item', error: error.message });
  }
};

// Get inventory statistics
exports.getInventoryStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(stock) as total_stock,
        SUM(CASE WHEN status IN ('low', 'critical') THEN 1 ELSE 0 END) as low_stock_items,
        SUM(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as expiring_soon,
        SUM(CASE WHEN type = 'fruit' THEN 1 ELSE 0 END) as fruit_items,
        SUM(CASE WHEN type = 'product' THEN 1 ELSE 0 END) as product_items
      FROM inventory
    `);

    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory statistics', error: error.message });
  }
};
