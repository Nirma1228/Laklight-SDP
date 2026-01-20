const db = require('../config/database');
const upload = require('../config/multer');

// FR09: Submit product for review
exports.submitProduct = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const {
      productName,
      category,
      variety,
      quantity,
      unit,
      grade,
      customPrice,
      harvestDate,
      transport,
      deliveryDate,
      storageInstructions,
      notes
    } = req.body;

    // Insert submission
    const [result] = await db.query(
      `INSERT INTO farmer_submissions 
       (farmer_id, product_name, category, variety, quantity, unit, grade, custom_price, 
        harvest_date, transport, delivery_date, storage_instructions, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        farmerId,
        productName,
        category,
        variety || null,
        quantity,
        unit,
        grade || null,
        customPrice || null,
        harvestDate,
        transport || null,
        deliveryDate || null,
        storageInstructions || null,
        notes || null,
        'under-review'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product submission sent for review',
      submissionId: result.insertId
    });
  } catch (error) {
    console.error('Submit product error:', error);
    res.status(500).json({ message: 'Failed to submit product', error: error.message });
  }
};

// FR10: Get farmer's submissions with status tracking
exports.getMySubmissions = async (req, res) => {
  try {
    const farmerId = req.user.userId;

    const [submissions] = await db.query(
      `SELECT * FROM farmer_submissions 
       WHERE farmer_id = ? 
       ORDER BY submission_date DESC`,
      [farmerId]
    );

    // Group by status for easier tracking
    const statusSummary = {
      selected: submissions.filter(s => s.status === 'selected').length,
      underReview: submissions.filter(s => s.status === 'under-review').length,
      notSelected: submissions.filter(s => s.status === 'not-selected').length,
      total: submissions.length
    };

    res.json({
      success: true,
      summary: statusSummary,
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
};

// FR10: Track specific submission status
exports.getSubmissionStatus = async (req, res) => {
  try {
    const submissionId = req.params.id;
    const farmerId = req.user.userId;

    const [submissions] = await db.query(
      'SELECT * FROM farmer_submissions WHERE id = ? AND farmer_id = ?',
      [submissionId, farmerId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({
      success: true,
      submission: submissions[0]
    });
  } catch (error) {
    console.error('Get submission status error:', error);
    res.status(500).json({ message: 'Failed to fetch submission status', error: error.message });
  }
};

// Update submission
exports.updateSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id;
    const farmerId = req.user.userId;
    const updateData = req.body;

    // Check if submission can be edited
    const [submissions] = await db.query(
      'SELECT * FROM farmer_submissions WHERE id = ? AND farmer_id = ?',
      [submissionId, farmerId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const submission = submissions[0];

    // Can only edit submissions that are under review
    if (submission.status !== 'under-review') {
      return res.status(400).json({ 
        message: `Cannot edit submission with status: ${submission.status}` 
      });
    }

    // Build update query dynamically
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(submissionId);

    await db.query(
      `UPDATE farmer_submissions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Submission updated successfully'
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ message: 'Failed to update submission', error: error.message });
  }
};

// Delete submission
exports.deleteSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id;
    const farmerId = req.user.userId;

    // Check if submission can be deleted
    const [submissions] = await db.query(
      'SELECT * FROM farmer_submissions WHERE id = ? AND farmer_id = ?',
      [submissionId, farmerId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const submission = submissions[0];

    // Can only delete submissions that are under review
    if (submission.status !== 'under-review') {
      return res.status(400).json({ 
        message: `Cannot delete submission with status: ${submission.status}` 
      });
    }

    await db.query('DELETE FROM farmer_submissions WHERE id = ?', [submissionId]);

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ message: 'Failed to delete submission', error: error.message });
  }
};

// Get delivery schedules
exports.getDeliveries = async (req, res) => {
  try {
    const farmerId = req.user.userId;

    const [deliveries] = await db.query(
      `SELECT d.*, fs.product_name, fs.quantity as submission_quantity
       FROM deliveries d
       JOIN farmer_submissions fs ON d.submission_id = fs.id
       WHERE d.farmer_id = ?
       ORDER BY d.proposed_date DESC`,
      [farmerId]
    );

    res.json({
      success: true,
      count: deliveries.length,
      deliveries
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ message: 'Failed to fetch deliveries', error: error.message });
  }
};

// Update delivery information
exports.updateDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const farmerId = req.user.userId;
    const { proposedDate, transportMethod } = req.body;

    const [deliveries] = await db.query(
      'SELECT * FROM deliveries WHERE id = ? AND farmer_id = ?',
      [deliveryId, farmerId]
    );

    if (deliveries.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Can only update pending deliveries
    if (deliveries[0].status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot update delivery with status: ${deliveries[0].status}` 
      });
    }

    await db.query(
      'UPDATE deliveries SET proposed_date = ?, transport_method = ? WHERE id = ?',
      [proposedDate || deliveries[0].proposed_date, transportMethod || deliveries[0].transport_method, deliveryId]
    );

    res.json({
      success: true,
      message: 'Delivery information updated successfully'
    });
  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({ message: 'Failed to update delivery', error: error.message });
  }
};
