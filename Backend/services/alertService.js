const db = require('../config/database');

// FR12: Automated alerts for low stock levels
exports.checkLowStock = async () => {
  try {
    console.log('Checking for low stock levels...');

    // Check products
    const [lowStockProducts] = await db.query(
      `SELECT * FROM products 
       WHERE stock < 50 OR availability = 'low-stock'
       ORDER BY stock ASC`
    );

    // Check inventory
    const [lowStockInventory] = await db.query(
      `SELECT * FROM inventory 
       WHERE status IN ('low', 'critical')
       ORDER BY stock ASC`
    );

    if (lowStockProducts.length > 0 || lowStockInventory.length > 0) {
      console.log(`⚠️ Low Stock Alert:`);
      console.log(`   - ${lowStockProducts.length} products with low stock`);
      console.log(`   - ${lowStockInventory.length} inventory items with low stock`);
      
      // In production, send email/push notifications to employees and admin
      await exports.sendLowStockNotification(lowStockProducts, lowStockInventory);
    } else {
      console.log('✅ All stock levels are adequate');
    }

    return { 
      products: lowStockProducts, 
      inventory: lowStockInventory 
    };
  } catch (error) {
    console.error('Error checking low stock:', error);
    return { products: [], inventory: [] };
  }
};

// FR12: Check for products approaching expiry dates
exports.checkExpiringProducts = async () => {
  try {
    console.log('Checking for expiring products...');

    const [expiringProducts] = await db.query(
      `SELECT * FROM inventory 
       WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       AND expiry_date >= CURDATE()
       ORDER BY expiry_date ASC`
    );

    if (expiringProducts.length > 0) {
      console.log(`⚠️ Expiry Alert: ${expiringProducts.length} products expiring within 7 days`);
      
      // In production, send email/push notifications
      await exports.sendExpiryNotification(expiringProducts);
    } else {
      console.log('✅ No products expiring soon');
    }

    return expiringProducts;
  } catch (error) {
    console.error('Error checking expiring products:', error);
    return [];
  }
};

// Send low stock notification (placeholder for email service)
exports.sendLowStockNotification = async (products, inventory) => {
  // TODO: Implement email/SMS notification service
  console.log('📧 Sending low stock notifications to employees and admin...');
  
  // Example notification data
  const notification = {
    type: 'LOW_STOCK_ALERT',
    timestamp: new Date().toISOString(),
    data: {
      productsCount: products.length,
      inventoryCount: inventory.length,
      criticalItems: [...products, ...inventory].filter(item => 
        item.stock < 20 || item.status === 'critical'
      )
    }
  };

  console.log('Notification data:', JSON.stringify(notification, null, 2));
  return notification;
};

// Send expiry notification
exports.sendExpiryNotification = async (products) => {
  // TODO: Implement email/SMS notification service
  console.log('📧 Sending expiry notifications to employees and admin...');
  
  const notification = {
    type: 'EXPIRY_ALERT',
    timestamp: new Date().toISOString(),
    data: {
      expiringCount: products.length,
      urgentItems: products.filter(item => {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 3;
      })
    }
  };

  console.log('Notification data:', JSON.stringify(notification, null, 2));
  return notification;
};

// Get all current alerts
exports.getCurrentAlerts = async () => {
  try {
    const lowStock = await exports.checkLowStock();
    const expiring = await exports.checkExpiringProducts();

    return {
      lowStockProducts: lowStock.products,
      lowStockInventory: lowStock.inventory,
      expiringProducts: expiring,
      totalAlerts: lowStock.products.length + lowStock.inventory.length + expiring.length
    };
  } catch (error) {
    console.error('Error getting current alerts:', error);
    return {
      lowStockProducts: [],
      lowStockInventory: [],
      expiringProducts: [],
      totalAlerts: 0
    };
  }
};
