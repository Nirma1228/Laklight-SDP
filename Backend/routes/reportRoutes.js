const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All report routes require admin or employee authentication

router.get('/sales', verifyToken, checkRole('administrator', 'employee'), reportController.getSalesReport);
router.get('/inventory', verifyToken, checkRole('administrator', 'employee'), reportController.getInventoryReport);
router.get('/supplier', verifyToken, checkRole('administrator', 'employee'), reportController.getSupplierReport);
router.get('/customer', verifyToken, checkRole('administrator', 'employee'), reportController.getCustomerReport);

router.post('/generate', verifyToken, checkRole('administrator', 'employee'), reportController.generateCustomReport);
router.get('/:id', verifyToken, checkRole('administrator', 'employee'), reportController.getReportById);
router.get('/:id/download', verifyToken, checkRole('administrator', 'employee'), reportController.downloadReport);

module.exports = router;
