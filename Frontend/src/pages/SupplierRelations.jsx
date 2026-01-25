import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SupplierRelations.css';

function SupplierRelations() {
  const [activeTab, setActiveTab] = useState('active-suppliers');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editForm, setEditForm] = useState({});


  const suppliers = [
    {
      id: 1,
      name: 'Mountain Fresh Farm',
      owner: 'Lakshman Bandara',
      location: 'Badulla District',
      phone: '0771234567',
      product: 'Fresh Mango - Grade A',
      license: 'AG2025078',
      rating: 4.8,
      deliveries: 24,
      status: 'Active',
      email: 'lakshman@mountainfresh.lk',
      address: 'Mahiyanganaya Road, Badulla',
      farmSize: '10 Acres'
    },
    {
      id: 2,
      name: 'Sunrise Plantation',
      owner: 'Nimal Perera',
      location: 'Matale District',
      phone: '0779876543',
      product: 'Strawberry - Grade A & B',
      license: 'AG2025045',
      rating: 4.2,
      deliveries: 18,
      status: 'Active',
      email: 'nimal@sunrisefarm.lk',
      address: 'Ukkuwela, Matale',
      farmSize: '7 Acres'
    },
    {
      id: 3,
      name: 'Golden Valley Farms',
      owner: 'Kumara Silva',
      location: 'Nuwara Eliya',
      phone: '0763456789',
      product: 'Passion Fruit - Grade A',
      license: 'AG2025123',
      rating: 4.9,
      deliveries: 32,
      status: 'Active',
      email: 'kumara@goldenvalley.lk',
      address: 'Ambewela, Nuwara Eliya',
      farmSize: '15 Acres'
    }
  ];

  const applications = [
    {
      id: 1,
      farmName: 'Highland Fruit Growers',
      owner: 'Priyantha Jayasinghe',
      location: 'Bandarawela, Badulla',
      phone: '0778765432',
      product: 'Fresh Avocado - Grade A',
      farmSize: '5 Acres',
      capacity: '500 kg',
      appliedDate: 'January 15, 2025'
    },
    {
      id: 2,
      farmName: 'Tropical Paradise Farms',
      owner: 'Sanduni Wickramasinghe',
      location: 'Kurunegala District',
      phone: '0771122334',
      product: 'Papaya - Grade A',
      farmSize: '8 Acres',
      capacity: '800 kg',
      appliedDate: 'January 18, 2025'
    }
  ];

  const supplyHistory = [
    { date: 'Jan 10, 2025', product: 'Fresh Mango - Grade A', supplier: 'Mountain Fresh Farm', quantity: '250 kg', price: 75000 },
    { date: 'Jan 12, 2025', product: 'Passion Fruit - Grade A', supplier: 'Golden Valley Farms', quantity: '180 kg', price: 54000 },
    { date: 'Jan 14, 2025', product: 'Pineapple - Grade A', supplier: 'Green Valley Estates', quantity: '300 kg', price: 60000 }
  ];

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };



  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setEditForm(supplier);
    setShowEditModal(true);
  };



  const handleEditSubmit = (e) => {
    e.preventDefault();
    alert(`Supplier ${editForm.name} updated successfully!`);
    setShowEditModal(false);
  };

  const handleApprove = (farmName) => {
    if (window.confirm(`Approve application from ${farmName}?`)) {
      alert(`✓ Application from ${farmName} approved!`);
    }
  };

  const handleReject = (farmName) => {
    const reason = window.prompt(`Enter rejection reason for ${farmName}:`);
    if (reason) {
      alert(`✗ Application from ${farmName} rejected. Reason: ${reason}`);
    }
  };

  const getRatingClass = (rating) => {
    if (rating >= 4.5) return 'rating-excellent';
    if (rating >= 3.5) return 'rating-good';
    return 'rating-average';
  };

  return (
    <div className="supplier-relations">
      <Header isLoggedIn={true} />

      <main className="dashboard">
        <div className="page-header">
          <h1 className="page-title">Supplier Relations Management</h1>
          <p>Manage farmer suppliers, applications, and supply history</p>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card active">
            <div className="stat-number">48</div>
            <div className="stat-label">Active Suppliers</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">12</div>
            <div className="stat-label">Pending Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">156</div>
            <div className="stat-label">Total Deliveries (Month)</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">Rs. 1.2M</div>
            <div className="stat-label">Monthly Procurement</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'active-suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('active-suppliers')}
          >
            Active Suppliers
          </button>
          <button
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Pending Applications
          </button>
          <button
            className={`tab-button ${activeTab === 'supply-history' ? 'active' : ''}`}
            onClick={() => setActiveTab('supply-history')}
          >
            Supply History
          </button>
          <button
            className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance Reports
          </button>
        </div>

        {/* Active Suppliers Tab */}
        {activeTab === 'active-suppliers' && (
          <div className="tab-content">
            <div className="suppliers-grid">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="supplier-card">
                  <div className="supplier-header">
                    <div>
                      <div className="supplier-name">{supplier.name}</div>
                      <div className="supplier-location"> {supplier.location}</div>
                    </div>
                    <span className="status-badge status-active">{supplier.status}</span>
                  </div>
                  <div className="supplier-info">
                    <div className="info-row">
                      <span className="info-label"> Owner</span>
                      <span className="info-value">{supplier.owner}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label"> Phone</span>
                      <span className="info-value">{supplier.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label"> Main Product</span>
                      <span className="info-value">{supplier.product}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label"> License</span>
                      <span className="info-value">{supplier.license}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label"> Rating</span>
                      <span className={`rating-badge ${getRatingClass(supplier.rating)}`}>
                        ★ {supplier.rating} {supplier.rating >= 4.5 ? 'Excellent' : 'Good'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label"> Total Supplies</span>
                      <span className="info-value">{supplier.deliveries} Deliveries</span>
                    </div>
                  </div>
                  <div className="supplier-actions">
                    <button className="btn btn-info btn-small" onClick={() => handleViewDetails(supplier)}>View Details</button>
                    <button className="btn btn-warning btn-small" onClick={() => handleEdit(supplier)}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Applications Tab */}
        {activeTab === 'applications' && (
          <div className="tab-content">
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Pending Farmer Applications</h3>
            {applications.map(app => (
              <div key={app.id} className="application-card">
                <div className="application-header">
                  <div>
                    <div className="supplier-name">{app.farmName}</div>
                    <div className="supplier-location"> {app.location}</div>
                  </div>
                  <span className="status-badge status-pending">Pending Review</span>
                </div>
                <div className="application-info">
                  <div className="detail-item">
                    <span className="detail-label">Owner Name</span>
                    <span className="detail-value">{app.owner}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact</span>
                    <span className="detail-value">{app.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Product Type</span>
                    <span className="detail-value">{app.product}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Farm Size</span>
                    <span className="detail-value">{app.farmSize}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Applied Date</span>
                    <span className="detail-value">{app.appliedDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expected Capacity</span>
                    <span className="detail-value">{app.capacity}</span>
                  </div>
                </div>
                <div className="supplier-actions">
                  <button className="btn btn-success btn-small" onClick={() => handleApprove(app.farmName)}>
                    ✓ Approve
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleReject(app.farmName)}>
                    ✗ Reject
                  </button>
                  <button className="btn btn-info btn-small">View Full Details</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Supply History Tab */}
        {activeTab === 'supply-history' && (
          <div className="tab-content">
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Supply History</h3>
            <div className="supply-history">
              {supplyHistory.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">{item.date}</div>
                  <div className="history-product">{item.product} ({item.supplier})</div>
                  <div className="history-quantity">{item.quantity}</div>
                  <div className="history-price">Rs. {item.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Reports Tab */}
        {activeTab === 'performance' && (
          <div className="tab-content">
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Supplier Performance Reports</h3>

            {/* Top Performers */}
            <div className="supplier-card" style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Top Performing Suppliers (This Month)</h4>
              <div className="performance-list">
                {suppliers.map((supplier, index) => (
                  <div key={supplier.id} className="performance-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '1rem',
                    background: index === 0 ? '#f1f8e9' : '#fafafa',
                    borderRadius: '10px',
                    borderLeft: index === 0 ? '4px solid #4caf50' : '4px solid #ddd'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                        <span style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: '1.1rem' }}>
                          {supplier.name}
                        </span>
                      </div>
                      <div style={{ color: '#666', fontSize: '0.9rem' }}>
                        {supplier.location}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={`rating-badge ${getRatingClass(supplier.rating)}`} style={{ marginBottom: '0.5rem' }}>
                        ★ {supplier.rating}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.9rem' }}>
                        {supplier.deliveries} deliveries
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="supplier-card" style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Performance Metrics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32' }}>98.5%</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>On-Time Delivery Rate</div>
                </div>
                <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>96%</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>Quality Compliance</div>
                </div>
                <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00' }}>4.7</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>Average Rating</div>
                </div>
                <div style={{ background: '#f3e5f5', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7b1fa2' }}>74</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Deliveries</div>
                </div>
              </div>
            </div>

            {/* Individual Supplier Details*/}
            <div className="supplier-card">
              <h4 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Detailed Supplier Performance</h4>
              {suppliers.map(supplier => (
                <div key={supplier.id} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2e7d32', marginBottom: '1rem' }}>
                    {supplier.name}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem' }}>
                    <div className="detail-item">
                      <span className="detail-label">Rating</span>
                      <span className="detail-value">★ {supplier.rating}/5.0</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Deliveries</span>
                      <span className="detail-value">{supplier.deliveries}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">On-Time Rate</span>
                      <span className="detail-value" style={{ color: '#4caf50' }}>
                        {(95 + Math.random() * 4).toFixed(1)}%
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Quality Score</span>
                      <span className="detail-value" style={{ color: '#2196f3' }}>
                        {(92 + Math.random() * 7).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* View Details Modal */}
      {showViewModal && selectedSupplier && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Supplier Details</h2>
              <button className="close-button" onClick={() => setShowViewModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>{selectedSupplier.name}</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Owner</span>
                    <span className="detail-value">{selectedSupplier.owner}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact Phone</span>
                    <span className="detail-value">{selectedSupplier.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedSupplier.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{selectedSupplier.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{selectedSupplier.address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Farm Size</span>
                    <span className="detail-value">{selectedSupplier.farmSize}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Main Product</span>
                    <span className="detail-value">{selectedSupplier.product}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">License Number</span>
                    <span className="detail-value">{selectedSupplier.license}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rating</span>
                    <span className={`rating-badge ${getRatingClass(selectedSupplier.rating)}`}>
                      ★ {selectedSupplier.rating}/5.0
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Deliveries</span>
                    <span className="detail-value">{selectedSupplier.deliveries} completed</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className="status-badge status-active">{selectedSupplier.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Edit Supplier Modal */}
      {showEditModal && selectedSupplier && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Supplier</h2>
              <button className="close-button" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Farm Name *</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Owner Name *</label>
                    <input
                      type="text"
                      value={editForm.owner}
                      onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Phone *</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Farm Size *</label>
                    <input
                      type="text"
                      value={editForm.farmSize}
                      onChange={(e) => setEditForm({ ...editForm, farmSize: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Main Product *</label>
                  <input
                    type="text"
                    value={editForm.product}
                    onChange={(e) => setEditForm({ ...editForm, product: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default SupplierRelations;
