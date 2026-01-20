const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { feedbackValidation, validate } = require('../middleware/validation');

// Customer and Farmer can submit feedback
router.post('/', verifyToken, checkRole('customer', 'farmer'), feedbackValidation, validate, feedbackController.submitFeedback);
router.get('/my', verifyToken, checkRole('customer', 'farmer'), feedbackController.getMyFeedback);
router.get('/:id', verifyToken, checkRole('customer', 'farmer'), feedbackController.getFeedbackById);
router.put('/:id', verifyToken, checkRole('customer', 'farmer'), feedbackValidation, validate, feedbackController.updateFeedback);
router.delete('/:id', verifyToken, checkRole('customer', 'farmer'), feedbackController.deleteFeedback);

// Public statistics
router.get('/stats', feedbackController.getFeedbackStats);

module.exports = router;
