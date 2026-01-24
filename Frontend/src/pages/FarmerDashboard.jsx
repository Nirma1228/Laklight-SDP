import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './FarmerDashboard.css'

// Utility: get today's date in YYYY-MM-DD
const getToday = () => new Date().toISOString().slice(0, 10);

function FarmerDashboard() {
  const navigate = useNavigate()
  
  const [products, setProducts] = useState([{ 
    id: 1, 
    name: '', 
    category: '', 
    variety: '',
    quantity: '', 
    unit: 'kg', 
    customPrice: '', 
    harvestDate: '',
    grade: '',
    transport: '', 
    deliveryDate: '',
    storage: '',
    images: null,
    notes: ''
  }])
  
  
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [newDeliveryDate, setNewDeliveryDate] = useState('')
  const [notifications, setNotifications] = useState([])
  
  const [submissions, setSubmissions] = useState([
    { 
      id: 1, 
      product: 'Fresh Mango', 
      grade: 'Grade A',
      quantity: '100kg', 
      price: 'LKR 200.00/kg',
      harvestDate: '2025-09-18',
      status: 'selected', 
      date: '2025-09-15'
    },
    { 
      id: 2, 
      product: 'Strawberry', 
      grade: 'Grade A',
      quantity: '50kg', 
      price: 'LKR 400.00/kg',
      harvestDate: '2025-09-20',
      status: 'under-review', 
      date: '2025-09-19'
    },
    { 
      id: 3, 
      product: 'Pineapple', 
      grade: 'Grade B',
      quantity: '75kg', 
      price: 'LKR 180.00/kg',
      harvestDate: '2025-09-10',
      status: 'not-selected', 
      date: '2025-09-08',
      rejectionReason: 'Quality does not meet Grade A standards. Product shows signs of early ripening and minor surface blemishes. Please ensure proper harvest timing for future submissions.'
    }
  ])

  const [deliveries, setDeliveries] = useState([
    { 
      id: 'DEL-001', 
      product: 'Fresh Mango - Grade A', 
      quantity: '100kg', 
      proposedDate: 'Oct 22, 2025',
      scheduleDate: '',
      transportMethod: 'Company Truck Pickup',
      status: 'pending'
    },
    { 
      id: 'DEL-002', 
      product: 'Strawberry - Grade A', 
      quantity: '50kg', 
      proposedDate: 'Oct 25, 2025',
      scheduleDate: 'Oct 25, 2025',
      transportMethod: 'Self Transport',
      status: 'confirmed'
    },
    { 
      id: 'DEL-003', 
      product: 'Pineapple - Grade B', 
      quantity: '75kg', 
      proposedDate: 'Oct 20, 2025',
      scheduleDate: 'Oct 20, 2025',
      transportMethod: 'Company Truck Pickup',
      status: 'completed'
    }
  ])

  // Check for notifications on mount
  useEffect(() => {
    const newNotifs = submissions
      .filter(sub => sub.status === 'selected' || sub.status === 'not-selected')
      .map(sub => {
        if (sub.status === 'selected') {
          return { type: 'success', message: `Your product "${sub.product}" was selected!` };
        } else if (sub.status === 'not-selected') {
          return { type: 'error', message: `Your product "${sub.product}" was not selected. Reason: ${sub.rejectionReason || 'No reason provided.'}` };
        }
        return null;
      })
      .filter(Boolean);
    setNotifications(newNotifs);
  }, [submissions]);

  const handleRescheduleClick = (delivery) => {
    setSelectedDelivery(delivery)
    setIsRescheduleModalOpen(true)
    // Set current scheduled date as default
    const currentDate = delivery.scheduleDate ? new Date(delivery.scheduleDate).toISOString().split('T')[0] : ''
    setNewDeliveryDate(currentDate)
  }

  // Reschedule delivery handler (with backend update)
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDelivery || !newDeliveryDate) return;
    try {
      const res = await fetch('/api/deliveries/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId: selectedDelivery.id, newDate: newDeliveryDate, confirmDate: getToday() })
      });
      if (res.ok) {
        alert('Delivery rescheduled!')
        // Optionally refresh deliveries list here
      } else {
        alert('Failed to reschedule delivery.')
      }
    } catch (err) {
      alert('Error rescheduling delivery.')
    }
    setIsRescheduleModalOpen(false)
    setSelectedDelivery(null)
    setNewDeliveryDate('')
  }

  const addProduct = () => {
    const newProduct = {
      id: products.length + 1,
      name: '',
      category: '',
      variety: '',
      quantity: '',
      unit: 'kg',
      customPrice: '',
      harvestDate: '',
      grade: '',
      transport: '',
      deliveryDate: '',
      storage: '',
      images: null,
      notes: ''
    }
    setProducts([...products, newProduct])
  }

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const updateProduct = (id, field, value) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const handleSubmitAll = (e) => {
    e.preventDefault()
    const validProducts = products.filter(p => p.name && p.quantity)
    if (validProducts.length > 0) {
      alert(`Successfully submitted ${validProducts.length} product(s) for review!`)
      setProducts([{ id: 1, name: '', category: '', quantity: '', unit: 'kg', priceRange: '', customPrice: '', transport: '', deliveryDate: '' }])
    } else {
      alert('Please fill in at least one complete product form.')
    }
  }

  // Confirm delivery handler
  const handleConfirmClick = async (delivery) => {
    try {
      const res = await fetch('/api/deliveries/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId: delivery.id, confirmDate: getToday() })
      });
      if (res.ok) {
        alert('Delivery confirmed!')
        // Optionally refresh deliveries list here
      } else {
        alert('Failed to confirm delivery.')
      }
    } catch (err) {
      alert('Error confirming delivery.')
    }
  };

  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="farmer-dashboard">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-section">
          {notifications.map((notif, idx) => (
            <div key={idx} className={`notification notification-${notif.type}`}>
              {notif.message}
              <button 
                className="notification-close" 
                onClick={() => removeNotification(idx)}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Header */}
      <div className="header">
        <div className="nav-container">
          <Link to="/home" className="logo" style={{textDecoration: 'none', color: 'white'}}>
            <span>🌿</span>
            Laklight Food Products
          </Link>
          <ul className="nav-menu">
            <li><Link to="/home">Dashboard</Link></li>
            <li><a href="#products">My Products</a></li>
            <li><a href="#deliveries">Deliveries</a></li>
            <li><a href="#profile">Profile</a></li>
          </ul>
          <div className="user-info">
            <span className="farm-welcome">Welcome, Farmer!</span>
            <Link to="/" className="btn btn-secondary">Logout</Link>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard">
        <div className="welcome-section">
          <h1 className="welcome-title">Farmer Dashboard</h1>
          <p className="welcome-description">Welcome to your supplier portal. Submit your fruit products and track your applications with Laklights Food Products.</p>
          <span className="approval-status status-approved">✓ Approved Supplier</span>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">5</div>
            <div className="stat-label">Products Submitted</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">3</div>
            <div className="stat-label">Products Selected</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">8</div>
            <div className="stat-label">Deliveries Made</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">4.8</div>
            <div className="stat-label">Quality Rating</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Submit Products Section */}
          <div className="dashboard-card full-width">
            <div className="card-header">
              
              <div>
                <h2 className="card-title">Submit Product Information</h2>
                <p className="card-subtitle">Add details about the products you want to sell</p>
              </div>
            </div>

            <form onSubmit={handleSubmitAll}>
              <div id="products-container">
                {products.map((product, index) => (
                  <div key={product.id} className="product-form">
                    <div className="product-form-header">
                      <span className="product-form-title">Product {index + 1}</span>
                      {products.length > 1 && (
                        <button type="button" className="remove-product" onClick={() => removeProduct(product.id)}>
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Product Type: *</label>
                        <select 
                          required
                          value={product.category}
                          onChange={(e) => updateProduct(product.id, 'category', e.target.value)}
                        >
                          <option value="">Select Type</option>
                          <option value="vegetables">Vegetables</option>
                          <option value="fruits">Fruits</option>
                          <option value="dairy">Dairy</option>
                          <option value="grains">Grains</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Product Name: *</label>
                        <input 
                          type="text" 
                          required 
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                          placeholder="e.g., Tomatoes"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Variety (Optional):</label>
                        <input 
                          type="text" 
                          value={product.variety || ''}
                          onChange={(e) => updateProduct(product.id, 'variety', e.target.value)}
                          placeholder="e.g., Cherry"
                        />
                      </div>

                      <div className="form-group">
                        <label>Quantity: *</label>
                        <div className="input-with-unit">
                          <input 
                            type="number" 
                            required 
                            value={product.quantity}
                            onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                            placeholder="Amount"
                          />
                          <select 
                            value={product.unit}
                            onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                            className="unit-select"
                          >
                            <option value="kg">kg</option>
                            <option value="L">Liters</option>
                            <option value="units">Units</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Price per Unit (LKR): *</label>
                        <input 
                          type="number" 
                          required
                          value={product.customPrice}
                          onChange={(e) => updateProduct(product.id, 'customPrice', e.target.value)}
                          placeholder="Price in LKR"
                        />
                      </div>

                      <div className="form-group">
                        <label>Harvest Date: *</label>
                        <input 
                          type="date" 
                          required
                          value={product.harvestDate || ''}
                          onChange={(e) => updateProduct(product.id, 'harvestDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Quality Grade: *</label>
                        <select 
                          required
                          value={product.grade || ''}
                          onChange={(e) => updateProduct(product.id, 'grade', e.target.value)}
                        >
                          <option value="">Select Grade</option>
                          <option value="grade-a">Grade A (Premium)</option>
                          <option value="grade-b">Grade B (Standard)</option>
                          <option value="grade-c">Grade C (Economy)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Transport Method: *</label>
                        <select 
                          required
                          value={product.transport}
                          onChange={(e) => updateProduct(product.id, 'transport', e.target.value)}
                        >
                          <option value="">Select Transport Method</option>
                          <option value="company">Company Transport</option>
                          <option value="self">Self Delivery</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Preferred Transport Date: *</label>
                        <input 
                          type="date" 
                          required
                          value={product.deliveryDate}
                          onChange={(e) => updateProduct(product.id, 'deliveryDate', e.target.value)}
                        />
                        <small className="form-hint">Must be after harvest date</small>
                      </div>

                      <div className="form-group">
                        <label>Storage Location: *</label>
                        <input 
                          type="text" 
                          required
                          value={product.storage || ''}
                          onChange={(e) => updateProduct(product.id, 'storage', e.target.value)}
                          placeholder="e.g., Cold Storage Room A"
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>Product Images (Max 5 images):</label>
                      <div className="file-upload-area">
                        <input 
                          type="file" 
                          id={`images-${product.id}`}
                          accept="image/*"
                          multiple
                          onChange={(e) => updateProduct(product.id, 'images', e.target.files)}
                          style={{display: 'none'}}
                        />
                        <label htmlFor={`images-${product.id}`} className="file-upload-label">
                          <div className="upload-icon">📷</div>
                          <div>Click to upload images or drag and drop</div>
                          <small>PNG, JPG up to 5MB each</small>
                        </label>
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>Additional Notes:</label>
                      <textarea 
                        value={product.notes || ''}
                        onChange={(e) => updateProduct(product.id, 'notes', e.target.value)}
                        placeholder="Any special information about this product..."
                        rows="4"
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-add" onClick={addProduct}>
                  + Add Another Product
                </button>
                <button type="submit" className="btn btn-primary btn-submit-all">
                  Submit All Products
                </button>
              </div>
            </form>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Product Submissions */}
            <div className="dashboard-card submissions-card">
              <div className="card-header">
               
                <h2 className="card-title">My Product Submissions</h2>
              </div>
              <div className="submissions-list">
                {submissions.map(sub => (
                  <div key={sub.id} className="submission-item">
                    <div className="submission-header">
                      <h3 className="submission-product">{sub.product} - {sub.grade}</h3>
                      {sub.status === 'not-selected' ? (
                        <Link to="/farmer/feedback" className={`submission-badge badge-${sub.status}`}>
                          Not Selected
                        </Link>
                      ) : (
                        <span className={`submission-badge badge-${sub.status}`}>
                          {sub.status === 'selected' ? 'Selected' : 'Under Review'}
                        </span>
                      )}
                    </div>
                    <div className="submission-details">
                      <p>Quantity: {sub.quantity} | Price: {sub.price}</p>
                      <p>Harvest Date: {sub.harvestDate} | Submitted: {sub.date}</p>
                    </div>
                    {sub.rejectionReason && (
                      <div className="rejection-reason">
                        <strong>Reason:</strong> {sub.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Schedule Management */}
            <div className="dashboard-card deliveries-card">
              <div className="delivery-schedule-header">
                <div className="schedule-title-section">
                  
                  <h2 className="schedule-title">Delivery Schedule Management</h2>
                </div>
              </div>
              
              <div className="deliveries-table">
                <div className="deliveries-header">
                  <div className="delivery-col">Delivery ID</div>
                  <div className="delivery-col">Product</div>
                  <div className="delivery-col">Quantity</div>
                  <div className="delivery-col">Proposed Date</div>
                  <div className="delivery-col">Schedule Date</div>
                  <div className="delivery-col">Transport Method</div>
                  <div className="delivery-col">Status</div>
                  <div className="delivery-col">Schedule Delivery</div>
                </div>
                {deliveries.map(delivery => (
                  <div key={delivery.id} className="delivery-row">
                    <div className="delivery-col">
                      <strong>{delivery.id}</strong>
                    </div>
                    <div className="delivery-col">{delivery.product}</div>
                    <div className="delivery-col">{delivery.quantity}</div>
                    <div className="delivery-col">{delivery.proposedDate}</div>
                    <div className="delivery-col">
                      {delivery.scheduleDate || '-'}
                    </div>
                    <div className="delivery-col">{delivery.transportMethod}</div>
                    <div className="delivery-col">
                      <span className={`delivery-badge badge-${delivery.status}`}>
                        {delivery.status === 'pending' && 'Pending Review'}
                        {delivery.status === 'confirmed' && 'Confirmed'}
                        {delivery.status === 'completed' && 'Completed'}
                      </span>
                    </div>
                    <div className="delivery-col delivery-actions">
                      {delivery.status === 'pending' && null}
                      {delivery.status === 'confirmed' && (
                        <>
                          <button 
                            className="btn-action btn-confirm"
                            onClick={() => handleConfirmClick(delivery)}
                          >
                            Confirm
                          </button>
                          <button 
                            className="btn-action btn-reschedule"
                            onClick={() => handleRescheduleClick(delivery)}
                          >
                            Reschedule Delivery
                          </button>
                        </>
                      )}
                      {delivery.status === 'completed' && null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wrap the following in a fragment to fix adjacent JSX error */}
      <>
        {/* Reschedule Modal */}
        {isRescheduleModalOpen && (
          <div className="modal-overlay" onClick={() => setIsRescheduleModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Reschedule Delivery</h3>
                <button 
                  className="modal-close" 
                  onClick={() => setIsRescheduleModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleRescheduleSubmit}>
                <div className="modal-body">
                  <div className="delivery-info">
                    <p><strong>Delivery ID:</strong> {selectedDelivery?.id}</p>
                    <p><strong>Product:</strong> {selectedDelivery?.product}</p>
                    <p><strong>Quantity:</strong> {selectedDelivery?.quantity}</p>
                    <p><strong>Current Scheduled Date:</strong> {selectedDelivery?.scheduleDate}</p>
                  </div>
                  <div className="form-group">
                    <label htmlFor="newDeliveryDate">Select New Delivery Date *</label>
                    <input 
                      type="date" 
                      id="newDeliveryDate"
                      value={newDeliveryDate}
                      onChange={(e) => setNewDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <p className="reschedule-note">
                    ⓘ Your reschedule request will be sent to the employee dashboard for approval.
                  </p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setIsRescheduleModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <div className="footer-bottom">
            <p>&copy; 2024 Laklight Food Products. All rights reserved.</p>
          </div>
        </div>
      </>
    </div>
  )
}

export default FarmerDashboard
