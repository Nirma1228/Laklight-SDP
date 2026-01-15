import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminInventory.css'

function AdminInventory() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('fruits')

  const [fruitInventory] = useState([
    { id: 1, name: 'Fresh Strawberry - Grade A', type: 'fruit', stock: 15, unit: 'kg', location: 'A-C1-R2', expiryDate: '2024-02-15', status: 'good', batch: 'BATCH-001' },
    { id: 2, name: 'Organic Mango - Premium', type: 'fruit', stock: 25, unit: 'kg', location: 'A-C2-R1', expiryDate: '2024-02-20', status: 'good', batch: 'BATCH-002' },
    { id: 3, name: 'Fresh Banana - Local', type: 'fruit', stock: 8, unit: 'kg', location: 'B-C1-R3', expiryDate: '2024-02-05', status: 'critical', batch: 'BATCH-003' },
    { id: 4, name: 'Green Apple - Imported', type: 'fruit', stock: 12, unit: 'kg', location: 'A-C3-R2', expiryDate: '2024-02-18', status: 'good', batch: 'BATCH-004' },
    { id: 5, name: 'Orange - Valencia', type: 'fruit', stock: 18, unit: 'kg', location: 'B-C2-R1', expiryDate: '2024-02-12', status: 'warning', batch: 'BATCH-005' }
  ])

  const [productInventory] = useState([
    { id: 11, name: 'Strawberry Jam - 500g', type: 'product', stock: 45, unit: 'units', location: 'C-C1-R1', expiryDate: '2024-08-15', status: 'good', batch: 'PROD-001' },
    { id: 12, name: 'Mango Juice - 1L', type: 'product', stock: 60, unit: 'units', location: 'C-C1-R2', expiryDate: '2024-06-20', status: 'good', batch: 'PROD-002' },
    { id: 13, name: 'Banana Chips - 200g', type: 'product', stock: 22, unit: 'units', location: 'C-C2-R1', expiryDate: '2024-05-10', status: 'low', batch: 'PROD-003' },
    { id: 14, name: 'Apple Cider - 750ml', type: 'product', stock: 38, unit: 'units', location: 'C-C2-R2', expiryDate: '2024-07-25', status: 'good', batch: 'PROD-004' },
    { id: 15, name: 'Orange Marmalade - 300g', type: 'product', stock: 15, unit: 'units', location: 'C-C3-R1', expiryDate: '2024-04-30', status: 'critical', batch: 'PROD-005' }
  ])

  const fruitStats = {
    total: fruitInventory.length,
    totalStock: fruitInventory.reduce((sum, item) => sum + item.stock, 0),
    lowStock: fruitInventory.filter(item => item.status === 'low' || item.status === 'critical').length,
    expiringSoon: fruitInventory.filter(item => item.status === 'warning' || item.status === 'critical').length
  }

  const productStats = {
    total: productInventory.length,
    totalStock: productInventory.reduce((sum, item) => sum + item.stock, 0),
    lowStock: productInventory.filter(item => item.status === 'low' || item.status === 'critical').length,
    expiringSoon: productInventory.filter(item => item.status === 'warning' || item.status === 'critical').length
  }

  const criticalAlerts = [...fruitInventory, ...productInventory].filter(item => item.status === 'critical')

  return (
    <div className="admin-inventory">
      {/* Header */}
      <div className="header">
        <div className="nav-container">
          <div className="logo">
            <span>🌿</span>
            Laklight Food Products
          </div>
          <div className="user-info">
            <span className="admin-badge">ADMIN</span>
            <span>Administrator</span>
            <button className="btn btn-secondary" onClick={() => navigate('/admin-dashboard')}>Dashboard</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">📦 Complete Inventory Control</h1>
          <p className="page-description">Monitor raw materials (fruits) and finished products - Track stock levels, locations, and expiry dates</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'fruits' ? 'active' : ''}`}
            onClick={() => setActiveTab('fruits')}
          >
            <span>🍎</span>
            Fruit Inventory (Raw Materials)
          </button>
          <button 
            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span>📦</span>
            Finished Products
          </button>
          <button 
            className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <span>⚠️</span>
            Critical Alerts
          </button>
        </div>

        {/* Fruits Tab */}
        {activeTab === 'fruits' && (
          <div className="tab-content active">
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card good">
                <div className="stat-number good">{fruitStats.total}</div>
                <div className="stat-label">Total Fruit Types</div>
              </div>
              <div className="stat-card good">
                <div className="stat-number good">{fruitStats.totalStock} kg</div>
                <div className="stat-label">Total Fruit Stock</div>
              </div>
              <div className="stat-card critical">
                <div className="stat-number critical">{fruitStats.lowStock}</div>
                <div className="stat-label">Low Stock Fruits</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-number warning">{fruitStats.expiringSoon}</div>
                <div className="stat-label">Expiring Soon (7 days)</div>
              </div>
            </div>

            {/* Fruit Inventory */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">🍇</span>
                  All Fruits Inventory
                </h2>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <button className="btn btn-primary" onClick={() => alert('Add fruit inventory')}>+ Add Inventory</button>
                  <button className="btn btn-warning" onClick={() => alert('Export report')}>Export Report</button>
                </div>
              </div>
              <div className="inventory-grid">
                {fruitInventory.map(item => (
                  <div key={item.id} className={`inventory-card ${item.status === 'low' ? 'low-stock' : item.status === 'critical' ? 'critical' : ''}`}>
                    <div className="item-header">
                      <div className="item-icon">🍇</div>
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-id">ID: FRUIT-{String(item.id).padStart(3, '0')}</div>
                      </div>
                    </div>
                    <div className="item-details">
                      <div className="detail-row">
                        <span className="detail-label">Stock Level:</span>
                        <span className={`stock-badge stock-${item.status}`}>{item.stock} {item.unit}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Location:</span>
                        <span className="location-badge">{item.location}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Batch:</span>
                        <span className="batch-badge">{item.batch}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Expiry Date:</span>
                        <span className={`expiry-badge expiry-${item.status}`}>{item.expiryDate}</span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="btn btn-warning btn-small" onClick={() => alert(`Edit ${item.name}`)}>Edit</button>
                      <button className="btn btn-danger btn-small" onClick={() => alert(`Delete ${item.name}`)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="tab-content active">
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card good">
                <div className="stat-number good">{productStats.total}</div>
                <div className="stat-label">Total Product Types</div>
              </div>
              <div className="stat-card good">
                <div className="stat-number good">{productStats.totalStock} units</div>
                <div className="stat-label">Total Product Stock</div>
              </div>
              <div className="stat-card critical">
                <div className="stat-number critical">{productStats.lowStock}</div>
                <div className="stat-label">Low Stock Products</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-number warning">{productStats.expiringSoon}</div>
                <div className="stat-label">Expiring Soon</div>
              </div>
            </div>

            {/* Product Inventory */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">📦</span>
                  All Finished Products
                </h2>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <button className="btn btn-primary" onClick={() => alert('Add product inventory')}>+ Add Product</button>
                  <button className="btn btn-warning" onClick={() => alert('Export report')}>Export Report</button>
                </div>
              </div>
              <div className="inventory-grid">
                {productInventory.map(item => (
                  <div key={item.id} className={`inventory-card ${item.status === 'low' ? 'low-stock' : item.status === 'critical' ? 'critical' : ''}`}>
                    <div className="item-header">
                      <div className="item-icon product">📦</div>
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-id">ID: PROD-{String(item.id).padStart(3, '0')}</div>
                      </div>
                    </div>
                    <div className="item-details">
                      <div className="detail-row">
                        <span className="detail-label">Stock Level:</span>
                        <span className={`stock-badge stock-${item.status}`}>{item.stock} {item.unit}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Location:</span>
                        <span className="location-badge">{item.location}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Batch:</span>
                        <span className="batch-badge">{item.batch}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Expiry Date:</span>
                        <span className={`expiry-badge expiry-${item.status}`}>{item.expiryDate}</span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="btn btn-warning btn-small" onClick={() => alert(`Edit ${item.name}`)}>Edit</button>
                      <button className="btn btn-danger btn-small" onClick={() => alert(`Delete ${item.name}`)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="tab-content active">
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">⚠️</span>
                  Critical Alerts
                </h2>
              </div>
              {criticalAlerts.map(item => (
                <div key={item.id} className="alert-banner">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <h4>Critical: {item.name}</h4>
                    <p>Stock: {item.stock} {item.unit} | Location: {item.location} | Expires: {item.expiryDate}</p>
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

export default AdminInventory
