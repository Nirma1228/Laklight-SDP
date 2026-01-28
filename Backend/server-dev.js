// Temporary Development Server (Without Database)
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'laklight_super_secret_key_2026_sdp_project';

// Middleware
app.use(cors());
app.use(express.json());

// Mock users (pre-hashed passwords)
const mockUsers = [
  {
    id: 1,
    full_name: 'System Administrator',
    email: 'admin@laklight.com',
    password: 'admin123', // Plain for demo
    user_type: 'administrator',
    phone: '+94 77 123 4567',
    address: 'Colombo',
    status: 'active'
  },
  {
    id: 2,
    full_name: 'John Employee',
    email: 'employee@laklight.com',
    password: 'employee123',
    user_type: 'employee',
    phone: '+94 77 234 5678',
    address: 'Colombo',
    status: 'active'
  },
  {
    id: 3,
    full_name: 'Green Valley Farm',
    email: 'farmer@laklight.com',
    password: 'farmer123',
    user_type: 'farmer',
    phone: '+94 77 345 6789',
    address: 'Nuwara Eliya',
    status: 'active'
  },
  {
    id: 4,
    full_name: 'Sarah Customer',
    email: 'customer@laklight.com',
    password: 'customer123',
    user_type: 'customer',
    phone: '+94 77 456 7890',
    address: 'Colombo',
    status: 'active'
  }
];

// Mock dashboard data
const mockDashboard = {
  users: {
    total_users: 567,
    customers: 450,
    farmers: 87,
    employees: 30,
    active_users: 534
  },
  orders: {
    total_orders: 1234,
    pending_orders: 23,
    delivered_orders: 1156,
    total_revenue: 1250000,
    avg_order_value: 3500
  },
  products: {
    total_products: 156,
    total_stock: 8500,
    low_stock_products: 12,
    out_of_stock_products: 3
  },
  recentOrders: [
    {
      id: 1,
      customer_name: 'John Doe',
      total_amount: 5400,
      payment_status: 'Paid',
      order_status: 'Processing',
      order_date: new Date()
    },
    {
      id: 2,
      customer_name: 'Jane Smith',
      total_amount: 3200,
      payment_status: 'Paid',
      order_status: 'Delivered',
      order_date: new Date()
    }
  ]
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const user = mockUsers.find(u =>
      u.email === email &&
      u.user_type === userType &&
      u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        message: `Account is ${user.status}. Please contact administrator.`
      });
    }

    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        userType: user.user_type,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin dashboard endpoint
app.get('/api/admin/analytics/dashboard', verifyToken, (req, res) => {
  if (req.user.userType !== 'administrator') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({
    success: true,
    dashboard: mockDashboard
  });
});

// Employee applications endpoint
app.get('/api/employee/applications', verifyToken, (req, res) => {
  if (req.user.userType !== 'employee' && req.user.userType !== 'administrator') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({
    success: true,
    applications: []
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Development server running (No database)' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Laklight DEVELOPMENT Server (No Database)');
  console.log('='.repeat(60));
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`✅ API Base URL: http://localhost:${PORT}/api`);
  console.log('\n📋 TEST CREDENTIALS:');
  console.log('   Admin: admin@laklight.com / admin123');
  console.log('   Employee: employee@laklight.com / employee123');
  console.log('   Farmer: farmer@laklight.com / farmer123');
  console.log('   Customer: customer@laklight.com / customer123');
  console.log('='.repeat(60) + '\n');
});
