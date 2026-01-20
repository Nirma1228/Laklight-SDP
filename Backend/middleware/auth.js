const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'laklight_super_secret_key_2026_sdp_project';

// Verify JWT token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Check user role - FR15: Role-based access control
exports.checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredRole: allowedRoles,
        userRole: req.user.userType
      });
    }

    next();
  };
};

// Optional authentication - allows both authenticated and guest users
exports.optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but continue as guest
      req.user = null;
    }
  }

  next();
};
