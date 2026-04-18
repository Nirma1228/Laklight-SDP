const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
    let connection;
    try {
        console.log('🚀 Starting database setup...');

        // Create connection without selecting a database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('✅ Connected to MySQL server');

        const schemaPath = path.join(__dirname, '../database/complete_final_schema.sql');
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at: ${schemaPath}`);
        }

        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('⏳ Executing schema script...');
        await connection.query(sql);

        console.log('✅ Database schema applied successfully!');
        console.log('🎉 Your database is now up to date with unique primary keys.');

    } catch (error) {
        console.error('❌ Error during database setup:');
        console.error(error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

setupDatabase();
