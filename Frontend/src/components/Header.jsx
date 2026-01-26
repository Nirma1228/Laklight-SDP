import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faSignOutAlt,
  faBars,
  faTimes,
  faShoppingBasket
} from '@fortawesome/free-solid-svg-icons'
import { config } from '../config'
import './Header.css'

function Header({ isLoggedIn = false, customLinks = null, children = null }) {
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)

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
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoggedIn])

  const defaultLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ]

  const linksToDisplay = customLinks || defaultLinks

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav-container">
        <Link to="/" className="logo">
          <img src="/images/Logo.png" alt="Laklight" className="logo-img" />
          <span className="logo-text">Laklight</span>
        </Link>

        <ul className="nav-menu">
          {linksToDisplay.map((link, index) => (
            <li key={index}>
              {link.onClick ? (
                <button className="nav-link-btn" onClick={link.onClick}>
                  {link.label}
                </button>
              ) : (
                <Link to={link.path}>{link.label}</Link>
              )}
            </li>
          ))}
        </ul>

        <div className="auth-buttons">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          ) : (
            <div className="user-nav-info">
              {children}
              <span className="user-display-name">
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                {userName || 'User'}
              </span>
              <button
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.href = '/'
                }}
                className="btn btn-secondary"
                title="Logout"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          )}

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>
      </nav>

      {/* Modern Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-dropdown-menu">
          {linksToDisplay.map((link, index) => (
            <div key={index} className="mobile-nav-item">
              {link.onClick ? (
                <button onClick={() => { link.onClick(); setIsMobileMenuOpen(false); }}>{link.label}</button>
              ) : (
                <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)}>{link.label}</Link>
              )}
            </div>
          ))}
          {!isLoggedIn ? (
            <div className="mobile-auth-footer">
              <Link to="/login" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
            </div>
          ) : (
            <div className="mobile-auth-footer">
              <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="btn btn-secondary">Logout</button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Header


