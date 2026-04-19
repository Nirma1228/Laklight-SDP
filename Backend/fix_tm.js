const mysql = require('mysql2/promise');
async function run() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'nnb1228',
      database: 'laklight_food_products'
    });
    console.log('Fixing transport_methods...');
    const [tables] = await conn.query("SHOW TABLES LIKE 'transport_methods'");
    if (tables.length === 0) {
      await conn.query("CREATE TABLE transport_methods (id INT PRIMARY KEY, method_name VARCHAR(50))");
      await conn.query("INSERT INTO transport_methods (id, method_name) VALUES (1, 'Farmer Delivery'), (2, 'Company Pickup'), (3, 'Other')");
      console.log('TRANSPORT_METHODS_CREATED');
    }
    console.log('DONE');
  } catch(e) {
    console.error('ERR:', e.message);
  } finally {
    if(conn) await conn.end();
  }
}
run();