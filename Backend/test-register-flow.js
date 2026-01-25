const authController = require('./controllers/authController');
require('dotenv').config();

// Mock Request
const req = {
    body: {
        fullName: 'Test User Flow',
        email: `flow_test_${Date.now()}@example.com`,
        phone: '0779998888',
        password: 'password123',
        userType: 'customer',
        address: '123 Flow St'
    }
};

// Mock Response
const res = {
    statusCode: 200,
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log(`\n✅ Response [${this.statusCode}]:`);
        console.log(JSON.stringify(data, null, 2));
    }
};

// Mock DB (Dependency injection not possible easily, so we rely on real DB connection used by controller)
// The controller requires ../config/database, which uses .env, so it should work.

async function runTest() {
    console.log('🚀 Starting Registration Flow Test...');
    try {
        await authController.register(req, res);
    } catch (error) {
        console.error('❌ Uncaught Error in Controller:', error);
    }
}

runTest();
