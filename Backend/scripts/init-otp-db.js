const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'laklight_food_products',
    multipleStatements: true
};

async function initDB() {
    console.log('🔄 Initializing Database...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Database: ${dbConfig.database}`);

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database!');

        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        user_type ENUM('customer', 'farmer', 'employee', 'admin') NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        INDEX idx_email (email),
        INDEX idx_otp (otp),
        INDEX idx_expires (expires_at)
      );
    `;

        await connection.query(createTableSQL);
        console.log('✅ Table otp_verifications verified/created successfully!');

        await connection.end();
        console.log('🏁 Initialization complete.');
    } catch (error) {
        console.error('❌ Database Initialization Failed:', error);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('⚠️ Database does not exist. Please create it manually or check your .env settings.');
        }
    }
}

initDB();
