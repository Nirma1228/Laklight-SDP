import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import StripeCheckoutButton from '../components/StripeCheckoutButton'
import './CustomerDashboard.css'

const CustomerDashboard = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [featuredSearch, setFeaturedSearch] = useState('')
  const [featuredCategory, setFeaturedCategory] = useState('')
  const [featuredSort, setFeaturedSort] = useState('')
  
  const [profileData, setProfileData] = useState({
    firstName: 'Asoka',
    lastName: 'Perera',
    email: 'asoka.perera@email.com',
    phone: '+94 71 234 5678',
    address: '123 Main Street',
    city: 'Colombo',
    postalCode: '00100',
    district: 'colombo',
    notifications: 'all',
    language: 'en'
  })

  const [checkoutData, setCheckoutData] = useState({
    firstName: '',
    lastName: '',
    deliveryAddress: '',
    contactNumber: '',
    postalCode: '',
    orderNotes: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('visa') // default to VISA

  const products = {
    'lime': { name: 'Lime Mix', price: 150.00, image: '/images/Lime Mix.png', description: 'Refreshing lime cordial made from fresh lime extracts. Perfect for mixing with water or soda. 350ml bottle.', availability: 'in-stock', category: 'juice' },
    'woodapple': { name: 'Wood Apple Juice', price: 100.00, image: '/images/Wood Apple Juice.png', description: 'Traditional Sri Lankan wood apple juice rich in nutrients. Naturally sweet and tangy. 200ml liter bottle.', availability: 'in-stock', category: 'juice' },
    'mangojelly': { name: 'Mango Jelly', price: 200.00, image: '/images/Mango Jelly.png', description: 'Premium mango jelly made from fresh mangoes. Great for desserts and breakfast spreads. 100g pack.', availability: 'out-of-stock', category: 'jam' },
    'custard': { name: 'Custard powder', price: 300.00, image: '/images/Custard powder.png', description: 'High-quality custard powder for delicious desserts. Rich vanilla flavor. Perfect for puddings and trifles. 100g pack.', availability: 'in-stock', category: 'preserves' }
  }

  const orders = [
    {
      id: 'O001',
      items: '15x Fresh Mango Drink',
      total: 3375.00,
      discount: true,
      status: 'processing'
    },
    {
      id: 'O002',
      items: '8x Mixed Jam Collection',
      total: 2400.00,
      discount: false,
      status: 'completed'
    }
  ]

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('laklight_customer_cart_v1')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('laklight_customer_cart_v1', JSON.stringify(cart))
  }, [cart])

  const addToCart = (productKey, quantity = 1) => {
    const product = products[productKey]
    if (!product) return

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.key === productKey)
      if (existingItem) {
        return prevCart.map(item => 
          item.key === productKey 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prevCart, {
          key: productKey,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity
        }]
      }
    })
  }

  const removeFromCart = (productKey) => {
    setCart(prevCart => prevCart.filter(item => item.key !== productKey))
  }

  const updateQuantity = (productKey, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.key === productKey) {
          const newQuantity = item.quantity + change
          return newQuantity <= 0 ? null : { ...item, quantity: newQuantity }
        }
        return item
      }).filter(Boolean)
    })
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  const saveProfile = () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email || 
        !profileData.phone || !profileData.address || !profileData.city || 
        !profileData.postalCode || !profileData.district) {
      alert('Please fill in all required fields marked with *')
      return
    }

    alert('Profile updated successfully!\n\nYour changes have been saved.')
    setIsEditProfileOpen(false)
  }

  const handleCheckoutSubmit = (e) => {
    e.preventDefault()
    setIsCheckoutOpen(false)
    setIsPaymentOpen(true)
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const qualifiesForDiscount = totalItems >= 12;
    const discount = qualifiesForDiscount ? subtotal * 0.1 : 0;
    const total = subtotal - discount;
    return { subtotal, totalItems, discount, total, qualifiesForDiscount };
  };

  const { subtotal, totalItems, discount, total, qualifiesForDiscount } = calculateTotals()

  const filteredProducts = Object.entries(products).filter(([key, product]) => {
    const matchesSearch = !featuredSearch || 
      product.name.toLowerCase().includes(featuredSearch.toLowerCase()) ||
      product.description.toLowerCase().includes(featuredSearch.toLowerCase())
    
    const matchesCategory = !featuredCategory || product.category === featuredCategory
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    const [keyA, productA] = a
    const [keyB, productB] = b
    
    switch(featuredSort) {
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
      {/* Header */}
      <header className="header">
        <nav className="nav-container">
          <Link to="/home" style={{ textDecoration: 'none', color: 'white' }}>
            <div className="logo">
              <img src="/images/Logo.png" alt="Laklights Food Products" className="logo-img" />
              Laklights Food Products
            </div>
          </Link>
          <ul className="nav-menu">
            <li><Link to="/home">Dashboard</Link></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#orders">My Orders</a></li>
            <li><a href="#profile">Profile</a></li>
          </ul>
          <div className="user-info">
            <div className="cart-icon" onClick={toggleCart}>
              <span className="cart-icon-symbol">🛒</span>
              <span className="cart-label">My Cart</span>
              {totalItems > 0 && <span id="cart-count">{totalItems}</span>}
            </div>
            <span className="welcome-text">Welcome, {profileData.firstName} {profileData.lastName}</span>
            <div className="header-buttons">
              <button className="btn btn-primary" onClick={() => setIsEditProfileOpen(true)}>
                Edit Profile
              </button>
              <Link to="/" className="btn btn-secondary">Logout</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1 className="welcome-title">Customer Dashboard</h1>
          <p>Welcome to your Laklights Food Products account. Browse our premium cordials, jams, and sauces with automatic wholesale discounts for bulk orders.</p>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Recent Orders</h2>
            </div>
            <div id="recent-orders">
              {orders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-details">
                    <div className="order-id">Order #{order.id}</div>
                    <div>{order.items}</div>
                    <div>Total: LKR {order.total.toFixed(2)} {order.discount && '(10% discount applied)'}</div>
                  </div>
                  {order.status === 'completed' ? (
                    <a href="/feedback" className="order-status status-completed">Delivered</a>
                  ) : (
                    <span className={`order-status status-${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <a href="#orders" className="btn btn-primary">View All Orders</a>
          </div>

          {/* Account Summary */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Account Summary</h2>
            </div>
            <div>
              <p><strong>Customer ID:</strong> C001</p>
              <p><strong>Total Orders:</strong> 12</p>
              <p><strong>Total Spent:</strong> LKR 45,500.00</p>
              <p><strong>Wholesale Discounts Earned:</strong> LKR 4,550.00</p>
              <p><strong>Member Since:</strong> January 2025</p>
            </div>
          </div>
        </div>

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
            <a href="/product-catalog" className="btn btn-primary">View All Products</a>
            <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
              💡 Order 12+ pieces of any product to get automatic 10% wholesale discount!
            </p>
          </div>
        </div>
      </main>

      {/* Shopping Cart Sidebar */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={toggleCart}></div>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-title">
            Shopping Cart
            <button className="cart-close" onClick={toggleCart}>×</button>
          </div>
        </div>
        <div className="cart-content">
          <div id="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <p>Your cart is empty</p>
                <p>Add some delicious products to get started!</p>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.key} className="cart-item">
                    <div className="cart-item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <span>🧃</span>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">LKR {item.price.toFixed(2)}</div>
                      <div className="cart-item-quantity">
                        <button className="quantity-btn" onClick={() => updateQuantity(item.key, -1)}>-</button>
                        <span style={{ padding: '0 1rem' }}>{item.quantity}</span>
                        <button className="quantity-btn" onClick={() => updateQuantity(item.key, 1)}>+</button>
                        <button 
                          className="btn btn-danger btn-small" 
                          style={{ marginLeft: '1rem' }}
                          onClick={() => removeFromCart(item.key)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>LKR {subtotal.toFixed(2)}</span>
              </div>
              {qualifiesForDiscount && (
                <div className="summary-row">
                  <span>Wholesale Discount (10%):</span>
                  <span style={{ color: '#4caf50' }}>-LKR {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row summary-total">
                <span>Total:</span>
                <span>LKR {total.toFixed(2)}</span>
              </div>
              
              {qualifiesForDiscount ? (
                <div className="wholesale-notice">
                  🎉 Congratulations! You've qualified for our 10% wholesale discount on bulk orders (12+ pieces)
                </div>
              ) : (
                <div className="wholesale-notice" style={{ background: '#fff3cd', borderColor: '#ffc107' }}>
                  💡 Add {12 - totalItems} more items to qualify for 10% wholesale discount
                </div>
              )}
              
              <div className="checkout-section">
                <button 
                  className="btn btn-primary checkout-btn" 
                  style={{ width: '100%', marginBottom: '1rem' }}
                  onClick={() => {
                    if (cart.length === 0) {
                      alert('Your cart is empty! Please add items before checking out.')
                      return
                    }
                    setIsCheckoutOpen(true)
                  }}
                >
                  Proceed to Checkout
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%' }}
                  onClick={toggleCart}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Edit Profile</h2>
              <button className="close" onClick={() => setIsEditProfileOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form>
                {/* Personal Information */}
                <div className="profile-section">
                  <h3 className="section-title">Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input 
                        type="text" 
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input 
                        type="text" 
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="profile-section">
                  <h3 className="section-title">Delivery Address</h3>
                  <div className="form-group">
                    <label>Street Address *</label>
                    <input 
                      type="text" 
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input 
                        type="text" 
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code *</label>
                      <input 
                        type="text" 
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>District *</label>
                    <select 
                      value={profileData.district}
                      onChange={(e) => setProfileData({...profileData, district: e.target.value})}
                      required
                    >
                      <option value="">Select District</option>
                      <option value="colombo">Colombo</option>
                      <option value="gampaha">Gampaha</option>
                      <option value="kalutara">Kalutara</option>
                      <option value="kandy">Kandy</option>
                      <option value="matale">Matale</option>
                      <option value="nuwara-eliya">Nuwara Eliya</option>
                      <option value="galle">Galle</option>
                      <option value="matara">Matara</option>
                      <option value="hambantota">Hambantota</option>
                    </select>
                  </div>
                </div>

                {/* Account Preferences */}
                <div className="profile-section">
                  <h3 className="section-title">Account Preferences</h3>
                  <div className="form-group">
                    <label>Email Notifications</label>
                    <select 
                      value={profileData.notifications}
                      onChange={(e) => setProfileData({...profileData, notifications: e.target.value})}
                    >
                      <option value="all">All Notifications</option>
                      <option value="orders">Order Updates Only</option>
                      <option value="promotions">Promotions Only</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Preferred Language</label>
                    <select 
                      value={profileData.language}
                      onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                    >
                      <option value="en">English</option>
                      <option value="si">Sinhala</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setIsEditProfileOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={saveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Checkout - Delivery Details</h2>
              <span className="close" onClick={() => setIsCheckoutOpen(false)}>×</span>
            </div>
            <form onSubmit={handleCheckoutSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input 
                      type="text" 
                      value={checkoutData.firstName}
                      onChange={(e) => setCheckoutData({...checkoutData, firstName: e.target.value})}
                      placeholder="Enter first name"
                        required 
                      />
                    </div>
                  </div>
                
                  <div className="form-group">
                    <label>Delivery Address *</label>
                    <textarea 
                      value={checkoutData.deliveryAddress}
                      onChange={(e) => setCheckoutData({...checkoutData, deliveryAddress: e.target.value})}
                      placeholder="Enter full delivery address"
                      rows="3"
                      required
                    />
                  </div>
                
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Number *</label>
                      <input 
                        type="tel" 
                        value={checkoutData.contactNumber}
                        onChange={(e) => setCheckoutData({...checkoutData, contactNumber: e.target.value})}
                        placeholder="07XXXXXXXX"
                        pattern="[0-9]{10}"
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code *</label>
                      <input 
                        type="text" 
                        value={checkoutData.postalCode}
                        onChange={(e) => setCheckoutData({...checkoutData, postalCode: e.target.value})}
                        placeholder="Enter postal code"
                        pattern="[0-9]{5}"
                        required 
                      />
                    </div>
                  </div>
                
                  <div className="form-group">
                    <label>Order Notes (Optional)</label>
                    <textarea 
                      value={checkoutData.orderNotes}
                      onChange={(e) => setCheckoutData({...checkoutData, orderNotes: e.target.value})}
                      placeholder="Any special instructions for delivery?"
                      rows="2"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {isPaymentOpen && (
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Select Payment Method</h2>
                <span className="close" onClick={() => setIsPaymentOpen(false)}>×</span>
              </div>
              <div className="modal-body">
                <p>Total: <strong>LKR {total.toFixed(2)}</strong></p>
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="visa">VISA</option>
                    <option value="mastercard">MasterCard</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>
                {['visa', 'mastercard'].includes(paymentMethod) ? (
                  <>
                    <p>Click below to pay securely with Stripe:</p>
                    <StripeCheckoutButton amount={total} onSuccess={() => {
                      setIsPaymentOpen(false);
                      setCart([]);
                      alert('Payment successful! Your order has been placed.');
                    }} />
                  </>
                ) : (
                  <>
                    <p>You selected <strong>Cash on Delivery</strong>. Your order will be placed and you can pay upon delivery.</p>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                      setIsPaymentOpen(false);
                      setCart([]);
                      alert('Order placed! Please pay cash upon delivery.');
                    }}>
                      Place Order (Cash on Delivery)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    )
  }

  // Product Card Component
  // Product Card Component
  const ProductCard = ({ productKey, product, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1)

    const updateQuantity = (change) => {
      setQuantity(prev => Math.max(1, Math.min(99, prev + change)))
    }

    const handleAddToCart = () => {
      onAddToCart(productKey, quantity)
      setQuantity(1)
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
              className="btn btn-primary btn-small"
              onClick={handleAddToCart}
              disabled={product.availability === 'out-of-stock'}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    )
  }

export default CustomerDashboard
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
              <a href="/product-catalog" className="btn btn-primary">View All Products</a>
              <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                💡 Order 12+ pieces of any product to get automatic 10% wholesale discount!
              </p>
            </div>
          </>
        </div>
      </main>

      {/* Shopping Cart Sidebar */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={toggleCart}></div>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-title">
            Shopping Cart
            <button className="cart-close" onClick={toggleCart}>×</button>
          </div>
        </div>
        <div className="cart-content">
          <div id="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <p>Your cart is empty</p>
                <p>Add some delicious products to get started!</p>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <>
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
                      <a href="/product-catalog" className="btn btn-primary">View All Products</a>
                      <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                        💡 Order 12+ pieces of any product to get automatic 10% wholesale discount!
                      </p>
                    </div>
                  </>
                      alert('Your cart is empty! Please add items before checking out.')
                      return
                    }
                    setIsCheckoutOpen(true)
                  }}
                >
                  Proceed to Checkout
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%' }}
                  onClick={toggleCart}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Edit Profile</h2>
              <button className="close" onClick={() => setIsEditProfileOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form>
                {/* Personal Information */}
                <div className="profile-section">
                  <h3 className="section-title">Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input 
                        type="text" 
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input 
                        type="text" 
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="profile-section">
                  <h3 className="section-title">Delivery Address</h3>
                  <div className="form-group">
                    <label>Street Address *</label>
                    <input 
                      type="text" 
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input 
                        type="text" 
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code *</label>
                      <input 
                        type="text" 
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>District *</label>
                    <select 
                      value={profileData.district}
                      onChange={(e) => setProfileData({...profileData, district: e.target.value})}
                      required
                    >
                      <option value="">Select District</option>
                      <option value="colombo">Colombo</option>
                      <option value="gampaha">Gampaha</option>
                      <option value="kalutara">Kalutara</option>
                      <option value="kandy">Kandy</option>
                      <option value="matale">Matale</option>
                      <option value="nuwara-eliya">Nuwara Eliya</option>
                      <option value="galle">Galle</option>
                      <option value="matara">Matara</option>
                      <option value="hambantota">Hambantota</option>
                    </select>
                  </div>
                </div>

                {/* Account Preferences */}
                <div className="profile-section">
                  <h3 className="section-title">Account Preferences</h3>
                  <div className="form-group">
                    <label>Email Notifications</label>
                    <select 
                      value={profileData.notifications}
                      onChange={(e) => setProfileData({...profileData, notifications: e.target.value})}
                    >
                      <option value="all">All Notifications</option>
                      <option value="orders">Order Updates Only</option>
                      <option value="promotions">Promotions Only</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Preferred Language</label>
                    <select 
                      value={profileData.language}
                      onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                    >
                      <option value="en">English</option>
                      <option value="si">Sinhala</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setIsEditProfileOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={saveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Checkout - Delivery Details</h2>
              <span className="close" onClick={() => setIsCheckoutOpen(false)}>×</span>
            </div>
            <form onSubmit={handleCheckoutSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input 
                      type="text" 
                      value={checkoutData.firstName}
                      onChange={(e) => setCheckoutData({...checkoutData, firstName: e.target.value})}
                      placeholder="Enter first name"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input 
                      type="text" 
                      value={checkoutData.lastName}
                      onChange={(e) => setCheckoutData({...checkoutData, lastName: e.target.value})}
                      placeholder="Enter last name"
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Delivery Address *</label>
                  <textarea 
                    value={checkoutData.deliveryAddress}
                    onChange={(e) => setCheckoutData({...checkoutData, deliveryAddress: e.target.value})}
                    placeholder="Enter full delivery address"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input 
                      type="tel" 
                      value={checkoutData.contactNumber}
                      onChange={(e) => setCheckoutData({...checkoutData, contactNumber: e.target.value})}
                      placeholder="07XXXXXXXX"
                      pattern="[0-9]{10}"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Postal Code *</label>
                    <input 
                      type="text" 
                      value={checkoutData.postalCode}
                      onChange={(e) => setCheckoutData({...checkoutData, postalCode: e.target.value})}
                      placeholder="Enter postal code"
                      pattern="[0-9]{5}"
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Order Notes (Optional)</label>
                  <textarea 
                    value={checkoutData.orderNotes}
                    onChange={(e) => setCheckoutData({...checkoutData, orderNotes: e.target.value})}
                    placeholder="Any special instructions for delivery?"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={checkoutData.paymentMethod}
                    onChange={e => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value })}
                    required
                  >
                    <option value="visa">VISA</option>
                    <option value="mastercard">MasterCard</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>
              </div>
              

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Continue to Payment
                </button>
              </div>
            </form>
            {/* Payment Gateway Section */}
            {checkoutData.firstName && checkoutData.lastName && checkoutData.deliveryAddress && checkoutData.contactNumber && checkoutData.postalCode && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>Pay Securely</h3>
                <p>Total: <strong>LKR {total.toFixed(2)}</strong></p>
                {['visa', 'mastercard'].includes(checkoutData.paymentMethod) ? (
                  <>
                    <p>Click below to pay with Stripe using your card:</p>
                    <StripeCheckoutButton amount={total} onSuccess={() => {
                      setIsCheckoutOpen(false);
                      setCart([]);
                      alert('Payment successful! Your order has been placed.');
                    }} />
                  </>
                ) : (
                  <>
                    <p>You selected <strong>Cash on Delivery</strong>. Your order will be placed and you can pay upon delivery.</p>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                      setIsCheckoutOpen(false);
                      setCart([]);
                      alert('Order placed! Please pay cash upon delivery.');
                    }}>
                      Place Order (Cash on Delivery)
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

// Product Card Component
const ProductCard = ({ productKey, product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)

  const updateQuantity = (change) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + change)))
  }

  const handleAddToCart = () => {
    onAddToCart(productKey, quantity)
    setQuantity(1)
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
            className="btn btn-primary btn-small"
            onClick={handleAddToCart}
            disabled={product.availability === 'out-of-stock'}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
