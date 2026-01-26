const db = require('../config/database');

const getId = async (table, col, val) => {
  const [rows] = await db.query(`SELECT id FROM ${table} WHERE ${col} = ?`, [val]);
  return rows.length > 0 ? rows[0].id : null;
};

// --- Applications ---
exports.getPendingApplications = async (req, res) => {
  try {
    const [apps] = await db.query(`
      SELECT fs.*, u.full_name as farmer_name, ss.status_name as status, 
             mu.unit_name as unit, qg.grade_name as grade, pc.category_name as category
       FROM farmer_submissions fs
       JOIN users u ON fs.farmer_id = u.id
       JOIN submission_statuses ss ON fs.status_id = ss.id
       JOIN measurement_units mu ON fs.unit_id = mu.id
       JOIN quality_grades qg ON fs.grade_id = qg.id
       JOIN product_categories pc ON fs.category_id = pc.id
       WHERE ss.status_name = 'under-review'`);
    res.json({ success: true, count: apps.length, applications: apps });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

exports.approveApplication = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { scheduledDate, notes } = req.body;
    const statusId = await getId('submission_statuses', 'status_name', 'selected');
    const deliveryStatusId = await getId('delivery_statuses', 'status_name', 'confirmed');

    await connection.query('UPDATE farmer_submissions SET status_id = ?, notes = ? WHERE id = ?', [statusId, notes, req.params.id]);

    const [[sub]] = await connection.query('SELECT * FROM farmer_submissions WHERE id = ?', [req.params.id]);
    const delNum = `DEL-${Date.now()}`;

    await connection.query(
      'INSERT INTO deliveries (submission_id, delivery_number, scheduled_date, transport_method_id, status_id) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, delNum, scheduledDate || sub.delivery_date, sub.transport_method_id, deliveryStatusId]
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
    const { materialName, gradeName, quantity, expiryDate, location } = req.body;
    const matId = await getId('raw_material_types', 'material_name', materialName);
    const gradeId = await getId('quality_grades', 'grade_name', gradeName);

    if (!matId || !gradeId) return res.status(400).json({ message: 'Invalid Material or Grade' });

    await db.query(
      'INSERT INTO inventory_raw (material_type_id, grade_id, quantity_kg, received_date, expiry_date, storage_location) VALUES (?, ?, ?, NOW(), ?, ?)',
      [matId, gradeId, quantity, expiryDate, location]
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
      SELECT ir.*, rt.material_name, qg.grade_name as grade 
      FROM inventory_raw ir 
      JOIN raw_material_types rt ON ir.material_type_id = rt.id
      JOIN quality_grades qg ON ir.grade_id = qg.id`);

    const [finished] = await db.query(`
      SELECT ifin.*, p.name 
      FROM inventory_finished ifin 
      JOIN products p ON ifin.product_id = p.id`);

    res.json({ success: true, raw, finished });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};
exports.getApplicationDetails = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT fs.*, u.full_name as farmer_name, ss.status_name as status FROM farmer_submissions fs JOIN users u ON fs.farmer_id = u.id JOIN submission_statuses ss ON fs.status_id = ss.id WHERE fs.id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, application: rows[0] });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const statusId = await getId('submission_statuses', 'status_name', 'not-selected');
    await db.query('UPDATE farmer_submissions SET status_id = ?, rejection_reason = ? WHERE id = ?', [statusId, reason, req.params.id]);
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
  res.status(501).json({ message: 'Update item not implemented yet' });
};

const alertService = require('../services/alertService');
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getCurrentAlerts();
    res.json({ success: true, alerts });
  } catch (error) { res.status(500).json({ message: 'Alerts failed', error: error.message }); }
};
