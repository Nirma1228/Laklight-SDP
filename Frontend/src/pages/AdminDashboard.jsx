import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api'

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const token = getAuthToken()
        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch(`${API_BASE_URL}/admin/analytics/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setDashboardData(data.dashboard)
            setRecentOrders(data.dashboard.recentOrders || [])
          }
        } else if (response.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          navigate('/login')
        } else {
          throw new Error('Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError(error.message)
        // Set sample data as fallback
        setDashboardData({
          users: { total_users: 567, customers: 450, farmers: 87, employees: 30, active_users: 534 },
          orders: { total_orders: 1234, pending_orders: 23, delivered_orders: 1156, total_revenue: 1250000, avg_order_value: 3500 },
          products: { total_products: 156, total_stock: 8500, low_stock_products: 12, out_of_stock_products: 3 }
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    navigate('/login')
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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
            <button onClick={handleLogout} className="logout-btn" style={{cursor: 'pointer', background: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px'}}>Logout</button>
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
        {isLoading ? (
          <div className="loading-message" style={{textAlign: 'center', padding: '40px'}}>
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="error-message" style={{textAlign: 'center', padding: '40px', color: '#dc3545'}}>
            <p>Using sample data (Backend connection issue)</p>
          </div>
        ) : null}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{dashboardData?.products?.total_products || 0}</div>
            <div className="stat-label">Total Products</div>
            <div className="stat-info">{dashboardData?.products?.low_stock_products || 0} low stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{dashboardData?.orders?.total_orders || 0}</div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-info">{dashboardData?.orders?.pending_orders || 0} pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{dashboardData?.users?.active_users || 0}</div>
            <div className="stat-label">Active Users</div>
            <div className="stat-info">{dashboardData?.users?.customers || 0} customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{formatCurrency(dashboardData?.orders?.total_revenue || 0)}</div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-info">Avg: {formatCurrency(dashboardData?.orders?.avg_order_value || 0)}</div>
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
                  <p>📦 {dashboardData?.orders?.pending_orders || 0} orders pending processing</p>
                  <p>⚠️ {dashboardData?.products?.low_stock_products || 0} products low in stock</p>
                  <p>👥 {dashboardData?.users?.total_users || 0} registered users</p>
                  <p>✅ {dashboardData?.orders?.delivered_orders || 0} orders delivered</p>
                </div>
                <div className="dashboard-card">
                  <h3>Quick Actions</h3>
                  <Link to="/admin/inventory" className="btn btn-primary" style={{display: 'block', marginBottom: '10px'}}>Manage Inventory</Link>
                  <Link to="/admin/users" className="btn btn-primary" style={{display: 'block', marginBottom: '10px'}}>Manage Users</Link>
                  <Link to="/admin/orders" className="btn btn-primary" style={{display: 'block', marginBottom: '10px'}}>Process Orders</Link>
                  <Link to="/admin/reports" className="btn btn-primary" style={{display: 'block'}}>Generate Reports</Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-content">
              <h2>Recent Orders</h2>
              {recentOrders.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.order_number || order.id}</td>
                        <td>{order.customer_name || 'N/A'}</td>
                        <td>{formatCurrency(order.total_amount)}</td>
                        <td>
                          <span className={`status-badge ${order.payment_status === 'Paid' ? 'status-completed' : 'status-pending'}`}>
                            {order.payment_status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${order.order_status?.toLowerCase() || 'pending'}`}>
                            {order.order_status || 'Pending'}
                          </span>
                        </td>
                        <td>{formatDate(order.order_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{textAlign: 'center', padding: '40px', color: '#666'}}>No recent orders found</p>
              )}
              <div style={{marginTop: '20px', textAlign: 'center'}}>
                <Link to="/admin/orders" className="btn btn-primary">View All Orders</Link>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-content">
              <h2>User Management</h2>
              <div className="user-stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                <div className="stat-card">
                  <div className="stat-number">{dashboardData?.users?.total_users || 0}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{dashboardData?.users?.customers || 0}</div>
                  <div className="stat-label">Customers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{dashboardData?.users?.farmers || 0}</div>
                  <div className="stat-label">Farmers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{dashboardData?.users?.employees || 0}</div>
                  <div className="stat-label">Employees</div>
                </div>
              </div>
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
                  <span className="management-stat-number">{dashboardData?.users?.customers || 0}</span>
                  <span className="management-stat-label">Customers</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.users?.farmers || 0}</span>
                  <span className="management-stat-label">Suppliers</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.users?.employees || 0}</span>
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
                  <span className="management-stat-number">{dashboardData?.products?.total_products || 0}</span>
                  <span className="management-stat-label">Products</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.products?.low_stock_products || 0}</span>
                  <span className="management-stat-label">Low Stock</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.products?.out_of_stock_products || 0}</span>
                  <span className="management-stat-label">Out of Stock</span>
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
                  <span className="management-stat-number">{dashboardData?.orders?.total_orders || 0}</span>
                  <span className="management-stat-label">Total Orders</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.orders?.pending_orders || 0}</span>
                  <span className="management-stat-label">Pending</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.orders?.delivered_orders || 0}</span>
                  <span className="management-stat-label">Delivered</span>
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
                  <span className="management-stat-number">{formatCurrency(dashboardData?.orders?.total_revenue || 0)}</span>
                  <span className="management-stat-label">Revenue</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.orders?.total_orders || 0}</span>
                  <span className="management-stat-label">Orders</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{formatCurrency(dashboardData?.orders?.avg_order_value || 0)}</span>
                  <span className="management-stat-label">Avg Order</span>
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

      <Footer />
    </div>
  )
}

export default AdminDashboard
