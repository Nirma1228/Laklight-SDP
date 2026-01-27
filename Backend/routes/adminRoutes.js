const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All admin routes require administrator authentication

// User management routes - Specific routes BEFORE parameterized routes
router.get('/users', verifyToken, checkRole('admin'), adminController.getAllUsers);
router.post('/users', verifyToken, checkRole('admin'), adminController.createUser);
router.get('/users/:id', verifyToken, checkRole('admin'), adminController.getUserDetails);
router.put('/users/:id', verifyToken, checkRole('admin'), adminController.updateUser);
router.delete('/users/:id', verifyToken, checkRole('admin'), adminController.deleteUser);
router.put('/users/:id/role', verifyToken, checkRole('admin'), adminController.changeUserRole);
router.put('/users/:id/status', verifyToken, checkRole('admin'), adminController.changeUserStatus);

// Analytics dashboard routes
router.get('/analytics/dashboard', verifyToken, checkRole('admin'), adminController.getAnalyticsDashboard);
router.get('/analytics/sales', verifyToken, checkRole('admin'), adminController.getSalesAnalytics);
router.get('/analytics/revenue', verifyToken, checkRole('admin'), adminController.getRevenueAnalytics);
router.get('/analytics/customers', verifyToken, checkRole('admin'), adminController.getCustomerAnalytics);
router.get('/analytics/products', verifyToken, checkRole('admin'), adminController.getProductAnalytics);

// Feedback management routes
router.get('/feedback', verifyToken, checkRole('admin'), adminController.getAllFeedback);
router.get('/feedback/:id', verifyToken, checkRole('admin'), adminController.getFeedbackDetails);
router.get('/complaints', verifyToken, checkRole('admin'), adminController.getComplaints);
router.get('/compliments', verifyToken, checkRole('admin'), adminController.getCompliments);

module.exports = router;
