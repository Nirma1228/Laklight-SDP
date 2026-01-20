const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, checkRole, optionalAuth } = require('../middleware/auth');
const { productValidation, validate } = require('../middleware/validation');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/filter', productController.filterProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

// Admin only routes
router.post('/', verifyToken, checkRole('administrator'), productValidation, validate, productController.addProduct);
router.put('/:id', verifyToken, checkRole('administrator'), productValidation, validate, productController.updateProduct);
router.delete('/:id', verifyToken, checkRole('administrator'), productController.deleteProduct);
router.patch('/:id/stock', verifyToken, checkRole('administrator', 'employee'), productController.updateStock);

module.exports = router;
