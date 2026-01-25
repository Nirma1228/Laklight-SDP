const db = require('../config/database');
require('dotenv').config({ path: '../.env' });

async function updateEnums() {
    try {
        console.log('Updating database ENUMs...');

        // 1. Update category ENUM in farmer_submissions
        try {
            await db.query(`ALTER TABLE farmer_submissions MODIFY COLUMN category ENUM('fruits', 'vegetables', 'dairy', 'grains', 'beverages', 'desserts', 'other') NOT NULL`);
            console.log("✅ Updated 'category' ENUM in farmer_submissions.");
        } catch (error) {
            console.log("⚠️ Error updating category:", error.message);
        }

        // 2. Update unit ENUM in farmer_submissions
        try {
            await db.query(`ALTER TABLE farmer_submissions MODIFY COLUMN unit ENUM('kg', 'g', 'units', 'L', 'bottle', 'pack', 'piece') NOT NULL`);
            console.log("✅ Updated 'unit' ENUM in farmer_submissions.");
        } catch (error) {
            console.log("⚠️ Error updating unit:", error.message);
        }

        console.log('Enum updates complete.');
        process.exit(0);
    } catch (error) {
        console.error('Script error:', error);
        process.exit(1);
    }
}

updateEnums();
