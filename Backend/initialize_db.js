const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    console.log('🔄 Initializing Laklight Food Products Database...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        const sqlPath = path.join(__dirname, 'database', 'complete_final_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('⏳ Executing schema script...');
        await connection.query(sql);

        console.log('✅ Database and tables created successfully!');
        console.log('🚀 3NF MASTER SCHEMA (v4.5 - UI ALIGNED) READY!');
    } catch (error) {
        console.error('❌ Error during database initialization:');
        console.error(error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

initializeDatabase();
