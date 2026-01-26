import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { config } from '../config'
import './Header.css'

function Header({ isLoggedIn = false, customLinks = null, children = null }) {
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      const storedName = localStorage.getItem('userName')
      const storedRole = localStorage.getItem('userType')
      if (storedName) setUserName(storedName)
      if (storedRole) setUserRole(storedRole.charAt(0).toUpperCase() + storedRole.slice(1))

      const fetchUserProfile = async () => {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token')
          if (!token) return

          const response = await fetch(`${config.API_BASE_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setUserName(data.user.full_name)
              setUserRole(data.user.user_type.charAt(0).toUpperCase() + data.user.user_type.slice(1))
              localStorage.setItem('userName', data.user.full_name)
            }
          }
        } catch (error) {
          console.error('Error fetching header profile:', error)
        }
      }
      fetchUserProfile()
    }
  }, [isLoggedIn])

  const defaultLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ]

  const linksToDisplay = customLinks || defaultLinks

  return (
    <header className="header">
      <nav className="nav-container">
        <Link to="/" className="logo">
          <img src="/images/Logo.png" alt="Laklights Food Products" className="logo-img" />
          <span className="logo-text">Laklights Food Products</span>
        </Link>

        {children && (
          <div className="header-mobile-actions mobile-only-flex">
            {children}
          </div>
        )}

        {/* Mobile Menu Overlay */}
        <div
          className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Mobile Menu Toggle Button */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Mobile-Only User Identity Display */}
          {isLoggedIn && (
            <li className="mobile-only user-status-item">
              <div className="mobile-user-status">
                <span className="user-role-label">{userRole}</span>
                <span className="user-name-display">{userName || 'User'}</span>
              </div>
            </li>
          )}

          {/* Core Navigation Links */}
          {linksToDisplay.map((link, index) => (
            <li key={index} style={{ transitionDelay: `${0.1 + index * 0.05}s` }}>
              {link.onClick ? (
                <button
                  className="nav-link-btn"
                  onClick={() => {
                    link.onClick();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </button>
              ) : (
                <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)}>{link.label}</Link>
              )}
            </li>
          ))}

          {/* Mobile Auth/Account Actions */}
          <li className="mobile-only auth-action-item" style={{ transitionDelay: `${0.1 + linksToDisplay.length * 0.05}s` }}>
            {!isLoggedIn ? (
              <div className="mobile-auth-links">
                <Link to="/login" className="btn btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.href = '/'
                }}
                className="mobile-logout-link"
              >
                <span className="logout-icon">🚪</span> Logout
              </button>
            )}
          </li>
        </ul>

        {/* Desktop-Only Auth Buttons */}
        <div className="auth-buttons desktop-only">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          ) : (
            <div className="user-nav-info">
              {children}
              <span className="user-display-name">{userRole}: {userName || 'User'}</span>
              <button
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.href = '/'
                }}
                className="btn btn-secondary btn-small"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header


