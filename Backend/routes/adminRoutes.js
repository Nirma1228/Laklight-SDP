const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All admin routes require administrator authentication

// User management routes - Specific routes BEFORE parameterized routes
router.get('/users', verifyToken, checkRole('administrator'), adminController.getAllUsers);
router.post('/users', verifyToken, checkRole('administrator'), adminController.createUser);
router.get('/users/:id', verifyToken, checkRole('administrator'), adminController.getUserDetails);
router.put('/users/:id', verifyToken, checkRole('administrator'), adminController.updateUser);
router.delete('/users/:id', verifyToken, checkRole('administrator'), adminController.deleteUser);
router.put('/users/:id/role', verifyToken, checkRole('administrator'), adminController.changeUserRole);
router.put('/users/:id/status', verifyToken, checkRole('administrator'), adminController.changeUserStatus);

// Analytics dashboard routes
router.get('/analytics/dashboard', verifyToken, checkRole('administrator'), adminController.getAnalyticsDashboard);
router.get('/analytics/sales', verifyToken, checkRole('administrator'), adminController.getSalesAnalytics);
router.get('/analytics/revenue', verifyToken, checkRole('administrator'), adminController.getRevenueAnalytics);
router.get('/analytics/customers', verifyToken, checkRole('administrator'), adminController.getCustomerAnalytics);
router.get('/analytics/products', verifyToken, checkRole('administrator'), adminController.getProductAnalytics);

// Feedback management routes
router.get('/feedback', verifyToken, checkRole('administrator'), adminController.getAllFeedback);
router.get('/feedback/:id', verifyToken, checkRole('administrator'), adminController.getFeedbackDetails);
router.get('/complaints', verifyToken, checkRole('administrator'), adminController.getComplaints);
router.get('/compliments', verifyToken, checkRole('administrator'), adminController.getCompliments);

module.exports = router;
