const db = require('../config/database');

const getId = async (table, col, val) => {
  const [rows] = await db.query(`SELECT id FROM ${table} WHERE ${col} = ?`, [val]);
  return rows.length > 0 ? rows[0].id : null;
};

// FR09: Submit product for review
exports.submitProduct = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const {
      productName, variety, category, quantity, unit,
      grade, customPrice, harvestDate, transport,
      storageInstructions, notes
    } = req.body;

    const catId = await getId('product_categories', 'category_name', category);
    const unitId = await getId('measurement_units', 'unit_name', unit);
    const gradeId = await getId('quality_grades', 'grade_name', grade);
    const transId = await getId('transport_methods', 'method_name', transport);
    const statusId = await getId('submission_statuses', 'status_name', 'under-review');

    if (!catId || !unitId || !gradeId || !statusId) {
      return res.status(400).json({ message: 'Invalid reference data (Category, Unit, Grade, or Status)' });
    }

    const [result] = await db.query(
      `INSERT INTO farmer_submissions 
       (farmer_id, product_name, variety, category_id, quantity, unit_id, grade_id, custom_price, harvest_date, transport_method_id, storage_instructions, notes, status_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [farmerId, productName, variety, catId, quantity, unitId, gradeId, customPrice, harvestDate, transId, storageInstructions, notes, statusId]
    );

    res.status(201).json({ success: true, message: 'Submission received', submissionId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Submission failed', error: error.message });
  }
};

// FR10: Get farmer's submissions
exports.getMySubmissions = async (req, res) => {
  try {
    const [submissions] = await db.query(`
      SELECT fs.*, ss.status_name as status, pc.category_name as category, mu.unit_name as unit, qg.grade_name as grade
      FROM farmer_submissions fs
      JOIN submission_statuses ss ON fs.status_id = ss.id
      JOIN product_categories pc ON fs.category_id = pc.id
      JOIN measurement_units mu ON fs.unit_id = mu.id
      JOIN quality_grades qg ON fs.grade_id = qg.id
      WHERE fs.farmer_id = ? 
      ORDER BY fs.submission_date DESC`, [req.user.userId]);

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

// Get delivery schedules
exports.getDeliveries = async (req, res) => {
  try {
    const [deliveries] = await db.query(`
      SELECT d.*, ds.status_name as status, fs.product_name, tm.method_name as transport
      FROM deliveries d
      JOIN delivery_statuses ds ON d.status_id = ds.id
      JOIN farmer_submissions fs ON d.submission_id = fs.id
      LEFT JOIN transport_methods tm ON d.transport_method_id = tm.id
      WHERE fs.farmer_id = ?
      ORDER BY d.scheduled_date DESC`, [req.user.userId]);

    res.json({ success: true, deliveries });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

// Update delivery (Reschedule/Confirm)
exports.updateDelivery = async (req, res) => {
  try {
    const { rescheduleDate, status } = req.body;
    const statusId = status ? await getId('delivery_statuses', 'status_name', status) : null;

    const updates = [];
    const params = [];
    if (rescheduleDate) { updates.push('proposed_reschedule_date = ?'); params.push(rescheduleDate); }
    if (statusId) { updates.push('status_id = ?'); params.push(statusId); }

    if (updates.length === 0) return res.status(400).json({ message: 'Nothing to update' });

    params.push(req.params.id);
    await db.query(`UPDATE deliveries SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: 'Delivery updated' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};
exports.getSubmissionStatus = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT fs.*, ss.status_name as status FROM farmer_submissions fs JOIN submission_statuses ss ON fs.status_id = ss.id WHERE fs.id = ? AND fs.farmer_id = ?', [req.params.id, req.user.userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, submission: rows[0] });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.updateSubmission = async (req, res) => {
  try {
    const { quantity, customPrice } = req.body;
    await db.query('UPDATE farmer_submissions SET quantity = ?, custom_price = ? WHERE id = ? AND farmer_id = ?', [quantity, customPrice, req.params.id, req.user.userId]);
    res.json({ success: true, message: 'Updated' });
  } catch (error) { res.status(500).json({ message: 'Update failed', error: error.message }); }
};

exports.deleteSubmission = async (req, res) => {
  try {
    await db.query('DELETE FROM farmer_submissions WHERE id = ? AND farmer_id = ?', [req.params.id, req.user.userId]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: 'Delete failed', error: error.message }); }
};
