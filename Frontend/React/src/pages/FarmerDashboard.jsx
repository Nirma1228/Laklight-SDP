import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FarmerDashboard.css'

function FarmerDashboard() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([{ id: 1, name: '', category: '', quantity: '', unit: 'kg', priceRange: '', customPrice: '', transport: '', deliveryDate: '' }])
  const [submissions, setSubmissions] = useState([
    { id: 1, product: 'Organic Tomatoes', status: 'under-review', date: '2024-01-20' },
    { id: 2, product: 'Fresh Carrots', status: 'selected', date: '2024-01-18' },
    { id: 3, product: 'Green Beans', status: 'not-selected', date: '2024-01-15' }
  ])

  const deliveries = [
    { id: 1, date: '2024-01-25', product: 'Organic Tomatoes', quantity: '500 kg', status: 'scheduled' },
    { id: 2, date: '2024-01-20', product: 'Fresh Milk', quantity: '200 L', status: 'completed' }
  ]

  const addProduct = () => {
    const newProduct = {
      id: products.length + 1,
      name: '',
      category: '',
      quantity: '',
      unit: 'kg',
      priceRange: '',
      customPrice: '',
      transport: '',
      deliveryDate: ''
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

  return (
    <div className="farmer-dashboard">
      {/* Header */}
      <div className="header">
        <div className="nav-container">
          <div className="logo">
            <span>🌿</span>
            Laklight Food Products
          </div>
          <div className="user-info">
            <span className="farm-welcome">Welcome, Farmer!</span>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>Logout</button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard">
        <div className="welcome-section">
          <h1 className="welcome-title">Farmer Dashboard</h1>
          <p>Submit your products and manage deliveries.</p>
          <span className="approval-status status-approved">✓ Account Approved</span>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">3</div>
            <div className="stat-label">Total Submissions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1</div>
            <div className="stat-label">Selected Products</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">2</div>
            <div className="stat-label">Deliveries</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1</div>
            <div className="stat-label">Under Review</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Submit Products Section */}
          <div className="dashboard-card full-width">
            <div className="card-header">
              <div className="card-icon">📦</div>
              <h2 className="card-title">Submit Products</h2>
            </div>

            <form onSubmit={handleSubmitAll}>
              <div id="products-container">
                <div className="product-count">Products to Submit: {products.length}</div>
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

                    <div className="form-group">
                      <label>Product Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        placeholder="e.g., Organic Tomatoes"
                      />
                    </div>

                    <div className="form-group">
                      <label>Category *</label>
                      <select 
                        required
                        value={product.category}
                        onChange={(e) => updateProduct(product.id, 'category', e.target.value)}
                      >
                        <option value="">Select category</option>
                        <option value="vegetables">Vegetables</option>
                        <option value="fruits">Fruits</option>
                        <option value="dairy">Dairy</option>
                        <option value="grains">Grains</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quantity & Unit *</label>
                      <div style={{display: 'flex', gap: '1rem'}}>
                        <input 
                          type="number" 
                          required 
                          value={product.quantity}
                          onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                          placeholder="Amount"
                          style={{flex: 2}}
                        />
                        <select 
                          value={product.unit}
                          onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                          style={{flex: 1}}
                        >
                          <option value="kg">kg</option>
                          <option value="L">Liters</option>
                          <option value="units">Units</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Price Range</label>
                      <div className="price-options">
                        {['Rs. 100-200', 'Rs. 200-400', 'Rs. 400-600', 'Rs. 600+'].map(range => (
                          <div 
                            key={range}
                            className={`price-option ${product.priceRange === range ? 'selected' : ''}`}
                            onClick={() => updateProduct(product.id, 'priceRange', range)}
                          >
                            {range}
                          </div>
                        ))}
                      </div>
                      <div className="custom-price">
                        <span>or enter custom price:</span>
                        <input 
                          type="number" 
                          value={product.customPrice}
                          onChange={(e) => updateProduct(product.id, 'customPrice', e.target.value)}
                          placeholder="Rs. per unit"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Transport Option *</label>
                      <div className="transport-selection">
                        <div 
                          className={`transport-option ${product.transport === 'company' ? 'selected' : ''}`}
                          onClick={() => updateProduct(product.id, 'transport', 'company')}
                        >
                          <i className="fas fa-truck"></i>
                          <span>Company Transport</span>
                          <div className="transport-description">We'll arrange pickup</div>
                        </div>
                        <div 
                          className={`transport-option ${product.transport === 'self' ? 'selected' : ''}`}
                          onClick={() => updateProduct(product.id, 'transport', 'self')}
                        >
                          <i className="fas fa-user"></i>
                          <span>Self Delivery</span>
                          <div className="transport-description">You'll deliver to us</div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Preferred Delivery Date</label>
                      <input 
                        type="date" 
                        value={product.deliveryDate}
                        onChange={(e) => updateProduct(product.id, 'deliveryDate', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-more-section">
                <button type="button" className="btn btn-add" onClick={addProduct}>
                  <i className="fas fa-plus"></i>
                  Add Another Product
                </button>
              </div>

              <div className="submit-all-section">
                <h3>Ready to Submit?</h3>
                <p>Submit all {products.length} product(s) for review by our team</p>
                <button type="submit" className="btn btn-success" style={{marginTop: '1rem', padding: '1rem 3rem', fontSize: '1.1rem'}}>
                  Submit All Products
                </button>
              </div>
            </form>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Product Submissions */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">📋</div>
                <h2 className="card-title">Submissions</h2>
              </div>
              {submissions.map(sub => (
                <div key={sub.id} className="product-item">
                  <div className="product-header">
                    <span className="product-name">{sub.product}</span>
                    <span className={`product-status status-${sub.status}`}>
                      {sub.status === 'selected' ? 'Selected' : 
                       sub.status === 'under-review' ? 'Under Review' : 
                       'Not Selected'}
                    </span>
                  </div>
                  <div style={{fontSize: '0.9rem', color: '#666'}}>Submitted: {sub.date}</div>
                </div>
              ))}
            </div>

            {/* Delivery Schedule */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">🚚</div>
                <h2 className="card-title">Deliveries</h2>
              </div>
              {deliveries.map(delivery => (
                <div key={delivery.id} className="delivery-item">
                  <div className="delivery-details">
                    <div className="delivery-date">{delivery.date}</div>
                    <div>{delivery.product}</div>
                    <div>{delivery.quantity}</div>
                  </div>
                  <span className={`delivery-status status-${delivery.status}`}>
                    {delivery.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
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

export default FarmerDashboard
