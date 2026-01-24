require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

(async () => {
  try {
    // Check for existing farmer users
    const [users] = await db.query('SELECT id, email, full_name, user_type, status FROM users WHERE user_type = "farmer"');
    console.log('Farmer users found:', users.length);
    
    if (users.length === 0) {
      console.log('\nNo farmer users found. Creating test farmer account...');
      
      // Create a test farmer account
      const passwordHash = await bcrypt.hash('farmer123', 10);
      
      const [result] = await db.query(
        'INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Test Farmer', 'farmer@test.com', '1234567890', passwordHash, 'farmer', '123 Farm Road', 'active']
      );
      
      console.log('✅ Test farmer account created!');
      console.log('Email: farmer@test.com');
      console.log('Password: farmer123');
    } else {
      console.log('\nExisting farmer users:');
      users.forEach(user => {
        console.log(`- ${user.full_name} (${user.email}) - Status: ${user.status}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
