require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function verifyEmployeeLogin() {
  try {
    console.log('🔍 Checking employee account...\n');

    // Check if employee exists
    const [users] = await db.query(
      'SELECT id, full_name, email, user_type, status, password_hash FROM users WHERE email = ?',
      ['employee@laklight.com']
    );

    if (users.length === 0) {
      console.log('❌ EMPLOYEE ACCOUNT NOT FOUND');
      console.log('You need to create the employee account first.');
      console.log('\nRun this SQL in phpMyAdmin:');
      console.log('='.repeat(60));
      console.log(`INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) 
VALUES ('Employee User', 'employee@laklight.com', '+94712345678', '$2a$10$xK7QqVZ8Qg.qFZxCCJK9/.wqmU5OwXZHLwFvvJ0VX4uXEjH8qmNh2', 'employee', 'Laklight Office, Colombo', 'active');`);
      console.log('='.repeat(60));
      process.exit(0);
    }

    const user = users[0];
    console.log('✅ EMPLOYEE ACCOUNT FOUND');
    console.log('ID:', user.id);
    console.log('Name:', user.full_name);
    console.log('Email:', user.email);
    console.log('Type:', user.user_type);
    console.log('Status:', user.status);
    console.log('Password Hash:', user.password_hash.substring(0, 20) + '...');

    // Check account status
    if (user.status !== 'active') {
      console.log('\n❌ ACCOUNT STATUS ISSUE');
      console.log(`Account status is: ${user.status}`);
      console.log('Account must be "active" to login');
      process.exit(0);
    }

    // Test password
    console.log('\n🔐 Testing password "employee123"...');
    const isPasswordValid = await bcrypt.compare('employee123', user.password_hash);

    if (isPasswordValid) {
      console.log('✅ PASSWORD IS CORRECT');
      console.log('\n✨ Login should work with:');
      console.log('Email: employee@laklight.com');
      console.log('Password: employee123');
    } else {
      console.log('❌ PASSWORD DOES NOT MATCH');
      console.log('\nThe password hash in database does not match "employee123"');
      console.log('You may need to update the password. Run this SQL:');
      console.log('='.repeat(60));
      console.log(`UPDATE users SET password_hash = '$2a$10$xK7QqVZ8Qg.qFZxCCJK9/.wqmU5OwXZHLwFvvJ0VX4uXEjH8qmNh2' WHERE email = 'employee@laklight.com';`);
      console.log('='.repeat(60));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyEmployeeLogin();
