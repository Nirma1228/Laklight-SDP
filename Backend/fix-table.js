const db = require('./config/database');

async function fixTable() {
    try {
        console.log('🔧 Fixing farmer_submissions table...');

        // Helper to add column if missing
        const addCol = async (colName, def) => {
            const [cols] = await db.query(`SHOW COLUMNS FROM farmer_submissions LIKE '${colName}'`);
            if (cols.length === 0) {
                console.log(`➕ Adding ${colName}...`);
                await db.query(`ALTER TABLE farmer_submissions ADD COLUMN ${colName} ${def}`);
                console.log(`✅ ${colName} added.`);
            } else {
                console.log(`ℹ️ ${colName} exists.`);
            }
        };

        await addCol('images', "TEXT COMMENT 'JSON array of image URLs'");
        await addCol('notes', "TEXT");
        await addCol('transport', "VARCHAR(100)"); // Using varchar to be safe
        await addCol('delivery_date', "DATE");
        await addCol('storage_instructions', "TEXT");

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
}

fixTable();
