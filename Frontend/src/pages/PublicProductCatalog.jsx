import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { config } from '../config'
import { useToast } from '../components/ToastNotification'
import './CustomerDashboard.css'

// Product Card Component (read-only for public view)
const ProductCard = ({ product, onLoginPrompt, backendUrl }) => {
  const handleAddToCart = () => {
    onLoginPrompt()
  }

  const availability = product.is_available !== undefined
    ? (product.is_available ? 'in-stock' : 'out-of-stock')
    : (product.stock_quantity > 10 ? 'in-stock' : product.stock_quantity > 0 ? 'low-stock' : 'out-of-stock')

  const availabilityLabel = {
    'in-stock': 'In Stock',
    'low-stock': 'Low Stock',
    'out-of-stock': 'Out of Stock'
  }[availability]

  const imageUrl = product.image_url || product.image;
  const displayImage = imageUrl 
    ? (imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`)
    : '/images/placeholder.png';

  return (
    <div className="product-card">
      <div className="product-img" style={{ height: '200px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={displayImage}
          alt={product.name}
          style={{ height: '100%', width: 'auto', objectFit: 'contain', borderRadius: '8px' }}
        />
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-price">LKR {(parseFloat(product.price) || 0).toFixed(2)}</div>
        <div className="product-description">{product.description}</div>
        <div className={`product-availability availability-${availability}`}>
          {availabilityLabel}
        </div>
        <div className="product-stock" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', fontWeight: 'bold' }}>
          Stock Available: {product.stock_quantity !== undefined ? product.stock_quantity : product.stock} Units
        </div>
        <div className="product-actions">
          <button
            className="btn btn-primary btn-small add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={availability === 'out-of-stock'}
            title="Login to add to cart"
          >
            🔒 Login to Order
          </button>
        </div>
      </div>
    </div>
  )
}

const PublicProductCatalog = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [featuredSearch, setFeaturedSearch] = useState('')
  const [featuredCategory, setFeaturedCategory] = useState('')
  const [featuredSort, setFeaturedSort] = useState('')
  const backendUrl = config.API_BASE_URL.replace('/api', '')

  // Fetch all products from API (same endpoint as CustomerDashboard)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}/products`)
        const data = await res.json()
        if (data.success) {
          setProducts(data.products)
        }
      } catch (err) {
        console.error('Product fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleLoginPrompt = () => {
    toast.warning('Please login to add items to your cart')
    setTimeout(() => {
      navigate('/login?redirect=/customer/dashboard')
    }, 1500)
  }

  // Get unique categories from fetched products
  const categories = [...new Set(products.map(p => p.category_name || p.category).filter(Boolean))]

  const filteredProducts = products.filter(product => {
    const productCategory = product.category_name || product.category || ''
    const matchesSearch = !featuredSearch ||
      product.name.toLowerCase().includes(featuredSearch.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(featuredSearch.toLowerCase())

    const matchesCategory = !featuredCategory || productCategory === featuredCategory

    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (featuredSort) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price)
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price)
      case 'popular':
        return a.name.localeCompare(b.name)
      case 'newest':
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })

  return (
    <div className="customer-dashboard">
      <Header
        isLoggedIn={false}
        customLinks={[
          { label: 'Home', path: '/' },
          { label: 'Products', path: '/shop' },
          { label: 'Login', path: '/login' }
        ]}
      />

      {/* Dashboard Content */}
      <main className="dashboard">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1 className="welcome-title">Our Products</h1>
          <p>Browse our premium selection of cordials, jams, and more. Login to place orders and get automatic wholesale discounts for bulk purchases.</p>
          <div className="welcome-buttons">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Login to Shop
            </button>
            <button
              className="btn btn-secondary"
              style={{ marginLeft: '1rem' }}
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </section>

        {/* Product Catalog */}
        <div id="products" className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Product Catalog</h2>
            {!loading && (
              <span style={{ color: '#666', fontSize: '0.9rem' }}>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </span>
            )}
          </div>

          {/* Search and Filter */}
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search products by name or description..."
                value={featuredSearch}
                onChange={(e) => setFeaturedSearch(e.target.value)}
              />
            </div>
            <div className="filter-options">
              <select
                className="filter-select"
                value={featuredCategory}
                onChange={(e) => setFeaturedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                className="filter-select"
                value={featuredSort}
                onChange={(e) => setFeaturedSort(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Name: A–Z</option>
                <option value="newest">Name: Z–A</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="no-results" style={{ padding: '3rem', textAlign: 'center' }}>
              <p>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-results">No products found matching your criteria.</div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.product_id || product.id}
                  product={product}
                  onLoginPrompt={handleLoginPrompt}
                  backendUrl={backendUrl}
                />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Login to View Your Cart
            </button>
            <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
              💡 Order 12+ pieces of any product to get automatic 10% wholesale discount!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PublicProductCatalog
