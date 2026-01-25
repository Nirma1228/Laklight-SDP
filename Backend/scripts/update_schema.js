const db = require('../config/database');
require('dotenv').config({ path: '../.env' }); // Load env from parent dir if running from scripts/

async function updateSchema() {
    try {
        console.log('Checking database schema...');

        // 1. Add images column to farmer_submissions if it doesn't exist
        try {
            await db.query("ALTER TABLE farmer_submissions ADD COLUMN images TEXT");
            console.log("✅ Added 'images' column to farmer_submissions table.");
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ 'images' column already exists in farmer_submissions.");
            } else {
                console.log("⚠️ Error adding images column:", error.message);
            }
        }

        // 2. Add rejection_reason if missing (just in case)
        try {
            await db.query("ALTER TABLE farmer_submissions ADD COLUMN rejection_reason TEXT");
            console.log("✅ Added 'rejection_reason' column to farmer_submissions table.");
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                // Ignore
            }
        }

        console.log('Schema update check complete.');
        process.exit(0);
    } catch (error) {
        console.error('Script error:', error);
        process.exit(1);
    }
}

updateSchema();
