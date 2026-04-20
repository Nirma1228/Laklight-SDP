const db = require('../config/database');

async function addRejectedStatus() {
  try {
    console.log('Adding "rejected" status to delivery_statuses...');
    await db.query('INSERT INTO delivery_statuses (status_name) VALUES (?) ON DUPLICATE KEY UPDATE status_name = status_name', ['rejected']);
    console.log('Successfully added "rejected" status.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addRejectedStatus();
