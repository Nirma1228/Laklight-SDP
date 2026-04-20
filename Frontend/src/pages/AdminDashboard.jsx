import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { config } from '../config'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import { formatSriLankanDate } from '../utils/dateFormatter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChartLine, faShoppingCart, faUsers, faTruckLoading,
  faBoxes, faClipboardList, faUserTie, faCogs, faDatabase,
  faChartBar, faStore, faBoxOpen, faUser, faHandshake,
  faBox, faExclamationTriangle, faClock, faCheckCircle,
  faTags, faHourglassHalf, faSync, faStar, faMoneyBillWave,
  faShieldAlt, faDesktop, faLock, faLeaf, faCubes, faBell,
  faExclamationCircle, faHome, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [customerFeedback, setCustomerFeedback] = useState([])
  const [farmerProducts, setFarmerProducts] = useState([])
  const [finishedProducts, setFinishedProducts] = useState([])
  const [alertCount, setAlertCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardAlerts, setDashboardAlerts] = useState([])
  const [adminName, setAdminName] = useState(localStorage.getItem('userName') || 'Administrator');
  const [showRecentOrders, setShowRecentOrders] = useState(false)
  const [showPendingRegistrations, setShowPendingRegistrations] = useState(false)
  const [showCustomerFeedback, setShowCustomerFeedback] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
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

    const fetchInventoryAlerts = async () => {
      try {
        const token = getAuthToken();
        const [resF, resP] = await Promise.all([
          fetch(`${config.API_BASE_URL}/admin/inventory/farmer-products`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${config.API_BASE_URL}/admin/inventory/finished-products`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (resF.ok && resP.ok) {
          const [dataF, dataP] = await Promise.all([resF.json(), resP.json()]);
          const fp = dataF.products || [];
          const pp = dataP.products || [];
          setFarmerProducts(fp);
          setFinishedProducts(pp);

          // Calculate alert count correctly using unique IDs (with prefixes to avoid collision between categories)
          const lowStockFarmer = fp.filter(p => (p.total_stock || p.batches.reduce((s, b) => s + (b.stockRaw || 0), 0)) < 50);
          const lowStockFinished = pp.filter(p => (p.total_stock || p.batches.reduce((s, b) => s + (b.quantity || 0), 0)) < 50);
          
          const expiringFarmer = fp.filter(p => p.batches.some(b => b.daysUntilExpiry <= 7));
          const expiringFinished = pp.filter(p => p.batches.some(b => {
            if (!b.bestBefore) return false;
            const days = Math.ceil((new Date(b.bestBefore) - new Date()) / (1000 * 60 * 60 * 24));
            return days <= 7;
          }));

          const uniqueAlertIds = new Set([
            ...lowStockFarmer.map(p => `f_${p.productId || p.id}`),
            ...lowStockFinished.map(p => `p_${p.productId || p.id}`),
            ...expiringFarmer.map(p => `f_${p.productId || p.id}`),
            ...expiringFinished.map(p => `p_${p.productId || p.id}`)
          ]);

          setAlertCount(uniqueAlertIds.size);

          // Generate dashboard alerts like employee dashboard
          const alerts = [];
          const today = new Date();
          
          // Low stock (Raw)
          lowStockFarmer.forEach(p => {
            alerts.push({
              id: `low-raw-${p.productId || p.id}`,
              type: 'danger',
              title: 'CRITICALLY LOW STOCK',
              message: `${p.name}: only ${p.total_stock || 0}kg remaining. Restock urgently.`,
              icon: faExclamationTriangle,
              color: '#d32f2f'
            });
          });

          // Low stock (Finished)
          lowStockFinished.forEach(p => {
            alerts.push({
              id: `low-fin-${p.productId || p.id}`,
              type: 'danger',
              title: 'LOW STOCK: FINISHED GOODS',
              message: `${p.productName || p.name}: only ${p.total_stock || 0} units left in inventory.`,
              icon: faExclamationCircle,
              color: '#d32f2f'
            });
          });

          // Expiry alerts
          expiringFarmer.forEach(p => {
            alerts.push({
              id: `exp-raw-${p.productId || p.id}`,
              type: 'warning',
              title: 'EXPIRY ALERT: RAW MATERIAL',
              message: `${p.name} batch is expiring within 7 days. Use immediately.`,
              icon: faClock,
              color: '#ed6c02'
            });
          });

          expiringFinished.forEach(p => {
            alerts.push({
              id: `exp-fin-${p.productId || p.id}`,
              type: 'warning',
              title: 'EXPIRING SOON: FINISHED PRODUCT',
              message: `${p.productName || p.name} is reaching its best before date soon.`,
              icon: faHourglassHalf,
              color: '#ed6c02'
            });
          });

          setDashboardAlerts(alerts);
        }
      } catch (err) { console.error('Alert fetch error:', err); }
    };

    fetchFeedback();
    fetchInventoryAlerts();
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
    return formatSriLankanDate(dateString);
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

  const { success, error: toastError } = useToast()

  const handleResetDatabase = async () => {
    if (!window.confirm('CRITICAL ACTION: This will delete ALL current transactions, users, and products, and reset IDs to start from 1. Proceed?')) return;

    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${config.API_BASE_URL}/admin/maintenance/seed`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        success(data.message);
        setTimeout(() => window.location.reload(), 2000); // Wait for toast
      } else {
        toastError('Reset failed: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      toastError('Maintenance failed');
    } finally {
      setIsLoading(false);
    }
  };

  const executeStatusUpdate = async () => {
    const { userId, status } = confirmModal;
    try {
      const token = getAuthToken();
      const response = await fetch(`${config.API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        setConfirmModal({ ...confirmModal, show: false });
        success(`User account ${status === 'active' ? 'approved' : 'rejected'} successfully`);
        // Refresh dashboard statistics after update
        fetchDashboardData();
      } else {
        toastError(data.message || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      toastError('Action failed');
    }
  };

  return (
    <div className="admin-dashboard-container">
      <Header
        isLoggedIn={true}
        customLinks={[]}
      />

      {/* Notification Dropdown Panel */}
      {showNotificationPanel && (
        <div className="notif-dropdown-panel" onClick={(e) => e.stopPropagation()}>
          <div className="notif-panel-header">
            <h3>System Notifications</h3>
            <button className="close-panel-btn" onClick={() => setShowNotificationPanel(false)}>&times;</button>
          </div>
          <div className="notif-panel-content">
            {alertCount === 0 ? (
              <div className="no-notifications">
                <i className="fas fa-check-circle"></i>
                <p>No critical issues detected.</p>
              </div>
            ) : (
              <>
                {/* Low Stock Section */}
                {[...farmerProducts.filter(p => (p.total_stock || 0) < 50), 
                  ...finishedProducts.filter(p => (p.total_stock || 0) < 50)].length > 0 && (
                  <div className="notif-section">
                    <h4 className="section-type low-stock"><i className="fas fa-exclamation-triangle"></i> Low Stock Items</h4>
                    {[...farmerProducts.filter(p => (p.total_stock || 0) < 50), 
                      ...finishedProducts.filter(p => (p.total_stock || 0) < 50)].map((item, idx) => (
                      <div key={`low-${idx}`} className="notif-item" onClick={() => navigate('/admin/inventory')}>
                        <span className="item-name">{item.name || item.productName}</span>
                        <span className="item-status status-critical">Only {item.total_stock} left</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expiring Section */}
                {[...farmerProducts.filter(p => p.batches?.some(b => b.daysUntilExpiry <= 7)),
                  ...finishedProducts.filter(p => p.batches?.some(b => {
                    if (!b.bestBefore) return false;
                    const days = Math.ceil((new Date(b.bestBefore) - new Date()) / (1000 * 60 * 60 * 24));
                    return days <= 7;
                  }))].length > 0 && (
                  <div className="notif-section">
                    <h4 className="section-type expire-soon"><i className="fas fa-hourglass-half"></i> Expiring Soon</h4>
                    {[...farmerProducts.filter(p => p.batches?.some(b => b.daysUntilExpiry <= 7)),
                      ...finishedProducts.filter(p => p.batches?.some(b => {
                        if (!b.bestBefore) return false;
                        const days = Math.ceil((new Date(b.bestBefore) - new Date()) / (1000 * 60 * 60 * 24));
                        return days <= 7;
                      }))].map((item, idx) => (
                      <div key={`exp-${idx}`} className="notif-item" onClick={() => navigate('/admin/inventory')}>
                        <span className="item-name">{item.name || item.productName}</span>
                        <span className="item-status status-warning">Expires in 7 days or less</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="notif-panel-footer">
            <button className="view-all-btn" onClick={() => navigate('/admin/inventory')}>View All Inventory</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="admin-dashboard-content">
        {/* Inventory Critical Alerts like Employee Dashboard */}
        {dashboardAlerts.length > 0 && (
          <div className="dashboard-alerts-section">
            <h2 className="alerts-heading">
              <FontAwesomeIcon icon={faExclamationTriangle} color="#d32f2f" />
              Critical Inventory Alerts
            </h2>
            <div className="dashboard-alerts-container">
              {dashboardAlerts.map(alert => (
                <div key={alert.id} className={`dashboard-alert card-alert-${alert.type}`} onClick={() => navigate('/admin/inventory')}>
                  <div className="alert-header">
                    <FontAwesomeIcon icon={alert.icon} />
                    <span className="alert-title">{alert.title}</span>
                  </div>
                  <p className="alert-body">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="page-header-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <h1>Admin Dashboard</h1>
              <p>Complete system overview and management controls for Laklight Food Products digital platform.</p>
            </div>
          </div>
          <div className="page-header-actions">
            <button className={`btn-toggle-view ${showRecentOrders ? 'active' : ''}`} onClick={() => setShowRecentOrders(!showRecentOrders)}>
              <FontAwesomeIcon icon={faShoppingCart} /> 
              <span>{showRecentOrders ? 'Hide' : 'Recent'} Orders</span>
            </button>
            <button className={`btn-toggle-view ${showPendingRegistrations ? 'active' : ''}`} onClick={() => setShowPendingRegistrations(!showPendingRegistrations)}>
              <FontAwesomeIcon icon={faUsers} /> 
              <span>{showPendingRegistrations ? 'Hide' : 'Show'} Pending</span>
            </button>
            <button className={`btn-toggle-view ${showCustomerFeedback ? 'active' : ''}`} onClick={() => setShowCustomerFeedback(!showCustomerFeedback)}>
              <FontAwesomeIcon icon={faStar} /> 
              <span>{showCustomerFeedback ? 'Hide' : 'Review'} Feedback</span>
            </button>
          </div>
        </div>

        {/* Stats Grid Removed */}
        
        {/* Recent Orders and System Alerts */}
        {(showRecentOrders || showPendingRegistrations) && (
          <div className="dashboard-row fade-in">
            {showRecentOrders && (
              <div className="recent-orders-section">
                <div className="section-header">
                  <h3>Recent Orders</h3>
                  <Link to="/admin/orders" className="btn-view-all">View All Orders</Link>
                </div>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Reference No</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td><span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', fontFamily: 'monospace' }}>{order.order_number || `ORD-${order.id}`}</span></td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{order.customer_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.phone || 'N/A'}</div>
                          </td>
                          <td>{formatCurrency(order.net_amount || order.total_amount)}</td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>{order.payment_method || 'Stripe'}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{formatDate(order.order_date)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center' }}>No recent orders found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {showPendingRegistrations && (
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
                          <small style={{ textTransform: 'capitalize' }}>{user.user_type} • {formatSriLankanDate(user.join_date)}</small>
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
            )}
          </div>
        )}

        {/* Customer Feedback Section */}
        {showCustomerFeedback && (
          <div className="feedback-summary-section fade-in" style={{ marginTop: '2.5rem' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <small style={{ color: 'var(--text-light)' }}>{formatDate(item.created_at)}</small>
                          {item.order_number && (
                            <span style={{ fontSize: '0.7rem', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold', color: '#475569' }}>
                              Order #{item.order_number}
                            </span>
                          )}
                        </div>
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

                    {item.improvements && (typeof item.improvements === 'string' ? JSON.parse(item.improvements || '[]') : item.improvements).length > 0 && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                        <small style={{ fontWeight: 700, color: 'var(--text-dark)', display: 'block', marginBottom: '0.5rem' }}>Suggested Improvements:</small>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(typeof item.improvements === 'string' ? JSON.parse(item.improvements || '[]') : item.improvements).map((imp, idx) => (
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
        )}

        {/* System Management Section */}

        {/* System Management Section */}
        <div className="system-management-section">
          <div className="section-header-centered">
            <h2>System Management</h2>
            <p>Access all administrative functions and system controls</p>
          </div>
          <div className="management-grid">
            <div className="management-card" onClick={() => navigate('/admin/users')}>
              <div className="management-card-header">
                <div className="icon-circle icon-blue">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <h3 className="management-title">User Management</h3>
              </div>
              <p className="management-description">Manage customers, suppliers, and employees accounts</p>
              <div className="management-stats">
              </div>
            </div>

            <div className="management-card" style={{ border: '2px solid #ef4444' }} onClick={() => navigate('/admin/inventory')}>
              <div className="management-card-header">
                <div className="icon-circle icon-green">
                  <FontAwesomeIcon icon={faBoxes} />
                </div>
                <h3 className="management-title">Inventory Control</h3>
              </div>
              <p className="management-description">Monitor stock levels, warehouse locations, and product expiry</p>
              <div className="management-stats">
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                <button 
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/admin/inventory', { state: { filter: 'low-stock' } });
                  }}
                >
                  <FontAwesomeIcon icon={faBell} />
                  View Low Stock & Expire Notifications
                </button>
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/products')}>
              <div className="management-card-header">
                <div className="icon-circle icon-teal">
                  <FontAwesomeIcon icon={faStore} />
                </div>
                <h3 className="management-title">Product Catalog</h3>
              </div>
              <p className="management-description">Add, edit, and manage products with pricing controls</p>
              <div className="management-stats">
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/admin/orders')}>
              <div className="management-card-header">
                <div className="icon-circle icon-orange">
                  <FontAwesomeIcon icon={faClipboardList} />
                </div>
                <h3 className="management-title">Order Management</h3>
              </div>
              <p className="management-description">Process orders, manage delivery, and track payments</p>
              <div className="management-stats">
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/admin/suppliers')}>
              <div className="management-card-header">
                <div className="icon-circle icon-purple">
                  <FontAwesomeIcon icon={faUserTie} />
                </div>
                <h3 className="management-title">Supplier Relations</h3>
              </div>
              <p className="management-description">Review applications, manage contracts, and quality control</p>
              <div className="management-stats">
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/generate-reports')}>
              <div className="management-card-header">
                <div className="icon-circle icon-red">
                  <FontAwesomeIcon icon={faChartBar} />
                </div>
                <h3 className="management-title">Analytics & Reports</h3>
              </div>
              <p className="management-description">Generate business insights, sales reports, and performance metrics</p>
              <div className="management-stats">
              </div>
            </div>

            <div className="management-card" onClick={() => navigate('/admin/settings')}>
              <div className="management-card-header">
                <div className="icon-circle icon-gray">
                  <FontAwesomeIcon icon={faCogs} />
                </div>
                <h3 className="management-title">System Settings</h3>
              </div>
              <p className="management-description">Configure platform settings, security, and integrations</p>
              <div className="management-stats">
                <div className="management-stat">
                  <span className="management-stat-number green-text">Active</span>
                  <span className="management-stat-label">
                    <FontAwesomeIcon icon={faShieldAlt} /> Status
                  </span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number">24/7</span>
                  <span className="management-stat-label">
                    <FontAwesomeIcon icon={faDesktop} /> Monitoring
                  </span>
                </div>
                <div className="management-stat">
                  <span className="management-stat-number green-text">Secure</span>
                  <span className="management-stat-label">
                    <FontAwesomeIcon icon={faLock} /> Protection
                  </span>
                </div>
              </div>
            </div>

            <div className="management-card maintenance-card" onClick={handleResetDatabase}>
              <div className="management-card-header">
                <div className="icon-circle icon-yellow">
                  <FontAwesomeIcon icon={faDatabase} />
                </div>
                <h3 className="management-title">Database Maintenance</h3>
              </div>
              <p className="management-description">Clean up system data and reset IDs for report generation testing</p>
              <div className="management-stats" style={{ color: '#92400e', fontWeight: '600', fontSize: '0.85rem' }}>
                <FontAwesomeIcon icon={faDatabase} style={{ marginRight: '8px' }} />
                Click to Reset & Seed Data
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
