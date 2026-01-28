const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'laklight_super_secret_key_2026_sdp_project';

// Helper: Get Role ID from Name
const getRoleId = async (roleName) => {
  const [roles] = await db.query('SELECT role_id FROM user_roles WHERE role_name = ?', [roleName]);
  return roles.length > 0 ? roles[0].role_id : null;
};

// Helper: Get Status ID from Name
const getStatusId = async (statusName) => {
  const [statuses] = await db.query('SELECT status_id FROM account_statuses WHERE status_name = ?', [statusName]);
  return statuses.length > 0 ? statuses[0].status_id : null;
};

// FR01: Generic Registration - Step 1: Send OTP
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, userType, address, adminCode } = req.body;

    // Check if user already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Admin Authorization Check
    if (userType === 'admin') {
      if (!adminCode || adminCode !== 'LAKLIGHT-2025') {
        return res.status(403).json({
          message: 'Invalid Admin Authorization Code. Please enter the correct code to register as an admin.'
        });
      }
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
       JOIN user_roles r ON u.role_id = r.role_id
       JOIN account_statuses s ON u.status_id = s.status_id
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

    await db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

    // Role-based expiration: Customer/Farmer: 2h, Employee/Admin: 24h
    const expiration = (user.role_name === 'customer' || user.role_name === 'farmer') ? '2h' : '24h';

    const token = jwt.sign(
      { userId: user.user_id, userType: user.role_name },
      JWT_SECRET,
      { expiresIn: expiration }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
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
    const [statusCheck] = await db.query('SELECT status_id FROM account_statuses WHERE status_id = ?', [targetStatusId]);
    if (statusCheck.length === 0) {
      console.error(`CRITICAL: Status ID ${targetStatusId} not found`);
      return res.status(500).json({ message: 'System configuration error: Status not found' });
    }

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userData.fullName, email, userData.phone, userData.passwordHash, userData.roleId, targetStatusId, userData.address]
    );

    await db.query('UPDATE otp_verifications SET verified = TRUE WHERE otp_id = ?', [otpRecord.otp_id]);

    // Get role name for response
    const [roles] = await db.query('SELECT role_name FROM user_roles WHERE role_id = ?', [userData.roleId]);
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

    // Role-based expiration: Customer/Farmer: 2h, Employee/Admin: 24h
    const expiration = (roleName === 'customer' || roleName === 'farmer') ? '2h' : '24h';

    const token = jwt.sign(
      { userId: result.insertId, userType: roleName },
      JWT_SECRET,
      { expiresIn: expiration }
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
      `SELECT u.user_id as id, u.full_name, u.email, u.phone, u.address, r.role_name as user_type, s.status_name as status, u.join_date 
       FROM users u
       JOIN user_roles r ON u.role_id = r.role_id
       JOIN account_statuses s ON u.status_id = s.status_id
       WHERE u.user_id = ?`,
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
    await db.query('UPDATE users SET full_name = ?, phone = ?, address = ? WHERE user_id = ?', [fullName, phone, address, req.user.userId]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [users] = await db.query('SELECT password_hash FROM users WHERE user_id = ?', [req.user.userId]);
    if (!await bcrypt.compare(currentPassword, users[0].password_hash)) return res.status(401).json({ message: 'Incorrect password' });
    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHash, req.user.userId]);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Change failed', error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    console.log(`🔍 Resend OTP request for: ${cleanEmail}`);

    // Find the latest pending OTP for this email (could be registration or password_reset)
    const [records] = await db.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND verified = FALSE ORDER BY created_at DESC LIMIT 1',
      [cleanEmail]
    );

    if (records.length === 0) {
      console.log(`⚠️ No pending verification found for: ${cleanEmail}`);
      return res.status(404).json({ message: 'No pending verification found' });
    }

    const record = records[0];
    const newOtp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      'UPDATE otp_verifications SET otp = ?, expires_at = ?, created_at = NOW() WHERE otp_id = ?',
      [newOtp, expiresAt, record.otp_id]
    );

    // Get user data to send email (contains fullName)
    const userData = typeof record.user_data_json === 'string'
      ? JSON.parse(record.user_data_json)
      : record.user_data_json;

    await sendOTPEmail(cleanEmail, userData.fullName || 'User', newOtp);

    console.log(`✅ New OTP (${newOtp}) resent to: ${cleanEmail} (Flow: ${record.flow_type})`);
    res.json({ message: 'New verification code sent' });
  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({ message: 'Resend failed', error: error.message });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};

