const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, optionalAuth, checkRole } = require('../middleware/auth');

// Customer payment routes
router.post('/process', verifyToken, checkRole('customer'), paymentController.processPayment);
router.post('/verify', verifyToken, checkRole('customer'), paymentController.verifyPayment);
router.get('/methods', paymentController.getPaymentMethods);
router.post('/card', verifyToken, checkRole('customer'), paymentController.processCardPayment);
router.post('/create-checkout-session', verifyToken, checkRole('customer'), paymentController.createCheckoutSession);
router.post('/confirm-stripe', optionalAuth, paymentController.confirmStripePayment);
router.get('/history', verifyToken, checkRole('customer'), paymentController.getPaymentHistory);

module.exports = router;
