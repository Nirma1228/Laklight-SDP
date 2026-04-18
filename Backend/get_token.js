const db = require('./config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

async function getToken() {
  const [rows] = await db.query('SELECT user_id, email, password_hash, role_id FROM users WHERE email = "admin@laklight.com"');
  if (rows.length === 0) {
    console.log('Admin not found');
    process.exit(1);
  }
  const user = rows[0];
  const token = jwt.sign(
    { userId: user.user_id, userType: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  console.log(token);
  process.exit(0);
}

getToken();
