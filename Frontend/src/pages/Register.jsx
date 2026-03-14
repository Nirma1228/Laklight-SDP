import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const { success, error: toastError, info } = useToast()
  const [step, setStep] = useState(1) // 1: Registration form, 2: OTP Verification
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    userType: 'customer',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
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

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          userType: formData.userType,
          address: formData.address,
          adminCode: formData.userType === 'admin' ? formData.adminCode : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.requiresVerification) {
        setRegisteredEmail(formData.email)
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
          email: registeredEmail,
          otp: otp
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed')
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('userName', data.user.name)
        localStorage.setItem('userType', data.user.userType)
      }

      success('Registration verified successfully!')

      // Redirect based on user type
      const targetPath = {
        'customer': '/customer/dashboard',
        'farmer': '/farmer/dashboard',
        'employee': '/login', // Employees wait for approval
        'admin': '/admin/dashboard'
      }[data.user.userType] || '/home'

      if (data.user.status === 'pending' || data.user.userType === 'employee') {
        info('Account pending admin approval. Redirecting to login...')
        setTimeout(() => navigate('/login'), 3000)
      } else {
        navigate(targetPath)
      }
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

  return (
    <div className="register-page">
      <Link to="/" className="back-home">&larr; Back to Home</Link>

      <div className="register-container">
        <div className="register-right">
          <div className="register-header">
            <h1>{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
            <p>{step === 1 ? 'Start your journey with Laklight today' : "We've sent a code to your inbox"}</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="register-form">
              {localError && <div className="error-message">{localError}</div>}

              <div className="form-group">
                <label htmlFor="userType">I am a:</label>
                <select id="userType" name="userType" value={formData.userType} onChange={handleChange} required>
                  <option value="customer">Customer</option>
                  <option value="farmer">Farmer</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
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
                <label htmlFor="address">Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
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
