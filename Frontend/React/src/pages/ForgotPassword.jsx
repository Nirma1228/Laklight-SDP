import { Link } from 'react-router-dom'
import './ForgotPassword.css'

function ForgotPassword() {
  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Password reset link has been sent to your email!')
  }

  return (
    <div className="forgot-password-page">
      <Link to="/login" className="back-link">← Back to Login</Link>
      
      <div className="forgot-password-container">
        <h1>Forgot Password?</h1>
        <p>Enter your email address and we'll send you a link to reset your password</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" required placeholder="Enter your email" />
          </div>
          
          <button type="submit" className="submit-btn">Send Reset Link</button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
