const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'laklight_super_secret_key_2026_sdp_project';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
exports.generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Decode token without verification
exports.decodeToken = (token) => {
  return jwt.decode(token);
};
