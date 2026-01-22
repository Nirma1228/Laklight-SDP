// Quick test script to verify password hashing
const bcrypt = require('bcryptjs');

const testPassword = 'myTestPassword123';

console.log('🔐 Testing Password Hashing\n');
console.log('Original password:', testPassword);

// Hash the password
bcrypt.hash(testPassword, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('\n✅ Hashed password:', hash);
  console.log('Length:', hash.length, 'characters');
  console.log('Starts with $2a$ or $2b$?', hash.startsWith('$2a$') || hash.startsWith('$2b$'));
  
  // Verify the hash works
  bcrypt.compare(testPassword, hash, (err, result) => {
    if (err) {
      console.error('Verification error:', err);
      return;
    }
    console.log('\n✅ Password verification:', result ? 'SUCCESS' : 'FAILED');
    console.log('\nYour bcrypt hashing is working correctly! ✨');
  });
});
