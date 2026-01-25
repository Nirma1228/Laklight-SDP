const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
exports.registerValidation = [
  body('fullName').notEmpty().trim().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['customer', 'farmer', 'employee', 'admin']).withMessage('Invalid user type')
];

// Login validation
exports.loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Product validation
exports.productValidation = [
  body('name').notEmpty().trim().withMessage('Product name is required'),
  body('category').isIn(['beverages', 'desserts', 'vegetables', 'fruits', 'other']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('unit').isIn(['kg', 'g', 'bottle', 'pack', 'units', 'piece']).withMessage('Invalid unit'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

// Order validation
exports.orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  body('paymentMethod').isIn(['Card Payment', 'Online Banking', 'Cash on Delivery']).withMessage('Invalid payment method')
];

// Farmer submission validation
exports.farmerSubmissionValidation = [
  body('productName').notEmpty().trim().withMessage('Product name is required'),
  body('category').isIn(['fruits', 'vegetables', 'dairy', 'grains', 'beverages', 'desserts', 'other']).withMessage('Invalid category'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be positive'),
  body('unit').isIn(['kg', 'g', 'units', 'L', 'bottle', 'pack', 'piece']).withMessage('Invalid unit'),
  body('harvestDate').isISO8601().withMessage('Valid harvest date is required')
];

// Feedback validation
exports.feedbackValidation = [
  body('productQuality').isInt({ min: 1, max: 5 }).withMessage('Product quality rating must be 1-5'),
  body('packaging').isInt({ min: 1, max: 5 }).withMessage('Packaging rating must be 1-5'),
  body('deliveryTime').isInt({ min: 1, max: 5 }).withMessage('Delivery time rating must be 1-5'),
  body('customerService').isInt({ min: 1, max: 5 }).withMessage('Customer service rating must be 1-5'),
  body('valueForMoney').isInt({ min: 1, max: 5 }).withMessage('Value for money rating must be 1-5')
];
