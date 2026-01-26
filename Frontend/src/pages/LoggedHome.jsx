import { useNavigate, Link } from 'react-router-dom'
import './LoggedHome.css'

function LoggedHome() {
  const navigate = useNavigate()

  const dashboards = [
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Manage inventory, orders, users, and generate reports',
      icon: '⚙️',
      path: '/admin/dashboard',
      features: ['Inventory Management', 'Order Processing', 'User Management', 'Reports & Analytics']
    },
    {
      id: 'customer',
      title: 'Customer Dashboard',
      description: 'Browse products, place orders, and track deliveries',
      icon: '🛒',
      path: '/customer/dashboard',
      features: ['Product Catalog', 'Order History', 'Wholesale Discounts', 'Track Orders']
    },
    {
      id: 'employee',
      title: 'Employee Dashboard',
      description: 'Manage inventory and review farmer applications',
      icon: '👨‍💼',
      path: '/employee/dashboard',
      features: ['Inventory Search', 'Application Review', 'Stock Management', 'Expiry Alerts']
    },
    {
      id: 'farmer',
      title: 'Farmer Dashboard',
      description: 'Submit products and manage delivery schedules',
      icon: '🌾',
      path: '/farmer/dashboard',
      features: ['Product Submission', 'Delivery Schedule', 'Order Status', 'Payment Tracking']
    }
  ]

  const handleDashboardClick = (path) => {
    navigate(path)
  }

  return (
    <div className="logged-home">
      <header className="header">
        <nav className="nav-container">
          <div className="logo">
            <img src="/images/Logo.png" alt="Laklight" />
            Laklight Food Products
          </div>
          <div className="user-info">
            <span className="welcome-text">Welcome back!</span>
            <Link to="/" className="logout-btn">Logout</Link>
          </div>
        </nav>
      </header>

      <main className="main-content">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Select Your Dashboard</h1>
            <p>Choose the appropriate dashboard to access your features and tools</p>
          </div>

          <div className="dashboard-grid">
            {dashboards.map(dashboard => (
              <div
                key={dashboard.id}
                className="dashboard-card"
                onClick={() => handleDashboardClick(dashboard.path)}
              >
                <div className="card-icon">{dashboard.icon}</div>
                <h2 className="card-title">{dashboard.title}</h2>
                <p className="card-description">{dashboard.description}</p>
                <ul className="card-features">
                  {dashboard.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <button className="access-btn">Access Dashboard</button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-bottom">
          <p>&copy; 2025 Laklight Food Products. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LoggedHome
