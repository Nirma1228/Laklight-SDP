const db = require('../config/database');

const getId = async (table, pk, col, val) => {
  const [rows] = await db.query(`SELECT ${pk} FROM ${table} WHERE ${col} = ?`, [val]);
  return rows.length > 0 ? rows[0][pk] : null;
};

// --- Applications ---
exports.getPendingApplications = async (req, res) => {
  try {
    const [apps] = await db.query(`
      SELECT 
        fs.submission_id AS id,
        u.full_name AS farmerName,
        fs.product_name AS product,
        fs.quantity,
        mu.unit_name AS unit,
        fs.custom_price AS price,
        fs.harvest_date,
        fs.delivery_date AS date,
        fs.storage_instructions,
        fs.images,
        fs.notes,
        fs.submission_date AS submitted,
        ss.status_name AS status,
        tm.method_name AS transport,
        c.category_name AS category
      FROM farmer_submissions fs
      JOIN users u ON fs.farmer_id = u.user_id
      JOIN submission_statuses ss ON fs.status_id = ss.submission_status_id
      LEFT JOIN measurement_units mu ON fs.unit_id = mu.unit_id
      LEFT JOIN transport_methods tm ON fs.transport_method_id = tm.transport_method_id
      LEFT JOIN product_categories c ON fs.category_id = c.category_id
      WHERE ss.status_name = 'under-review'
    `);
    res.json({ success: true, count: apps.length, applications: apps });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

exports.approveApplication = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { scheduledDate, notes, isUsingFarmerDate } = req.body;
    
    // If using farmer's date, status is 'selected' (approved)
    // If rescheduling, we set a temporary 'Action Required' status for the farmer to respond
    const statusName = isUsingFarmerDate ? 'selected' : 'under-review';
    const statusId = await getId('submission_statuses', 'submission_status_id', 'status_name', statusName);

    // If employee uses farmer's proposed date → 'confirmed' (confirmed immediately)
    // If employee reschedules → 'Action Required' (waiting for farmer to confirm/reject)
    let deliveryStatusName = isUsingFarmerDate ? 'confirmed' : 'Action Required';
    const deliveryStatusId = await getId('delivery_statuses', 'delivery_status_id', 'status_name', deliveryStatusName);

    await connection.query('UPDATE farmer_submissions SET status_id = ?, notes = ? WHERE submission_id = ?', [statusId, notes, req.params.id]);

    const [[sub]] = await connection.query('SELECT * FROM farmer_submissions WHERE submission_id = ?', [req.params.id]);

    // Delete any existing delivery record for this submission to avoid duplicates before inserting new one
    await connection.query('DELETE FROM deliveries WHERE submission_id = ?', [req.params.id]);

    await connection.query(
      'INSERT INTO deliveries (submission_id, scheduled_date, proposed_reschedule_date, transport_method_id, status_id) VALUES (?, ?, ?, ?, ?)',
      [
        req.params.id, 
        isUsingFarmerDate ? scheduledDate : null, 
        isUsingFarmerDate ? null : scheduledDate, 
        sub.transport_method_id, 
        deliveryStatusId
      ]
    );

    await connection.commit();
    res.json({ success: true, message: 'Approved & Delivery Scheduled' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Approval failed', error: error.message });
  } finally { connection.release(); }
};

// --- Inventory ---

exports.addRawMaterial = async (req, res) => {
  try {
    const { material_name, materialName, quantity, expiryDate, expiry_date, location, storage_location, unitName, received_date } = req.body;
    
    // Support both Material Name and material_name for flexibility
    const name = material_name || materialName;
    const qty = quantity;
    const exp = expiry_date || expiryDate;
    const loc = storage_location || location;
    const rcv = received_date || new Date();

    const unitId = await getId('measurement_units', 'unit_id', 'unit_name', unitName || 'kg');

    await db.query(
      'INSERT INTO inventory_raw (material_name, grade_id, quantity_units, unit_id, received_date, expiry_date, storage_location) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, 1, qty, unitId || 1, rcv, exp, loc]
    );
    res.json({ success: true, message: 'Raw stock added' });
  } catch (error) {
    res.status(500).json({ message: 'Add failed', error: error.message });
  }
};

exports.addFinishedProduct = async (req, res) => {
  try {
    const { productId, batch, mfgDate, expDate, quantity, location } = req.body;
    await db.query(
      'INSERT INTO inventory_finished (product_id, batch_number, manufactured_date, expiry_date, quantity_units, storage_location) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, batch, mfgDate, expDate, quantity, location]
    );
    res.json({ success: true, message: 'Finished stock added' });
  } catch (error) {
    res.status(500).json({ message: 'Add failed', error: error.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const [raw] = await db.query(`
      SELECT ir.*,
             ir.material_name,
             mu.unit_name,
             ir.received_date,
             ir.expiry_date,
             ir.storage_location
      FROM inventory_raw ir
      LEFT JOIN measurement_units mu ON ir.unit_id = mu.unit_id
      ORDER BY ir.raw_inventory_id ASC`);

    const [finished] = await db.query(`
      SELECT ifin.*,
             p.name,
             pc.category_name as category,
             ifin.manufactured_date,
             ifin.expiry_date,
             ifin.storage_location,
             ifin.batch_number,
             ifin.quantity_units
      FROM inventory_finished ifin
      JOIN products p ON ifin.product_id = p.product_id
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      ORDER BY ifin.finished_inventory_id ASC`);

    console.log('Backend getInventory Raw Count:', raw.length);
    res.json({ success: true, raw, finished });
  } catch (error) {
    console.error('getInventory error:', error.message);
    res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
  }
};
exports.getApplicationDetails = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT fs.*, fs.submission_id as id, u.full_name as farmer_name, ss.status_name as status FROM farmer_submissions fs JOIN users u ON fs.farmer_id = u.user_id JOIN submission_statuses ss ON fs.status_id = ss.submission_status_id WHERE fs.submission_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, application: rows[0] });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.rejectApplication = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const statusId = await getId('submission_statuses', 'submission_status_id', 'status_name', 'not-selected');
    await db.query('UPDATE farmer_submissions SET status_id = ?, rejection_reason = ? WHERE submission_id = ?', [statusId, rejectionReason, req.params.id]);
    res.json({ success: true, message: 'Application rejected' });
  } catch (error) { res.status(500).json({ message: 'Update failed', error: error.message }); }
};

