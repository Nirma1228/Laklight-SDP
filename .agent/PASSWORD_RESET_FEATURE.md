# Password Reset Feature - Implementation Guide

## Overview
Implemented a complete OTP-based password reset flow that allows users to securely reset their passwords via email verification.

## Architecture

### Flow Diagram
```
User enters email → Backend sends OTP → User enters OTP → OTP verified → User sets new password → Password updated
```

### 3-Step Process

#### **Step 1: Request Password Reset**
- User enters their email address
- Backend validates email exists in database
- Generates 6-digit OTP
- Stores OTP in `otp_verifications` table with `flow_type = 'password_reset'`
- Sends OTP to user's email
- OTP expires in 10 minutes

#### **Step 2: Verify OTP**
- User enters the 6-digit code received via email
- Backend validates OTP matches and hasn't expired
- Marks OTP as verified in database
- Allows user to proceed to password reset

#### **Step 3: Reset Password**
- User enters new password (minimum 6 characters)
- User confirms new password
- Backend validates OTP is still verified
- Hashes new password with bcrypt
- Updates user's password in database
- Deletes used OTP from database
- Redirects user to login page

## Backend Implementation

### New Controller Functions (`Backend/controllers/authController.js`)

#### 1. `requestPasswordReset`
```javascript
POST /auth/forgot-password
Body: { email: string }
```
- Checks if user exists
- Generates and stores OTP
- Sends email with OTP
- Returns success message

#### 2. `verifyResetOTP`
```javascript
POST /auth/verify-reset-otp
Body: { email: string, otp: string }
```
- Validates OTP and expiration
- Marks OTP as verified
- Returns success message

#### 3. `resetPassword`
```javascript
POST /auth/reset-password
Body: { email: string, otp: string, newPassword: string }
```
- Validates verified OTP
- Hashes new password
- Updates user password
- Deletes used OTP
- Returns success message

