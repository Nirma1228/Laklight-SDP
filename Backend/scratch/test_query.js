const db = require('../config/database');

async function testQuery() {
  const userId = 11;
  try {
    const [deliveries] = await db.query(`
      SELECT d.*, d.delivery_id as id, ds.status_name as status, fs.product_name, tm.method_name as transport,
             d.proposed_reschedule_date,
             DATE_FORMAT(d.scheduled_date, '%Y-%m-%d') as scheduleDate,
             DATE_FORMAT(fs.delivery_date, '%Y-%m-%d') as proposedDate,
             fs.quantity, fs.grade as grade_name, fs.custom_price
      FROM deliveries d
      JOIN delivery_statuses ds ON d.status_id = ds.delivery_status_id
      JOIN farmer_submissions fs ON d.submission_id = fs.submission_id
      LEFT JOIN transport_methods tm ON fs.transport_method_id = tm.transport_method_id
      WHERE fs.farmer_id = ?`, [userId]);

    console.log('--- Test Query Results ---');
    console.table(deliveries);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testQuery();
