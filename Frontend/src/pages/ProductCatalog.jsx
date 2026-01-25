import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProductCatalog.css'

function ProductCatalog() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([
    { id: 1, name: 'Lime Mix', category: 'beverages', price: 150, unit: 'bottle', stock: 150, description: 'Refreshing lime cordial 350ml', availability: 'in-stock', image: '/images/Lime Mix.png' },
    { id: 2, name: 'Wood Apple Juice', category: 'beverages', price: 100, unit: 'bottle', stock: 200, description: 'Traditional wood apple nectar 200ml', availability: 'in-stock', image: '/images/Wood Apple Juice.png' },
    { id: 3, name: 'Mango Jelly', category: 'desserts', price: 200, unit: 'pack', stock: 45, description: 'Premium mango jelly 100g', availability: 'low-stock', image: '/images/Mango Jelly.png' },
    { id: 4, name: 'Custard Powder', category: 'desserts', price: 300, unit: 'pack', stock: 100, description: 'Mango flavored custard powder 100g', availability: 'in-stock', image: '/images/Custard powder.png' }
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    unit: 'kg',
    stock: '',
    description: '',
    availability: 'in-stock'
  })

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({ name: '', category: '', price: '', unit: 'kg', stock: '', description: '', availability: 'in-stock' })
    setShowModal(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData(product)
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p))
    } else {
      setProducts([...products, { ...formData, id: Date.now() }])
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'low' && product.price < 300) ||
      (priceFilter === 'medium' && product.price >= 300 && product.price < 700) ||
      (priceFilter === 'high' && product.price >= 700)
    return matchesSearch && matchesCategory && matchesPrice
  })

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.availability === 'in-stock').length,
    lowStock: products.filter(p => p.availability === 'low-stock').length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  }

  return (
    <div className="product-catalog">
      {/* Header */}
      <div className="header">
        <div className="nav-container">
          <div className="logo">
            <img src="/images/Logo.png" alt="Laklight" style={{ height: '40px', marginRight: '10px' }} />
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
          <div>
            <h1 className="page-title">Product Catalog Management</h1>
            <p className="page-description">Manage your product inventory and pricing</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={openAddModal}>+ Add Product</button>
            <button className="btn btn-secondary" onClick={() => alert('Export feature')}>Export</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.inStock}</div>
            <div className="stat-label">In Stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.lowStock}</div>
            <div className="stat-label">Low Stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">Rs. {stats.totalValue.toLocaleString()}</div>
            <div className="stat-label">Total Inventory Value</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-row">
            <div className="form-group">
              <label>Search Products</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="vegetables">Vegetables</option>
                <option value="dairy">Dairy</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price Range</label>
              <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                <option value="all">All Prices</option>
                <option value="low">Under Rs. 300</option>
                <option value="medium">Rs. 300 - 700</option>
                <option value="high">Above Rs. 700</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  product.name.charAt(0)
                )}
              </div>
              <div className="product-info">
                <div className="product-header">
                  <h3 className="product-name">{product.name}</h3>
                </div>
                <span className="product-category">{product.category}</span>
                <p className="product-description">{product.description}</p>
                <div className="product-details">
                  <div className="product-detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value price-value">Rs. {product.price}/{product.unit}</span>
                  </div>
                  <div className="product-detail-row">
                    <span className="detail-label">Stock:</span>
                    <span className={`stock-badge stock-${product.availability === 'in-stock' ? 'good' : product.availability === 'low-stock' ? 'warning' : 'critical'}`}>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                  <div className="product-detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-${product.availability === 'in-stock' ? 'active' : 'inactive'}`}>
                      {product.availability === 'in-stock' ? 'In Stock' : 'Low Stock'}
                    </span>
                  </div>
                </div>
                <div className="product-actions">
                  <button className="btn btn-warning btn-small" onClick={() => openEditModal(product)}>Edit</button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDelete(product.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="dairy">Dairy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="kg">kg</option>
                    <option value="L">Liters</option>
                    <option value="dozen">Dozen</option>
                    <option value="units">Units</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Availability *</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="form-row full-width">
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
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
    </div>
  )
}

export default ProductCatalog
