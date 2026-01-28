const db = require('../config/database');

const getId = async (table, col, val) => {
  const [rows] = await db.query(`SELECT id FROM ${table} WHERE ${col} = ?`, [val]);
  return rows.length > 0 ? rows[0].id : null;
};

// FR09: Submit product for review
// FR09: Submit product for review
exports.submitProduct = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const {
      productName, variety, category, quantity, unit,
      grade, customPrice, harvestDate, transport,
      deliveryDate, storageInstructions, notes, images
    } = req.body;

    console.log('📦 Received submission:', { productName, category, quantity, unit, grade });

    // Helper to get ID (case-insensitive)
    const getPkId = async (table, pk, col, val) => {
      if (!val) return null;
      // Try exact match
      const [rows] = await db.query(`SELECT ${pk} FROM ${table} WHERE ${col} = ?`, [val]);
      if (rows.length > 0) return rows[0][pk];

      // Try case-insensitive
      const [rowsCI] = await db.query(`SELECT ${pk} FROM ${table} WHERE LOWER(${col}) = LOWER(?)`, [val]);
      return rowsCI.length > 0 ? rowsCI[0][pk] : null;
    };

    // Lookups for Foreign Keys
    const catId = await getPkId('product_categories', 'category_id', 'category_name', category);
    const unitId = await getPkId('measurement_units', 'unit_id', 'unit_name', unit);
    const statusId = await getPkId('submission_statuses', 'submission_status_id', 'status_name', 'under-review');

    if (!catId) {
      console.error(`❌ Invalid category: '${category}'. Supported categories may be case-sensitive or missing.`);
      return res.status(400).json({ message: `Invalid category: '${category}'.` });
    }
    if (!unitId) {
      console.error(`❌ Invalid unit: '${unit}'`);
      return res.status(400).json({ message: `Invalid unit: '${unit}'.` });
    }
    if (!statusId) {
      console.error(`❌ Status 'under-review' not found in DB`);
      return res.status(500).json({ message: 'System error: status configuration missing.' });
    }

    // Handle images
    const imageData = images && Array.isArray(images) && images.length > 0
      ? JSON.stringify(images)
      : null;

    // Mappings to match Database ENUMs/Expectations
    const gradeMap = {
      'grade-a': 'Grade A',
      'grade-b': 'Grade B',
      'grade-c': 'Grade C'
    };

    const transportMap = {
      'self': 'Self Transport',
      'company': 'Company Truck Pickup'
    };

    const finalGrade = gradeMap[grade] || grade; // Fallback to original if not found
    const finalTransport = transportMap[transport] || transport;

    const gradeId = await getPkId('quality_grades', 'grade_id', 'grade_name', finalGrade);
    const transportMethodId = await getPkId('transport_methods', 'transport_method_id', 'method_name', finalTransport);

    console.log(`📝 Mapped Data: Grade='${grade}'->'${finalGrade}' (ID: ${gradeId}), Transport='${transport}'->'${finalTransport}' (ID: ${transportMethodId})`);

    // Insert
    const [result] = await db.query(
      `INSERT INTO farmer_submissions 
       (farmer_id, product_name, category_id, quantity, unit_id, grade_id, custom_price, harvest_date, transport_method_id, delivery_date, storage_instructions, images, notes, status_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        farmerId,
        productName,
        catId,
        quantity,
        unitId,
        gradeId,
        customPrice || null,
        harvestDate,
        transportMethodId || null,
        deliveryDate || null,
        storageInstructions || null,
        imageData,
        notes || null,
        statusId
      ]
    );

    console.log('✅ Submission created with ID:', result.insertId);
    res.status(201).json({ success: true, message: 'Submission received', submissionId: result.insertId });
  } catch (error) {
    console.error('❌ Submission error:', error);
    res.status(500).json({ message: 'Submission failed', error: error.message });
  }
};

// FR10: Get farmer's submissions
exports.getMySubmissions = async (req, res) => {
  try {
    const [submissions] = await db.query(`
      SELECT fs.*, fs.submission_id as id, ss.status_name as status, pc.category_name as category, mu.unit_name as unit, qg.grade_name as grade
      FROM farmer_submissions fs
      JOIN submission_statuses ss ON fs.status_id = ss.submission_status_id
      JOIN product_categories pc ON fs.category_id = pc.category_id
      JOIN measurement_units mu ON fs.unit_id = mu.unit_id
      LEFT JOIN quality_grades qg ON fs.grade_id = qg.grade_id
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
      SELECT d.*, d.delivery_id as id, ds.status_name as status, fs.product_name, tm.method_name as transport
      FROM deliveries d
      JOIN delivery_statuses ds ON d.status_id = ds.delivery_status_id
      JOIN farmer_submissions fs ON d.submission_id = fs.submission_id
      LEFT JOIN transport_methods tm ON d.transport_method_id = tm.transport_method_id
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
    let statusId = null;
    if (status) {
      const [statusRows] = await db.query('SELECT delivery_status_id FROM delivery_statuses WHERE status_name = ?', [status]);
      if (statusRows.length > 0) statusId = statusRows[0].delivery_status_id;
    }

    const updates = [];
    const params = [];
    if (rescheduleDate) { updates.push('proposed_reschedule_date = ?'); params.push(rescheduleDate); }
    if (statusId) { updates.push('status_id = ?'); params.push(statusId); }

    if (updates.length === 0) return res.status(400).json({ message: 'Nothing to update' });

    params.push(req.params.id);
    await db.query(`UPDATE deliveries SET ${updates.join(', ')} WHERE delivery_id = ?`, params);

    res.json({ success: true, message: 'Delivery updated' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};
exports.getSubmissionStatus = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT fs.*, ss.status_name as status FROM farmer_submissions fs JOIN submission_statuses ss ON fs.status_id = ss.submission_status_id WHERE fs.submission_id = ? AND fs.farmer_id = ?', [req.params.id, req.user.userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, submission: rows[0] });
  } catch (error) { res.status(500).json({ message: 'Fetch failed', error: error.message }); }
};

