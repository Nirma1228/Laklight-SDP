import { Link } from 'react-router-dom'
import './Header.css'

function Header({ isLoggedIn = false }) {
  return (
    <header className="header">
      <nav className="nav-container">
        <Link to="/" className="logo">
          <img src="/images/Logo.png" alt="Laklights Food Products" className="logo-img" />
          Laklights Food Products
        </Link>
        <ul className="nav-menu">
          <li><a href="#home">Home</a></li>
          <li><Link to="/login">Products</Link></li>
          <li><a href="#features">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="auth-buttons">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          ) : (
            <Link to="/logout" className="btn btn-secondary">Logout</Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
