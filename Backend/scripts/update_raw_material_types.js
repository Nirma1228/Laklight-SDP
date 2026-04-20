const db = require('../config/database');

async function updateRawMaterialTypes() {
  const types = [
    'Fruits',
    'Vegetables',
    'Dairy',
    'Other Resources'
  ];

  try {
    console.log('Updating raw_material_types table...');
    
    for (const type of types) {
      await db.query(
        'INSERT INTO raw_material_types (material_name) VALUES (?) ON DUPLICATE KEY UPDATE material_name = ?',
        [type, type]
      );
      console.log(`Added/Updated: ${type}`);
    }

    console.log('Successfully updated raw_material_types.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating raw_material_types:', error);
    process.exit(1);
  }
}

updateRawMaterialTypes();
