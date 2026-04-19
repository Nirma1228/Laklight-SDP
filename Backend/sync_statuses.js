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
    console.log('Syncing statuses...');
    // 1. Set all to unique temporary names first to avoid duplicate key errors
    await conn.query('UPDATE delivery_statuses SET status_name = CONCAT("temp_", id)');
    // 2. Map IDs to fixed labels
    const map = { 1: "pending", 2: "confirmed", 3: "scheduled delivery", 4: "completed", 5: "cancelled" };
    for (const [id, name] of Object.entries(map)) {
      await conn.query('UPDATE delivery_statuses SET status_name = ? WHERE id = ?', [name, id]);
    }
    console.log('FINAL_SYNC_DONE');
    const [res] = await conn.query('SELECT d.id, ds.status_name FROM deliveries d JOIN delivery_statuses ds ON d.status_id = ds.id');
    console.log('FINAL_STATE:', JSON.stringify(res));
  } catch(e) {
    console.error('ERR:', e.message);
  } finally {
    if(conn) await conn.end();
  }
}
run();