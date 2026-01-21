const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'laklight_food_products'
};

async function createAdminUser() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    console.log('\n🔄 Creating administrator account...');
    
    await connection.query(`
      INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        user_type = 'administrator',
        status = 'active'
    `, [
      'System Administrator',
      'admin@laklight.com',
      '+94 77 123 4567',
      adminPassword,
      'administrator',
      'Laklight Food Products HQ, Colombo',
      'active'
    ]);
    
    console.log('✅ Administrator account created');

    // Create employee user
    const employeePassword = await bcrypt.hash('employee123', 10);
    console.log('\n🔄 Creating employee account...');
    
    await connection.query(`
      INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        user_type = 'employee',
        status = 'active'
    `, [
      'John Employee',
      'employee@laklight.com',
      '+94 77 234 5678',
      employeePassword,
      'employee',
      'Colombo, Sri Lanka',
      'active'
    ]);
    
    console.log('✅ Employee account created');

    // Create farmer user
    const farmerPassword = await bcrypt.hash('farmer123', 10);
    console.log('\n🔄 Creating farmer account...');
    
    await connection.query(`
      INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        user_type = 'farmer',
        status = 'active'
    `, [
      'Green Valley Farm',
      'farmer@laklight.com',
      '+94 77 345 6789',
      farmerPassword,
      'farmer',
      'Nuwara Eliya, Sri Lanka',
      'active'
    ]);
    
    console.log('✅ Farmer account created');

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    console.log('\n🔄 Creating customer account...');
    
    await connection.query(`
      INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        user_type = 'customer',
        status = 'active'
    `, [
      'Sarah Customer',
      'customer@laklight.com',
      '+94 77 456 7890',
      customerPassword,
      'customer',
      'Colombo, Sri Lanka',
      'active'
    ]);
    
    console.log('✅ Customer account created');

    console.log('\n' + '='.repeat(60));
    console.log('✅ All test users created successfully!');
    console.log('='.repeat(60));
    console.log('\n📋 LOGIN CREDENTIALS:\n');
    console.log('👨‍💼 Administrator:');
    console.log('   Email: admin@laklight.com');
    console.log('   Password: admin123\n');
    console.log('👔 Employee:');
    console.log('   Email: employee@laklight.com');
    console.log('   Password: employee123\n');
    console.log('🌾 Farmer:');
    console.log('   Email: farmer@laklight.com');
    console.log('   Password: farmer123\n');
    console.log('🛒 Customer:');
    console.log('   Email: customer@laklight.com');
    console.log('   Password: customer123\n');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Database connection refused. Please ensure:');
      console.error('   1. MySQL server is running');
      console.error('   2. Database credentials in .env are correct');
      console.error('   3. Database "laklight_food_products" exists');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
createAdminUser();
