import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { config } from '../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faBoxes, faShoppingCart, faUserTie, faChartBar
} from '@fortawesome/free-solid-svg-icons';
import './SupplierRelations.css';

function SupplierRelations() {
  const [activeTab, setActiveTab] = useState('active-suppliers');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [supplyHistory, setSupplyHistory] = useState([]);
  const [selectedSupplierHistory, setSelectedSupplierHistory] = useState([]);
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/suppliers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.suppliers.filter(s => s.status === 'Active'));
      }
      
      const appsRes = await fetch(`${config.API_BASE_URL}/employee/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (appsRes.ok) {
        const appData = await appsRes.json();
        const appsRaw = appData.applications || [];
        const formattedApplications = appsRaw.map(app => {
          // Parse images robustly (JSON string or array)
          let parsedImages = [];
          try {
            if (Array.isArray(app.images)) {
              parsedImages = app.images;
            } else if (typeof app.images === 'string' && app.images) {
              parsedImages = JSON.parse(app.images);
            }
          } catch (e) {
            parsedImages = [];
          }
          return {
            ...app,
            id: app.id,
            farmerName: app.farmerName,
            product: app.product,
            quantity: `${app.quantity} ${app.unit || 'kg'}`,
            price: app.price ? `LKR ${app.price}/kg` : 'N/A',
            status: app.status || 'under-review',
            date: app.date ? new Date(app.date).toISOString().split('T')[0] : '—',
            submitted: app.submitted ? new Date(app.submitted).toISOString().split('T')[0] : '—',
            transport: app.transport || 'N/A',
            images: parsedImages,
          };
        });
        setApplications(formattedApplications);
      }

      // Fetch all deliveries for Supply History (Delivery Schedule)
      const delRes = await fetch(`${config.API_BASE_URL}/employee/deliveries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (delRes.ok) {
        const delData = await delRes.json();
        const formattedDeliveries = delData.deliveries.map(del => ({
          id: del.delivery_id || del.id,
          farmer: del.farmer_name,
          product: del.product_name,
          quantity: `${del.quantity}${del.unit || 'kg'}`,
          quantityVal: del.quantity,
          price_per_unit: del.custom_price || 0,
          proposedDate: del.delivery_date ? new Date(del.delivery_date).toISOString().split('T')[0] : 
                        (del.final_delivery_date ? new Date(del.final_delivery_date).toISOString().split('T')[0] : ''),
          scheduleDate: del.scheduled_date ? new Date(del.scheduled_date).toISOString().split('T')[0] : 
                        (del.proposed_reschedule_date ? new Date(del.proposed_reschedule_date).toISOString().split('T')[0] : 
                        (del.final_delivery_date ? new Date(del.final_delivery_date).toISOString().split('T')[0] : '-')),
          transport: del.transport_method || 'N/A',
          status: del.status || 'pending'
        }));
        setSupplyHistory(formattedDeliveries);
      }
    } catch (err) {
      console.error('Fetch suppliers error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleViewDetails = async (supplier) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/suppliers/${supplier.id}/performance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedSupplier({ ...supplier, deliveries: data.deliveries.length });
        setSelectedSupplierHistory(data.deliveries);
        setShowViewModal(true);
      }
    } catch (err) {
      console.error('Fetch performance error:', err);
      setSelectedSupplier(supplier);
      setShowViewModal(true);
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setEditForm({
      name: supplier.farm_name,
      owner: supplier.owner_name,
      phone: supplier.phone,
      email: supplier.email,
      location: supplier.location,
      product: supplier.product_types,
      license: supplier.license_number,
      farmSize: supplier.farm_size,
      status: supplier.status
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/suppliers/${selectedSupplier.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          farmName: editForm.name,
          ownerName: editForm.owner,
          location: editForm.location,
          phone: editForm.phone,
          email: editForm.email,
          productTypes: editForm.product,
          licenseNumber: editForm.license,
          status: editForm.status
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Supplier updated successfully!');
        setShowEditModal(false);
        fetchSuppliers();
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update supplier error:', err);
      alert('Error updating supplier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to set status to ${newStatus}?`)) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      // For status update, we can use the same PUT /:id since it accepts status
      const res = await fetch(`${config.API_BASE_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Supplier status updated to ${newStatus}!`);
        fetchSuppliers();
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Error updating status');
    }
  };

  const handleApproveSubmission = async (id, date) => {
    if (!window.confirm('Are you sure you want to approve this application?')) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/employee/applications/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ scheduleDate: date })
      });
      const data = await response.json();
      if (data.success) {
        alert('Application approved and scheduled!');
        fetchSuppliers(); // Refresh
      } else {
        alert(data.message || 'Failed to approve');
      }
    } catch (err) {
      console.error(err);
      alert('Error approving application');
    }
  };

  const handleRejectSubmission = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/employee/applications/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rejectionReason: reason })
      });
      const data = await response.json();
      if (data.success) {
        alert('Application rejected');
        fetchSuppliers(); // Refresh
      } else {
        alert(data.message || 'Failed to reject');
      }
    } catch (err) {
      console.error(err);
      alert('Error rejecting application');
    }
  };

  const getRatingClass = (rating) => {
    const r = parseFloat(rating);
    if (r >= 4.5) return 'rating-excellent';
    if (r >= 3.5) return 'rating-good';
    return 'rating-average';
  };

  return (
    <div className="supplier-relations">
      <Header
        isLoggedIn={true}
        customLinks={[
          {
            label: (
              <>
                <FontAwesomeIcon icon={faUsers} style={{ marginRight: '8px' }} />
                USER MANAGEMENT
              </>
            ),
            path: '/admin/users'
          },
          {
            label: (
              <>
                <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '8px' }} />
                INVENTORY
              </>
            ),
            path: '/admin/inventory'
          },
          {
            label: (
              <>
                <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} />
                ORDER MANAGEMENT
              </>
            ),
            path: '/admin/orders'
          },
          {
            label: (
              <>
                <FontAwesomeIcon icon={faUserTie} style={{ marginRight: '8px' }} />
                SUPPLIER RELATIONS
              </>
            ),
            path: '/admin/suppliers'
          },
          {
            label: (
              <>
                <FontAwesomeIcon icon={faChartBar} style={{ marginRight: '8px' }} />
                ANALYTICS & REPORTS
              </>
            ),
            path: '/admin/reports'
          }
        ]}
      />

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
            <div className="stat-number">
              {applications.filter(app => app.status === 'under-review' || app.status_id === 1).length}
            </div>
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
        </div>

        {/* Active Suppliers Tab */}
        {activeTab === 'active-suppliers' && (
          <div className="tab-content">
            <div className="suppliers-grid">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="supplier-card">
                  <div className="supplier-header">
                    <div>
                      <div className="supplier-name">{supplier.farm_name}</div>
                      <div className="supplier-location"> {supplier.location}</div>
                    </div>
                    <span className="status-badge status-active">{supplier.status}</span>
                  </div>
                  <div className="supplier-info">
                    <div className="info-row">
                      <span className="info-label"> Owner</span>
                      <span className="info-value">{supplier.owner_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label"> Phone</span>
                      <span className="info-value">{supplier.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label"> Main Product</span>
                      <span className="info-value">{supplier.product_types}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label"> License</span>
                      <span className="info-value">{supplier.license_number}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label"> Rating</span>
                      <span className={`rating-badge ${getRatingClass(supplier.rating)}`}>
                        ★ {supplier.rating}
                      </span>
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
            {applications.filter(app => app.status === 'under-review' || app.status_id === 1).map(app => (
              <div key={app.id} className="application-card">
                <div className="application-header">
                  <div>
                    <div className="supplier-name">{app.farmerName}</div>
                    <div className="supplier-location"> {app.product}</div>
                  </div>
                  <span className="status-badge status-pending">Pending Review</span>
                </div>
                <div className="application-info">
                  <div className="detail-item">
                    <span className="detail-label">Product Type</span>
                    <span className="detail-value">{app.product}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Quantity</span>
                    <span className="detail-value">{app.quantity}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expected Price</span>
                    <span className="detail-value">{app.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Transport</span>
                    <span className="detail-value">{app.transport}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted On</span>
                    <span className="detail-value">{app.submitted}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Delivery Date</span>
                    <span className="detail-value">{app.date}</span>
                  </div>
                </div>

                {/* Uploaded Images */}
                <div className="sr-images-section">
                  <span className="sr-images-label">📷 Submitted Images</span>
                  <div className="sr-image-gallery">
                    {(app.images && app.images.length > 0) ? (
                      app.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.startsWith('http') || img.startsWith('data:') ? img : `${config.API_BASE_URL.replace('/api', '')}${img}`}
                          alt={`Product Image ${idx + 1}`}
                          className="sr-thumbnail"
                          onClick={() => window.open(img.startsWith('http') || img.startsWith('data:') ? img : `${config.API_BASE_URL.replace('/api', '')}${img}`, '_blank')}
                          title="Click to view full size"
                        />
                      ))
                    ) : (
                      <span className="sr-no-images">No images submitted</span>
                    )}
                  </div>
                </div>

                <div className="supplier-actions">
                  <button className="btn btn-success btn-small" onClick={() => handleApproveSubmission(app.id, app.date)}>
                    ✓ Approve & Schedule
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleRejectSubmission(app.id)}>
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
            {applications.filter(app => app.status === 'under-review' || app.status_id === 1).length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px' }}>
                <p style={{ color: '#64748b', margin: 0 }}>No pending supplier applications found.</p>
              </div>
            )}
          </div>
        )}

        {/* Supply History Tab (Delivery Schedule) */}
        {activeTab === 'supply-history' && (
          <div className="tab-content">
            <div className="section-header-inline">
              <h3 style={{ margin: 0, color: '#333' }}>Farmer Delivery Schedule</h3>
              <div className="inventory-filters">
                <select
                  className="filter-select"
                  value={deliveryStatusFilter}
                  onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                >
                  <option value="all">All Delivery Schedules</option>
                  <option value="scheduled delivery">Scheduled Delivery</option>
                  <option value="pending">Waiting for Farmer Response</option>
                  <option value="confirmed">Confirmed (Ready to Complete)</option>
                  <option value="confirmed schedule">Confirmed Schedule</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="table-container" style={{ marginTop: '1.5rem' }}>
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
                  </tr>
                </thead>
                <tbody>
                  {supplyHistory.filter(del => deliveryStatusFilter === 'all' || del.status === deliveryStatusFilter).length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No delivery records found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    supplyHistory
                      .filter(del => deliveryStatusFilter === 'all' || del.status === deliveryStatusFilter)
                      .map(delivery => (
                        <tr key={delivery.id}>
                          <td><strong>#{delivery.id}</strong></td>
                          <td>{delivery.farmer}</td>
                          <td>{delivery.product}</td>
                          <td>{delivery.quantity}</td>
                          <td>{delivery.proposedDate}</td>
                          <td>{delivery.scheduleDate === '-' ? '-' : <strong>{delivery.scheduleDate}</strong>}</td>
                          <td>{delivery.transport}</td>
                          <td>
                            <span className={`status-badge ${(['action required', 'Action Required', 'pending'].includes(delivery.status)) ? 'status-pending' : `status-${delivery.status.toLowerCase().replace(/\s+/g, '-')}`}`}>
                              {delivery.status === 'scheduled delivery' && 'Scheduled Delivery'}
                              {(delivery.status === 'action required' || delivery.status === 'Action Required') && 'Waiting for Farmer Response'}
                              {delivery.status === 'pending' && 'Waiting for Farmer Response'}
                              {delivery.status === 'confirmed' && 'Confirmed'}
                              {delivery.status === 'confirmed schedule' && 'Confirmed Schedule'}
                              {delivery.status === 'completed' && 'Completed'}
                              {delivery.status === 'cancelled' && 'Cancelled'}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
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
