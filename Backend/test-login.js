require('dotenv').config();
const fetch = require('node-fetch');

(async () => {
  try {
    console.log('Testing login API...\n');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'nirmanethminigmail@gmail.com',
        password: 'customer123'
      })
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('User type:', data.user.userType);
    } else {
      console.log('\n❌ Login failed:', data.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
