const db = require('../config/database');

(async () => {
  try {
    const [users] = await db.query('SELECT id, email, full_name, user_type, status FROM users WHERE user_type = "farmer"');
    console.log('Farmer users found:', users.length);
    console.log(users);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
