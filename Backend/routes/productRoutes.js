const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, checkRole, optionalAuth } = require('../middleware/auth');
const { productValidation, validate } = require('../middleware/validation');
const multer = require('../config/multer');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/filter', productController.filterProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

// Admin only routes
router.post('/upload', verifyToken, checkRole('admin'), multer.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ 
    success: true, 
    url: `/uploads/${req.file.filename}` 
  });
});

router.post('/', verifyToken, checkRole('admin'), productValidation, validate, productController.addProduct);
router.put('/:id', verifyToken, checkRole('admin'), productValidation, validate, productController.updateProduct);
router.delete('/:id', verifyToken, checkRole('admin'), productController.deleteProduct);
router.patch('/:id/stock', verifyToken, checkRole('admin', 'employee'), productController.updateStock);

module.exports = router;
