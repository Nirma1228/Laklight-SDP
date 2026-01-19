import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="footer-content">
        <div className="footer-section footer-about">
          <div className="footer-logo">
            <img src="/images/Logo.png" alt="Laklight Food Products" />
            <h4>Laklight Food Products</h4>
          </div>
          <p className="footer-description">
            Your trusted source for fresh, locally-sourced food products. 
            Connecting farmers directly with customers for the freshest produce.
          </p>
          <div className="contact-info">
            <p><strong>Address:</strong></p>
            <p>Gokaralla Road, Kadulawa</p>
            <p>Ibbagamuwa, Sri Lanka</p>
            <p><strong>Phone:</strong> 0721267405</p>
            <p><strong>Contact:</strong> Radika Lakmali</p>
            <p><strong>Email:</strong> info@laklightfoods.lk</p>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>For Customers</h4>
          <p><Link to="/login">Browse Products</Link></p>
          <p><Link to="/login">Track Orders</Link></p>
          <p><Link to="/login">My Account</Link></p>
          <p><Link to="/login">Give Feedback</Link></p>
          <p><Link to="/login">Wholesale Orders</Link></p>
          <p><Link to="/login">Payment Options</Link></p>
        </div>
        
        <div className="footer-section">
          <h4>For Farmers</h4>
          <p><Link to="/login">Join as Farmer</Link></p>
          <p><Link to="/login">Submit Product</Link></p>
          <p><Link to="/login">Delivery Schedule</Link></p>
          <p><Link to="/login">Track Applications</Link></p>
          <p><Link to="/login">Pricing Guide</Link></p>
          <p><Link to="/login">Farmer Support</Link></p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <p><a href="#home">Home</a></p>
          <p><a href="#features">About Us</a></p>
          <p><a href="#features">System Features</a></p>
          <p><Link to="/login">Privacy Policy</Link></p>
          <p><Link to="/login">Terms of Service</Link></p>
          <p><Link to="/login">FAQ</Link></p>
        </div>
        
        <div className="footer-section">
          <h4>Business Hours</h4>
          <p><strong>Monday - Friday:</strong></p>
          <p>8:00 AM - 6:00 PM</p>
          <p><strong>Saturday:</strong></p>
          <p>9:00 AM - 4:00 PM</p>
          <p><strong>Sunday:</strong></p>
          <p>Closed</p>
          <div className="social-links">
            <h4 style={{marginTop: '1.5rem'}}>Follow Us</h4>
            <div className="social-icons">
              <a href="#" title="Facebook">FB</a>
              <a href="#" title="Instagram">IG</a>
              <a href="#" title="Twitter">TW</a>
              <a href="#" title="WhatsApp">WA</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 Laklight Food Products. All rights reserved.</p>
          <p>Developed by Nirma Bandara</p>
          <p>Fresh Products | Direct from Farm | Quality Guaranteed</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
