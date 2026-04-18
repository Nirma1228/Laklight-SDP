const fetch = require('node-fetch');

async function testForgotPassword() {
    try {
        console.log('🧪 Testing /api/auth/forgot-password endpoint...');

        const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'bandaranethmi2002@gmail.com'
            })
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('❌ Request failed');
        } else {
            console.log('✅ Request successful');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testForgotPassword();
