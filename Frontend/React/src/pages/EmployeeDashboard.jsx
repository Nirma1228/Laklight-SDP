import { useState } from 'react'
import { useNavigate } from 'react-router-dom'







































































































































































































































































































































































































































































































































































}  }    grid-template-columns: 1fr;  .price-options {  }    grid-template-columns: repeat(2, 1fr);  .stats-grid {@media (max-width: 768px) {}  }    grid-template-columns: 1fr;  .transport-selection {  }    grid-template-columns: 1fr;  .dashboard-grid {@media (max-width: 1000px) {}  color: #c8e6c9;.footer-bottom {}  text-align: center;  margin-top: 4rem;  padding: 2rem 0 1rem;  color: white;  background: #1b5e20;.footer {}  color: #155724;  background: #d4edda;.status-completed {}  color: #004085;  background: #cce5ff;.status-scheduled {}  font-weight: bold;  font-size: 0.8rem;  border-radius: 15px;  padding: 0.3rem 0.8rem;.delivery-status {}  margin-bottom: 0.25rem;  color: #2e7d32;  font-weight: bold;.delivery-date {}  flex: 1;.delivery-details {}  box-shadow: 0 2px 8px rgba(0,0,0,0.1);.delivery-item:hover {}  transition: box-shadow 0.3s ease;  background: #f9f9f9;  margin-bottom: 1rem;  border-radius: 8px;  border: 1px solid #e0e0e0;  padding: 1rem;  align-items: center;  justify-content: space-between;  display: flex;.delivery-item {/* Delivery Items */}  color: #721c24;  background: #f8d7da;.status-not-selected {}  color: #004085;  background: #cce5ff;.status-under-review {}  color: #155724;  background: #d4edda;.status-selected {}  font-weight: bold;  font-size: 0.8rem;  border-radius: 15px;  padding: 0.3rem 0.8rem;.product-status {}  color: #2e7d32;  font-weight: bold;.product-name {}  margin-bottom: 0.5rem;  align-items: center;  justify-content: space-between;  display: flex;.product-header {}  box-shadow: 0 2px 8px rgba(0,0,0,0.1);.product-item:hover {}  transition: box-shadow 0.3s ease;  background: #f9f9f9;  margin-bottom: 1rem;  padding: 1rem;  border-radius: 10px;  border: 1px solid #e0e0e0;.product-item {/* Product Items */}  margin-bottom: 0.5rem;  color: #2e7d32;.submit-all-section h3 {}  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.1);  border: 2px solid #2196F3;  text-align: center;  margin-top: 2rem;  border-radius: 10px;  padding: 1.5rem;  background: #f0f8ff;.submit-all-section {}  margin: 2rem 0;  text-align: center;.add-more-section {}  color: #2e7d32;.transport-option.selected .transport-description {}  margin-top: 0.3rem;  color: #666;  font-size: 0.9rem;.transport-description {}  font-size: 1.1rem;  font-weight: 600;.transport-option span {}  color: #4caf50;  font-size: 2rem;.transport-option i {}  color: #2e7d32;  background: #e8f5e9;  border-color: #4caf50;.transport-option.selected {}  transform: translateY(-2px);  background: #f1f8e9;  border-color: #4caf50;.transport-option:hover {}  gap: 0.8rem;  align-items: center;  flex-direction: column;  display: flex;  transition: all 0.3s ease;  background: white;  text-align: center;  cursor: pointer;  border-radius: 12px;  border: 2px solid #e0e0e0;  padding: 1.5rem;.transport-option {}  margin-top: 0.5rem;  gap: 1rem;  grid-template-columns: 1fr 1fr;  display: grid;.transport-selection {/* Transport Selection */}  border-color: #4caf50;  outline: none;.custom-price input:focus {}  transition: border-color 0.3s ease;  font-size: 1rem;  border-radius: 8px;  border: 2px solid #e0e0e0;  padding: 0.8rem;  flex: 1;.custom-price input {}  margin-top: 1rem;  gap: 0.5rem;  align-items: center;  display: flex;.custom-price {}  font-weight: bold;  color: #2e7d32;  background: #e8f5e9;  border-color: #4caf50;.price-option.selected {}  background: #f1f8e9;  border-color: #4caf50;.price-option:hover {}  transition: all 0.3s ease;  background: white;  text-align: center;  cursor: pointer;  border-radius: 8px;  border: 2px solid #e0e0e0;  padding: 0.8rem;.price-option {}  margin-bottom: 1rem;  gap: 0.5rem;  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));  display: grid;.price-options {/* Price Range Styles */}  font-weight: 600;  margin-bottom: 1rem;  color: #2e7d32;  font-size: 1.1rem;.product-count {}  color: white;  background: #ef5350;.remove-product:hover {}  transition: all 0.3s ease;  font-size: 0.9rem;  cursor: pointer;  border-radius: 20px;  padding: 0.5rem 1rem;  border: none;  color: #d32f2f;  background: #ffebee;.remove-product {}  color: #2e7d32;  font-weight: 600;  font-size: 1.25rem;.product-form-title {}  border-bottom: 2px solid #e8f5e9;  padding-bottom: 1rem;  margin-bottom: 2rem;  align-items: center;  justify-content: space-between;  display: flex;.product-form-header {}  box-shadow: 0 4px 8px rgba(0,0,0,0.1);.product-form:hover {}  transition: all 0.3s ease;  box-shadow: 0 2px 4px rgba(0,0,0,0.05);  position: relative;  background: #fff;  margin-bottom: 2rem;  padding: 2rem;  border-radius: 10px;  border: 1px solid #e0e0e0;.product-form {/* Multiple Product Forms */}  border-color: #4caf50;  outline: none;.form-group textarea:focus {.form-group select:focus,.form-group input:focus,}  transition: border-color 0.3s ease;  font-size: 1rem;  border-radius: 8px;  border: 2px solid #e0e0e0;  padding: 0.8rem;  width: 100%;.form-group textarea {.form-group select,.form-group input,}  color: #333;  font-weight: 500;  margin-bottom: 0.5rem;  display: block;.form-group label {}  margin-bottom: 1.5rem;.form-group {}  color: #2e7d32;  font-size: 1.3rem;.card-title {}  font-size: 1.5rem;  color: white;  justify-content: center;  align-items: center;  display: flex;  border-radius: 10px;  background: linear-gradient(135deg, #4caf50, #81c784);  height: 50px;  width: 50px;.card-icon {}  margin-bottom: 1.5rem;  gap: 1rem;  align-items: center;  display: flex;.card-header {}  margin-bottom: 0;.right-column .dashboard-card {}  gap: 0.75rem;  flex-direction: column;  display: flex;.right-column {}  grid-column: 1 / -1;.dashboard-card.full-width {}  transform: translateY(-5px);.dashboard-card:hover {}  transition: transform 0.3s ease;  box-shadow: 0 5px 20px rgba(0,0,0,0.1);  padding: 2rem;  border-radius: 15px;  background: white;.dashboard-card {}  align-items: start;  margin-bottom: 2rem;  gap: 2rem;  grid-template-columns: 65% 35%;  display: grid;.dashboard-grid {}  font-size: 0.9rem;  color: #666;.stat-label {}  margin-bottom: 0.5rem;  color: #2e7d32;  font-weight: bold;  font-size: 2.5rem;.stat-number {}  transform: translateY(-3px);.stat-item:hover {}  transition: transform 0.3s ease;  box-shadow: 0 2px 10px rgba(0,0,0,0.1);  border-radius: 10px;  background: white;  padding: 1.5rem 1rem;  text-align: center;.stat-item {}  margin-bottom: 2rem;  gap: 1rem;  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));  display: grid;.stats-grid {}  color: #856404;  background: #fff3cd;.status-pending {}  color: #155724;  background: #d4edda;.status-approved {}  margin: 1rem 0;  font-weight: bold;  border-radius: 20px;  padding: 0.5rem 1rem;  display: inline-block;.approval-status {}  margin-bottom: 0.5rem;  color: #2e7d32;  font-size: 2rem;.welcome-title {}  box-shadow: 0 5px 20px rgba(0,0,0,0.1);  margin-bottom: 2rem;  padding: 2rem;  border-radius: 15px;  background: white;.welcome-section {}  padding: 100px 2rem 2rem;  margin: 0 auto;  max-width: 1200px;.dashboard {/* Dashboard Content */}  border-style: solid;  background: #c8e6c9;.btn-add:hover {}  gap: 0.5rem;  align-items: center;  display: inline-flex;  transition: all 0.3s ease;  border: 2px dashed #4caf50;  color: #2e7d32;  background: #e8f5e9;.btn-add {}  background: #388e3c;.btn-success:hover {}  color: white;  background: #4caf50;.btn-success {}  color: #2e7d32;  background: white;.btn-secondary:hover {}  border: 2px solid white;  color: white;  background: transparent;.btn-secondary {}  transition: all 0.3s ease;  text-align: center;  display: inline-block;  text-decoration: none;  font-weight: 500;  cursor: pointer;  border-radius: 25px;  border: none;  padding: 0.7rem 1.5rem;.btn {}  font-weight: 600;  color: #c8e6c9;.farm-welcome {}  gap: 1rem;  align-items: center;  display: flex;.user-info {}  gap: 0.5rem;  font-weight: bold;  font-size: 1.6rem;  align-items: center;  display: flex;.logo {}  padding: 0 2rem;  align-items: center;  justify-content: space-between;  display: flex;  margin: 0 auto;  max-width: 1200px;.nav-container {}  z-index: 1000;  width: 100%;  top: 0;  position: fixed;  box-shadow: 0 2px 10px rgba(0,0,0,0.1);  padding: 1rem 0;  color: white;  background: linear-gradient(135deg, rgb(132, 213, 147) 0%, #4caf50 100%);.header {}  background: #f8f9fa;  min-height: 100vh;import './EmployeeDashboard.css'

function EmployeeDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('inventory')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  // Sample inventory data
  const farmerInventory = [
    { id: 1, name: 'Fresh Tomatoes', type: 'farmer', quantity: 250, unit: 'kg', location: 'A1', status: 'good', expiryDate: '2024-02-15' },
    { id: 2, name: 'Green Beans', type: 'farmer', quantity: 180, unit: 'kg', location: 'A2', status: 'good', expiryDate: '2024-02-10' },
    { id: 3, name: 'Carrots', type: 'farmer', quantity: 120, unit: 'kg', location: 'B1', status: 'warning', expiryDate: '2024-02-05' }
  ]

  const finishedInventory = [
    { id: 4, name: 'Tomato Sauce', type: 'finished', quantity: 60, unit: 'units', location: 'C1', status: 'low', expiryDate: '2024-06-15' },
    { id: 5, name: 'Carrot Juice', type: 'finished', quantity: 150, unit: 'units', location: 'C2', status: 'good', expiryDate: '2024-05-20' },
    { id: 6, name: 'Bean Salad', type: 'finished', quantity: 85, unit: 'units', location: 'C3', status: 'good', expiryDate: '2024-04-10' }
  ]

  // Sample farmer applications
  const farmerApplications = [
    { 
      id: 1, 
      farmerName: 'John Silva', 
      farmName: 'Silva Organic Farm',
      product: 'Organic Tomatoes', 
      quantity: 500, 
      unit: 'kg',
      pricePerUnit: 350,
      date: '2024-01-20',
      quality: 'A Grade',
      status: 'pending',
      images: ['🍅', '🍅', '🍅']
    },
    { 
      id: 2, 
      farmerName: 'Mary Fernando', 
      farmName: 'Fernando Greens',
      product: 'Fresh Carrots', 
      quantity: 300, 
      unit: 'kg',
      pricePerUnit: 220,
      date: '2024-01-21',
      quality: 'Premium',
      status: 'pending',
      images: ['🥕', '🥕']
    },
    { 
      id: 3, 
      farmerName: 'David Perera', 
      farmName: 'Perera Dairy Farm',
      product: 'Fresh Milk', 
      quantity: 200, 
      unit: 'L',
      pricePerUnit: 380,
      date: '2024-01-19',
      quality: 'A Grade',
      status: 'approved',
      images: ['🥛', '🥛', '🥛']
    }
  ]

  const handleApproveApplication = (id) => {
    alert(`Application ${id} approved!`)
  }

  const handleRejectApplication = (id) => {
    if (confirm('Are you sure you want to reject this application?')) {
      alert(`Application ${id} rejected!`)
    }
  }

  const filteredInventory = [...farmerInventory, ...finishedInventory].filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.type === categoryFilter
    const matchesLocation = locationFilter === 'all' || item.location.startsWith(locationFilter)
    return matchesSearch && matchesCategory && matchesLocation
  })

  const pendingApplications = farmerApplications.filter(app => app.status === 'pending')

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <div className="header">
        <div className="nav-container">
          <div className="logo">
            <span>🌿</span>
            Laklight Food Products
          </div>
          <div className="user-info">
            <span>Welcome, Employee!</span>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>Logout</button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard">
        <div className="welcome-section">
          <h1 className="welcome-title">Employee Dashboard</h1>
          <p>Manage inventory and review farmer applications.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{farmerInventory.length}</div>
            <div className="stat-label">Farmer Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{finishedInventory.length}</div>
            <div className="stat-label">Finished Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{pendingApplications.length}</div>
            <div className="stat-label">Pending Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{farmerApplications.filter(a => a.status === 'approved').length}</div>
            <div className="stat-label">Approved Today</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📦 Inventory Management
          </button>
          <button 
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            📋 Farmer Applications ({pendingApplications.length})
          </button>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="tab-content active">
            {/* Search and Filters */}
            <div className="inventory-search">
              <div className="search-box">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search inventory..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn-search">
                  <i className="fas fa-search"></i>
                  Search
                </button>
              </div>
              <div className="inventory-filters">
                <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="farmer">Farmer Products</option>
                  <option value="finished">Finished Products</option>
                </select>
                <select className="filter-select" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  <option value="all">All Locations</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            {/* Inventory Split View */}
            <div className="inventory-split">
              {/* Farmer Products */}
              <div className="inventory-column">
                <h3>🌾 Farmer Products</h3>
                {filteredInventory.filter(item => item.type === 'farmer').map(item => (
                  <div key={item.id} className="inventory-item">
                    <div className="inventory-details">
                      <h4>{item.name}</h4>
                      <div className="inventory-location">Location: {item.location} | Expires: {item.expiryDate}</div>
                    </div>
                    <span className={`stock-level stock-${item.status}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Finished Products */}
              <div className="inventory-column">
                <h3>📦 Finished Products</h3>
                {filteredInventory.filter(item => item.type === 'finished').map(item => (
                  <div key={item.id} className="inventory-item">
                    <div className="inventory-details">
                      <h4>{item.name}</h4>
                      <div className="inventory-location">Location: {item.location} | Expires: {item.expiryDate}</div>
                    </div>
                    <span className={`stock-level ${item.status === 'low' ? 'unit-low' : 'stock-' + item.status}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Farmer Applications Tab */}
        {activeTab === 'applications' && (
          <div className="tab-content active">
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon">👨‍🌾</div>
                  <h2>Pending Farmer Applications</h2>
                </div>
              </div>
              {farmerApplications.filter(app => app.status === 'pending').map(application => (
                <div key={application.id} className="application-item">
                  <div className="application-header">
                    <div>
                      <div className="farmer-name">{application.farmerName} - {application.farmName}</div>
                      <div>Product: <strong>{application.product}</strong></div>
                      <div>Quantity: {application.quantity} {application.unit} @ Rs. {application.pricePerUnit}/{application.unit}</div>
                      <div>Quality: {application.quality} | Date: {application.date}</div>
                    </div>
                  </div>
                  <div className="submitted-images">
                    <p>Product Images:</p>
                    <div className="image-gallery">
                      {application.images.map((img, idx) => (
                        <div key={idx} className="product-thumbnail" style={{fontSize: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5e9'}}>
                          {img}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="application-actions">
                    <button className="btn btn-success btn-small" onClick={() => handleApproveApplication(application.id)}>
                      ✓ Approve
                    </button>
                    <button className="btn btn-danger btn-small" onClick={() => handleRejectApplication(application.id)}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-bottom">
          <p>&copy; 2024 Laklight Food Products. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard
