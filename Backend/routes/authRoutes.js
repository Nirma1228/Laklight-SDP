const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/farmer-register', registerValidation, validate, authController.farmerRegister);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', loginValidation, validate, authController.login);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/change-password', verifyToken, authController.changePassword);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
