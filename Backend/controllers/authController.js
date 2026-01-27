const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'laklight_super_secret_key_2026_sdp_project';

// Helper: Get Role ID from Name
const getRoleId = async (roleName) => {
  const [roles] = await db.query('SELECT id FROM user_roles WHERE role_name = ?', [roleName]);
  return roles.length > 0 ? roles[0].id : null;
};

// Helper: Get Status ID from Name
const getStatusId = async (statusName) => {
  const [statuses] = await db.query('SELECT id FROM account_statuses WHERE status_name = ?', [statusName]);
  return statuses.length > 0 ? statuses[0].id : null;
};

// FR01: Generic Registration - Step 1: Send OTP
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, userType, address } = req.body;

    // Check if user already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const roleId = await getRoleId(userType || 'customer');
    if (!roleId) return res.status(400).json({ message: 'Invalid user type' });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete existing OTPs
    await db.query('DELETE FROM otp_verifications WHERE email = ? AND flow_type = "registration"', [email]);

    // Store registration data in JSON
    const userData = JSON.stringify({ fullName, phone, passwordHash, roleId, address });

    await db.query(
      'INSERT INTO otp_verifications (email, otp, flow_type, user_data_json, expires_at) VALUES (?, ?, "registration", ?, ?)',
      [email, otp, userData, expiresAt]
    );

    await sendOTPEmail(email, fullName, otp);

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      email,
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// FR08: Farmer Registration - Step 1: Send OTP (Shared logic)
exports.farmerRegister = async (req, res) => {
  req.body.userType = 'farmer';
  return exports.register(req, res);
};

// Login for all users (FR01, FR08)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and join role/status names
    const [rows] = await db.query(
      `SELECT u.*, r.role_name, s.status_name 
       FROM users u
       JOIN user_roles r ON u.role_id = r.id
       JOIN account_statuses s ON u.status_id = s.id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.status_name !== 'active') {
      return res.status(403).json({
        message: `Account is ${user.status_name}. Please contact administrator.`
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { userId: user.id, userType: user.role_name },
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
        userType: user.role_name,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Step 2: Verify OTP and Complete Registration
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const [otpRecords] = await db.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND flow_type = "registration" AND verified = FALSE',
      [email, otp]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    const otpRecord = otpRecords[0];
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Handle potential double-parsing or JSON column auto-parsing
    let userData;
    try {
      userData = typeof otpRecord.user_data_json === 'string'
        ? JSON.parse(otpRecord.user_data_json)
        : otpRecord.user_data_json;
    } catch (parseError) {
      console.error('Error parsing user_data_json:', parseError);
      return res.status(500).json({ message: 'Stored registration data is corrupt' });
    }

    const isEmployee = userData.roleId === 3; // 3 = employee
    // For employees, set to 'pending' (3), for others 'active' (1)
    const targetStatusId = isEmployee ? 3 : 1;

    // Verify status exists
    const [statusCheck] = await db.query('SELECT id FROM account_statuses WHERE id = ?', [targetStatusId]);
    if (statusCheck.length === 0) {
      console.error(`CRITICAL: Status ID ${targetStatusId} not found`);
      return res.status(500).json({ message: 'System configuration error: Status not found' });
    }

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userData.fullName, email, userData.phone, userData.passwordHash, userData.roleId, targetStatusId, userData.address]
    );

    await db.query('UPDATE otp_verifications SET verified = TRUE WHERE id = ?', [otpRecord.id]);

    // Get role name for response
    const [roles] = await db.query('SELECT role_name FROM user_roles WHERE id = ?', [userData.roleId]);
    const roleName = roles.length > 0 ? roles[0].role_name : 'customer';

    try {
      if (!isEmployee) {
        await sendWelcomeEmail(email, userData.fullName, roleName);
      } else {
        // Send "Pending Approval" email to employee
        await sendGenericEmail(
          email,
          'Registration Pending Approval',
          'Registration Under Review',
          `<p>Hi ${userData.fullName},</p><p>Your employee registration has been verified successfully. Your account is currently <strong>pending administrator approval</strong>.</p><p>You will receive another email once your account has been activated.</p>`
        );
      }
    } catch (emailError) {
      console.error('Email sending failed (non-blocking):', emailError.message);
    }

    const token = jwt.sign(
      { userId: result.insertId, userType: roleName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: isEmployee ? 'Registration pending approval' : 'Registration complete',
      token,
      user: {
        id: result.insertId,
        name: userData.fullName,
        email,
        userType: roleName,
        status: isEmployee ? 'pending' : 'active'
      }
    });
  } catch (error) {
    console.error('OTP verification error DETAIL:', error);
    res.status(500).json({
      message: 'Verification failed',
      error: error.message,
      detail: 'Please check server logs for more information'
    });
  }
};

// FR18: Get user profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.address, r.role_name as user_type, s.status_name as status, u.join_date 
       FROM users u
       JOIN user_roles r ON u.role_id = r.id
       JOIN account_statuses s ON u.status_id = s.id
       WHERE u.id = ?`,
      [req.user.userId]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ user: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    await db.query('UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?', [fullName, phone, address, req.user.userId]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.userId]);
    if (!await bcrypt.compare(currentPassword, users[0].password_hash)) return res.status(401).json({ message: 'Incorrect password' });
    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.userId]);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Change failed', error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const [records] = await db.query('SELECT * FROM otp_verifications WHERE email = ? AND verified = FALSE ORDER BY created_at DESC LIMIT 1', [email]);
    if (records.length === 0) return res.status(404).json({ message: 'No pending registration' });
    const newOtp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.query('UPDATE otp_verifications SET otp = ?, expires_at = ?, created_at = NOW() WHERE id = ?', [newOtp, expiresAt, records[0].id]);
    const userData = JSON.parse(records[0].user_data_json);
    await sendOTPEmail(email, userData.fullName, newOtp);
    res.json({ message: 'New OTP sent' });
  } catch (error) {
    res.status(500).json({ message: 'Resend failed', error: error.message });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};

