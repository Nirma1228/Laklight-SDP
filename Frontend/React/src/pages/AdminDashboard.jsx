import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="admin-dashboard-page">
      {/* Header */}
      <header className="header">
        <nav className="nav-container">
          <Link to="/" className="logo">
            <img src="/images/Logo.png" alt="Laklight" />
            Laklight Food Products
          </Link>
          <ul className="nav-menu">
            <li><Link to="/admin/users">User Management</Link></li>
            <li><Link to="/admin/inventory">Inventory</Link></li>
            <li><Link to="/admin/orders">Orders</Link></li>
            <li><Link to="/admin/suppliers">Suppliers</Link></li>
            <li><Link to="/admin/reports">Reports</Link></li>
          </ul>
          <div className="user-info">
            <span className="admin-badge">Admin</span>
            <span>Administrator</span>
            <Link to="/home" className="logout-btn">Dashboard</Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Monitor and manage all system operations</p>
          <div className="action-buttons">
            <Link to="/generate-reports" className="btn btn-primary">Generate Report</Link>
            <Link to="/admin/settings" className="btn btn-secondary">System Settings</Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">2,345</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1,234</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">567</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">LKR 1.2M</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Recent Orders
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content-area">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <h2>System Overview</h2>
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>Recent Activity</h3>
                  <p>24 new orders today</p>
                  <p>15 products updated</p>
                  <p>8 new customer registrations</p>
                </div>
                <div className="dashboard-card">
                  <h3>Quick Actions</h3>
                  <Link to="/admin/inventory" className="btn btn-primary">Manage Inventory</Link>
                  <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
                  <Link to="/admin/reports" className="btn btn-primary">Generate Reports</Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-content">
              <h2>Recent Orders</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#ORD-001</td>
                    <td>John Doe</td>
                    <td>LKR 5,400</td>
                    <td><span className="status-badge status-processing">Processing</span></td>
                    <td>2025-01-15</td>
                  </tr>
                  <tr>
                    <td>#ORD-002</td>
                    <td>Jane Smith</td>
                    <td>LKR 3,200</td>
                    <td><span className="status-badge status-completed">Completed</span></td>
                    <td>2025-01-14</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-content">
              <h2>User Management</h2>
              <Link to="/admin/users" className="btn btn-primary">View All Users</Link>
            </div>
          )}
        </div>

        {/* System Management Section */}
        <div className="section">
          <div className="section-header">
            <h3>System Management</h3>
            <p style={{color: '#666'}}>Access all administrative functions and system controls</p>
          </div>
          <div className="management-grid">
            <div className="management-card" onClick={() => navigate('/admin/users')}>
              <div className="management-icon users">👥</div>
              <div className="management-title">User Management</div>
              <div className="management-description">Manage customers, suppliers, and employees accounts</div>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number">1,523</span>
                  <span className="management-stat-label">Customers</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">234</span>
                  <span className="management-stat-label">Suppliers</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">45</span>
                  <span className="management-stat-label">Employees</span>
                </div>
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/admin/inventory')}>
              <div className="management-icon inventory">📦</div>
              <div className="management-title">Inventory Control</div>
              <div className="management-description">Monitor stock levels, warehouse locations, and product expiry</div>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number">156</span>
                  <span className="management-stat-label">Products</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">12</span>
                  <span className="management-stat-label">Low Stock</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">3</span>
                  <span className="management-stat-label">Expiring</span>
                </div>
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/products')}>
              <div className="management-icon inventory">🏪</div>
              <div className="management-title">Product Catalog</div>
              <div className="management-description">Add, edit, and manage products with pricing controls</div>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number">156</span>
                  <span className="management-stat-label">Total Products</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">142</span>
                  <span className="management-stat-label">Active</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">8</span>
                  <span className="management-stat-label">Categories</span>
                </div>
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/admin/orders')}>
              <div className="management-icon orders">🛍️</div>
              <div className="management-title">Order Management</div>
              <div className="management-description">Process orders, manage delivery, and track payments</div>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number">1,847</span>
                  <span className="management-stat-label">Total Orders</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">23</span>
                  <span className="management-stat-label">Pending</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">15</span>
                  <span className="management-stat-label">Processing</span>
                </div>
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/admin/suppliers')}>
              <div className="management-icon suppliers">🤝</div>
              <div className="management-title">Supplier Relations</div>
              <div className="management-description">Review applications, manage contracts, and quality control</div>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number">234</span>
                  <span className="management-stat-label">Active</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">18</span>
                  <span className="management-stat-label">Pending</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">98%</span>
                  <span className="management-stat-label">Quality Rate</span>
                </div>
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/generate-reports')}>
              <div className="management-icon reports">📊</div>
              <div className="management-title">Analytics & Reports</div>
              <div className="management-description">Generate business insights, sales reports, and performance metrics</div>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number">Rs. 2.4M</span>
                  <span className="management-stat-label">Revenue</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">+12%</span>
                  <span className="management-stat-label">Growth</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">99.5%</span>
                  <span className="management-stat-label">Uptime</span>
                </div>
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/admin/settings')}>
              <div className="management-icon settings">⚙️</div>
              <div className="management-title">System Settings</div>
              <div className="management-description">Configure platform settings, security, and integrations</div>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number">Active</span>
                  <span className="management-stat-label">System Status</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">24/7</span>
                  <span className="management-stat-label">Monitoring</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">Secure</span>
                  <span className="management-stat-label">SSL Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
