import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { config } from '../config'
import StripeCheckoutButton from '../components/StripeCheckoutButton'
import { useToast } from '../components/ToastNotification'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingBag, faBoxOpen, faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import './CustomerDashboard.css'

// Product Card Component
const ProductCard = ({ product, onAddToCart, onImageClick }) => {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const updateQuantity = (change) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + change)))
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    setQuantity(1)
    setAdded(true)
    setTimeout(() => setAdded(false), 400)
  }

  return (
    <div className="product-card">
      <div 
        className="product-img cursor-zoom-in" 
        style={{ height: '100px', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => onImageClick(product.image_url ? (product.image_url.startsWith('http') ? product.image_url : product.image_url) : '/images/placeholder.png')}
      >
        <img
          src={product.image_url ? (product.image_url.startsWith('http') ? product.image_url : product.image_url) : '/images/placeholder.png'}
          alt={product.name}
          style={{ height: '100%', width: 'auto', objectFit: 'contain', borderRadius: '8px' }}
        />
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-price">LKR {(parseFloat(product.price) || 0).toFixed(2)}</div>
        <div className="product-description">{product.description}</div>
        <div className={`product-availability availability-${product.is_available ? 'in-stock' : 'out-of-stock'}`}>
          {product.is_available ? 'Available' : 'Out of Stock'}
        </div>
        <div className="product-stock" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', fontWeight: 'bold' }}>
          Stock Available: {product.stock_quantity !== undefined ? product.stock_quantity : product.stock} Units
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
            disabled={!product.is_available}
          >
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

const CustomerDashboard = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [featuredSearch, setFeaturedSearch] = useState('')
  const [featuredCategory, setFeaturedCategory] = useState('')
  const [featuredSort, setFeaturedSort] = useState('')
  const [activeDashboardView, setActiveDashboardView] = useState('none')
  const [selectedZoomImage, setSelectedZoomImage] = useState(null)

  // Load user data from localStorage and Database
  useEffect(() => {
    // 1. Initial load from localStorage
    const userName = localStorage.getItem('userName');
    if (userName) {
      const parts = userName.split(' ');
      setProfileData(prev => ({
        ...prev,
        firstName: parts[0],
        lastName: parts.slice(1).join(' ')
      }));
    }

    // 2. Fetch fresh data from Database
    const fetchRealProfile = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${config.API_BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            const fullName = data.user.full_name;
            setProfileData(prev => ({
              ...prev,
              firstName: fullName.split(' ')[0],
              lastName: fullName.split(' ').slice(1).join(' '),
              email: data.user.email,
              phone: data.user.phone,
              address: data.user.address,
              city: data.user.city || '',
              postalCode: data.user.postal_code || '',
              district: data.user.district || ''
            }));
            localStorage.setItem('userName', fullName);
          }
        }
      } catch (error) {
        console.error('Error fetching real-time profile:', error);
      }
    };

    fetchRealProfile();
  }, []);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    district: '',
    notifications: 'all',
    language: 'en'
  })
  const [checkoutData, setCheckoutData] = useState({
    firstName: '',
    lastName: '',
    deliveryAddress: '',
    city: '',
    contactNumber: '',
    postalCode: '',
    orderNotes: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('visa') // default to VISA
  const [dbProducts, setDbProducts] = useState([])
  const [dbOrders, setDbOrders] = useState([])
  const [activeOrderId, setActiveOrderId] = useState(null)

  // Fetch products from DB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}/products`);
        const data = await res.json();
        if (data.success) {
          setDbProducts(data.products);
        }
      } catch (err) { console.error('Product fetch failed:', err); }
    };
    fetchProducts();
  }, []);

  // Fetch orders from DB
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${config.API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        // Token expired – clear storage and redirect to login
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (data.success) {
        setDbOrders(data.orders);
      } else {
        console.error('Orders API error:', data.message);
      }
    } catch (err) { console.error('Order fetch failed:', err); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch cart from Backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${config.API_BASE_URL}/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCart(data.items.map(item => ({
            id: item.product_id,
            cart_id: item.cart_id,
            name: item.name,
            price: parseFloat(item.price),
            image_url: item.image_url,
            quantity: item.quantity
          })));
        }
      } catch (err) {
        console.error('Cart fetch failed:', err);
      }
    };
    fetchCart();
  }, []);

  // Poll for order status updates
  useEffect(() => {
    const checkOrders = () => {
      const saved = localStorage.getItem('order_list')
      if (saved) {
        const allOrders = JSON.parse(saved)
        const myOrders = allOrders.filter(o => o.customer === 'Asoka Perera' || o.id === 'O001' || o.id === 'O002')
        setOrders(myOrders)
      }
    }
    const interval = setInterval(checkOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  // Handle Stripe Success/Cancel URLs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('payment')
    const sessionId = params.get('session_id')

    const confirmPaymentOnBackend = async (id) => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(`${config.API_BASE_URL}/payments/confirm-stripe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId: id })
        });

        if (response.ok) {
          setCart([])
          // Clear local cart persistent state too
          localStorage.removeItem('laklight_customer_cart_v1');
          
          toast.success('🎉 Payment successful! Your order has been placed and is now being processed.');
          
          // Refresh the dashboard data
          fetchOrders();
          setIsPaymentOpen(false);
          setActiveDashboardView('orders');
        } else {
          const data = await response.json();
          toast.error(`Payment verification failed: ${data.message}`)
        }
      } catch (err) {
        console.error('Confirmation error:', err);
        toast.error('Failed to confirm payment with the server.')
      } finally {
        // Clear URL params to prevent double-confirmation if user refreshes
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    };

    if (status === 'success' && sessionId) {
      confirmPaymentOnBackend(sessionId)
    } else if (status === 'success') {
      // Fallback if session_id is missing but status is success
      setCart([])
      localStorage.removeItem('laklight_customer_cart_v1')
      toast.success('Payment successful! Your order has been placed.')
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (status === 'cancel') {
      toast.error('Payment cancelled.')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [toast])

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()

    // Create order in DB first
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const orderData = {
        items: cart.map(item => ({
          productId: item.id, // This is mapped to product_id in fetchCart
          quantity: item.quantity
        })),
        deliveryAddress: `${checkoutData.deliveryAddress}, ${checkoutData.city}, ${checkoutData.postalCode}`,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'
      };

      const res = await fetch(`${config.API_BASE_URL}/orders/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      if (data.success) {
        setActiveOrderId(data.orderId);
        setIsCheckoutOpen(false);
        setIsPaymentOpen(true);
      } else {
        toast.error(`Order failed: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      toast.error('Failed to place order. Please try again.');
    }
  }

  const addToCart = async (product, quantity = 1) => {
    // Check if user is logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      toast.warning('Please login to add items to your cart')
      setTimeout(() => {
        navigate('/login?redirect=/customer/dashboard')
      }, 1500)
      return
    }

    try {
      const productId = product.product_id || product.id;
      if (!productId) {
        toast.error('Could not identify product ID');
        return;
      }
      
      const res = await fetch(`${config.API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: productId, quantity })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh cart from backend
        const cartRes = await fetch(`${config.API_BASE_URL}/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const cartData = await cartRes.json();
        if (cartData.success) {
          setCart(cartData.items.map(item => ({
            id: item.product_id,
            cart_id: item.cart_id,
            name: item.name,
            price: parseFloat(item.price),
            image_url: item.image_url,
            quantity: item.quantity
          })));
          toast.success('Product added to cart');
        }
      } else {
        toast.error(`Added to cart failed: ${data.message}`);
      }
    } catch (err) {
      console.error('Cart add error:', err);
      toast.error('Failed to update cart on server');
    }
  }

  const removeFromCart = async (cartId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/cart/remove/${cartId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCart(prevCart => prevCart.filter(item => item.cart_id !== cartId));
        toast.success('Item removed from cart');
      }
    } catch (err) {
      console.error('Cart remove error:', err);
    }
  }

  const updateQuantity = async (cartId, change) => {
    const item = cart.find(i => i.cart_id === cartId);
    if (!item) return;
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/cart/update/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      const data = await res.json();
      if (data.success) {
        setCart(prevCart => prevCart.map(i =>
          i.cart_id === cartId ? { ...i, quantity: newQuantity } : i
        ));
      }
    } catch (err) {
      console.error('Cart update error:', err);
    }
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  const saveProfile = async () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email ||
      !profileData.phone || !profileData.address) {
      toast.warning('Please fill in all required fields marked with *')
      return
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const fullName = `${profileData.firstName} ${profileData.lastName}`;
      
      const response = await fetch(`${config.API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          postalCode: profileData.postalCode,
          district: profileData.district
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Profile updated successfully!');
        localStorage.setItem('userName', fullName);
        setIsEditProfileOpen(false);
      } else {
        toast.error(`Update failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  }


  const calculateTotals = () => {
    let subtotal = 0;
    let discount = 0;
    let totalItems = 0;
    const deliveryCharge = 400;

    cart.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;
      totalItems += item.quantity;
      
      // Give 10% discount for a specific product if purchased 12+ times
      if (item.quantity >= 12) {
        discount += itemSubtotal * 0.1;
      }
    });

    const total = subtotal - discount + deliveryCharge;
    const qualifiesForDiscount = discount > 0;
    return { subtotal, totalItems, discount, deliveryCharge, total, qualifiesForDiscount };
  };

  const { subtotal, totalItems, discount, deliveryCharge, total, qualifiesForDiscount } = calculateTotals()

  const filteredProducts = dbProducts.filter(product => {
    // Only show products marked as featured
    if (!product.is_featured) return false;

    const matchesSearch = !featuredSearch ||
      product.name.toLowerCase().includes(featuredSearch.toLowerCase()) ||
      product.description.toLowerCase().includes(featuredSearch.toLowerCase())

    const matchesCategory = !featuredCategory || product.category === featuredCategory

    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (featuredSort) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
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
        isLoggedIn={true}
        customLinks={[
          { label: 'DASHBOARD', path: '/home' },
          { label: 'PRODUCTS', onClick: () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) },
          { 
            label: 'MY ORDERS', 
            onClick: () => {
              setActiveDashboardView('orders');
              setTimeout(() => {
                document.getElementById('recent-orders')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            } 
          },
          { label: 'PROFILE', onClick: () => setIsEditProfileOpen(true) }
        ]}
      >
        <div className="cart-icon" onClick={toggleCart}>
          <FontAwesomeIcon icon={faShoppingCart} className="cart-icon-symbol" />
          <span className="cart-label">My Cart</span>
          {totalItems > 0 && <span id="cart-count">{totalItems}</span>}
        </div>
      </Header>

      {/* Dashboard Content */}
      <main className="dashboard">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1 className="welcome-title">Welcome, {profileData.firstName || 'Customer'}!</h1>
          <p className="welcome-subtitle">
            Manage your account, track recent orders, and quickly browse our premium products.
          </p>
          <div className="welcome-quick-links">
            <button
              className="quick-link-card"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <FontAwesomeIcon icon={faShoppingBag} className="quick-link-icon" />
              <span className="quick-link-text">Browse Catalog</span>
            </button>
            <button
              className={`quick-link-card ${activeDashboardView === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveDashboardView(activeDashboardView === 'orders' ? 'none' : 'orders')}
            >
              <FontAwesomeIcon icon={faBoxOpen} className="quick-link-icon" />
              <span className="quick-link-text">Recent Orders</span>
            </button>
            <button
              className={`quick-link-card ${activeDashboardView === 'account' ? 'active' : ''}`}
              onClick={() => setActiveDashboardView(activeDashboardView === 'account' ? 'none' : 'account')}
            >
              <FontAwesomeIcon icon={faUser} className="quick-link-icon" />
              <span className="quick-link-text">Account Summary</span>
            </button>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Recent Orders */}
          {activeDashboardView === 'orders' && (
            <div className="dashboard-card animated fadeIn" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <h2 className="card-title">Recent Orders</h2>
              </div>
              <div id="recent-orders">
                {dbOrders.length === 0 ? (
                  <p>No orders found yet.</p>
                ) : (
                  dbOrders.slice(0, 5).map(order => (
                    <div key={order.order_id} className="order-item">
                      <div className="order-details">
                        <div className="order-id">Order #{order.order_number || order.order_id}</div>
                        <div>{order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}</div>
                        <div>Total: LKR {(parseFloat(order.net_amount) || 0).toFixed(2)}</div>
                      </div>
                      <div className="order-actions-status" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        {(order.order_status || '').toLowerCase() === 'delivered' ? (
                          <Link to="/feedback" className={`order-status status-${(order.order_status || '').toLowerCase()}`} style={{ textDecoration: 'none' }}>
                            {order.order_status}
                          </Link>
                        ) : (
                          <span className={`order-status status-${(order.order_status || '').toLowerCase()}`}>
                            {order.order_status}
                          </span>
                        )}
                        <span className={`payment-status status-${(order.payment_status || '').toLowerCase()}`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => document.getElementById('recent-orders')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-primary"
              >
                View All Orders
              </button>
            </div>
          )}

          {/* Account Summary */}
          {activeDashboardView === 'account' && (
            <div className="dashboard-card animated fadeIn" id="account-summary" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="card-title">Account Summary</h2>
                <button 
                  className="btn btn-small btn-secondary"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  Edit Profile
                </button>
              </div>
              <div className="account-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="summary-item" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ color: '#666', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Name</span>
                  <strong>{profileData.firstName} {profileData.lastName}</strong>
                </div>
                <div className="summary-item" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ color: '#666', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Email</span>
                  <strong style={{ wordBreak: 'break-all' }}>{profileData.email || 'N/A'}</strong>
                </div>
                <div className="summary-item" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ color: '#666', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Phone</span>
                  <strong>{profileData.phone || 'N/A'}</strong>
                </div>
                <div className="summary-item" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ color: '#666', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Total Orders</span>
                  <strong>{dbOrders.length}</strong>
                </div>
              </div>
            </div>
          )}
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
                <option value="beverages">Beverages</option>
                <option value="desserts">Desserts</option>
                <option value="fruits">Fruits</option>
                <option value="vegetables">Vegetables</option>
                <option value="other">Other</option>
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
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  onAddToCart={addToCart}
                  onImageClick={(url) => setSelectedZoomImage(url)}
                />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/product-catalog" className="btn btn-primary">View All Products</a>
            <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
              💡 Order 12+ pieces of any specific product to get an automatic 10% wholesale discount on it!
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
                  <div key={item.cart_id} className="cart-item">
                    <div className="cart-item-image">
                      {item.image_url ? (
                        <img src={item.image_url.startsWith('http') ? item.image_url : item.image_url} alt={item.name} />
                      ) : (
                        <span>🧃</span>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">LKR {item.price.toFixed(2)}</div>
                      <div className="cart-item-quantity" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '50px', padding: '0.25rem 0.75rem' }}>
                          <button 
                            className="quantity-btn" 
                            style={{ background: 'transparent', border: 'none', color: '#1a5d1a', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
                            onClick={() => updateQuantity(item.cart_id, -1)}
                          >
                            −
                          </button>
                          <span style={{ padding: '0 1rem', fontWeight: '800', minWidth: '35px', textAlign: 'center' }}>{item.quantity}</span>
                          <button 
                            className="quantity-btn" 
                            style={{ background: 'transparent', border: 'none', color: '#1a5d1a', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
                            onClick={() => updateQuantity(item.cart_id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="btn btn-danger btn-small"
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                          onClick={() => removeFromCart(item.cart_id)}
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
              <div className="summary-row">
                <span>Delivery Charge:</span>
                <span>LKR {deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total:</span>
                <span>LKR {total.toFixed(2)}</span>
              </div>

              {qualifiesForDiscount ? (
                <div className="wholesale-notice">
                  🎉 Congratulations! You've qualified for our 10% wholesale discount on specific bulk items (12+ pieces)
                </div>
              ) : (
                <div className="wholesale-notice" style={{ background: '#fff3cd', borderColor: '#ffc107', color: '#856404' }}>
                  💡 Order 12 or more of any specific item to unlock a 10% wholesale discount for that item!
                </div>
              )}

              <div className="checkout-section">
                <button
                  className="btn checkout-btn"
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
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
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
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
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
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code *</label>
                      <input
                        type="text"
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>District *</label>
                    <select
                      value={profileData.district}
                      onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                    >
                      <option value="">Select District</option>
                      <option value="ampara">Ampara</option>
                      <option value="anuradhapura">Anuradhapura</option>
                      <option value="badulla">Badulla</option>
                      <option value="batticaloa">Batticaloa</option>
                      <option value="colombo">Colombo</option>
                      <option value="galle">Galle</option>
                      <option value="gampaha">Gampaha</option>
                      <option value="hambantota">Hambantota</option>
                      <option value="jaffna">Jaffna</option>
                      <option value="kalutara">Kalutara</option>
                      <option value="kandy">Kandy</option>
                      <option value="kegalle">Kegalle</option>
                      <option value="kilinochchi">Kilinochchi</option>
                      <option value="kurunegala">Kurunegala</option>
                      <option value="mannar">Mannar</option>
                      <option value="matale">Matale</option>
                      <option value="matara">Matara</option>
                      <option value="moneragala">Moneragala</option>
                      <option value="mullaitivu">Mullaitivu</option>
                      <option value="nuwara-eliya">Nuwara Eliya</option>
                      <option value="polonnaruwa">Polonnaruwa</option>
                      <option value="puttalam">Puttalam</option>
                      <option value="ratnapura">Ratnapura</option>
                      <option value="trincomalee">Trincomalee</option>
                      <option value="vavuniya">Vavuniya</option>
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
                      onChange={(e) => setProfileData({ ...profileData, notifications: e.target.value })}
                    >
                      <option value="all">All Notifications</option>
                      <option value="orders">Order Updates Only</option>
                      <option value="promotions">Promotions Only</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="form-group">
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
                  <div className="form-group" style={{ width: '100%', gridColumn: '1 / -1' }}>
                    <label>Name *</label>
                    <input
                      type="text"
                      value={checkoutData.firstName}
                      onChange={(e) => setCheckoutData({ ...checkoutData, firstName: e.target.value })}
                      placeholder="Enter name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Delivery Address *</label>
                  <textarea
                    value={checkoutData.deliveryAddress}
                    onChange={(e) => setCheckoutData({ ...checkoutData, deliveryAddress: e.target.value })}
                    placeholder="Enter full delivery address"
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={checkoutData.city}
                    onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input
                      type="tel"
                      value={checkoutData.contactNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^[0-9\b]+$/.test(val)) {
                          setCheckoutData({ ...checkoutData, contactNumber: val });
                        }
                      }}
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
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^[0-9\b]+$/.test(val)) {
                          setCheckoutData({ ...checkoutData, postalCode: val });
                        }
                      }}
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
                    onChange={(e) => setCheckoutData({ ...checkoutData, orderNotes: e.target.value })}
                    placeholder="Any special instructions for delivery?"
                    rows="2"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-cancel"
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
                <StripeCheckoutButton amount={total} orderId={activeOrderId} />
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

      {/* Image Zoom Modal */}
      {selectedZoomImage && (
        <div 
          className="zoom-overlay"
          onClick={() => setSelectedZoomImage(null)}
        >
          <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="zoom-close"
              onClick={() => setSelectedZoomImage(null)}
            >
              ×
            </button>
            <img 
              src={selectedZoomImage} 
              alt="Product Zoomed" 
              className="zoom-image"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default CustomerDashboard
