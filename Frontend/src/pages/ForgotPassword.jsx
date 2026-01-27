import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { config } from '../config'
import './ForgotPassword.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to send reset code')

      setStep(2)
      setSuccess('Reset code sent to your email!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Verification failed')

      setStep(3)
      setSuccess('OTP verified! Please set your new password.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          newPassword: passwords.newPassword
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to reset password')

      setShowSuccessModal(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-page">
      <Link to="/login" className="back-link">← Back to Login</Link>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => { setShowSuccessModal(false); navigate('/login'); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon success">✓</div>
            <h2>Password Reset Successful!</h2>
            <p>Your password has been updated successfully. Please login with your new password.</p>
            <button
              className="modal-btn"
              onClick={() => { setShowSuccessModal(false); navigate('/login'); }}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      <div className="forgot-password-container">
        <div className="progress-bar">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        <h1>{step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'New Password'}</h1>
        <p>
          {step === 1 ? "Enter your email address and we'll send you a reset code" :
            step === 2 ? `Enter the 6-digit code sent to ${email}` :
              "Create a strong new password for your account"}
        </p>

        {error && <div className="error-box">{error}</div>}
        {success && !error && <div className="success-box">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpVerify}>
            <div className="form-group">
              <label htmlFor="otp">6-Digit Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                placeholder="000000"
                maxLength="6"
                className="otp-input"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button type="button" className="text-btn" onClick={() => setStep(1)}>
              Change Email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
                placeholder="Minimum 6 characters"
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
                placeholder="Repeat new password"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
