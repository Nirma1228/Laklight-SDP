const db = require('../config/database');

async function updateDelivery() {
  try {
    const [result] = await db.query(
      "UPDATE deliveries SET scheduled_date = '2026-04-20' WHERE DATE(scheduled_date) = '2026-04-22' AND submission_id IN (SELECT submission_id FROM farmer_submissions WHERE product_name LIKE '%Tomato%')"
    );
    console.log(`Updated ${result.affectedRows} rows.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateDelivery();
