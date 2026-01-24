import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'


function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Call backend API for authentication
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store token based on remember me option
        if (formData.rememberMe) {
          localStorage.setItem('token', data.token);
        } else {
          sessionStorage.setItem('token', data.token);
        }

        // Store user info
        localStorage.setItem('userType', data.user.userType);
        localStorage.setItem('userName', data.user.name || data.user.email);

        // Navigate based on user type from response
        const userType = data.user.userType;
        switch (userType) {
          case 'administrator':
            navigate('/admin/dashboard');
            break;
          case 'customer':
            navigate('/customer/dashboard');
            break;
          case 'employee':
            navigate('/employee/dashboard');
            break;
          case 'farmer':
            navigate('/farmer/dashboard');
            break;
          default:
            navigate('/home');
        }
      } else {
        // Show error message
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Link to="/" className="back-home">← Back to Home</Link>
      
      <div className="main-content">
        <div className="login-container">
          <div className="login-left">
            <div className="logo-section">
              <img src="/images/Logo.png" alt="Laklight Logo" />
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
              {error && (
                <div style={{
                  padding: '12px',
                  marginBottom: '20px',
                  background: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '8px',
                  border: '1px solid #f5c6cb'
                }}>
                  {error}
                </div>
              )}



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

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
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
