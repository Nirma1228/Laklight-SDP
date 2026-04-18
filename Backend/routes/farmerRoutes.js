const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { farmerSubmissionValidation, validate } = require('../middleware/validation');

// All farmer routes require farmer authentication
router.post('/submissions', verifyToken, checkRole('farmer'), farmerSubmissionValidation, validate, farmerController.submitProduct);
router.get('/submissions', verifyToken, checkRole('farmer'), farmerController.getMySubmissions);
router.get('/submissions/:id', verifyToken, checkRole('farmer'), farmerController.getSubmissionStatus);
router.put('/submissions/:id', verifyToken, checkRole('farmer'), farmerController.updateSubmission);
router.delete('/submissions/:id', verifyToken, checkRole('farmer'), farmerController.deleteSubmission);

router.get('/deliveries', verifyToken, checkRole('farmer'), farmerController.getDeliveries);
router.put('/deliveries/:id', verifyToken, checkRole('farmer'), farmerController.updateDelivery);

// Bank Details
router.get('/bank-details', verifyToken, checkRole('farmer'), farmerController.getBankDetails);
router.post('/bank-details', verifyToken, checkRole('farmer'), farmerController.saveBankDetails);

module.exports = router;
