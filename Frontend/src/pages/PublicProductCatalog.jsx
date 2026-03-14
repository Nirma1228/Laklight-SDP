import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import './CustomerDashboard.css'

// Product Card Component
const ProductCard = ({ productKey, product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const updateQuantity = (change) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + change)))
  }

  const handleAddToCart = () => {
    onAddToCart(productKey, quantity)
    setQuantity(1)
    setAdded(true)
    setTimeout(() => setAdded(false), 400)
  }

  return (
    <div className="product-card" data-key={productKey}>
      <div className="product-img" style={{ height: '200px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ height: '100%', width: 'auto', objectFit: 'contain', borderRadius: '8px' }}
        />
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-price">LKR {product.price.toFixed(2)}</div>
        <div className="product-description">{product.description}</div>
        <div className={`product-availability availability-${product.availability}`}>
          {product.availability === 'in-stock' && 'In Stock'}
          {product.availability === 'low-stock' && 'Low Stock'}
          {product.availability === 'out-of-stock' && 'Out of Stock'}
        </div>
        <div className="product-actions">
          <div className="quantity-controls">
            <button className="quantity-btn" onClick={() => updateQuantity(-1)}>-</button>
            <input
              type="number"
              className="quantity-input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
              min="1"
              max="99"
            />
            <button className="quantity-btn" onClick={() => updateQuantity(1)}>+</button>
          </div>
          <button
            className={`btn btn-primary btn-small add-to-cart-btn${added ? ' added' : ''}`}
            onClick={handleAddToCart}
            disabled={product.availability === 'out-of-stock'}
          >
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

const PublicProductCatalog = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [featuredSearch, setFeaturedSearch] = useState('')
  const [featuredCategory, setFeaturedCategory] = useState('')
  const [featuredSort, setFeaturedSort] = useState('')

  const products = {
    'lime': {
      name: 'Lime Mix',
      price: 150.00,
      image: '/images/Lime Mix.png',
      description: 'Refreshing lime cordial made from fresh lime extracts. Perfect for mixing with water or soda. 350ml bottle.',
      availability: 'in-stock',
      category: 'juice'
    },
    'woodapple': {
      name: 'Wood Apple Juice',
      price: 100.00,
      image: '/images/Wood Apple Juice.png',
      description: 'Traditional Sri Lankan wood apple juice rich in nutrients. Naturally sweet and tangy. 200ml liter bottle.',
      availability: 'in-stock',
      category: 'juice'
    },
    'mangojelly': {
      name: 'Mango Jelly',
      price: 200.00,
      image: '/images/Mango Jelly.png',
      description: 'Premium mango jelly made from fresh mangoes. Great for desserts and breakfast spreads. 100g pack.',
      availability: 'out-of-stock',
      category: 'jam'
    },
    'custard': {
      name: 'Custard powder',
      price: 300.00,
      image: '/images/Custard powder.png',
      description: 'High-quality custard powder for delicious desserts. Rich vanilla flavor. Perfect for puddings and trifles. 100g pack.',
      availability: 'in-stock',
      category: 'preserves'
    }
  }

  const addToCart = (productKey, quantity = 1) => {
    // Check if user is logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      toast.warning('Please login to add items to your cart')
      setTimeout(() => {
        navigate('/login?redirect=/customer/dashboard')
      }, 1500)
      return
    }

    // If logged in, redirect to customer dashboard
    toast.info('Redirecting to your dashboard...')
    setTimeout(() => {
      navigate('/customer/dashboard')
    }, 1000)
  }

  const filteredProducts = Object.entries(products).filter(([key, product]) => {
    const matchesSearch = !featuredSearch ||
      product.name.toLowerCase().includes(featuredSearch.toLowerCase()) ||
      product.description.toLowerCase().includes(featuredSearch.toLowerCase())

    const matchesCategory = !featuredCategory || product.category === featuredCategory

    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    const [keyA, productA] = a
    const [keyB, productB] = b

    switch (featuredSort) {
      case 'price-low':
        return productA.price - productB.price
      case 'price-high':
        return productB.price - productA.price
      case 'popular':
        return productA.name.localeCompare(productB.name)
      case 'newest':
        return productB.name.localeCompare(productA.name)
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
          <p>Browse our premium selection of cordials, jams, and sauces. Login to place orders and get automatic wholesale discounts for bulk purchases.</p>
          <div className="welcome-buttons">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Login to Shop
            </button>
          </div>
        </section>

        {/* Featured Products */}
        <div id="products" className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Featured Products</h2>
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
                <option value="fruits">Fresh Fruits</option>
                <option value="juice">Fruit Juice</option>
                <option value="jam">Fruit Jam</option>
                <option value="preserves">Preserves</option>
              </select>
              <select
                className="filter-select"
                value={featuredSort}
                onChange={(e) => setFeaturedSort(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-results">No featured products found matching your criteria.</div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(([key, product]) => (
                <ProductCard
                  key={key}
                  productKey={key}
                  product={product}
                  onAddToCart={addToCart}
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