// Password Reset - Step 1: Request OTP
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    console.log(`🔍 Password reset request for: ${cleanEmail}`);

    // Check if user exists
    const [users] = await db.query('SELECT user_id, full_name FROM users WHERE email = ?', [cleanEmail]);
    if (users.length === 0) {
      console.log(`⚠️ No account found for email: ${cleanEmail}`);
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    const user = users[0];
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing password reset OTPs for this email to avoid confusion
    await db.query('DELETE FROM otp_verifications WHERE email = ? AND flow_type = "password_reset"', [cleanEmail]);

    // Store OTP with user ID and name in user_data_json
    const userDataObj = { userId: user.user_id, fullName: user.full_name };

    const [insertResult] = await db.query(
      'INSERT INTO otp_verifications (email, otp, flow_type, user_data_json, expires_at) VALUES (?, ?, ?, ?, ?)',
      [cleanEmail, otp, 'password_reset', JSON.stringify(userDataObj), expiresAt]
    );

    console.log(`📡 DB: OTP Record created for ${cleanEmail} (ID: ${insertResult.insertId})`);

    // Send OTP email
    await sendOTPEmail(cleanEmail, user.full_name, otp);

    console.log(`✅ Password reset OTP (${otp}) sent to: ${cleanEmail}`);
    res.json({ message: 'Password reset code sent to your email', email: cleanEmail });
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    res.status(500).json({ message: 'Failed to send reset code', error: error.message });
  }
};

// Password Reset - Step 2: Verify OTP
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    console.log(`🔍 Verifying reset OTP for: ${cleanEmail}, code: ${cleanOtp}`);

    const [records] = await db.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND flow_type = "password_reset"',
      [cleanEmail, cleanOtp]
    );

    if (records.length === 0) {
      console.log(`⚠️ Invalid OTP attempt for ${cleanEmail}`);
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    const record = records[0];

    // Check expiration
    if (new Date() > new Date(record.expires_at)) {
      console.log(`⚠️ Expired OTP for ${cleanEmail}`);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Mark OTP as verified
    await db.query('UPDATE otp_verifications SET verified = TRUE WHERE otp_id = ?', [record.otp_id]);

    console.log(`✅ Password reset OTP verified for: ${cleanEmail}`);
    res.json({ message: 'OTP verified successfully. You can now reset your password.' });
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// Password Reset - Step 3: Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    console.log(`🔍 Finalizing password reset for: ${cleanEmail}`);

    // Verify OTP is still valid and verified
    const [records] = await db.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND flow_type = "password_reset" AND verified = TRUE',
      [cleanEmail, cleanOtp]
    );

    if (records.length === 0) {
      console.log(`⚠️ Password reset failed: OTP not verified for ${cleanEmail}`);
      return res.status(400).json({ message: 'Invalid or unverified OTP. Please verify your OTP first.' });
    }

    const record = records[0];

    // Check expiration (allow 30 minutes for password reset after verification)
    const expirationTime = new Date(record.expires_at).getTime() + (30 * 60 * 1000);
    if (new Date().getTime() > expirationTime) {
      console.log(`⚠️ Password reset failed: Session expired for ${cleanEmail}`);
      return res.status(400).json({ message: 'Reset session has expired. Please request a new code.' });
    }

    // Get user ID from stored data
    const userData = typeof record.user_data_json === 'string'
      ? JSON.parse(record.user_data_json)
      : record.user_data_json;

    if (!userData || !userData.userId) {
      console.error('❌ Corrupt user data in OTP record:', record.user_data_json);
      return res.status(500).json({ message: 'Failed to retrieve account information' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const [updateResult] = await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [passwordHash, userData.userId]);

    if (updateResult.affectedRows === 0) {
      console.error(`❌ Password update failed: User ID ${userData.userId} not found`);
      return res.status(404).json({ message: 'User account not found' });
    }

    // Delete the used OTP
    await db.query('DELETE FROM otp_verifications WHERE otp_id = ?', [record.otp_id]);

    console.log(`✅ Password reset successful for user ID: ${userData.userId} (${cleanEmail})`);
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};

