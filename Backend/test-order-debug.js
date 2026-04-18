const axios = require('axios');

async function testOrder() {
  try {
    // 1. Login to get token
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@laklight.com',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('Logged in successfully.');

    // 2. Place order
    console.log('Placing order...');
    const orderRes = await axios.post('http://localhost:5001/api/orders/place', {
      items: [{ productId: 1, quantity: 13 }],
      deliveryAddress: 'Test Address, Test City, 12345',
      paymentMethod: 'Card Payment'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Order status:', orderRes.status);
    console.log('Order response:', orderRes.data);
  } catch (err) {
    if (err.response) {
      console.error('SERVER ERROR:', err.response.status, err.response.data);
    } else {
      console.error('ERROR:', err.message);
    }
  }
}

testOrder();
