const db = require('../config/database');

// FR19: Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const {
      productQuality,
      packaging,
      deliveryTime,
      customerService,
      valueForMoney,
      feedbackText,
      improvements
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO feedback 
       (customer_id, product_quality, packaging, delivery_time, customer_service, value_for_money, feedback_text, improvements)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        productQuality,
        packaging,
        deliveryTime,
        customerService,
        valueForMoney,
        feedbackText || null,
        improvements ? JSON.stringify(improvements) : null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      feedbackId: result.insertId
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
};

// Get user's own feedback
exports.getMyFeedback = async (req, res) => {
  try {
    const customerId = req.user.userId;

    const [feedback] = await db.query(
      'SELECT f.*, f.feedback_id as id FROM feedback f WHERE f.customer_id = ? ORDER BY f.created_at DESC',
      [customerId]
    );

    res.json({
      success: true,
      count: feedback.length,
      feedback
    });
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
};

// Get specific feedback
exports.getFeedbackById = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user.userId;

    const [feedback] = await db.query(
      'SELECT * FROM feedback WHERE feedback_id = ? AND customer_id = ?',
      [feedbackId, userId]
    );

    if (feedback.length === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      success: true,
      feedback: feedback[0]
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user.userId;
    const {
      productQuality,
      packaging,
      deliveryTime,
      customerService,
      valueForMoney,
      feedbackText,
      improvements
    } = req.body;

    const [result] = await db.query(
      `UPDATE feedback 
       SET product_quality = ?, packaging = ?, delivery_time = ?, customer_service = ?, 
           value_for_money = ?, feedback_text = ?, improvements = ?
       WHERE feedback_id = ? AND customer_id = ?`,
      [
        productQuality,
        packaging,
        deliveryTime,
        customerService,
        valueForMoney,
        feedbackText || null,
        improvements ? JSON.stringify(improvements) : null,
        feedbackId,
        userId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      success: true,
      message: 'Feedback updated successfully'
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: 'Failed to update feedback', error: error.message });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user.userId;

    const [result] = await db.query(
      'DELETE FROM feedback WHERE feedback_id = ? AND customer_id = ?',
      [feedbackId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: 'Failed to delete feedback', error: error.message });
  }
};

// Get feedback statistics
exports.getFeedbackStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(product_quality) as avg_product_quality,
        AVG(packaging) as avg_packaging,
        AVG(delivery_time) as avg_delivery_time,
        AVG(customer_service) as avg_customer_service,
        AVG(value_for_money) as avg_value_for_money,
        (AVG(product_quality) + AVG(packaging) + AVG(delivery_time) + AVG(customer_service) + AVG(value_for_money)) / 5 as overall_rating
      FROM feedback
    `);

    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback statistics', error: error.message });
  }
};
// Get all feedback (Admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    const [feedback] = await db.query(`
      SELECT f.*, u.full_name as customer_name, u.email as customer_email
      FROM feedback f
      JOIN users u ON f.customer_id = u.user_id
      ORDER BY f.created_at DESC
    `);

    res.json({
      success: true,
      count: feedback.length,
      feedback
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
};
