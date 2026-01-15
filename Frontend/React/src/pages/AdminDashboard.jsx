import { useState } from 'react'
import { Link } from 'react-router-dom'
import './AdminDashboard.css'

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="admin-dashboard-page">
      {/* Header */}
      <header className="header">
        <nav className="nav-container">
          <Link to="/" className="logo">
            <img src="/Logo.png" alt="Laklight" />
            Laklight Food Products
          </Link>
          <ul className="nav-menu">
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/admin/inventory">Inventory</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/reports">Reports</Link></li>
          </ul>
          <div className="user-info">
            <span className="admin-badge">Admin</span>
            <span>Administrator</span>
            <Link to="/" className="logout-btn">Logout</Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Monitor and manage all system operations</p>
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
      </main>
    </div>
  )
}

export default AdminDashboard
