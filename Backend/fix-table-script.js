const db = require('./config/database');

async function fixTable() {
    try {
        const [cols] = await db.query('DESCRIBE farmer_submissions');
        const colNames = cols.map(c => c.Field.toLowerCase());

        const queries = [];

        if (colNames.includes('id') && !colNames.includes('submission_id')) {
            queries.push('ALTER TABLE farmer_submissions CHANGE id submission_id INT AUTO_INCREMENT');
        }

        if (!colNames.includes('variety')) {
            queries.push('ALTER TABLE farmer_submissions ADD COLUMN variety VARCHAR(100) AFTER product_name');
        }

        if (!colNames.includes('transport_method_id')) {
            queries.push('ALTER TABLE farmer_submissions ADD COLUMN transport_method_id INT AFTER harvest_date');
        }

        if (!colNames.includes('delivery_date')) {
            queries.push('ALTER TABLE farmer_submissions ADD COLUMN delivery_date DATE AFTER transport_method_id');
        }

        if (!colNames.includes('proposed_date_2')) {
            queries.push('ALTER TABLE farmer_submissions ADD COLUMN proposed_date_2 DATE AFTER delivery_date');
        }

        if (!colNames.includes('proposed_date_3')) {
            queries.push('ALTER TABLE farmer_submissions ADD COLUMN proposed_date_3 DATE AFTER proposed_date_2');
        }

        if (!colNames.includes('storage_instructions')) {
            queries.push('ALTER TABLE farmer_submissions ADD COLUMN storage_instructions TEXT AFTER proposed_date_3');
        }

        if (!colNames.includes('images')) {
            queries.push('ALTER TABLE farmer_submissions ADD COLUMN images JSON AFTER storage_instructions');
        }

        if (!colNames.includes('notes')) {
            queries.push('ALTER TABLE farmer_submissions ADD COLUMN notes TEXT AFTER images');
        }

        for (const q of queries) {
            console.log(`Executing: ${q}`);
            await db.query(q);
        }

        console.log('✅ Table fixed successfully');
        const [finalCols] = await db.query('DESCRIBE farmer_submissions');
        console.table(finalCols.map(c => ({ Field: c.Field, Type: c.Type })));
        
        process.exit(0);
    } catch (e) {
        console.error('❌ Fix failed:', e);
        process.exit(1);
    }
}

fixTable();