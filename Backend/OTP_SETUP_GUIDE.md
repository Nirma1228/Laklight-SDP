# Email OTP Verification Setup Guide

## ✅ Implementation Complete!

The OTP-based email verification system has been successfully implemented with the following features:

### 🎯 Features Implemented:

1. **Beautiful Email Templates** with professional styling
2. **6-Digit OTP** generation and validation
3. **10-Minute Expiry** for security
4. **Resend OTP** functionality
5. **Welcome Email** after successful verification
6. **Two-Step Registration** flow (Register → Verify OTP)

### 📋 Database Setup Required:

**IMPORTANT:** Please run this SQL in your MySQL database to create the OTP table:

```sql
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('customer', 'farmer', 'employee', 'admin') NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_otp (otp),
    INDEX idx_expires (expires_at)
);
```

### 📧 Email Configuration:

**Brevo SMTP Settings** (Already configured in code):
- SMTP Server: `smtp-relay.brevo.com`
- Port: `587`
- Login: `a0bfd6001@smtp-brevo.com`
- Password: `xsmtpsib-c9dfa534219a2d55797fa98ccd115261d6b9ffcdf7228b81b055a8116729916c-Jltr3aO1k4peqzZe`

### 🔄 Registration Flow:

1. **Step 1: Registration Form**
   - User fills in details (name, email, password, etc.)
   - Clicks "Register" button
   - OTP is generated and sent to email
   - User sees OTP verification screen

2. **Step 2: Email Verification**
   - User checks email for OTP code
   - Enters 6-digit OTP
   - Clicks "Verify & Complete Registration"
   - Account is created after successful verification
   - Welcome email is sent
   - User is logged in automatically

### 📂 Files Modified:

**Backend:**
- ✅ `services/emailService.js` - Email service with Brevo SMTP
- ✅ `controllers/authController.js` - OTP generation, verification, resend
- ✅ `routes/authRoutes.js` - New routes: `/verify-otp`, `/resend-otp`
- ✅ `database/otp_table.sql` - OTP storage table schema

**Frontend:**
- ✅ `pages/Register.jsx` - Two-step registration with OTP verification
- ✅ `pages/Register.css` - Styling for OTP input and verification UI

### 🚀 How to Test:

1. **Create the database table** (run SQL above in MySQL)
2. **Start Backend Server:**
   ```bash
   cd Backend
   node server.js
   ```

3. **Start Frontend Server:**
   ```bash
   cd Frontend
   npm run dev
   ```

4. **Test Registration:**
   - Go to http://localhost:3000/register
   - Fill in registration form
   - Click "Register"
   - Check your email for OTP (should arrive within seconds)
   - Enter OTP code
   - Complete registration

### 📨 Email Templates:

**OTP Verification Email:**
- Professional gradient header with Laklight branding
- Large, centered OTP code display
- 10-minute validity timer
- Security warnings
- Mobile-friendly design

**Welcome Email:**
- Congratulatory message
- Account confirmation
- User type acknowledgment
- Professional footer

### 🔐 Security Features:

- ✅ OTP expires after 10 minutes
- ✅ Old OTPs are deleted when new registration attempted
- ✅ Passwords are hashed with bcrypt
- ✅ OTPs are 6-digit random numbers
- ✅ Email verification prevents fake registrations
- ✅ Resend OTP with rate limiting (manual implementation possible)

### 🎨 UI Features:

- ✅ Two-step wizard interface
- ✅ Large, easy-to-read OTP input
- ✅ Resend OTP button
- ✅ Back to registration option
- ✅ Loading states for all actions
- ✅ Error messages display
- ✅ Success confirmation

### 📊 API Endpoints:

**POST /api/auth/register**
- Body: `{ fullName, email, phone, password, userType, address }`
- Returns: `{ message, email, requiresVerification: true }`

**POST /api/auth/farmer-register**
- Body: `{ fullName, email, phone, password, address }`
- Returns: `{ message, email, requiresVerification: true }`

**POST /api/auth/verify-otp**
- Body: `{ email, otp }`
- Returns: `{ message, token, user: { id, name, email, userType } }`

**POST /api/auth/resend-otp**
- Body: `{ email }`
- Returns: `{ message }`

### 🎯 Next Steps (Optional Enhancements):

1. **Rate Limiting:** Add rate limiting for OTP resend (max 3 times)
2. **Email Queue:** Use job queue for email sending (bull, bee-queue)
3. **SMS OTP:** Add SMS verification as alternative
4. **Cleanup Job:** Schedule job to delete expired OTPs
5. **Admin Dashboard:** View pending verifications
6. **Email Templates:** Customize for different user types

### ⚠️ Important Notes:

- Make sure Brevo SMTP credentials are valid
- Check spam folder if OTP email not received
- Ensure database credentials are correct in `config/database.js`
- OTP table must be created before testing
- Backend must be restarted after changes

---

**Status:** ✅ Ready for Testing
**Date:** January 24, 2026
