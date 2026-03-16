const mysql = require('mysql2/promise');

async function fixCart() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'nnb1228',
      database: 'laklight_food_products'
    });

    console.log('Connected to database');

    // Cart items don't have image_url, they join with products.
    // Wait, let's check the schema.
    const [columns] = await db.query("SHOW COLUMNS FROM cart");
    console.log('Cart columns:', columns.map(c => c.Field));

    // If cart has its own image_url (unlikely), fix it.
    // Usually it's in the products table.

    // Let's also check the 'orders' and 'order_items' table just in case.
    const [productCheck] = await db.query("SELECT product_id, image_url FROM products WHERE image_url LIKE '%%%'");
    console.log(`Found ${productCheck.length} remaining malformed product URLs`);

    await db.end();
  } catch (err) {
    console.error('Error fixing database:', err);
  }
}

fixCart();
