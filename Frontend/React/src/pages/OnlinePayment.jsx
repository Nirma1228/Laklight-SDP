import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './OnlinePayment.css'

function OnlinePayment() {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  })

  const orderItems = [
    { name: 'Lime Mix', quantity: '15 pieces', price: 1800, image: 'Lime Mix.png', discount: true },
    { name: 'Wood Apple Juice', quantity: '2 kg', price: 400, image: 'Wood Apple Juice.png', discount: false },
    { name: 'Mango Jelly', quantity: '5 pieces', price: 500, image: 'Mango Jelly.png', discount: false }
  ]

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0)
  const discount = 250
  const delivery = 200
  const total = subtotal - discount + delivery

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (paymentMethod === 'card' && (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName)) {
      alert('Please fill in all card details')
      return
    }

    setLoading(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      alert('Payment Successful! Order #' + Math.floor(Math.random() * 10000) + ' has been placed.')
      navigate('/customer/dashboard')
    }, 2000)
  }

  return (
    <div className="payment-page">
      <header className="header">
        <nav className="nav-container">
          <div className="logo">Laklight Food Products</div>
          <button className="back-btn" onClick={() => navigate(-1)}>← Back to Cart</button>
        </nav>
      </header>

      <div className="main-container">
        <div className="payment-section">
          <h2 className="section-title">Payment Details</h2>

          <div className="payment-methods">
            <div 
              className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="payment-method-icon">💳</div>
              <div>Credit/Debit Card</div>
            </div>
            <div 
              className={`payment-method ${paymentMethod === 'cod' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('cod')}
            >
              <div className="payment-method-icon">💵</div>
              <div>Cash On Delivery</div>
            </div>
          </div>

          <form id="paymentForm" onSubmit={handleSubmit}>
            {paymentMethod === 'card' && (
              <div id="cardDetails">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input 
                    type="text" 
                    id="cardNumber" 
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456" 
                    maxLength="19" 
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input 
                      type="text" 
                      id="expiryDate" 
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY" 
                      maxLength="5" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input 
                      type="text" 
                      id="cvv" 
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123" 
                      maxLength="3" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cardName">Name on Card</label>
                  <input 
                    type="text" 
                    id="cardName" 
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="Asoka Perera" 
                    required 
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="cod-notice">
                <p>You have selected Cash on Delivery. Please keep exact change ready.</p>
                <p>Payment will be collected upon delivery of your order.</p>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : `Complete Payment - Rs. ${total.toFixed(2)}`}
            </button>
          </form>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Processing your payment...</p>
            </div>
          )}
        </div>

        <div className="order-summary">
          <h2 className="section-title">Order Summary</h2>

          {orderItems.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-details">
                <div className="item-image">🛒</div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>{item.quantity}</p>
                  {item.discount && <span className="discount-badge">Wholesale Discount Applied!</span>}
                </div>
              </div>
              <div className="item-price">Rs. {item.price.toFixed(2)}</div>
            </div>
          ))}

          <div className="summary-section">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Discount:</span>
              <span className="discount-amount">-Rs. {discount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span>Rs. {delivery.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnlinePayment
