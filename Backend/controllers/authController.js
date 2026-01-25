const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'laklight_super_secret_key_2026_sdp_project';

// FR01: Customer Registration - Step 1: Send OTP
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, userType, address } = req.body;

    // Check if user already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();

    // Calculate expiry time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTP for this email
    await db.query('DELETE FROM otp_verifications WHERE email = ?', [email]);

    // Store OTP and user data temporarily
    await db.query(
      'INSERT INTO otp_verifications (email, otp, full_name, phone, password_hash, user_type, address, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, otp, fullName, phone, passwordHash, userType || 'customer', address || null, expiresAt]
    );

    // Send OTP email (Soft Fail)
    let emailSent = false;
    try {
      await sendOTPEmail(email, fullName, otp);
      emailSent = true;
    } catch (emailErr) {
      console.error('⚠️ Registration email failed (Soft Fail):', emailErr.message);
      // Continue anyway since we have debugOtp
    }

    // DEVELOPMENT ONLY: Log OTP to console for testing
    console.log('='.repeat(50));
    console.log('📧 OTP SENT FOR TESTING');
    console.log('Email:', email);
    console.log('OTP Code:', otp);
    console.log('Expires in: 10 minutes');
    console.log('='.repeat(50));

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: email,
      requiresVerification: true,
      debugOtp: otp // TEMPORARY: Expose OTP for debugging
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// FR08: Farmer Registration - Step 1: Send OTP
exports.farmerRegister = async (req, res) => {
  try {
    const { fullName, email, phone, password, address, farmDetails } = req.body;

    // Check if user already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();

    // Calculate expiry time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTP for this email
    await db.query('DELETE FROM otp_verifications WHERE email = ?', [email]);

    // Store OTP and farmer data temporarily
    await db.query(
      'INSERT INTO otp_verifications (email, otp, full_name, phone, password_hash, user_type, address, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, otp, fullName, phone, passwordHash, 'farmer', address || null, expiresAt]
    );

    // Send OTP email (Soft Fail)
    let emailSent = false;
    try {
      await sendOTPEmail(email, fullName, otp);
      emailSent = true;
    } catch (emailErr) {
      console.error('⚠️ Farmer registration email failed (Soft Fail):', emailErr.message);
    }

    // DEVELOPMENT ONLY: Log OTP to console
    console.log('='.repeat(50));
    console.log('📧 FARMER OTP SENT FOR TESTING');
    console.log('Email:', email);
    console.log('OTP Code:', otp);
    console.log('Expires in: 10 minutes');
    console.log('='.repeat(50));

    res.status(200).json({
      message: emailSent ? 'OTP sent to your email.' : 'OTP generated (Email failed, check popup).',
      email: email,
      requiresVerification: true,
      debugOtp: otp, // TEMPORARY: Expose OTP for debugging
      emailSent: emailSent
    });
  } catch (error) {
    console.error('Farmer registration error:', error);
    res.status(500).json({ message: 'Farmer registration failed', error: error.message });
  }
};

// Login for all users (FR01, FR08)
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    // Find user by email only
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        message: `Account is ${user.status}. Please contact administrator.`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Generate JWT token
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
};

// FR18: Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await db.query(
      'SELECT id, full_name, email, phone, user_type, address, status, join_date FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// FR18: Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, address } = req.body;

    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
      [fullName, phone, address, userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};

// Logout (client-side handles token removal)
exports.logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};

// Step 2: Verify OTP and Complete Registration
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP record
    const [otpRecords] = await db.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND verified = FALSE',
      [email, otp]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    const otpRecord = otpRecords[0];

    // Check if OTP has expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Insert user into users table
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [otpRecord.full_name, otpRecord.email, otpRecord.phone, otpRecord.password_hash, otpRecord.user_type, otpRecord.address, 'active']
    );

    // Mark OTP as verified
    await db.query('UPDATE otp_verifications SET verified = TRUE WHERE id = ?', [otpRecord.id]);

    // Send welcome email
    await sendWelcomeEmail(otpRecord.email, otpRecord.full_name, otpRecord.user_type);

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, userType: otpRecord.user_type },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Email verified successfully! Registration complete.',
      token,
      user: {
        id: result.insertId,
        name: otpRecord.full_name,
        email: otpRecord.email,
        userType: otpRecord.user_type
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find existing OTP record
    const [otpRecords] = await db.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND verified = FALSE ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (otpRecords.length === 0) {
      return res.status(404).json({ message: 'No pending registration found for this email' });
    }

    const otpRecord = otpRecords[0];

    // Generate new OTP
    const newOtp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update OTP
    await db.query(
      'UPDATE otp_verifications SET otp = ?, expires_at = ?, created_at = NOW() WHERE id = ?',
      [newOtp, expiresAt, otpRecord.id]
    );

    // Send new OTP email
    await sendOTPEmail(email, otpRecord.full_name, newOtp);

    res.status(200).json({
      message: 'New OTP sent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
};

