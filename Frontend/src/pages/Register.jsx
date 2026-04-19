import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faEye, 
  faEyeSlash,
  faShoppingBasket,
  faSeedling,
  faUserTie,
  faCog
} from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const { success, error: toastError, info } = useToast()
  const [step, setStep] = useState(1) // 1: Registration form, 2: OTP Verification, 3: Success
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registeredUser, setRegisteredUser] = useState(null) // { name, userType, dashboardPath, isPending }
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    userType: 'customer',
    fullName: '',
    farmName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    postalCode: '',
    district: '',
    adminCode: '',
    agreeToTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'At least one lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'At least one number', test: (p) => /\d/.test(p) },
    { label: 'At least one special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setLocalError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match!')
      toastError('Passwords must match')
      return
    }

    // Strong Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
    if (!passwordRegex.test(formData.password)) {
      setLocalError('Password must meet complexity requirements.')
      toastError('Password is too weak')
      return
    }

    if (!formData.agreeToTerms) {
      setLocalError('Please agree to the Terms and Conditions')
      return
    }

    setLoading(true)

    try {
      const endpoint = formData.userType === 'farmer'
        ? `${config.API_BASE_URL}/auth/farmer-register`
        : `${config.API_BASE_URL}/auth/register`

      // Normalize email to match backend's normalizeEmail() middleware
      const normalizedEmail = formData.email.trim().toLowerCase()

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          farmName: formData.userType === 'farmer' ? formData.farmName.trim() : undefined,
          email: normalizedEmail,
          phone: formData.phone.trim(),
          password: formData.password,
          userType: formData.userType,
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
          district: formData.district,
          adminCode: formData.userType === 'admin' ? formData.adminCode : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.requiresVerification) {
        setRegisteredEmail(normalizedEmail)
        setStep(2)
        success('Success! Please check your email for the OTP code.')
      }
    } catch (err) {
      setLocalError(err.message)
      toastError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!otp || otp.length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registeredEmail.trim().toLowerCase(),
          otp: otp.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed')
      }

      const isPending = data.user.status === 'pending' || data.user.userType === 'employee'

      if (data.token && !isPending) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('userName', data.user.name)
        localStorage.setItem('userType', data.user.userType)
      }

      // Dashboard paths per role
      const dashboardPaths = {
        'customer': '/customer/dashboard',
        'farmer': '/farmer/dashboard',
        'employee': '/login',
        'admin': '/admin/dashboard'
      }
      const dashboardPath = dashboardPaths[data.user.userType] || '/home'

      // Role display labels
      const roleLabels = {
        'customer': 'Customer',
        'farmer': 'Farmer',
        'employee': 'Employee',
        'admin': 'Administrator'
      }

      setRegisteredUser({
        name: data.user.name,
        userType: data.user.userType,
        roleLabel: roleLabels[data.user.userType] || data.user.userType,
        dashboardPath,
        isPending
      })
      setStep(3)
    } catch (err) {
      setLocalError(err.message)
      toastError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setLocalError('')

    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP')
      }

      success('New OTP sent to your email!')
      setOtp('') // Clear OTP input
    } catch (err) {
      setLocalError(err.message)
      toastError(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  // Dashboard link labels
  const dashboardLabels = {
    'customer': '🛒 Go to Customer Dashboard',
    'farmer': '🌾 Go to Farmer Dashboard',
    'employee': '🔐 Go to Login Page',
    'admin': '⚙️ Go to Admin Dashboard'
  }

  return (
    <div className="register-page">
      <Link to="/" className="back-home">&larr; Back to Home</Link>

      <div className="register-container">
        <div className="register-right">

          {/* ── Step 3: Registration Complete ── */}
          {step === 3 && registeredUser && (
            <div className="registration-success">
              <div className="success-checkmark">
                <svg viewBox="0 0 52 52" className="checkmark-svg">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>

              <h1 className="success-title">Registration Complete!</h1>
              <p className="success-greeting">Welcome aboard, <strong>{registeredUser.name}</strong>!</p>

              <div className={`role-badge role-badge--${registeredUser.userType}`}>
                {registeredUser.roleLabel}
              </div>

              {registeredUser.isPending ? (
                <div className="pending-notice">
                  <span className="pending-icon">⏳</span>
                  <h3>Account Pending Approval</h3>
                  <p>
                    Your employee account has been created successfully. An administrator will review
                    and activate your account shortly. You&apos;ll receive an email once approved.
                  </p>
                  <button
                    className="dashboard-link-btn dashboard-link-btn--pending"
                    onClick={() => navigate('/login')}
                  >
                    🔐 Go to Login Page
                  </button>
                </div>
              ) : (
                <div className="dashboard-prompt">
                  <p className="dashboard-prompt-text">Your account is ready. Head over to your dashboard to get started!</p>
                  <button
                    className="dashboard-link-btn"
                    onClick={() => navigate(registeredUser.dashboardPath)}
                  >
                    {dashboardLabels[registeredUser.userType] || '🏠 Go to Dashboard'}
                  </button>
                  <div className="or-login">
                    <span>or</span>
                    <Link to="/login" className="login-text-link">Login to an existing account</Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 1 & 2 Header ── */}
          {step !== 3 && (
            <div className="register-header">
              <h1>{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
              <p>{step === 1 ? 'Start your journey with Laklight today' : "We've sent a code to your inbox"}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="register-form">
              {localError && <div className="error-message">{localError}</div>}

              <div className="form-group role-selection-group">
                <label>I am a:</label>
                <div className="role-cards-container">
                  <div 
                    className={`role-card ${formData.userType === 'customer' ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, userType: 'customer'})}
                  >
                    <div className="role-card-icon"><FontAwesomeIcon icon={faShoppingBasket} /></div>
                    <div className="role-card-content">
                      <h4>Customer</h4>
                      <p>Buy fresh wholesale products</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`role-card ${formData.userType === 'farmer' ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, userType: 'farmer'})}
                  >
                    <div className="role-card-icon"><FontAwesomeIcon icon={faSeedling} /></div>
                    <div className="role-card-content">
                      <h4>Farmer</h4>
                      <p>Sell products to our warehouse</p>
                    </div>
                  </div>

                  <div 
                    className={`role-card ${formData.userType === 'employee' ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, userType: 'employee'})}
                  >
                    <div className="role-card-icon"><FontAwesomeIcon icon={faUserTie} /></div>
                    <div className="role-card-content">
                      <h4>Employee</h4>
                      <p>Manage warehouse & logistics</p>
                    </div>
                  </div>

                  <div 
                    className={`role-card ${formData.userType === 'admin' ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, userType: 'admin'})}
                  >
                    <div className="role-card-icon"><FontAwesomeIcon icon={faCog} /></div>
                    <div className="role-card-content">
                      <h4>Admin</h4>
                      <p>System control & management</p>
                    </div>
                  </div>
                </div>
              </div>

              {formData.userType === 'admin' && (
                <div className="form-group admin-code-field">
                  <label htmlFor="adminCode">Admin Authorization Code</label>
                  <input
                    type="password"
                    id="adminCode"
                    name="adminCode"
                    value={formData.adminCode}
                    onChange={handleChange}
                    placeholder="Enter Authorization Code"
                    required
                  />
                  <small className="help-text">Authorized personnel only.</small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>

              {formData.userType === 'farmer' && (
                <div className="form-group">
                  <label htmlFor="farmName">Farm Name</label>
                  <input
                    type="text"
                    id="farmName"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    placeholder="E.g. Green Valley Farm"
                    required
                  />
                  <small className="help-text">Name of your agricultural property or farm.</small>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="district">District</label>
                <select id="district" name="district" value={formData.district} onChange={handleChange} required>
                  <option value="">Select District</option>
                  <option value="ampara">Ampara</option>
                  <option value="anuradhapura">Anuradhapura</option>
                  <option value="badulla">Badulla</option>
                  <option value="batticaloa">Batticaloa</option>
                  <option value="colombo">Colombo</option>
                  <option value="galle">Galle</option>
                  <option value="gampaha">Gampaha</option>
                  <option value="hambantota">Hambantota</option>
                  <option value="jaffna">Jaffna</option>
                  <option value="kalutara">Kalutara</option>
                  <option value="kandy">Kandy</option>
                  <option value="kegalle">Kegalle</option>
                  <option value="kilinochchi">Kilinochchi</option>
                  <option value="kurunegala">Kurunegala</option>
                  <option value="mannar">Mannar</option>
                  <option value="matale">Matale</option>
                  <option value="matara">Matara</option>
                  <option value="moneragala">Moneragala</option>
                  <option value="mullaitivu">Mullaitivu</option>
                  <option value="nuwara-eliya">Nuwara Eliya</option>
                  <option value="polonnaruwa">Polonnaruwa</option>
                  <option value="puttalam">Puttalam</option>
                  <option value="ratnapura">Ratnapura</option>
                  <option value="trincomalee">Trincomalee</option>
                  <option value="vavuniya">Vavuniya</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group password-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>

                  <div className="password-requirements">
                    {passwordRequirements.map((req, index) => {
                      const isMet = req.test(formData.password);
                      return (
                        <div key={index} className={`requirement-item ${formData.password ? (isMet ? 'met' : 'not-met') : ''}`}>
                          <span className="dot"></span>
                          {req.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group password-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="terms-group">
                <label>
                  <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} required />
                  I agree to the Terms and Conditions
                </label>
              </div>

              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Register'}
              </button>

              <div className="login-link">
                Already have an account? <Link to="/login">Login here</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="register-form">
              {localError && <div className="error-message">{localError}</div>}

              <div className="otp-info">
                <p>We've sent a 6-digit verification code to:</p>
                <strong>{registeredEmail}</strong>
              </div>

              <div className="form-group">
                <label htmlFor="otp">Enter OTP Code</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  className="otp-input"
                  required
                />
              </div>

              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>

              <div className="resend-otp">
                <p>Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="resend-btn"
                >
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>

              <div className="login-link">
                <button type="button" onClick={() => setStep(1)} className="back-btn">
                  &larr; Back to Registration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register
