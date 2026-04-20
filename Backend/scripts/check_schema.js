const db = require('../config/database');

async function checkSchema() {
  try {
    const [columns] = await db.query('SHOW COLUMNS FROM raw_material_types');
    console.log('Columns in raw_material_types:', columns.map(c => c.Field));
    process.exit(0);
  } catch (error) {
    console.error('Error checking schema:', error);
    process.exit(1);
  }
}

checkSchema();
