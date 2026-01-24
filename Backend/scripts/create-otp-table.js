const mysql = require('mysql2/promise');
const fs = require('fs');

async function createOTPTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'laklight_food_products'
    });

    const sql = fs.readFileSync('./database/otp_table.sql', 'utf8');
    
    await connection.query(sql);
    console.log('✅ OTP table created successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error creating OTP table:', error.message);
    console.log('\n📋 Please run this SQL manually in your MySQL database:');
    console.log(fs.readFileSync('./database/otp_table.sql', 'utf8'));
  }
}

createOTPTable();
