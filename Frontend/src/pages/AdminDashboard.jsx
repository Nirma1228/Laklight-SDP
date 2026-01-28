import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { config } from '../config'
import Footer from '../components/Footer'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [customerFeedback, setCustomerFeedback] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adminName, setAdminName] = useState(localStorage.getItem('userName') || 'Administrator');
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    userId: null,
    status: ''
  })

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  // API base URL


  // Fetch Profile data to show correct name
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const response = await fetch(`${config.API_BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setAdminName(data.user.full_name);
            localStorage.setItem('userName', data.user.full_name);
          }
        }
      } catch (err) { console.error('Admin profile fetch error:', err); }
    };
    fetchAdminProfile();
  }, []);

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

        const response = await fetch(`${config.API_BASE_URL}/admin/analytics/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setDashboardData(data.dashboard)
            setRecentOrders(data.dashboard.recentOrders || [])
            setPendingUsers(data.dashboard.pendingUsers || [])
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

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await fetch(`${config.API_BASE_URL}/feedback/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCustomerFeedback(data.feedback)
          }
        }
      } catch (error) {
        console.error('Error fetching feedback:', error)
      }
    }

    fetchFeedback()
  }, [])

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

  const handleApproveUser = (userId) => {
    setConfirmModal({
      show: true,
      title: 'Approve User',
      message: 'Are you sure you want to approve this user? They will gain access to the platform immediately.',
      userId,
      status: 'active'
    });
  };

  const handleRejectUser = (userId) => {
    setConfirmModal({
      show: true,
      title: 'Reject User',
      message: 'Are you sure you want to reject this registration request? This action cannot be easily undone.',
      userId,
      status: 'inactive'
    });
  };

  const executeStatusUpdate = async () => {
    const { userId, status } = confirmModal;
    try {
      const token = getAuthToken();
      const response = await fetch(`${config.API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        setConfirmModal({ ...confirmModal, show: false });
      } else {
        alert('Action failed');
      }
    } catch (err) {
      console.error(err);
      alert('Action failed');
    }
  };

  return (
    <div className="admin-dashboard-container">
      <Header
        isLoggedIn={true}
        customLinks={[
          { label: 'User Management', path: '/admin/users' },
          { label: 'Inventory', path: '/admin/inventory' },
          { label: 'Orders', path: '/admin/orders' },
          { label: 'Suppliers', path: '/admin/suppliers' },
          { label: 'Reports', path: '/admin/reports' }
        ]}
      />

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
              <h3>Pending Registrations</h3>
              <Link to="/admin/users" className="btn-view-all">View All</Link>
            </div>

            {pendingUsers.length > 0 ? (
              <div className="pending-users-list">
                {pendingUsers.map(user => (
                  <div key={user.id} className="alert-item alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, margin: 0 }}>{user.full_name}</p>
                      <small style={{ textTransform: 'capitalize' }}>{user.user_type} • {new Date(user.join_date).toLocaleDateString()}</small>
                    </div>
                    <div className="action-buttons-mini" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        style={{ background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectUser(user.id)}
                        style={{ background: '#c62828', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alerts-list">
                <div className="alert-item success">
                  <p>All Cleared</p>
                  <small>No pending registration requests</small>
                </div>
                {/* Keep only critical alerts if no users */}
                <div className="alert-item warning">
                  <p>Low Stock Alert</p>
                  <small>Mango Cordial stock is running low (5 bottles remaining)</small>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Feedback Section */}
        <div className="feedback-summary-section" style={{ marginTop: '2.5rem' }}>
          <div className="section-header">
            <h3>Customer Feedback</h3>
            <span className="feedback-count">{customerFeedback.length} Reviews</span>
          </div>

          <div className="feedback-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {customerFeedback.length > 0 ? (
              customerFeedback.slice(0, 6).map((item) => (
                <div key={item.feedback_id} className="feedback-card-item" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-dark)' }}>{item.customer_name}</h4>
                      <small style={{ color: 'var(--text-light)' }}>{formatDate(item.created_at)}</small>
                    </div>
                    <div className="overall-rating-badge" style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                      ★ {((item.product_quality + item.packaging + item.delivery_time + item.customer_service + item.value_for_money) / 5).toFixed(1)}
                    </div>
                  </div>

                  <p style={{ fontStyle: 'italic', color: '#4b5563', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                    "{item.feedback_text || 'No comment provided'}"
                  </p>

                  <div className="feedback-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Quality:</span>
                      <span style={{ fontWeight: 600 }}>{item.product_quality}/5</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Packaging:</span>
                      <span style={{ fontWeight: 600 }}>{item.packaging}/5</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Delivery:</span>
                      <span style={{ fontWeight: 600 }}>{item.delivery_time}/5</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Support:</span>
                      <span style={{ fontWeight: 600 }}>{item.customer_service}/5</span>
                    </div>
                  </div>

                  {item.improvements && JSON.parse(item.improvements).length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                      <small style={{ fontWeight: 700, color: 'var(--text-dark)', display: 'block', marginBottom: '0.5rem' }}>Suggested Improvements:</small>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {JSON.parse(item.improvements).map((imp, idx) => (
                          <span key={idx} style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{imp}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '16px', color: 'var(--text-light)' }}>
                No customer feedback received yet.
              </div>
            )}
          </div>
          {customerFeedback.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button className="btn-view-all" style={{ background: 'none', border: '1px solid var(--primary-premium)', color: 'var(--primary-premium)', padding: '0.75rem 2rem', borderRadius: '50px', fontWeight: '600', cursor: 'pointer' }}>
                View All Feedback
              </button>
            </div>
          )}
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

      {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <div className="confirm-modal-icon">⚠️</div>
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>
            <div className="confirm-modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
              >
                Cancel
              </button>
              <button
                className="btn-modal-confirm"
                onClick={executeStatusUpdate}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
