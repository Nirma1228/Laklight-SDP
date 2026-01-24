import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Register.css'

function Register() {
  const navigate = useNavigate()
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
        ? 'http://localhost:5000/api/auth/farmer-register'
        : 'http://localhost:5000/api/auth/register'

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
        throw new Error(data.message || 'Registration failed')
      }

      // Store token if provided
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      // Show success message
      alert(data.message || 'Registration successful!')

      // Redirect based on user type - all users can login immediately
      switch(formData.userType) {
        case 'customer':
          navigate('/customer/dashboard')
          break
        case 'farmer':
          navigate('/farmer/dashboard')
          break
        case 'employee':
          navigate('/employee/dashboard')
          break
        case 'admin':
          navigate('/admin/dashboard')
          break
        default:
          navigate('/home')
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <Link to="/" className="back-home">← Back to Home</Link>
      
      <div className="main-content">
        <div className="register-container">
          <div className="register-header">
            <img src="/Logo.png" alt="Laklight Logo" className="logo" />
            <h1>Create Account</h1>
            <p>Join Laklight Food Products today</p>
          </div>

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
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="login-link">
              Already have an account? <Link to="/login">Login here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
