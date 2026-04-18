const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All report routes require admin or employee authentication

// Specific report routes BEFORE parameterized routes
router.get('/sales', verifyToken, checkRole('admin', 'employee'), reportController.getSalesReport);
router.get('/inventory', verifyToken, checkRole('admin', 'employee'), reportController.getInventoryReport);
router.get('/supplier', verifyToken, checkRole('admin', 'employee'), reportController.getSupplierReport);
router.get('/customer', verifyToken, checkRole('admin', 'employee'), reportController.getCustomerReport);
router.post('/generate', verifyToken, checkRole('admin', 'employee'), reportController.generateCustomReport);

// Parameterized routes AFTER specific routes
router.get('/:id', verifyToken, checkRole('admin', 'employee'), reportController.getReportById);
router.get('/:id/download', verifyToken, checkRole('admin', 'employee'), reportController.downloadReport);

module.exports = router;
