const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { orderValidation, validate } = require('../middleware/validation');

// Customer routes
router.post('/', verifyToken, checkRole('customer'), orderValidation, validate, orderController.placeOrder);
router.get('/', verifyToken, checkRole('customer'), orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrderDetails);
router.put('/:id/cancel', verifyToken, checkRole('customer'), orderController.cancelOrder);

// Public route (with order number)
router.get('/track/:orderNumber', orderController.trackOrder);

// Admin/Employee routes
router.get('/all', verifyToken, checkRole('administrator', 'employee'), orderController.getAllOrders);
router.put('/:id/status', verifyToken, checkRole('administrator', 'employee'), orderController.updateOrderStatus);
router.get('/stats', verifyToken, checkRole('administrator', 'employee'), orderController.getOrderStats);

module.exports = router;
