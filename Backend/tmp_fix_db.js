const mysql = require('mysql2/promise');

async function fixDatabase() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'nnb1228',
      database: 'laklight_food_products'
    });

    console.log('Connected to database');

    // Escaping % in LIKE
    const [rows] = await db.query("SELECT product_id, image_url FROM products WHERE image_url LIKE '%\\%%'");
    console.log(`Found ${rows.length} products with literal % in URLs`);

    for (const row of rows) {
      const fixedUrl = row.image_url.replace(/%/g, '_percent_');
      await db.query("UPDATE products SET image_url = ? WHERE product_id = ?", [fixedUrl, row.product_id]);
      console.log(`Updated product ${row.product_id}: ${row.image_url} -> ${fixedUrl}`);
    }

    await db.end();
    console.log('Database fix complete');
  } catch (err) {
    console.error('Error fixing database:', err);
  }
}

fixDatabase();