exports.updateSubmission = async (req, res) => {
  try {
    const { quantity, customPrice } = req.body;
    await db.query('UPDATE farmer_submissions SET quantity = ?, custom_price = ? WHERE submission_id = ? AND farmer_id = ?', [quantity, customPrice, req.params.id, req.user.userId]);
    res.json({ success: true, message: 'Updated' });
  } catch (error) { res.status(500).json({ message: 'Update failed', error: error.message }); }
};

exports.deleteSubmission = async (req, res) => {
  try {
    await db.query('DELETE FROM farmer_submissions WHERE submission_id = ? AND farmer_id = ?', [req.params.id, req.user.userId]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: 'Delete failed', error: error.message }); }
};

// Bank Details Management
exports.saveBankDetails = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { accountHolderName, bankName, branchName, accountNumber } = req.body;

    if (!accountHolderName || !bankName || !branchName || !accountNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Use INSERT ... ON DUPLICATE KEY UPDATE for easy upsert
    await db.query(
      `INSERT INTO farmer_bank_details 
       (farmer_id, account_holder_name, bank_name, branch_name, account_number) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       account_holder_name = VALUES(account_holder_name),
       bank_name = VALUES(bank_name),
       branch_name = VALUES(branch_name),
       account_number = VALUES(account_number)`,
      [farmerId, accountHolderName, bankName, branchName, accountNumber]
    );

    res.json({ success: true, message: 'Bank details saved successfully' });
  } catch (error) {
    console.error('Save bank details error:', error);
    res.status(500).json({ message: 'Failed to save bank details', error: error.message });
  }
};

exports.getBankDetails = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const [rows] = await db.query(
      'SELECT * FROM farmer_bank_details WHERE farmer_id = ?',
      [farmerId]
    );

    res.json({ success: true, bankDetails: rows.length > 0 ? rows[0] : null });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({ message: 'Failed to fetch bank details', error: error.message });
  }
};
