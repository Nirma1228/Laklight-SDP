const db = require('./config/database');

async function checkSchema() {
    try {
        const [columns] = await db.query('DESCRIBE farmer_submissions');
        console.log('=== farmer_submissions Table Structure ===\n');
        columns.forEach(col => {
            console.log(`${col.Field.padEnd(25)} | ${col.Type.padEnd(30)} | ${col.Null} | ${col.Key} | ${col.Default || 'NULL'}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkSchema();
