const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All employee routes require employee or admin authentication

// Application review routes
router.get('/applications', verifyToken, checkRole('employee', 'admin'), employeeController.getPendingApplications);
router.get('/applications/:id', verifyToken, checkRole('employee', 'admin'), employeeController.getApplicationDetails);
router.put('/applications/:id/approve', verifyToken, checkRole('employee', 'admin'), employeeController.approveApplication);
router.put('/applications/:id/reject', verifyToken, checkRole('employee', 'admin'), employeeController.rejectApplication);

// Inventory management routes - Specific routes BEFORE parameterized routes
router.get('/inventory', verifyToken, checkRole('employee', 'admin'), employeeController.getInventory);
router.post('/inventory', verifyToken, checkRole('employee', 'admin'), employeeController.addInventoryItem);
router.get('/inventory/search', verifyToken, checkRole('employee', 'admin'), employeeController.searchByLocation);
router.get('/inventory/stats', verifyToken, checkRole('employee', 'admin'), employeeController.getInventoryStats);
router.get('/inventory/location/:location', verifyToken, checkRole('employee', 'admin'), employeeController.getByLocation);
router.get('/inventory/:id', verifyToken, checkRole('employee', 'admin'), employeeController.getInventoryItem);
router.put('/inventory/:id', verifyToken, checkRole('employee', 'admin'), employeeController.updateInventory);
router.delete('/inventory/:id', verifyToken, checkRole('employee', 'admin'), employeeController.deleteInventoryItem);

// Alert routes
router.get('/alerts', verifyToken, checkRole('employee', 'admin'), employeeController.getAlerts);

// Delivery routes
router.get('/deliveries', verifyToken, checkRole('employee', 'admin'), employeeController.getDeliveries);
router.put('/deliveries/:id/reschedule', verifyToken, checkRole('employee', 'admin'), employeeController.rescheduleDelivery);
router.put('/deliveries/:id/approve-reschedule', verifyToken, checkRole('employee', 'admin'), employeeController.approveReschedule);
router.put('/deliveries/:id/complete', verifyToken, checkRole('employee', 'admin'), employeeController.completeDelivery);

// User Management (Read-only for employees)
const adminController = require('../controllers/adminController');
router.get('/users', verifyToken, checkRole('employee', 'admin'), adminController.getAllUsers);
router.put('/users/:id/status', verifyToken, checkRole('employee', 'admin'), adminController.changeUserStatus);

module.exports = router;
