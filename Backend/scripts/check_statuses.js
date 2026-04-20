const db = require('../config/database');

async function checkStatuses() {
  try {
    const [rows] = await db.query('SELECT * FROM delivery_statuses');
    console.log('Delivery Statuses:', rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkStatuses();
