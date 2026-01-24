require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

(async () => {
  try {
    const email = 'farmer@laklight.com';
    const testPassword = 'farmer123';
    
    console.log('Testing farmer login...');
    console.log('Email:', email);
    
    // Find user
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? AND user_type = ?',
      [email, 'farmer']
    );
    
    if (users.length === 0) {
      console.log('❌ No farmer found with this email');
      
      // Try to show what password hash exists
      const [anyUser] = await db.query('SELECT email, password_hash FROM users WHERE email = ?', [email]);
      if (anyUser.length > 0) {
        console.log('User exists but with different user_type');
      }
    } else {
      const user = users[0];
      console.log('✅ Farmer found:', user.full_name);
      console.log('Status:', user.status);
      
      // Try common passwords
      const passwords = ['farmer123', 'Farmer123', 'password', '123456', 'laklight'];
      
      for (const pwd of passwords) {
        const isValid = await bcrypt.compare(pwd, user.password_hash);
        if (isValid) {
          console.log(`✅ Password is: "${pwd}"`);
          break;
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
