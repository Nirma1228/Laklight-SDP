import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    userType: 'customer',
    email: '',
    password: '',
    rememberMe: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle login logic here
    console.log('Login attempt:', formData)
    
    // Navigate based on user type
    switch(formData.userType) {
      case 'administrator':
        navigate('/admin/dashboard')
        break
      case 'customer':
        navigate('/customer/dashboard')
        break
      case 'employee':
        navigate('/employee/dashboard')
        break
      case 'farmer':
        navigate('/farmer/dashboard')
        break
      default:
        navigate('/home')
    }
  }

  return (
    <div className="login-page">
      <Link to="/" className="back-home">← Back to Home</Link>
      
      <div className="main-content">
        <div className="login-container">
          <div className="login-left">
            <div className="logo-section">
              <img src="/Logo.png" alt="Laklight Logo" />
              <h1>Laklight Food Products</h1>
              <p>Fresh From Farm to Table</p>
            </div>
            <div className="welcome-text">
              <h2>Welcome Back!</h2>
              <p>Login to access your dashboard and manage your account</p>
            </div>
          </div>

          <div className="login-right">
            <div className="login-header">
              <h2>Login</h2>
              <p>Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="user-type-selector">
                <label htmlFor="userType">I am a:</label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="farmer">Farmer</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="login-btn">
                Login
              </button>

              <div className="register-link">
                Don't have an account? <Link to="/register">Register here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
