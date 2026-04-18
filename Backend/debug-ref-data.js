const db = require('./config/database');

async function debugRefData() {
    try {
        console.log('🔍 Checking Reference Data Tables...');

        const [categories] = await db.query('SELECT * FROM product_categories');
        console.log('\n📂 Valid Categories:', JSON.stringify(categories, null, 2));

        const [units] = await db.query('SELECT * FROM measurement_units');
        console.log('\n⚖️ Valid Units:', JSON.stringify(units, null, 2));

        const [statuses] = await db.query('SELECT * FROM submission_statuses');
        console.log('\n📊 Valid Statuses:', JSON.stringify(statuses, null, 2));

        // Also check transport methods just in case
        try {
            const [transports] = await db.query('SELECT * FROM transport_methods');
            console.log('\n🚛 Valid Transport Methods:', JSON.stringify(transports, null, 2));
        } catch (e) { console.log('Checking transport_methods table failed (might not exist yet)'); }

        // Check quality grades if used
        try {
            const [grades] = await db.query('SELECT * FROM quality_grades');
            console.log('\n⭐ Valid Grades:', JSON.stringify(grades, null, 2));
        } catch (e) { console.log('Checking quality_grades table failed'); }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking ref data:', error);
        process.exit(1);
    }
}

debugRefData();
