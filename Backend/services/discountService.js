// FR05: Wholesale Discount Service
// Applies 10% discount for orders of 12 or more of the same item

const WHOLESALE_THRESHOLD = parseInt(process.env.WHOLESALE_THRESHOLD) || 12;
const WHOLESALE_DISCOUNT = parseFloat(process.env.WHOLESALE_DISCOUNT) || 0.10;

// Calculate wholesale discount percentage
exports.calculateWholesaleDiscount = (quantity) => {
  if (quantity >= WHOLESALE_THRESHOLD) {
    return WHOLESALE_DISCOUNT; // 10% discount
  }
  return 0; // No discount
};

// Apply discount to price
exports.applyDiscountToPrice = (price, quantity) => {
  const discount = exports.calculateWholesaleDiscount(quantity);
  return price * (1 - discount);
};

// Calculate discount amount
exports.getDiscountAmount = (price, quantity) => {
  const discount = exports.calculateWholesaleDiscount(quantity);
  return price * quantity * discount;
};

// Check if item qualifies for wholesale discount
exports.qualifiesForDiscount = (quantity) => {
  return quantity >= WHOLESALE_THRESHOLD;
};

// Get discount information
exports.getDiscountInfo = () => {
  return {
    threshold: WHOLESALE_THRESHOLD,
    discountPercentage: WHOLESALE_DISCOUNT * 100,
    message: `Get ${WHOLESALE_DISCOUNT * 100}% off when you order ${WHOLESALE_THRESHOLD} or more of the same item`
  };
};
