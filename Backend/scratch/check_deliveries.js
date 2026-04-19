const db = require('../config/database');

async function checkDB() {
  try {
    const [rows] = await db.query(
      "SELECT d.delivery_id, d.scheduled_date, d.proposed_reschedule_date, ds.status_name, fs.product_name " +
      "FROM deliveries d " +
      "JOIN delivery_statuses ds ON d.status_id = ds.delivery_status_id " +
      "JOIN farmer_submissions fs ON fs.submission_id = d.submission_id " +
      "WHERE product_name LIKE '%Tomato%'"
    );
    console.log('Tomatoes Deliveries:', rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDB();
