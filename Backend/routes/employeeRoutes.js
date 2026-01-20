const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All employee routes require employee or admin authentication

// Application review routes
router.get('/applications', verifyToken, checkRole('employee', 'administrator'), employeeController.getPendingApplications);
router.get('/applications/:id', verifyToken, checkRole('employee', 'administrator'), employeeController.getApplicationDetails);
router.put('/applications/:id/approve', verifyToken, checkRole('employee', 'administrator'), employeeController.approveApplication);
router.put('/applications/:id/reject', verifyToken, checkRole('employee', 'administrator'), employeeController.rejectApplication);

// Inventory management routes
router.get('/inventory', verifyToken, checkRole('employee', 'administrator'), employeeController.getInventory);
router.get('/inventory/:id', verifyToken, checkRole('employee', 'administrator'), employeeController.getInventoryItem);
router.put('/inventory/:id', verifyToken, checkRole('employee', 'administrator'), employeeController.updateInventory);
router.post('/inventory', verifyToken, checkRole('employee', 'administrator'), employeeController.addInventoryItem);
router.get('/inventory/search', verifyToken, checkRole('employee', 'administrator'), employeeController.searchByLocation);
router.get('/inventory/location/:location', verifyToken, checkRole('employee', 'administrator'), employeeController.getByLocation);
router.get('/inventory/stats', verifyToken, checkRole('employee', 'administrator'), employeeController.getInventoryStats);

// Alert routes
router.get('/alerts', verifyToken, checkRole('employee', 'administrator'), employeeController.getAlerts);

module.exports = router;
