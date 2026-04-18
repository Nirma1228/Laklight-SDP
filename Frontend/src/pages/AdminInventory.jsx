import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { config } from '../config'
import './AdminInventory.css'

function AdminInventory() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('fruits')
  const [adminName, setAdminName] = useState(localStorage.getItem('userName') || 'Administrator');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${config.API_BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setAdminName(data.user.full_name);
            localStorage.setItem('userName', data.user.full_name);
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  const adminLinks = [
    { label: 'Admin Home', path: '/admin-dashboard' },
    { label: 'User Management', path: '/admin/users' },
    { label: 'Inventory', path: '/admin/inventory' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Suppliers', path: '/admin/suppliers' },
    { label: 'Reports', path: '/admin/reports' }
  ];

  const [fruitInventory, setFruitInventory] = useState([]);
  const [productInventory, setProductInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/employee/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Map backend 'raw' to 'fruitInventory'
        setFruitInventory(data.raw.map(item => ({
          id: item.raw_inventory_id,
          name: item.material_name,
          type: 'fruit',
          stock: item.quantity_units,
          unit: item.unit_name || 'kg',
          location: item.storage_location,
          expiryDate: new Date(item.expiry_date).toISOString().split('T')[0],
          status: item.quantity_units < 10 ? 'critical' : item.quantity_units < 25 ? 'warning' : 'good',
          batch: item.batch_number || 'BATCH-NEW'
        })));

        // Map backend 'finished' to 'productInventory'
        setProductInventory(data.finished.map(item => ({
          id: item.finished_inventory_id,
          name: item.name,
          type: 'product',
          stock: item.quantity_units,
          unit: 'units',
          location: item.storage_location,
          expiryDate: new Date(item.expiry_date).toISOString().split('T')[0],
          status: item.quantity_units < 20 ? 'critical' : item.quantity_units < 50 ? 'low' : 'good',
          batch: item.batch_number
        })));
      }
    } catch (err) {
      console.error('Fetch inventory error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.name} from inventory?`)) return;
    try {
      const typeStr = item.type === 'fruit' ? 'raw' : 'finished';
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/employee/inventory/${item.id}?type=${typeStr}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Deleted successfully');
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const handleAddFruit = async () => {
    const name = prompt('Fruit Name:');
    if (!name) return;
    const categoryId = prompt('Category ID (e.g., 2 for Fruits):', '2');
    if (!categoryId) return;
    const quantity = prompt('Quantity:', '0');
    if (!quantity) return;
    const unitId = prompt('Unit ID (e.g., 1 for kg):', '1');
    if (!unitId) return;
    const location = prompt('Storage Location:', 'Cold Storage A');
    if (!location) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/employee/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'raw',
          name,
          categoryId,
          quantity,
          unitId,
          location,
          batch: `B${new Date().toISOString().slice(0, 7).replace('-', '')}`,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Fruit added successfully');
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add fruit');
    }
  };

  const handleEdit = async (item) => {
    const newQty = prompt(`Update stock for ${item.name}:`, item.stock);
    if (newQty === null) return;
    const newLoc = prompt(`Update location for ${item.name}:`, item.location);
    if (newLoc === null) return;

    try {
      const typeStr = item.type === 'fruit' ? 'raw' : 'finished';
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/employee/inventory/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: newQty,
          location: newLoc,
          type: typeStr
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Inventory updated');
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const fruitStats = {
    total: fruitInventory.length,
    totalStock: fruitInventory.reduce((sum, item) => sum + (Number(item.stock) || 0), 0),
    lowStock: fruitInventory.filter(item => item.status === 'low' || item.status === 'critical').length,
    expiringSoon: fruitInventory.filter(item => item.status === 'warning' || item.status === 'critical').length
  }

  const productStats = {
    total: productInventory.length,
    totalStock: productInventory.reduce((sum, item) => sum + (Number(item.stock) || 0), 0),
    lowStock: productInventory.filter(item => item.status === 'low' || item.status === 'critical').length,
    expiringSoon: productInventory.filter(item => item.status === 'warning' || item.status === 'critical').length
  }

  const criticalAlerts = [...fruitInventory, ...productInventory].filter(item => item.status === 'critical')

  return (
    <div className="admin-inventory">
      <Header isLoggedIn={true} customLinks={adminLinks} />

      {/* Main Content */}
      <div className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Complete Inventory Control</h1>
          <p className="page-description">Monitor raw materials (fruits) and finished products - Track stock levels, locations, and expiry dates</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'fruits' ? 'active' : ''}`}
            onClick={() => setActiveTab('fruits')}
          >
            Fruit Inventory (Raw Materials)
          </button>
          <button
            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Finished Products
          </button>
          <button
            className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
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
                  <span className="section-icon"></span>
                  All Fruits Inventory
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" onClick={handleAddFruit}>+ Add Inventory</button>
                  <button className="btn btn-warning" onClick={() => alert('Export report')}>Export Report</button>
                </div>
              </div>
              <div className="inventory-grid">
                {fruitInventory.map(item => (
                  <div key={item.id} className={`inventory-card ${item.status === 'low' ? 'low-stock' : item.status === 'critical' ? 'critical' : ''}`}>
                    <div className="item-header">
                      <div className="item-icon"></div>
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
                      <button className="btn btn-warning btn-small" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn btn-danger btn-small" onClick={() => handleDelete(item)}>Delete</button>
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
                  <span className="section-icon"></span>
                  All Finished Products
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" onClick={() => alert('Add product inventory')}>+ Add Product</button>
                  <button className="btn btn-warning" onClick={() => alert('Export report')}>Export Report</button>
                </div>
              </div>
              <div className="inventory-grid">
                {productInventory.map(item => (
                  <div key={item.id} className={`inventory-card ${item.status === 'low' ? 'low-stock' : item.status === 'critical' ? 'critical' : ''}`}>
                    <div className="item-header">
                      <div className="item-icon product"></div>
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
                      <button className="btn btn-warning btn-small" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn btn-danger btn-small" onClick={() => handleDelete(item)}>Delete</button>
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
                  <span className="section-icon"></span>
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