### Database Schema
Uses existing `otp_verifications` table:
```sql
CREATE TABLE otp_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    flow_type ENUM('registration', 'password_reset') DEFAULT 'registration',
    user_data_json JSON, -- Stores userId and fullName for password reset
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Routes (`Backend/routes/authRoutes.js`)
```javascript
// Password Reset routes
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);
```

## Frontend Implementation

### Updated Component (`Frontend/src/pages/ForgotPassword.jsx`)

#### State Management
```javascript
const [email, setEmail] = useState('')
const [otp, setOtp] = useState('')
const [newPassword, setNewPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [step, setStep] = useState(1) // Multi-step form
const [loading, setLoading] = useState(false)
const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
```

#### Features
- **Multi-step form** with 3 distinct steps
- **Toast notifications** for user feedback
- **Loading states** during API calls
- **Error handling** with user-friendly messages
- **Input validation** (email format, password length, password match)
- **Responsive design** works on all devices

### Styling (`Frontend/src/pages/ForgotPassword.css`)
- Modern gradient background
- Clean white card design
- Smooth transitions and hover effects
- Disabled state styling
- Error message styling
- Mobile-responsive layout

## Security Features

### 1. **OTP Expiration**
- OTPs expire after 10 minutes
- Extended grace period of 30 minutes total for password reset completion
- Expired OTPs are rejected with clear error messages

### 2. **Single-Use OTPs**
- OTP is deleted after successful password reset
- Cannot reuse the same OTP

### 3. **Email Verification**
- Only registered email addresses can request password reset
- Prevents enumeration attacks with generic error messages

### 4. **Password Hashing**
- Passwords hashed using bcrypt with salt rounds = 10
- Never stored in plain text

### 5. **Input Sanitization**
- Email trimmed and lowercased
- OTP trimmed to remove whitespace
- Prevents injection attacks

### 6. **Flow Type Isolation**
- Registration OTPs and password reset OTPs are separate
- `flow_type` field ensures correct OTP is used for correct purpose

## User Experience Improvements

### Before
❌ Mock alert with no functionality
❌ No actual email sent
❌ No password reset capability
❌ Poor user feedback

### After
✅ Complete 3-step password reset flow
✅ Real OTP sent via email
✅ Toast notifications for all actions
✅ Clear error messages
✅ Loading states during operations
✅ Password validation
✅ Auto-redirect after success
✅ Ability to change email if entered incorrectly

## Email Template
Uses the existing OTP email template from `emailService.js`:
- Professional design with Laklight branding
- Clear display of 6-digit code
- Expiration notice (10 minutes)
- Security warning
- Responsive HTML email

## Testing Guide

### Manual Testing Steps

#### Test 1: Successful Password Reset
1. Navigate to `/forgot-password`
2. Enter a valid registered email
3. Click "Send Reset Code"
4. Check email for 6-digit OTP
5. Enter OTP on verification page
6. Click "Verify Code"
7. Enter new password (min 6 characters)
8. Confirm password
9. Click "Reset Password"
10. Verify redirect to login page
11. Login with new password

#### Test 2: Invalid Email
1. Enter an unregistered email
2. Verify error message: "No account found with this email address"

#### Test 3: Expired OTP
1. Request OTP
2. Wait 11+ minutes
3. Try to verify OTP
4. Verify error message about expiration

#### Test 4: Invalid OTP
1. Request OTP
2. Enter wrong 6-digit code
3. Verify error message: "Invalid or expired OTP"

#### Test 5: Password Mismatch
1. Complete steps 1-6 successfully
2. Enter different passwords in "New Password" and "Confirm Password"
3. Verify error message: "Passwords do not match"

#### Test 6: Weak Password
1. Complete steps 1-6 successfully
2. Enter password less than 6 characters
3. Verify error message: "Password must be at least 6 characters"

### API Testing (Postman/cURL)

#### Request OTP
```bash
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP
```bash
POST http://localhost:5000/api/auth/verify-reset-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Reset Password
```bash
POST http://localhost:5000/api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

## Error Handling

### Backend Errors
| Error | Status | Message |
|-------|--------|---------|
| Email not found | 404 | "No account found with this email address" |
| Invalid OTP | 400 | "Invalid or expired OTP" |
| Expired OTP | 400 | "OTP has expired. Please request a new one." |
| Unverified OTP | 400 | "Invalid or unverified OTP. Please verify your OTP first." |
| Session expired | 400 | "Reset session has expired. Please request a new code." |
| Network error | 500 | "Failed to send reset code" / "OTP verification failed" / "Password reset failed" |

### Frontend Validation
- Email format validation (HTML5)
- Password minimum length (6 characters)
- Password confirmation match
- All fields required

## Future Enhancements

1. **Rate Limiting**: Prevent OTP request spam (max 3 requests per hour)
2. **SMS OTP**: Alternative to email OTP
3. **Password Strength Meter**: Visual indicator for password strength
4. **Remember Device**: Skip OTP for trusted devices
5. **Account Recovery Questions**: Alternative recovery method
6. **Audit Logging**: Log all password reset attempts
7. **Email Notification**: Notify user when password is changed
8. **Multi-language Support**: Internationalization for emails and UI

## Files Modified

### Backend
- ✅ `Backend/controllers/authController.js` - Added 3 new functions
- ✅ `Backend/routes/authRoutes.js` - Added 3 new routes

### Frontend
- ✅ `Frontend/src/pages/ForgotPassword.jsx` - Complete rewrite with 3-step flow
- ✅ `Frontend/src/pages/ForgotPassword.css` - Enhanced styling

### Dependencies
- No new dependencies required
- Uses existing: `bcryptjs`, `nodemailer`, `mysql2`

## Troubleshooting

### Issue: Email not received
**Solutions:**
1. Check spam/junk folder
2. Verify email service configuration in `.env`
3. Check backend console for email sending logs
4. Verify SMTP credentials are correct
5. Check network/firewall settings

### Issue: OTP verification fails
**Solutions:**
1. Ensure OTP is entered exactly as received (6 digits)
2. Check if OTP has expired (10 minutes)
3. Verify email matches the one used to request OTP
4. Check database for OTP record

### Issue: Password reset fails
**Solutions:**
1. Ensure OTP was verified in step 2
2. Check password meets minimum requirements
3. Verify passwords match
4. Check backend logs for errors

## Conclusion

The password reset feature is now fully functional with a secure, user-friendly OTP-based flow. Users can reset their passwords independently without admin intervention, improving the overall user experience and reducing support burden.
