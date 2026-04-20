const db = require('../config/database');

async function updateDelivery25() {
  try {
    console.log('Updating delivery ID 25 to "rejected" status...');
    const [result] = await db.query('UPDATE deliveries SET status_id = 5, scheduled_date = NULL, proposed_reschedule_date = NULL WHERE delivery_id = 25');
    console.log(`Successfully updated ${result.affectedRows} row(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateDelivery25();
