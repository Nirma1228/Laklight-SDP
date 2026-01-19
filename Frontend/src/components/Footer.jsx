import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Laklight Food Products</h4>
          <p>Gokaralla Road, Kadulawa, Ibbagamuwa</p>
          <p>Phone: 0721267405</p>
          <p>Contact: Radika Lakmali</p>
        </div>
        <div className="footer-section">
          <h4>For Customers</h4>
          <p><Link to="/products">Browse Products</Link></p>
          <p><Link to="/customer/orders">Track Orders</Link></p>
          <p><Link to="/customer/profile">My Account</Link></p>
          <p><Link to="/feedback">Give Feedback</Link></p>
        </div>
        <div className="footer-section">
          <h4>For Farmers</h4>
          <p><Link to="/login">Join as Farmer</Link></p>
          <p><Link to="/login">Submit Product</Link></p>
          <p><Link to="/login">Delivery Schedule</Link></p>
          <p><Link to="/login">Track Requests</Link></p>
        </div>
        <div className="footer-section">
          <h4>System Features</h4>
          <p><a href="#features">E-commerce Platform</a></p>
          <p><a href="#features">Inventory Management</a></p>
          <p><a href="#features">Farmer Portal</a></p>
          <p><a href="#features">Analytics Dashboard</a></p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Laklight Food Products. All rights reserved. | Developed by Nirma Bandara</p>
      </div>
    </footer>
  )
}

export default Footer
