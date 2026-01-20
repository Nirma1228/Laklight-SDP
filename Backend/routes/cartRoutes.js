const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All cart routes require customer authentication
router.get('/', verifyToken, checkRole('customer'), cartController.getCart);
router.post('/add', verifyToken, checkRole('customer'), cartController.addToCart);
router.put('/update/:itemId', verifyToken, checkRole('customer'), cartController.updateCartItem);
router.delete('/remove/:itemId', verifyToken, checkRole('customer'), cartController.removeFromCart);
router.delete('/clear', verifyToken, checkRole('customer'), cartController.clearCart);
router.get('/count', verifyToken, checkRole('customer'), cartController.getCartCount);

module.exports = router;
