const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'laklight_food_products'
};

async function testInsert() {
    console.log('🧪 Testing DB Insert into otp_verifications...');

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected.');

        const testData = [
            'test_debug@example.com',
            '123456',
            'Debug User',
            '0771234567',
            'hashed_password',
            'customer', // User Type
            '123 Test St',
            new Date(Date.now() + 600000) // Expires At
        ];

        console.log('📝 INSERT Params:', testData);

        const [result] = await connection.query(
            'INSERT INTO otp_verifications (email, otp, full_name, phone, password_hash, user_type, address, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            testData
        );

        console.log('✅ Insert Successful! ID:', result.insertId);

        // Clean up
        await connection.query('DELETE FROM otp_verifications WHERE email = ?', ['test_debug@example.com']);
        console.log('🧹 Cleanup complete.');
        await connection.end();

    } catch (error) {
        console.error('❌ Insert Test Failed:', error.message);
        console.error('   Code:', error.code);
        console.error('   SQL Message:', error.sqlMessage);
    }
}

testInsert();