exports.addInventoryItem = async (req, res) => {
  // Generic handler for raw/finished
  const { type } = req.body;
  if (type === 'raw') return exports.addRawMaterial(req, res);
  return exports.addFinishedProduct(req, res);
};

exports.getInventoryStats = async (req, res) => {
  try {
    const [[rawCount]] = await db.query('SELECT COUNT(*) as count FROM inventory_raw');
    const [[finCount]] = await db.query('SELECT COUNT(*) as count FROM inventory_finished');
    res.json({ success: true, stats: { raw: rawCount.count, finished: finCount.count } });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.getByLocation = async (req, res) => {
  try {
    const loc = req.params.location;
    const [raw] = await db.query('SELECT * FROM inventory_raw WHERE storage_location = ?', [loc]);
    const [fin] = await db.query('SELECT * FROM inventory_finished WHERE storage_location = ?', [loc]);
    res.json({ success: true, items: { raw, finished: fin } });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.searchByLocation = async (req, res) => {
  req.params.location = req.query.query;
  return exports.getByLocation(req, res);
};

exports.getInventoryItem = async (req, res) => {
  res.status(501).json({ message: 'Detailed item view not implemented yet' });
};

exports.updateInventory = async (req, res) => {
  try {
    const { quantity, location, type } = req.body;
    const table = type === 'raw' ? 'inventory_raw' : 'inventory_finished';
    const pk = 'id';

    await db.query(`UPDATE ${table} SET quantity_units = ?, storage_location = ? WHERE ${pk} = ?`, [quantity, location, req.params.id]);
    res.json({ success: true, message: 'Stock updated' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const { type } = req.query;
    const table = type === 'raw' ? 'inventory_raw' : 'inventory_finished';
    const pk = 'id';

    await db.query(`DELETE FROM ${table} WHERE ${pk} = ?`, [req.params.id]);
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getCurrentAlerts();
    res.json({ success: true, alerts });
  } catch (error) { res.status(500).json({ message: 'Alerts failed', error: error.message }); }
};

// Get all deliveries for employee dashboard
exports.getDeliveries = async (req, res) => {
  try {
    const [deliveries] = await db.query(`
      SELECT d.*, d.delivery_id, d.proposed_reschedule_date, fs.product_name, fs.quantity, fs.custom_price, u.full_name as farmer_name,
             mu.unit_name as unit, ds.status_name as status,
             tm.method_name AS transport_method,
             fs.delivery_date
      FROM deliveries d
      JOIN farmer_submissions fs ON d.submission_id = fs.submission_id
      JOIN users u ON fs.farmer_id = u.user_id
      LEFT JOIN measurement_units mu ON fs.unit_id = mu.unit_id
      JOIN delivery_statuses ds ON d.status_id = ds.delivery_status_id
      LEFT JOIN transport_methods tm ON fs.transport_method_id = tm.transport_method_id
      ORDER BY d.delivery_id DESC
    `);
    res.json({ success: true, count: deliveries.length, deliveries });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch deliveries', error: error.message });
  }
};

// Reschedule delivery
exports.rescheduleDelivery = async (req, res) => {
  try {
    const { scheduledDate } = req.body;
    const deliveryId = req.params.id;

    if (!scheduledDate) {
      return res.status(400).json({ message: 'Scheduled date is required' });
    }

    await db.query(
      'UPDATE deliveries SET scheduled_date = ?, updated_at = NOW() WHERE delivery_id = ?',
      [scheduledDate, deliveryId]
    );

    res.json({ success: true, message: 'Delivery rescheduled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reschedule delivery', error: error.message });
  }
};

// Approve farmer's reschedule request
exports.approveReschedule = async (req, res) => {
  try {
    const { scheduledDate } = req.body;
    const deliveryId = req.params.id;

    if (!scheduledDate) {
      return res.status(400).json({ message: 'Scheduled date is required' });
    }

    const statusId = await getId('delivery_statuses', 'delivery_status_id', 'status_name', 'confirmed schedule');

    // Update scheduled_date, clear proposed_reschedule_date, and update status
    await db.query(
      'UPDATE deliveries SET scheduled_date = ?, proposed_reschedule_date = NULL, status_id = ?, updated_at = NOW() WHERE delivery_id = ?',
      [scheduledDate, statusId, deliveryId]
    );

    res.json({ success: true, message: 'Farmer\'s reschedule request approved' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve reschedule', error: error.message });
  }
};

// Mark delivery as complete
exports.completeDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const statusId = await getId('delivery_statuses', 'delivery_status_id', 'status_name', 'completed');

    await db.query(
      'UPDATE deliveries SET status_id = ?, updated_at = NOW() WHERE delivery_id = ?',
      [statusId, deliveryId]
    );

    res.json({ success: true, message: 'Delivery marked as completed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete delivery', error: error.message });
  }
};


