import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFacebookF,
  faInstagram,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons'
import {
  faMapMarkerAlt,
  faPhoneAlt,
  faEnvelope,
  faUserCircle,
  faClock
} from '@fortawesome/free-solid-svg-icons'
import './Footer.css'

function Footer() {
  return (
    <footer id="contact" className="premium-footer">
      <div className="footer-top">
        <div className="footer-grid container">
          <div className="footer-brand-section">
            <div className="footer-logo-premium">
              <img src="/images/Logo.png" alt="Laklight Logo" />
              <h3>Laklight</h3>
            </div>
            <p className="brand-description">
              Sourcing the finest harvests from Sri Lanka's rural heartlands directly to your table. We bridge the gap between quality farmers and conscious consumers.
            </p>
            <div className="social-pill-group">
              <a href="https://facebook.com" className="social-pill"><FontAwesomeIcon icon={faFacebookF} /></a>
              <a href="https://instagram.com" className="social-pill"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="https://wa.me/94721267405" className="social-pill"><FontAwesomeIcon icon={faWhatsapp} /></a>
            </div>
          </div>

          <div className="footer-links-column">
            <h4>Solutions</h4>
            <ul>
              <li><Link to="/products">Product Catalog</Link></li>
              <li><Link to="/login">Farmers Portal</Link></li>
              <li><Link to="/login">Bulk Orders</Link></li>
              <li><Link to="/login">Smart Logistics</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Company</h4>
            <ul>
              <li><a href="#features">About Us</a></li>
              <li><Link to="/feedback">Client Feedback</Link></li>
              <li><Link to="/login">Quality Standards</Link></li>
              <li><Link to="/login">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-contact-column">
            <h4>Contact Info</h4>
            <div className="contact-item-premium">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>Ibbagamuwa, Kurunegala, Sri Lanka</span>
            </div>
            <div className="contact-item-premium">
              <FontAwesomeIcon icon={faPhoneAlt} />
              <span>+94 72 126 7405</span>
            </div>
            <div className="contact-item-premium">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>info@laklightfoods.lk</span>
            </div>
            <div className="contact-item-premium">
              <FontAwesomeIcon icon={faUserCircle} />
              <span>Radika Lakmali</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom-premium">
        <div className="container bottom-flex">
          <p className="copyright">&copy; 2025 <strong>Laklight Food Products</strong>. All rights reserved.</p>
          <div className="developer-tag">
            <span className="dot"></span>
            Designed by <strong>Nirma Bandara</strong>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
