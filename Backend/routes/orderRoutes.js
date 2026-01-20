const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { orderValidation, validate } = require('../middleware/validation');

// Customer routes
router.post('/', verifyToken, checkRole('customer'), orderValidation, validate, orderController.placeOrder);
router.get('/', verifyToken, checkRole('customer'), orderController.getOrders);

// Admin/Employee routes - Place specific routes BEFORE parameterized routes
router.get('/all', verifyToken, checkRole('administrator', 'employee'), orderController.getAllOrders);
router.get('/stats', verifyToken, checkRole('administrator', 'employee'), orderController.getOrderStats);

// Public route (with order number) - Specific route before :id
router.get('/track/:orderNumber', orderController.trackOrder);

// Parameterized routes - Must come AFTER specific routes
router.get('/:id', verifyToken, orderController.getOrderDetails);
router.put('/:id/cancel', verifyToken, checkRole('customer'), orderController.cancelOrder);
router.put('/:id/status', verifyToken, checkRole('administrator', 'employee'), orderController.updateOrderStatus);

module.exports = router;
