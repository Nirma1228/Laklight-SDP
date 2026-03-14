const db = require('./config/database');

async function checkAllSchemas() {
    const tables = ['users', 'orders', 'products', 'order_items', 'payments', 'suppliers', 'feedback'];
    try {
        for (const table of tables) {
            const [columns] = await db.query(`SHOW COLUMNS FROM ${table}`);
            console.log(`Table: ${table}`);
            columns.forEach(col => {
                console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? 'DEF: ' + col.Default : ''}`);
            });
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkAllSchemas();
