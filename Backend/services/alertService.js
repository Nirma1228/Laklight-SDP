const db = require('../config/database');

// FR12: Automated alerts for low stock levels
exports.checkLowStock = async () => {
  try {
    console.log('Checking for low stock levels (3NF)...');

    const [lowProducts] = await db.query(
      `SELECT id, name, stock_quantity FROM products 
       WHERE stock_quantity < 50 OR is_available = FALSE`
    );

    const [lowRaw] = await db.query(
      `SELECT ir.*, rt.material_name FROM inventory_raw ir
       JOIN raw_material_types rt ON ir.material_type_id = rt.id
       WHERE ir.quantity_kg < 50`
    );

    const [lowFinished] = await db.query(
      `SELECT ifin.*, p.name FROM inventory_finished ifin
       JOIN products p ON ifin.product_id = p.id
       WHERE ifin.quantity_units < 50`
    );

    if (lowProducts.length > 0 || lowRaw.length > 0 || lowFinished.length > 0) {
      console.log(`⚠️ Low Stock Alerts: ${lowProducts.length} Products, ${lowRaw.length} Raw, ${lowFinished.length} Finished`);
    }

    return { products: lowProducts, raw: lowRaw, finished: lowFinished };
  } catch (error) {
    console.error('Low stock check failed:', error);
    return { products: [], raw: [], finished: [] };
  }
};

exports.checkExpiringProducts = async () => {
  try {
    console.log('Checking for expiring batches...');

    const [expiringRaw] = await db.query(
      `SELECT ir.*, rt.material_name FROM inventory_raw ir
       JOIN raw_material_types rt ON ir.material_type_id = rt.id
       WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    );

    const [expiringFinished] = await db.query(
      `SELECT ifin.*, p.name FROM inventory_finished ifin
       JOIN products p ON ifin.product_id = p.id
       WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    );

    return { raw: expiringRaw, finished: expiringFinished };
  } catch (error) {
    console.error('Expiry check failed:', error);
    return { raw: [], finished: [] };
  }
};

exports.getCurrentAlerts = async () => {
  const low = await exports.checkLowStock();
  const exp = await exports.checkExpiringProducts();
  return { ...low, ...exp, total: low.products.length + low.raw.length + low.finished.length + exp.raw.length + exp.finished.length };
};
