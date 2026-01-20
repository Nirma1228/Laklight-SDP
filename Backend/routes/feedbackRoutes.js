const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { feedbackValidation, validate } = require('../middleware/validation');

// Customer and Farmer can submit feedback
router.post('/', verifyToken, checkRole('customer', 'farmer'), feedbackValidation, validate, feedbackController.submitFeedback);

// Public statistics - Specific route BEFORE parameterized routes
router.get('/stats', feedbackController.getFeedbackStats);

// Specific route before :id
router.get('/my', verifyToken, checkRole('customer', 'farmer'), feedbackController.getMyFeedback);

// Parameterized routes AFTER specific routes
router.get('/:id', verifyToken, checkRole('customer', 'farmer'), feedbackController.getFeedbackById);
router.put('/:id', verifyToken, checkRole('customer', 'farmer'), feedbackValidation, validate, feedbackController.updateFeedback);
router.delete('/:id', verifyToken, checkRole('customer', 'farmer'), feedbackController.deleteFeedback);

module.exports = router;
