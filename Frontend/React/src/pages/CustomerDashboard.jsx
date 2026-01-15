import { useState } from 'react'
import { useNavigate } from 'react-router-dom'















































































































































































































































































































































































































































































































































































































}  }    flex-direction: column;  .search-box {  }    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));  .products-grid {  }    right: -100%;    width: 100%;  .cart-sidebar {@media (max-width: 768px) {}  color: #c8e6c9;.footer-bottom {}  text-align: center;  margin-top: 4rem;  padding: 2rem 0 1rem;  color: white;  background: #1b5e20;.footer {}  color: #155724;  background: #d4edda;.status-completed {}  color: #004085;  background: #cce5ff;.status-processing {}  color: #856404;  background: #fff3cd;.status-pending {}  font-weight: bold;  font-size: 0.8rem;  border-radius: 15px;  padding: 0.3rem 0.8rem;  display: inline-block;.order-status {}  margin-bottom: 0.25rem;  color: #2e7d32;  font-weight: bold;.order-id {}  flex: 1;.order-details {}  margin-bottom: 1rem;  border-radius: 8px;  border: 1px solid #e0e0e0;  padding: 1rem;  align-items: center;  justify-content: space-between;  display: flex;.order-item {}  flex: 1;  font-size: 0.9rem;  padding: 0.5rem 1rem;.btn-small {}  margin: 0;  -webkit-appearance: none;.quantity-input::-webkit-inner-spin-button {.quantity-input::-webkit-outer-spin-button,}  border-radius: 4px;  border: 1px solid #ddd;  padding: 0.3rem;  text-align: center;  width: 50px;.quantity-input {}  margin-bottom: 0.5rem;  gap: 0.5rem;  align-items: center;  display: flex;.quantity-controls {}  gap: 0.5rem;  flex-direction: column;  display: flex;.product-actions {}  color: #c62828;  background: #ffebee;.availability-out-of-stock {}  color: #f57c00;  background: #fff3e0;.availability-low-stock {}  color: #2e7d32;  background: #e8f5e9;.availability-in-stock {}  margin-bottom: 0.5rem;  font-weight: 600;  font-size: 0.8rem;  border-radius: 12px;  padding: 0.25rem 0.75rem;  display: inline-block;.product-availability {}  line-height: 1.4;  margin-bottom: 0.5rem;  font-size: 0.9rem;  color: #666;.product-description {}  margin-bottom: 0.5rem;  font-weight: bold;  font-size: 1.1rem;  color: #4caf50;.product-price {}  color: #333;  margin-bottom: 0.5rem;  font-weight: bold;.product-name {}  padding: 1rem;.product-info {}  font-weight: bold;  color: white;  font-size: 3rem;  justify-content: center;  align-items: center;  display: flex;  background: linear-gradient(135deg, #81c784, #c8e6c9);  height: 150px;  width: 100%;.product-img {}  box-shadow: 0 8px 25px rgba(0,0,0,0.15);  transform: translateY(-3px);.product-card:hover {}  transition: transform 0.3s ease, box-shadow 0.3s ease;  overflow: hidden;  border-radius: 10px;  border: 1px solid #e0e0e0;.product-card {}  margin-top: 1rem;  gap: 1.5rem;  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));  display: grid;.products-grid {}  color: #2e7d32;  font-size: 1.3rem;.card-title {}  font-size: 1.5rem;  color: white;  justify-content: center;  align-items: center;  display: flex;  border-radius: 10px;  background: linear-gradient(135deg, #4caf50, #81c784);  height: 50px;  width: 50px;.card-icon {}  margin-bottom: 1.5rem;  gap: 1rem;  align-items: center;  display: flex;.card-header {}  transform: translateY(-5px);.dashboard-card:hover {}  transition: transform 0.3s ease;  box-shadow: 0 5px 20px rgba(0,0,0,0.1);  margin-bottom: 2rem;  padding: 2rem;  border-radius: 15px;  background: white;.dashboard-card {}  border-color: #4caf50;  outline: none;.filter-select:focus {}  min-width: 150px;  transition: all 0.3s ease;  cursor: pointer;  background: white;  font-size: 0.9rem;  border-radius: 20px;  border: 2px solid #e0e0e0;  padding: 0.5rem 1rem;.filter-select {}  gap: 1rem;  flex-wrap: wrap;  display: flex;.filter-options {}  background: #388e3c;.btn-search:hover {}  font-weight: 500;  gap: 0.5rem;  align-items: center;  display: flex;  transition: all 0.3s ease;  cursor: pointer;  border-radius: 25px;  border: none;  color: white;  background: #4caf50;  padding: 0.8rem 1.5rem;.btn-search {}  border-color: #4caf50;  outline: none;.search-input:focus {}  transition: all 0.3s ease;  font-size: 1rem;  border-radius: 25px;  border: 2px solid #e0e0e0;  padding: 0.8rem 1.2rem;  flex: 1;.search-input {}  margin-bottom: 1rem;  gap: 1rem;  display: flex;.search-box {}  box-shadow: 0 2px 10px rgba(0,0,0,0.1);  margin-bottom: 2rem;  border-radius: 10px;  padding: 1.5rem;  background: #fff;.search-container {/* Search and Filter */}  margin-bottom: 0.5rem;  color: #2e7d32;  font-size: 2rem;.welcome-title {}  box-shadow: 0 5px 20px rgba(0,0,0,0.1);  margin-bottom: 2rem;  padding: 2rem;  border-radius: 15px;  background: white;.welcome-section {}  padding: 100px 2rem 2rem;  margin: 0 auto;  max-width: 1200px;.dashboard {/* Dashboard Content */}  color: #2e7d32;  background: white;.btn-secondary:hover {}  border: 2px solid white;  color: white;  background: transparent;.btn-secondary {}  cursor: not-allowed;  background: #ccc;.btn-primary:disabled {}  background: #f57c00;.btn-primary:hover {}  color: white;  background: #ff9800;.btn-primary {}  transition: all 0.3s ease;  text-align: center;  display: inline-block;  text-decoration: none;  font-weight: 500;  cursor: pointer;  border-radius: 25px;  border: none;  padding: 0.7rem 1.5rem;.btn {}  padding: 1rem 0;.checkout-section {}  color: #4caf50;.discount-amount {}  font-size: 0.9rem;  margin: 1rem 0;  padding: 1rem;  border-radius: 8px;  border: 1px solid #4caf50;  background: #e8f5e9;.wholesale-notice {}  margin-top: 0.5rem;  padding-top: 0.5rem;  border-top: 2px solid #4caf50;  color: #2e7d32;  font-weight: bold;  font-size: 1.2rem;.summary-total {}  margin-bottom: 0.5rem;  justify-content: space-between;  display: flex;.summary-row {}  margin-top: 1rem;  border-top: 2px solid #e0e0e0;  padding: 1rem 0;.cart-summary {}  background: #f5f5f5;.quantity-btn:hover {}  transition: background 0.3s ease;  border-radius: 4px;  justify-content: center;  align-items: center;  display: flex;  cursor: pointer;  background: white;  border: 1px solid #ddd;  height: 30px;  width: 30px;.quantity-btn {}  margin-top: 0.5rem;  gap: 0.5rem;  align-items: center;  display: flex;.cart-item-quantity {}  font-weight: bold;  color: #4caf50;.cart-item-price {}  margin-bottom: 0.25rem;  font-weight: bold;.cart-item-name {}  flex: 1;.cart-item-details {}  font-weight: bold;  flex-shrink: 0;  color: white;  font-size: 1.5rem;  justify-content: center;  align-items: center;  display: flex;  border-radius: 8px;  background: linear-gradient(135deg, #81c784, #c8e6c9);  height: 60px;  width: 60px;.cart-item-image {}  border-bottom: 1px solid #e0e0e0;  padding: 1rem 0;  gap: 1rem;  display: flex;.cart-item {}  color: #666;  padding: 3rem 1rem;  text-align: center;.cart-empty {}  padding: 2rem;.cart-content {}  background-color: rgba(255, 255, 255, 0.2);.cart-close:hover {}  transition: background-color 0.3s ease;  border-radius: 50%;  padding: 0.5rem;  cursor: pointer;  font-size: 1.5rem;  color: white;  border: none;  background: none;.cart-close {}  align-items: center;  justify-content: space-between;  display: flex;  font-weight: bold;  font-size: 1.5rem;.cart-title {}  color: white;  background: linear-gradient(135deg, rgb(132, 213, 147) 0%, #4caf50 100%);  border-bottom: 1px solid #e0e0e0;  padding: 2rem;.cart-header {}  visibility: visible;  opacity: 1;.cart-overlay.open {}  transition: all 0.3s ease;  visibility: hidden;  opacity: 0;  z-index: 1500;  background: rgba(0, 0, 0, 0.5);  height: 100%;  width: 100%;  left: 0;  top: 0;  position: fixed;.cart-overlay {}  right: 0;.cart-sidebar.open {}  overflow-y: auto;  transition: right 0.3s ease;  z-index: 2000;  box-shadow: -5px 0 15px rgba(0,0,0,0.1);  background: white;  height: 100vh;  width: 400px;  right: -400px;  top: 0;  position: fixed;.cart-sidebar {/* Shopping Cart Sidebar */}  font-weight: bold;  justify-content: center;  align-items: center;  display: flex;  font-size: 0.8rem;  height: 20px;  width: 20px;  border-radius: 50%;  color: white;  background: #ff9800;  right: -5px;  top: -5px;  position: absolute;#cart-count {}  background: rgba(255,255,255,0.2);.cart-icon:hover {}  height: 40px;  width: 40px;  justify-content: center;  align-items: center;  display: flex;  transition: background-color 0.3s ease;  border-radius: 8px;  padding: 0.5rem;  cursor: pointer;  font-size: 1.3rem;  position: relative;.cart-icon {}  gap: 1rem;  align-items: center;  display: flex;.user-info {}  gap: 0.5rem;  font-weight: bold;  font-size: 1.6rem;  align-items: center;  display: flex;.logo {}  padding: 0 2rem;  align-items: center;  justify-content: space-between;  display: flex;  margin: 0 auto;  max-width: 1200px;.nav-container {}  z-index: 1000;  width: 100%;  top: 0;  position: fixed;  box-shadow: 0 2px 10px rgba(0,0,0,0.1);  padding: 1rem 0;  color: white;  background: linear-gradient(135deg, rgb(132, 213, 147) 0%, #4caf50 100%);.header {}  background: #f8f9fa;  min-height: 100vh;import './CustomerDashboard.css'

function CustomerDashboard() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')

  // Sample products
  const products = [
    { id: 1, name: 'Fresh Tomatoes', price: 350, unit: 'kg', category: 'vegetables', availability: 'in-stock', stock: 150, description: 'Fresh organic tomatoes from local farms' },
    { id: 2, name: 'Green Beans', price: 280, unit: 'kg', category: 'vegetables', availability: 'in-stock', stock: 200, description: 'Crisp and fresh green beans' },
    { id: 3, name: 'Carrots', price: 220, unit: 'kg', category: 'vegetables', availability: 'low-stock', stock: 45, description: 'Sweet and crunchy carrots' },
    { id: 4, name: 'Potatoes', price: 150, unit: 'kg', category: 'vegetables', availability: 'in-stock', stock: 300, description: 'High quality potatoes for all dishes' },
    { id: 5, name: 'Fresh Milk', price: 380, unit: 'L', category: 'dairy', availability: 'in-stock', stock: 100, description: 'Pure and fresh farm milk' },
    { id: 6, name: 'Eggs', price: 450, unit: 'dozen', category: 'dairy', availability: 'in-stock', stock: 80, description: 'Farm fresh organic eggs' },
    { id: 7, name: 'Honey', price: 1200, unit: 'kg', category: 'other', availability: 'low-stock', stock: 20, description: 'Pure organic honey' },
    { id: 8, name: 'Coconut Oil', price: 950, unit: 'L', category: 'other', availability: 'in-stock', stock: 60, description: 'Pure virgin coconut oil' }
  ]

  // Sample orders
  const orders = [
    { id: 'ORD-001', date: '2024-01-15', total: 4500, status: 'completed', items: 3 },
    { id: 'ORD-002', date: '2024-01-18', total: 2800, status: 'processing', items: 2 },
    { id: 'ORD-003', date: '2024-01-20', total: 6200, status: 'pending', items: 5 }
  ]

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = category === 'all' || product.category === category
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'low' && product.price < 300) ||
      (priceRange === 'medium' && product.price >= 300 && product.price < 700) ||
      (priceRange === 'high' && product.price >= 700)
    return matchesSearch && matchesCategory && matchesPrice
  })

  // Cart functions
  const addToCart = (product, quantity) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity }])
    }
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    // Wholesale discount: 10% for orders over 10000
    return subtotal > 10000 ? subtotal * 0.1 : 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount()
  }

  const handleCheckout = () => {
    if (cart.length > 0) {
      navigate('/online-payment')
    }
  }

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <div className="header">
        <div className="nav-container">
          <div className="logo">
            <span>🌿</span>
            Laklight Food Products
          </div>
          <div className="user-info">
            <div className="cart-icon" onClick={() => setIsCartOpen(true)}>
              <i className="fas fa-shopping-cart"></i>
              {cart.length > 0 && <span id="cart-count">{cart.length}</span>}
            </div>
            <span>Welcome, Customer!</span>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>Logout</button>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-title">
            <span>Shopping Cart</span>
            <button className="cart-close" onClick={() => setIsCartOpen(false)}>×</button>
          </div>
        </div>
        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">{item.name.charAt(0)}</div>
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">Rs. {item.price}/{item.unit}</div>
                    <div className="cart-item-quantity">
                      <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button className="quantity-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>Rs. {calculateSubtotal().toFixed(2)}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <>
                    <div className="summary-row">
                      <span>Discount (10%):</span>
                      <span className="discount-amount">-Rs. {calculateDiscount().toFixed(2)}</span>
                    </div>
                    <div className="wholesale-notice">
                      🎉 Wholesale discount applied! Orders over Rs. 10,000 get 10% off
                    </div>
                  </>
                )}
                <div className="summary-row summary-total">
                  <span>Total:</span>
                  <span>Rs. {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              <div className="checkout-section">
                <button className="btn btn-primary" style={{width: '100%'}} onClick={handleCheckout}>Proceed to Checkout</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard">
        <div className="welcome-section">
          <h1 className="welcome-title">Customer Dashboard</h1>
          <p>Welcome back! Browse our fresh products and manage your orders.</p>
        </div>

        {/* Search and Filter */}
        <div className="search-container">
          <div className="search-box">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-search">
              <i className="fas fa-search"></i>
              Search
            </button>
          </div>
          <div className="filter-options">
            <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="vegetables">Vegetables</option>
              <option value="dairy">Dairy</option>
              <option value="other">Other</option>
            </select>
            <select className="filter-select" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value="all">All Prices</option>
              <option value="low">Under Rs. 300</option>
              <option value="medium">Rs. 300 - 700</option>
              <option value="high">Above Rs. 700</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">🛒</div>
            <h2 className="card-title">Available Products</h2>
          </div>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>

        {/* Order History */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">📦</div>
            <h2 className="card-title">Recent Orders</h2>
          </div>
          {orders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-details">
                <div className="order-id">{order.id}</div>
                <div>Date: {order.date}</div>
                <div>Items: {order.items} | Total: Rs. {order.total}</div>
              </div>
              <span className={`order-status status-${order.status}`}>{order.status}</span>
            </div>
          ))}
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

// Product Card Component
function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    if (product.availability !== 'out-of-stock') {
      onAddToCart(product, quantity)
      setQuantity(1)
    }
  }

  return (
    <div className="product-card">
      <div className="product-img">{product.name.charAt(0)}</div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-price">Rs. {product.price}/{product.unit}</div>
        <div className="product-description">{product.description}</div>
        <span className={`product-availability availability-${product.availability}`}>
          {product.availability === 'in-stock' ? `In Stock (${product.stock})` : 
           product.availability === 'low-stock' ? `Low Stock (${product.stock})` : 
           'Out of Stock'}
        </span>
        <div className="product-actions">
          <div className="quantity-controls">
            <button className="quantity-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <input 
              type="number" 
              className="quantity-input" 
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
            <button className="quantity-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
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
