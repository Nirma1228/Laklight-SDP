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
    navigate('/')
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
    <div className="admin-dashboard-container">
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
            <span className="admin-badge">ADMIN</span>
            <span>Administrator</span>
            <button onClick={handleLogout} className="logout-btn-header">Logout</button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="admin-dashboard-content">
        <div className="page-header-section">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Complete system overview and management controls for Laklight Food Products digital platform.</p>
          </div>
          <div className="page-header-actions">
            <Link to="/generate-reports" className="btn-generate">Generate Report</Link>
            <Link to="/admin/settings" className="btn-settings">System Settings</Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-revenue">
            <div className="stat-icon"></div>
            <div className="stat-value">Rs. {((dashboardData?.orders?.total_revenue || 1250000) / 1000000).toFixed(1)}M</div>
            <div className="stat-label">Monthly Revenue</div>
            <div className="stat-change positive">+12% from last month</div>
          </div>
          <div className="stat-card stat-orders">
            <div className="stat-icon"></div>
            <div className="stat-value">{dashboardData?.orders?.total_orders || 1234}</div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-change positive">+8% from last month</div>
          </div>
          <div className="stat-card stat-customers">
            <div className="stat-icon"></div>
            <div className="stat-value">{dashboardData?.users?.customers || 450}</div>
            <div className="stat-label">Active Customers</div>
            <div className="stat-change positive">+15% from last month</div>
          </div>
          <div className="stat-card stat-suppliers">
            <div className="stat-icon"></div>
            <div className="stat-value">{dashboardData?.users?.farmers || 87}</div>
            <div className="stat-label">Registered Suppliers</div>
            <div className="stat-change positive">+5% from last month</div>
          </div>
        </div>

        {/* Recent Orders and System Alerts */}
        <div className="dashboard-row">
          <div className="recent-orders-section">
            <div className="section-header">
              <h3>Recent Orders</h3>
              <Link to="/admin/orders" className="btn-view-all">View All Orders</Link>
            </div>
            <table className="orders-table">
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
                  <td>LF2025-1847</td>
                  <td>Nimal Silva</td>
                  <td>Rs. 3,450</td>
                  <td><span className="status-badge delivered">Delivered</span></td>
                  <td>Mar 20, 2025</td>
                </tr>
                <tr>
                  <td>LF2025-1846</td>
                  <td>Maria Fernando</td>
                  <td>Rs. 1,280</td>
                  <td><span className="status-badge processing">Processing</span></td>
                  <td>Mar 20, 2025</td>
                </tr>
                <tr>
                  <td>LF2025-1845</td>
                  <td>ABC store</td>
                  <td>Rs. 12,640</td>
                  <td><span className="status-badge delivered">Delivered</span></td>
                  <td>Mar 19, 2025</td>
                </tr>
                <tr>
                  <td>LF2025-1844</td>
                  <td>Colombo Restaurant</td>
                  <td>Rs. 8,750</td>
                  <td><span className="status-badge pending">Pending</span></td>
                  <td>Mar 19, 2025</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="system-alerts-section">
            <div className="section-header">
              <h3>System Alerts</h3>
            </div>
            <div className="alerts-list">
              <div className="alert-item warning">
                <p>Low Stock Alert</p>
                <small>Mango Cordial stock is running low (5 bottles remaining)</small>
              </div>
              <div className="alert-item success">
                <p>New Supplier Application</p>
                <p>Fresh Farms Ltd. has submitted a new supplier application</p>
              </div>
              <div className="alert-item alert-info">
                <h4>Expiry Notice</h4>
                <p>3 products expiring within next 7 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Management Section */}
        <div className="system-management-section">
          <div className="section-header-centered">
            <h2>System Management</h2>
            <p>Access all administrative functions and system controls</p>
          </div>
          <div className="management-grid">
            <div className="management-card" onClick={() => navigate('/admin/users')}>
              <div className="management-icon blue">
                <span></span>
              </div>
              <h3 className="management-title">User Management</h3>
              <p className="management-description">Manage customers, suppliers, and employees accounts</p>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.users?.customers || 1523}</span>
                  <span className="management-stat-label">Customers</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.users?.farmers || 234}</span>
                  <span className="management-stat-label">Suppliers</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.users?.employees || 45}</span>
                  <span className="management-stat-label">Employees</span>
                </div>
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/admin/inventory')}>
              <div className="management-icon green">
                <span></span>
              </div>
              <h3 className="management-title">Inventory Control</h3>
              <p className="management-description">Monitor stock levels, warehouse locations, and product expiry</p>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.products?.total_products || 156}</span>
                  <span className="management-stat-label">Products</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.products?.low_stock_products || 12}</span>
                  <span className="management-stat-label">Low Stock</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.products?.out_of_stock_products || 3}</span>
                  <span className="management-stat-label">Expiring</span>
                </div>
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/products')}>
              <div className="management-icon lime">
                <span></span>
              </div>
              <h3 className="management-title">Product Catalog</h3>
              <p className="management-description">Add, edit, and manage products with pricing controls</p>
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
              <div className="management-icon orange">
                <span></span>
              </div>
              <h3 className="management-title">Order Management</h3>
              <p className="management-description">Process orders, manage delivery, and track payments</p>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.orders?.total_orders || 1847}</span>
                  <span className="management-stat-label">Total Orders</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">{dashboardData?.orders?.pending_orders || 23}</span>
                  <span className="management-stat-label">Pending</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">15</span>
                  <span className="management-stat-label">Processing</span>
                </div>
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/admin/suppliers')}>
              <div className="management-icon purple">
                <span></span>
              </div>
              <h3 className="management-title">Supplier Relations</h3>
              <p className="management-description">Review applications, manage contracts, and quality control</p>
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
              <div className="management-icon red">
                <span></span>
              </div>
              <h3 className="management-title">Analytics & Reports</h3>
              <p className="management-description">Generate business insights, sales reports, and performance metrics</p>
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
              <div className="management-icon gray">
                <span></span>
              </div>
              <h3 className="management-title">System Settings</h3>
              <p className="management-description">Configure platform settings, security, and integrations</p>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number green-text">Active</span>
                  <span className="management-stat-label">System Status</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">24/7</span>
                  <span className="management-stat-label">Monitoring</span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number green-text">Secure</span>
                  <span className="management-stat-label">Data Protection</span>
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
