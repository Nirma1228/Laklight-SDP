const db = require('../config/database');

async function dump() {
  try {
    const [submissions] = await db.query('SELECT * FROM farmer_submissions');
    console.log('--- farmer_submissions ---');
    console.table(submissions.map(s => ({
      id: s.submission_id,
      product: s.product_name,
      status_id: s.status_id,
      farmer_id: s.farmer_id
    })));

    const [deliveries] = await db.query('SELECT * FROM deliveries');
    console.log('--- deliveries ---');
    console.table(deliveries);

    const [statuses] = await db.query('SELECT * FROM delivery_statuses');
    console.log('--- delivery_statuses ---');
    console.table(statuses);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dump();
