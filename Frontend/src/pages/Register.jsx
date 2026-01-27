import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { config } from '../config'
import './Register.css'

function Register() {
  const navigate = useNavigate()
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
    agreeToTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms and Conditions')
      return
    }

    setLoading(true)

    try {
      // Determine endpoint based on user type
      const endpoint = formData.userType === 'farmer'
        ? `${config.API_BASE_URL}/auth/farmer-register`
        : `${config.API_BASE_URL}/auth/register`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          userType: formData.userType,
          address: formData.address
        })
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMsg = data.message || 'Registration failed';

        // Handle Express-Validator errors array
        if (data.errors && Array.isArray(data.errors)) {
          const validationMessages = data.errors.map(e => e.msg).join(', ');
          errorMsg = `Validation failed: ${validationMessages}`;
        }

        // Handle specific error detail
        if (data.error) {
          errorMsg += ` (${data.error})`;
        }

        throw new Error(errorMsg);
      }

      // If OTP verification is required
      if (data.requiresVerification) {
        setRegisteredEmail(formData.email)
        setStep(2) // Move to OTP verification step
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registeredEmail,
          otp: otp
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed')
      }

      // Store token
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('userName', data.user.name)
        localStorage.setItem('userType', data.user.userType)
      }

      // Show success message
      if (data.user.status === 'pending' || data.user.userType === 'employee') {
        alert('Verification successful! Your employee account is pending Admin approval. You will be notified via email once approved.');
        navigate('/login');
        return;
      }

      // Show success message
      if (data.user.status === 'pending' || data.user.userType === 'employee') {
        alert('Verification successful! Your employee account is pending Admin approval. You will be notified via email once approved.');
        navigate('/login');
        return;
      }

      // Redirect based on user type
      switch (data.user.userType) {
        case 'customer':
          navigate('/customer/dashboard')
          break
        case 'farmer':
          navigate('/farmer/dashboard')
          break
        case 'employee':
          // Should effectively be unreachable if 'pending' logic above works, but kept for safety if active immediately
          navigate('/employee/dashboard')
          break
        case 'admin':
          navigate('/admin/dashboard')
          break
        default:
          navigate('/home')
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.')
      console.error('OTP verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setError('')

    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registeredEmail
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP')
      }

      alert('New OTP sent to your email!')
      setOtp('') // Clear OTP input
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.')
      console.error('Resend OTP error:', err)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="register-page">
      <Link to="/" className="back-home">← Back to Home</Link>

      <div className="register-container">
        <div className="register-right">
          <div className="register-header">
            <h1>{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
            <p>{step === 1 ? 'Start your journey with Laklight today' : 'We\'ve sent a code to your inbox'}</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="register-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="userType">I am a:</label>
                <select id="userType" name="userType" value={formData.userType} onChange={handleChange} required>
                  <option value="customer">Customer</option>
                  <option value="farmer">Farmer</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

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
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
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
              {error && <div className="error-message">{error}</div>}

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
                  ← Back to Registration
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
