import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SupplierRelations.css';

function SupplierRelations() {
  const [activeTab, setActiveTab] = useState('active-suppliers');
  
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
      status: 'Active'
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
      status: 'Active'
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
      status: 'Active'
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
          <h1 className="page-title">🤝 Supplier Relations Management</h1>
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
                      <div className="supplier-location">📍 {supplier.location}</div>
                    </div>
                    <span className="status-badge status-active">{supplier.status}</span>
                  </div>
                  <div className="supplier-info">
                    <div className="info-row">
                      <span className="info-label">👤 Owner</span>
                      <span className="info-value">{supplier.owner}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">📞 Phone</span>
                      <span className="info-value">{supplier.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">🌾 Main Product</span>
                      <span className="info-value">{supplier.product}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">📋 License</span>
                      <span className="info-value">{supplier.license}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">⭐ Rating</span>
                      <span className={`rating-badge ${getRatingClass(supplier.rating)}`}>
                        ★ {supplier.rating} {supplier.rating >= 4.5 ? 'Excellent' : 'Good'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">📦 Total Supplies</span>
                      <span className="info-value">{supplier.deliveries} Deliveries</span>
                    </div>
                  </div>
                  <div className="supplier-actions">
                    <button className="btn btn-info btn-small">View Details</button>
                    <button className="btn btn-success btn-small">Place Order</button>
                    <button className="btn btn-warning btn-small">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Applications Tab */}
        {activeTab === 'applications' && (
          <div className="tab-content">
            <h3 style={{marginBottom: '1.5rem', color: '#333'}}>📋 Pending Farmer Applications</h3>
            {applications.map(app => (
              <div key={app.id} className="application-card">
                <div className="application-header">
                  <div>
                    <div className="supplier-name">{app.farmName}</div>
                    <div className="supplier-location">📍 {app.location}</div>
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
            <h3 style={{marginBottom: '1.5rem', color: '#333'}}>📊 Supply History</h3>
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
            <h3 style={{marginBottom: '1.5rem', color: '#333'}}>📊 Supplier Performance Reports</h3>
            <div className="supplier-card">
              <h4 style={{color: '#2e7d32', marginBottom: '1rem'}}>Top Performing Suppliers (This Month)</h4>
              <div className="info-row" style={{marginBottom: '0.8rem'}}>
                <span className="info-label">🥇 1st Place</span>
                <span className="info-value">Golden Valley Farms - ★ 4.9 (32 deliveries)</span>
              </div>
              <div className="info-row" style={{marginBottom: '0.8rem'}}>
                <span className="info-label">🥈 2nd Place</span>
                <span className="info-value">Mountain Fresh Farm - ★ 4.8 (24 deliveries)</span>
              </div>
              <div className="info-row">
                <span className="info-label">🥉 3rd Place</span>
                <span className="info-value">Green Valley Estates - ★ 4.3 (21 deliveries)</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SupplierRelations;
