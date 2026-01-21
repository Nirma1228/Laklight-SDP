import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './EmployeeDashboard.css'

const EmployeeDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('inventory')
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isReviewDeliveryOpen, setIsReviewDeliveryOpen] = useState(false)
  const [isDeliveryDetailsOpen, setIsDeliveryDetailsOpen] = useState(false)
  const [currentDelivery, setCurrentDelivery] = useState(null)
  const [notifications, setNotifications] = useState([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortFilter, setSortFilter] = useState('')
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all')

  // Load reschedule notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = JSON.parse(localStorage.getItem('employee_notifications') || '[]')
      setNotifications(storedNotifications.filter(n => n.status === 'pending'))
    }
    loadNotifications()
    
    // Poll for new notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  const [profileData, setProfileData] = useState({
    firstName: 'Nimal',
    lastName: 'Fernando',
    email: 'nimal.fernando@laklights.com',
    phone: '+94 77 345 6789',
    employeeId: 'EMP-001',
    department: 'Operations',
    position: 'Inventory Manager',
    joinDate: 'January 15, 2024',
    address: '45 Galle Road',
    city: 'Colombo',
    postalCode: '00300',
    notifications: 'all',
    language: 'en'
  })

  const [farmerProducts, setFarmerProducts] = useState([
    {
      id: 1,
      name: 'Fresh Mango - Grade A',
      location: 'C03-R04 (Cold Storage A)',
      expiry: '2025-09-30',
      daysUntilExpiry: 5,
      stock: '85 kg',
      reorder: '20 kg',
      status: 'critical'
    },
    {
      id: 2,
      name: 'Pineapple Chunks',
      location: 'C02-R01 (Cold Storage B)',
      expiry: '2025-10-15',
      daysUntilExpiry: 20,
      stock: '25 kg',
      reorder: '40 kg',
      status: 'warning'
    },
    {
      id: 3,
      name: 'Fresh Papaya - Grade A',
      location: 'C01-R03 (Cold Storage A)',
      expiry: '2025-10-05',
      daysUntilExpiry: 10,
      stock: '45 kg',
      reorder: '15 kg',
      status: 'good'
    },
    {
      id: 4,
      name: 'Passion Fruit - Grade B',
      location: 'C03-R02 (Cold Storage B)',
      expiry: '2025-10-08',
      daysUntilExpiry: 13,
      stock: '32 kg',
      reorder: '20 kg',
      status: 'good'
    }
  ])

  const [finishedProducts, setFinishedProducts] = useState([
    {
      id: 1,
      name: 'Lime Mix',
      location: 'Finished Goods - Shelf A',
      batch: 'B202509',
      manufactured: '2025-09-01',
      bestBefore: '2026-04-01',
      quantity: 120,
      status: 'good'
    },
    {
      id: 2,
      name: 'Mango Jelly',
      location: 'Finished Goods - Shelf B',
      batch: 'B202508',
      manufactured: '2025-05-10',
      bestBefore: '2026-02-10',
      quantity: 50,
      status: 'warning'
    },
    {
      id: 3,
      name: 'Wood Apple Juice',
      location: 'Finished Goods - Shelf C',
      batch: 'B202507',
      manufactured: '2025-04-20',
      bestBefore: '2026-01-20',
      quantity: 80,
      status: 'unit-low'
    }
  ])

  const [supplierApplications, setSupplierApplications] = useState([
    {
      id: 1,
      farmerName: 'Mountain Fresh Farm - Badulla',
      product: 'Fresh Mango - Grade A',
      quantity: '200kg',
      price: 'LKR 180.00/kg',
      harvestDate: '2025-09-20',
      qualityGrade: 'Grade A',
      license: 'AG2025078',
      submitted: '2025-09-21',
      transport: 'Self Transport',
      date: '2025-09-25',
      images: ['Mango+1', 'Mango+2', 'Quality+Cert']
    },
    {
      id: 2,
      farmerName: 'Sunrise Plantation - Matale',
      product: 'Strawberry - Grade B',
      quantity: '80kg',
      price: 'LKR 350.00/kg',
      harvestDate: '2025-09-22',
      qualityGrade: 'Grade B',
      license: 'AG2025045',
      submitted: '2025-09-20',
      transport: 'Company Truck Pickup',
      date: '2025-09-25',
      images: ['Strawberry+1', 'Strawberry+2', 'Farm+View']
    },
    {
      id: 3,
      farmerName: 'Golden Valley Farms - Nuwara Eliya',
      product: 'Passion Fruit - Grade A',
      quantity: '60kg',
      price: 'LKR 450.00/kg',
      harvestDate: '2025-09-23',
      qualityGrade: 'Grade A',
      license: 'AG2025123',
      submitted: '2025-09-22',
      transport: 'Self Transport',
      date: '2025-09-26',
      images: ['Passion+Fruit', 'Quality+Check', 'Packaging']
    }
  ])

  const [orders, setOrders] = useState([
    {
      id: 'O001',
      customer: 'Asoka Perera',
      items: '15x Fresh Mango Cordial (Wholesale Discount Applied)',
      total: 3375.00,
      payment: 'Completed',
      status: 'Ready',
      date: 'Sept 20, 2025'
    },
    {
      id: 'O003',
      customer: 'Sarah Wilson',
      items: '8x Mixed Jam Collection',
      total: 2400.00,
      payment: 'Pending',
      status: 'Hold',
      date: 'Sept 21, 2025'
    },
    {
      id: 'O004',
      customer: 'ABC Restaurant',
      items: '25x Chili Sauce (Bulk Order - 10% Discount)',
      total: 4500.00,
      payment: 'Completed',
      status: 'Ready',
      date: 'Sept 22, 2025'
    }
  ])

  const [deliveries, setDeliveries] = useState([
    {
      id: 'DEL-001',
      farmer: 'Green Valley Farm',
      product: 'Fresh Mango - Grade A',
      quantity: '100kg',
      proposedDate: 'Oct 22, 2025',
      scheduleDate: '-',
      transport: 'Company Truck Pickup',
      status: 'pending'
    },
    {
      id: 'DEL-004',
      farmer: 'Sunrise Organic Farm',
      product: 'Papaya - Grade A',
      quantity: '80kg',
      proposedDate: 'Oct 23, 2025',
      scheduleDate: '-',
      transport: 'Self Transport',
      status: 'pending'
    },
    {
      id: 'DEL-002',
      farmer: 'Green Valley Farm',
      product: 'Strawberry - Grade A',
      quantity: '50kg',
      proposedDate: 'Oct 25, 2025',
      scheduleDate: 'Oct 25, 2025',
      transport: 'Self Transport',
      status: 'confirmed'
    },
    {
      id: 'DEL-003',
      farmer: 'Green Valley Farm',
      product: 'Pineapple - Grade B',
      quantity: '75kg',
      proposedDate: 'Oct 20, 2025',
      scheduleDate: 'Oct 20, 2025',
      transport: 'Company Truck Pickup',
      status: 'completed'
    }
  ])

  const showTab = (tabName) => {
    setActiveTab(tabName)
  }

  const approveApplication = (farmName) => {
    if (window.confirm(`Approve application from ${farmName}?\n\nThis will:\n- Accept their product submission\n- Schedule delivery pickup\n- Send confirmation to farmer`)) {
      alert(`✅ Application from ${farmName} has been approved!\n\nDelivery scheduled for next available slot.\nFarmer will receive confirmation notification.`)
      // Remove application from list
      setSupplierApplications(prev => prev.filter(app => app.farmerName !== farmName))
    }
  }

  const rejectApplication = (farmName) => {
    const reason = window.prompt(`Reject application from ${farmName}?\n\nPlease provide reason for rejection:`)
    if (reason && reason.trim()) {
      alert(`❌ Application from ${farmName} has been rejected.\n\nReason: ${reason}\n\nFarmer will receive notification with feedback.`)
      // Remove application from list
      setSupplierApplications(prev => prev.filter(app => app.farmerName !== farmName))
    }
  }

  const reviewDelivery = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId)
    if (delivery) {
      setCurrentDelivery(delivery)
      setIsReviewDeliveryOpen(true)
    }
  }

  const confirmDeliverySchedule = () => {
    if (currentDelivery) {
      alert(`Delivery schedule confirmed!\n\nDelivery ID: ${currentDelivery.id}\n\nThe farmer has been notified. The delivery is now confirmed and scheduled for pickup/delivery.`)
      
      setDeliveries(prev => prev.map(d => 
        d.id === currentDelivery.id 
          ? { ...d, status: 'confirmed', scheduleDate: d.proposedDate }
          : d
      ))
      setIsReviewDeliveryOpen(false)
      setCurrentDelivery(null)
    }
  }

  const requestScheduleChange = () => {
    if (currentDelivery) {
      const newDate = window.prompt('Enter the new proposed date (YYYY-MM-DD):')
      if (newDate) {
        alert(`Schedule change request sent to farmer.\n\nDelivery ID: ${currentDelivery.id}\nNew Proposed Date: ${newDate}\n\nThe farmer will receive a notification about the requested change.`)
        setIsReviewDeliveryOpen(false)
        setCurrentDelivery(null)
      }
    }
  }

  const viewEmployeeDeliveryDetails = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId)
    if (delivery) {

  }

  const handleApproveReschedule = (notification) => {
    const allNotifications = JSON.parse(localStorage.getItem('employee_notifications') || '[]')
    const updatedNotifications = allNotifications.map(n => 
      n.id === notification.id ? { ...n, status: 'approved' } : n
    )
    localStorage.setItem('employee_notifications', JSON.stringify(updatedNotifications))
    
    setNotifications(prev => prev.filter(n => n.id !== notification.id))
    
    alert(`✅ Reschedule approved!\n\nDelivery ${notification.deliveryId} has been rescheduled to ${notification.newDate}\nFarmer will be notified.`)
  }

  const handleRejectReschedule = (notification) => {
    const reason = window.prompt('Provide reason for rejection:')
    if (reason && reason.trim()) {
      const allNotifications = JSON.parse(localStorage.getItem('employee_notifications') || '[]')
      const updatedNotifications = allNotifications.map(n => 
        n.id === notification.id ? { ...n, status: 'rejected', rejectionReason: reason } : n
      )
      localStorage.setItem('employee_notifications', JSON.stringify(updatedNotifications))
      
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
      
      alert(`❌ Reschedule rejected!\n\nDelivery ${notification.deliveryId} will keep original date.\nFarmer will be notified with reason.`)
    }
  }

  const viewEmployeeDeliveryDetails = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId)
    if (delivery) {
      setCurrentDelivery(delivery)
      setIsDeliveryDetailsOpen(true)
    }
  }

  const acceptDate = (deliveryId) => {
    if (window.confirm(`Accept the scheduled date for delivery ${deliveryId}?`)) {
      alert(`✅ Schedule date accepted!\n\nDelivery ID: ${deliveryId}\n\nThe farmer has been notified that the delivery date is confirmed and accepted.`)
      
      setDeliveries(prev => prev.map(d => 
        d.id === deliveryId ? { ...d, status: 'completed' } : d
      ))
    }
  }

  const rescheduleDelivery = (deliveryId) => {
    const newDate = window.prompt('Enter new delivery date (e.g., Oct 26, 2025):')
    if (newDate && newDate.trim() !== '') {
      alert(`📅 Delivery rescheduled!\n\nDelivery ID: ${deliveryId}\nNew Date: ${newDate}\n\nThe farmer has been notified of the new delivery date.`)
      
      setDeliveries(prev => prev.map(d => 
        d.id === deliveryId ? { ...d, scheduleDate: newDate } : d
      ))
    }
  }

  const showAddFarmerProductModal = () => {
    const productName = window.prompt("Enter product name:")
    const quantity = window.prompt("Enter quantity (kg or units):")
    const location = window.prompt("Enter storage location (e.g., C03-R04 or Shelf A):")
    const expiryDate = window.prompt("Enter expiry date (YYYY-MM-DD):")
    
    if (productName && quantity && location && expiryDate) {
      const newProduct = {
        id: farmerProducts.length + 1,
        name: productName,
        location: location,
        expiry: expiryDate,
        daysUntilExpiry: 'N/A',
        stock: quantity,
        reorder: '0',
        status: 'good'
      }
      setFarmerProducts(prev => [...prev, newProduct])
      alert(`✅ New inventory item added!\n\nProduct: ${productName}\nQuantity: ${quantity}\nLocation: ${location}\nExpiry: ${expiryDate}`)
    }
  }

  const showAddFinishedProductModal = () => {
    const productName = window.prompt("Enter product name:")
    const quantity = window.prompt("Enter quantity:")
    const manufacturingDate = window.prompt("Enter manufacturing date (YYYY-MM-DD):")
    const location = window.prompt("Enter storage location (e.g., Shelf A):")
    const expiryDate = window.prompt("Enter best-before date (YYYY-MM-DD):")
    
    if (productName && quantity && location && expiryDate && manufacturingDate) {
      const newProduct = {
        id: finishedProducts.length + 1,
        name: productName,
        location: location,
        batch: 'B' + new Date().getFullYear() + Math.floor(Math.random() * 100),
        manufactured: manufacturingDate,
        bestBefore: expiryDate,
        quantity: parseInt(quantity),
        status: 'good'
      }
      setFinishedProducts(prev => [...prev, newProduct])
      alert(`✅ New inventory item added!\n\nProduct: ${productName}\nQuantity: ${quantity}\nLocation: ${location}\nExpiry: ${expiryDate}\nManufactured: ${manufacturingDate}`)
    }
  }

  const searchInventory = () => {
    console.log('Searching inventory:', searchTerm)
  }

  const filterDeliveries = () => {
    return deliveries.filter(delivery => {
      if (deliveryStatusFilter === 'all') return true
      return delivery.status === deliveryStatusFilter
    })
  }

  const saveProfile = () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email || 
        !profileData.phone || !profileData.address || !profileData.city || !profileData.postalCode) {
      alert('Please fill in all required fields marked with *')
      return
    }

    alert('Profile updated successfully!\n\nYour changes have been saved.')
    setIsEditProfileOpen(false)
  }

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="header">
        <nav className="nav-container">
          <Link to="/home" style={{textDecoration: 'none', color: 'white'}}>
            <div className="logo">
              <img src="/images/Logo.png" alt="Laklights Food Products" className="logo-img" />
              Laklights Food Products
            </div>
          </Link>
          <ul className="nav-menu">
            <li><Link to="/home">Dashboard</Link></li>
            <li><a href="#inventory">Inventory</a></li>
            <li><a href="#suppliers">Suppliers</a></li>
            <li><a href="#orders">Orders</a></li>
          </ul>
          <div className="user-info">
            <span>Employee: {profileData.firstName} {profileData.lastName}</span>
            <button className="btn btn-primary" onClick={() => setIsEditProfileOpen(true)}>
              Edit Profile
            </button>
            <Link to="/" className="btn btn-secondary">Logout</Link>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1 className="welcome-title">Employee Dashboard</h1>
          <p>Manage inventory, review supplier applications, and oversee manufacturing operations for Laklights Food Products.</p>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">156</div>
              <div className="stat-label">Total Inventory Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">8</div>
              <div className="stat-label">Low Stock Alerts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{supplierApplications.length}</div>
              <div className="stat-label">Pending Applications</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{orders.length}</div>
              <div className="stat-label">Orders Processing</div>
            </div>
          </div>
        </section>

        {/* Dashboard Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`} 
            onClick={() => showTab('inventory')}
          >
            Inventory Management
          </button>
          <button 
            className={`tab-button ${activeTab === 'suppliers' ? 'active' : ''}`} 
            onClick={() => showTab('suppliers')}
          >
            Supplier Applications
          </button>
          <button 
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`} 
            onClick={() => showTab('orders')}
          >
            Order Management
          </button>
          <button 
            className={`tab-button ${activeTab === 'deliveries' ? 'active' : ''}`} 
            onClick={() => showTab('deliveries')}
          >
            Delivery Schedule
          </button>
        </div>

        {/* Inventory Management Tab */}
        <div className={`tab-content ${activeTab === 'inventory' ? 'active' : ''}`}>
          {/* Reschedule Notifications */}
          {notifications.length > 0 && (
            <div className="notifications-section">
              <div className="notifications-header">
                <h3>🔔 Delivery Reschedule Requests ({notifications.length})</h3>
              </div>
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-content">
                    <h4>🔄 Delivery Reschedule Request</h4>
                    <div className="notification-details">
                      <div className="detail-row">
                        <span className="detail-label">Delivery ID:</span>
                        <span className="detail-value">{notification.deliveryId}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Product:</span>
                        <span className="detail-value">{notification.product}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Farmer:</span>
                        <span className="detail-value">{notification.farmerName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Quantity:</span>
                        <span className="detail-value">{notification.quantity || 'N/A'}</span>
                      </div>
                      <div className="date-comparison">
                        <div className="date-box current-date">
                          <label>Current Date</label>
                          <span>{notification.oldDate}</span>
                        </div>
                        <div className="date-arrow">→</div>
                        <div className="date-box requested-date">
                          <label>Requested Date</label>
                          <span>{notification.newDate}</span>
                        </div>
                      </div>
                      <p className="notification-time">
                        📅 Requested: {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="notification-actions">
                    <button 
                      className="btn btn-approve"
                      onClick={() => handleApproveReschedule(notification)}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="btn btn-reject"
                      onClick={() => handleRejectReschedule(notification)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon">📦</div>
                  <h2>Current Inventory</h2>
                </div>
              </div>

              {/* Inventory Search */}
              <div className="inventory-search">
                <div className="search-box">
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search inventory by product name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn-search" onClick={searchInventory}>
                    Search
                  </button>
                </div>
                <div className="inventory-filters">
                  <select 
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="raw">Raw Materials</option>
                    <option value="processed">Processed Products</option>
                    <option value="packaging">Packaging Materials</option>
                  </select>
                  <select 
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Stock Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                  <select 
                    className="filter-select"
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
                  >
                    <option value="">Sort By</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="stock-low">Stock: Low to High</option>
                    <option value="stock-high">Stock: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="inventory-split">
                {/* Farmer Products Column */}
                <div className="inventory-column">
                  <h3>Farmer Products</h3>
                  <button 
                    className="btn btn-primary btn-small" 
                    style={{ marginBottom: '0.5rem' }}
                    onClick={showAddFarmerProductModal}
                  >
                    Add New Item
                  </button>

                  <div className="expiry-warning" style={{ marginTop: '0.5rem' }}>
                    <strong>⚠️ Critical Alert:</strong>
                    <ul style={{ margin: '0.5rem 0 0 1.25rem', color: '#7a2c2c' }}>
                      <li>Pineapples are needed quickly.</li>
                      <li>Fresh Mango approaching expiry in 3 days.</li>
                    </ul>
                  </div>

                  {farmerProducts.map(product => (
                    <div key={product.id} className="inventory-item">
                      <div className="inventory-details">
                        <h4>{product.name}</h4>
                        <div className="inventory-location">Location: {product.location}</div>
                        <div>Expiry: {product.expiry} ({product.daysUntilExpiry} days)</div>
                      </div>
                      <div className={`stock-level stock-${product.status}`}>{product.stock}</div>
                      <div>Reorder: {product.reorder}</div>
                      <div>
                        <button className={`btn btn-${product.status === 'critical' ? 'danger' : product.status === 'warning' ? 'primary' : 'success'} btn-small`}>
                          Update
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Finished Products Column */}
                <div className="inventory-column">
                  <h3>Finished Products</h3>
                  <button 
                    className="btn btn-primary btn-small" 
                    style={{ marginBottom: '0.5rem' }}
                    onClick={showAddFinishedProductModal}
                  >
                    Add New Item
                  </button>

                  <div className="expiry-warning" style={{ marginTop: '0.5rem' }}>
                    <strong>⚠️ Critical Alert:</strong>
                    <ul style={{ margin: '0.5rem 0 0 1.25rem', color: '#7a2c2c' }}>
                      <li>Mango Jelly Stock is Low (50 units).</li>
                      <li>Wood Apple Juice stock approaching best-before in 120 days (80 units).</li>
                    </ul>
                  </div>

                  {finishedProducts.map(product => (
                    <div key={product.id} className="inventory-item">
                      <div className="inventory-details">
                        <h4>{product.name}</h4>
                        <div className="inventory-location">Location: {product.location}</div>
                        <div>Batch: {product.batch} | Manufactured: {product.manufactured} | Best Before: {product.bestBefore}</div>
                        <div>Current Quantity: {product.quantity} units</div>
                      </div>
                      <div className={`stock-level stock-${product.status}`}>{product.quantity} units</div>
                      <div>
                        <button className={`btn btn-${product.status === 'unit-low' ? 'danger' : product.status === 'warning' ? 'primary' : 'success'} btn-small`}>
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Applications Tab */}
        <div className={`tab-content ${activeTab === 'suppliers' ? 'active' : ''}`}>
          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon">🌾</div>
                  <h2>Pending Supplier Applications</h2>
                </div>
              </div>

              {supplierApplications.map(app => (
                <div key={app.id} className="application-item">
                  <div className="farmer-name">{app.farmerName}</div>
                  <p><strong>Product:</strong> {app.product}</p>
                  <p><strong>Quantity:</strong> {app.quantity} | <strong>Price:</strong> {app.price}</p>
                  <p><strong>Harvest Date:</strong> {app.harvestDate} | <strong>Quality Grade:</strong> {app.qualityGrade}</p>
                  <p><strong>License:</strong> {app.license} | <strong>Submitted:</strong> {app.submitted}</p>
                  <p><strong>Transport:</strong> {app.transport} | <strong>Date:</strong> {app.date}</p>
                  
                  <div className="submitted-images">
                    <p><strong>Submitted Images:</strong></p>
                    <div className="image-gallery">
                      {app.images.map((img, idx) => (
                        <img 
                          key={idx}
                          src={`https://via.placeholder.com/150x150?text=${img}`} 
                          alt={`Product Image ${idx + 1}`} 
                          className="product-thumbnail"
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="application-actions">
                    <button 
                      className="btn btn-success btn-small" 
                      onClick={() => approveApplication(app.farmerName)}
                    >
                      Approve & Schedule
                    </button>
                    <button 
                      className="btn btn-danger btn-small" 
                      onClick={() => rejectApplication(app.farmerName)}
                    >
                      Reject
                    </button>
                    <button className="btn btn-secondary btn-small">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Management Tab */}
        <div className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`}>
          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon">📋</div>
                  <h2>Processing Orders</h2>
                </div>
              </div>

              {orders.map(order => (
                <div key={order.id} className="inventory-item">
                  <div className="inventory-details">
                    <h4>Order #{order.id} - {order.customer}</h4>
                    <div>{order.items}</div>
                    <div>Total: LKR {order.total.toFixed(2)} | Payment: {order.payment}</div>
                  </div>
                  <div className={`stock-level stock-${order.status === 'Ready' ? 'good' : 'low'}`}>
                    {order.status}
                  </div>
                  <div>{order.date}</div>
                  <div>
                    <button className={`btn btn-${order.status === 'Ready' ? 'primary' : 'secondary'} btn-small`}>
                      {order.status === 'Ready' ? 'Process' : 'On Hold'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery Schedule Tab */}
        <div className={`tab-content ${activeTab === 'deliveries' ? 'active' : ''}`}>
          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon">🚚</div>
                  <h2>Farmer Delivery Schedule Requests</h2>
                </div>
              </div>

              <div className="inventory-filters" style={{ marginBottom: '1rem' }}>
                <select 
                  className="filter-select"
                  value={deliveryStatusFilter}
                  onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="table-container">
                <table className="delivery-schedule-table">
                  <thead>
                    <tr>
                      <th>Delivery ID</th>
                      <th>Farmer</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Proposed Date</th>
                      <th>Schedule Date</th>
                      <th>Transport</th>
                      <th>Status</th>
                      <th>Schedule Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterDeliveries().map(delivery => (
                      <tr key={delivery.id} data-status={delivery.status}>
                        <td>{delivery.id}</td>
                        <td>{delivery.farmer}</td>
                        <td>{delivery.product}</td>
                        <td>{delivery.quantity}</td>
                        <td>{delivery.proposedDate}</td>
                        <td>{delivery.scheduleDate === '-' ? '-' : <strong>{delivery.scheduleDate}</strong>}</td>
                        <td>{delivery.transport}</td>
                        <td>
                          <span className={`status-badge status-${delivery.status}`}>
                            {delivery.status === 'pending' && 'Pending Review'}
                            {delivery.status === 'confirmed' && 'Confirmed'}
                            {delivery.status === 'completed' && 'Completed'}
                            {delivery.status === 'cancelled' && 'Cancelled'}
                          </span>
                        </td>
                        <td>
                          {delivery.status === 'pending' && (
                            <button 
                              className="btn-action" 
                              onClick={() => reviewDelivery(delivery.id)}
                            >
                              Review
                            </button>
                          )}
                          {delivery.status === 'confirmed' && (
                            <>
                              <button 
                                className="btn-action" 
                                style={{ background: '#4caf50', color: 'white' }}
                                onClick={() => acceptDate(delivery.id)}
                              >
                                Accept Date
                              </button>
                              <button 
                                className="btn-action" 
                                style={{ background: '#ff9800', color: 'white', marginLeft: '0.5rem' }}
                                onClick={() => rescheduleDelivery(delivery.id)}
                              >
                                Reschedule
                              </button>
                            </>
                          )}
                          {delivery.status === 'completed' && (
                            <button 
                              className="btn-action btn-secondary" 
                              onClick={() => viewEmployeeDeliveryDetails(delivery.id)}
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Edit Profile</h2>
              <button className="close" onClick={() => setIsEditProfileOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form>
                {/* Personal Information */}
                <div className="profile-section">
                  <h3 className="section-title">Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input 
                        type="text" 
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input 
                        type="text" 
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Employee Information */}
                <div className="profile-section">
                  <h3 className="section-title">Employee Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Employee ID</label>
                      <input type="text" value={profileData.employeeId} disabled />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input type="text" value={profileData.department} disabled />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Position</label>
                      <input type="text" value={profileData.position} disabled />
                    </div>
                    <div className="form-group">
                      <label>Join Date</label>
                      <input type="text" value={profileData.joinDate} disabled />
                    </div>
                  </div>
                </div>

                {/* Contact Address */}
                <div className="profile-section">
                  <h3 className="section-title">Contact Address</h3>
                  <div className="form-group">
                    <label>Street Address *</label>
                    <input 
                      type="text" 
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input 
                        type="text" 
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code *</label>
                      <input 
                        type="text" 
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="profile-section">
                  <h3 className="section-title">Account Settings</h3>
                  <div className="form-group">
                    <label>Email Notifications</label>
                    <select 
                      value={profileData.notifications}
                      onChange={(e) => setProfileData({...profileData, notifications: e.target.value})}
                    >
                      <option value="all">All Notifications</option>
                      <option value="critical">Critical Only</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Preferred Language</label>
                    <select 
                      value={profileData.language}
                      onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                    >
                      <option value="en">English</option>
                      <option value="si">Sinhala</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setIsEditProfileOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={saveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Delivery Modal */}
      {isReviewDeliveryOpen && currentDelivery && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Review Delivery Schedule</h2>
              <button className="close" onClick={() => setIsReviewDeliveryOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ lineHeight: 2 }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Delivery Information</h3>
                <p><strong>Delivery ID:</strong> {currentDelivery.id}</p>
                <p><strong>Farmer:</strong> {currentDelivery.farmer}</p>
                <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Product Details</h3>
                <p><strong>Product:</strong> {currentDelivery.product}</p>
                <p><strong>Quantity:</strong> {currentDelivery.quantity}</p>
                <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Logistics</h3>
                <p><strong>Proposed Date:</strong> {currentDelivery.proposedDate}</p>
                <p><strong>Transport Method:</strong> {currentDelivery.transport}</p>
                <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
                <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                  <strong>Action Required:</strong> Review the delivery details and confirm the schedule or request changes if needed.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setIsReviewDeliveryOpen(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ background: '#dc3545' }}
                onClick={requestScheduleChange}
              >
                Request Change
              </button>
              <button className="btn btn-save" onClick={confirmDeliverySchedule}>
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Details Modal */}
      {isDeliveryDetailsOpen && currentDelivery && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Delivery Details</h2>
              <button className="close" onClick={() => setIsDeliveryDetailsOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ lineHeight: 2 }}>
                <p><strong>Delivery ID:</strong> {currentDelivery.id}</p>
                <p><strong>Farmer:</strong> {currentDelivery.farmer}</p>
                <p><strong>Product:</strong> {currentDelivery.product}</p>
                <p><strong>Quantity:</strong> {currentDelivery.quantity}</p>
                <p><strong>Proposed Date:</strong> {currentDelivery.proposedDate}</p>
                {currentDelivery.scheduleDate !== '-' && (
                  <p><strong>Confirmed Date:</strong> {currentDelivery.scheduleDate}</p>
                )}
                <p><strong>Transport Method:</strong> {currentDelivery.transport}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge status-${currentDelivery.status}`}>
                    {currentDelivery.status.charAt(0).toUpperCase() + currentDelivery.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setIsDeliveryDetailsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default EmployeeDashboard
