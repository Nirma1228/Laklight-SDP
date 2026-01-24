const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createEmployeeAccount() {
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'laklight_food_products'
    });

    console.log('✅ Connected to database');

    // Employee details
    const employeeData = {
      fullName: 'Employee User',
      email: 'employee@laklight.com',
      phone: '+94712345678',
      password: 'employee123',
      address: 'Laklight Office, Colombo'
    };

    // Check if employee already exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [employeeData.email]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Employee account already exists!');
      console.log('📧 Email:', employeeData.email);
      console.log('🔑 Password: employee123');
      await connection.end();
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(employeeData.password, 10);

    // Insert employee user
    const [result] = await connection.query(
      'INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        employeeData.fullName,
        employeeData.email,
        employeeData.phone,
        passwordHash,
        'employee',
        employeeData.address,
        'active'
      ]
    );

    console.log('✅ Employee account created successfully!');
    console.log('='.repeat(50));
    console.log('📧 Email:', employeeData.email);
    console.log('🔑 Password:', employeeData.password);
    console.log('👤 User Type: Employee');
    console.log('📍 Address:', employeeData.address);
    console.log('='.repeat(50));
    console.log('🔗 You can now login at: http://localhost:3000/login');

    await connection.end();
  } catch (error) {
    console.error('❌ Error creating employee account:', error.message);
  }
}

createEmployeeAccount();
