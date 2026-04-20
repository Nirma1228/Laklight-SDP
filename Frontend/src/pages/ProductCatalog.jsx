import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { config } from '../config'
import './ProductCatalog.css'

function ProductCatalog() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const BACKEND_URL = config.API_BASE_URL.replace('/api', '')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/products`)
      const data = await res.json()
      if (data.success) {
        // Map backend schema to frontend state
        setProducts(data.products.map(p => ({
          id: p.id || p.product_id, // Use correct ID field
          name: p.name,
          category: p.category || p.category_name || 'other',
          price: parseFloat(p.price),
          unit: p.unit || p.unit_name || 'unit',
          stock: p.stock_quantity,
          description: p.description,
          availability: p.is_available === 0 ? 'out-of-stock' : (p.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'),
          image: p.image_url ? (p.image_url.startsWith('http') ? p.image_url : `${BACKEND_URL}${p.image_url}`) : null
        })))
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    unit: 'kg',
    stock: 0,
    description: '',
    image: '',
    availability: 'in-stock'
  })

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const data = new FormData()
    data.append('image', file)

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/products/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      })

      if (response.ok) {
        const result = await response.json()
        setFormData({ ...formData, image: result.url })
      } else {
        alert('Failed to upload image')
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      category: '',
      price: 0,
      unit: 'kg',
      stock: 0,
      description: '',
      image: '',
      availability: 'in-stock'
    })
    setShowModal(true)
  }

  const openEditModal = (product) => {
    // Determine internal category name from display name
    let categoryValue = product.category?.toLowerCase() || ''
    if (categoryValue.includes('beverage') || categoryValue.includes('juice')) categoryValue = 'beverages'
    else if (categoryValue.includes('dessert') || categoryValue.includes('jelly') || categoryValue.includes('jam')) categoryValue = 'desserts'
    else if (categoryValue.includes('sauce') || categoryValue.includes('other')) categoryValue = 'sauce'

    // Normalize availability value for the select dropdown
    let availabilityValue = product.availability?.toLowerCase() || 'in-stock'
    if (availabilityValue === 'in stock') availabilityValue = 'in-stock'
    if (availabilityValue === 'out of stock') availabilityValue = 'out-of-stock'
    if (availabilityValue === 'low stock') availabilityValue = 'low-stock'

    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      category: categoryValue,
      price: product.price || 0,
      unit: product.unit || 'kg',
      stock: product.stock || 0,
      description: product.description || '',
      image: product.image || '',
      availability: availabilityValue
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prepare the update object with exact numeric types
    const imageUrlToSave = formData.image.startsWith(BACKEND_URL) 
      ? formData.image.replace(BACKEND_URL, '') 
      : formData.image

    const updatedData = {
      id: editingProduct ? editingProduct.id : Date.now(), // Preserve ID
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      unit: formData.unit,
      stock: Number(formData.stock),
      description: formData.description,
      image_url: imageUrlToSave,
      availability: formData.availability // Store the raw value consistently (in-stock, low-stock, out-of-stock)
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const method = editingProduct ? 'PUT' : 'POST'
      const url = editingProduct 
        ? `${config.API_BASE_URL}/products/${editingProduct.id}`
        : `${config.API_BASE_URL}/products`

      const bodyContent = {
        name: updatedData.name,
        category: updatedData.category,
        price: updatedData.price,
        unit: updatedData.unit,
        stock: updatedData.stock,
        description: updatedData.description,
        image_url: updatedData.image_url,
        availability: formData.availability // Pass raw value instead of mapped "In Stock" text
      }

      console.log('Sending update:', bodyContent)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyContent)
      })

      if (response.ok) {
        // Only refresh products from server after a successful save
        await fetchProducts()
        setShowModal(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to save: ${errorData.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Save error:', err)
      // Fallback for demo/offline: Update local state correctly
      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedData : p))
      } else {
        setProducts(prev => [...prev, updatedData])
      }
      setShowModal(false)
    }
  }

  const handleDeleteClick = (product) => {
    setProductToDelete(product)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productToDelete.id))
      } else {
        const errorData = await response.json()
        alert(`Failed to delete: ${errorData.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Delete error:', err)
      // Fallback
      setProducts(products.filter(p => p.id !== productToDelete.id))
    } finally {
      setShowDeleteConfirm(false)
      setProductToDelete(null)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category?.toLowerCase() === categoryFilter.toLowerCase()
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
                <option value="beverages">Beverages (Juice)</option>
                <option value="desserts">Desserts (Jelly/Jam)</option>
                <option value="sauce">Sauce & Others</option>
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
                    <span className="detail-label">Available:</span>
                    <span className={product.availability === 'in-stock' ? 'status-active' : 'status-inactive'}>
                      {product.availability === 'in-stock' ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <div className="product-actions">
                  <button className="btn btn-warning btn-small" onClick={() => openEditModal(product)}>Edit</button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDeleteClick(product)}>Delete</button>
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
                    <option value="beverages">Beverages (Juice)</option>
                    <option value="desserts">Desserts (Jelly/Jam)</option>
                    <option value="sauce">Sauce & Others</option>
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
                    <option value="bottle">bottle</option>
                    <option value="pack">pack</option>
                    <option value="unit">unit</option>
                    <option value="piece">piece</option>
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
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="form-row full-width">
                <div className="form-group">
                  <label>Product Image</label>
                  <div className="image-upload-container">
                    {uploading ? (
                      <div className="upload-loading">
                        <div className="spinner"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : formData.image ? (
                      <div className="image-preview-wrapper">
                        <img 
                          src={formData.image.startsWith('http') ? formData.image : `${BACKEND_URL}${formData.image}`} 
                          alt="Preview" 
                          className="preview-img" 
                        />
                        <div 
                          className="image-edit-overlay"
                          onClick={() => setFormData({ ...formData, image: '' })}
                        >
                          <i className="fas fa-camera"></i>
                          <span>Change</span>
                        </div>
                        <button 
                          type="button" 
                          className="remove-img-btn"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          title="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <label className="upload-label-wrapper">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                        <div className="upload-icon">
                          <i className="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div className="upload-text">Click to upload product image</div>
                        <div className="upload-hint">PNG, JPG or WebP (Max 5MB)</div>
                      </label>
                    )}
                  </div>
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

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <div className="confirm-modal-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Delete Product?</h3>
            <p>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="confirm-modal-actions">
              <button 
                className="btn-modal-cancel" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                No, Keep it
              </button>
              <button 
                className="btn-modal-confirm" 
                style={{ backgroundColor: '#dc2626' }}
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
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
