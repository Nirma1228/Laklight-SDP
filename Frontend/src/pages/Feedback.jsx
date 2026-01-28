import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { config } from '../config'
import './Feedback.css'

function Feedback() {
  const navigate = useNavigate()
  const [ratings, setRatings] = useState({
    productQuality: 0,
    packaging: 0,
    deliveryTime: 0,
    customerService: 0,
    valueForMoney: 0
  })
  const [feedback, setFeedback] = useState('')
  const [improvements, setImprovements] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const improvementOptions = [
    'Faster Delivery',
    'Better Packaging',
    'More Product Variety',
    'Lower Prices',
    'Better Customer Support',
    'Improved Website Experience'
  ]

  const handleRatingClick = (category, value) => {
    setRatings({ ...ratings, [category]: value })
  }

  const handleImprovementToggle = (option) => {
    if (improvements.includes(option)) {
      setImprovements(improvements.filter(item => item !== option))
    } else {
      setImprovements([...improvements, option])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Check if at least one rating is provided
    const hasRating = Object.values(ratings).some(rating => rating > 0)
    if (!hasRating) {
      alert('Please provide at least one rating')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (!token) {
        throw new Error('You must be logged in to submit feedback')
      }

      const response = await fetch(`${config.API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productQuality: ratings.productQuality,
          packaging: ratings.packaging,
          deliveryTime: ratings.deliveryTime,
          customerService: ratings.customerService,
          valueForMoney: ratings.valueForMoney,
          feedbackText: feedback,
          improvements: improvements
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback')
      }

      setSubmitted(true)

      setTimeout(() => {
        navigate('/customer/dashboard')
      }, 3000)
    } catch (err) {
      setError(err.message)
      console.error('Feedback submission error:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (category) => {
    return [1, 2, 3, 4, 5].map(value => (
      <span
        key={value}
        className={`star ${ratings[category] >= value ? 'active' : ''}`}
        onClick={() => handleRatingClick(category, value)}
      >
        ★
      </span>
    ))
  }

  if (submitted) {
    return (
      <div className="feedback-page">
        <header className="header">
          <nav className="nav-container">
            <div className="logo">Laklight Food Products</div>
          </nav>
        </header>
        <div className="main-container">
          <div className="feedback-card">
            <div className="success-message" style={{ display: 'block' }}>
              <h3>✓ Thank You for Your Feedback!</h3>
              <p>Your feedback helps us improve our products and services.</p>
              <p>Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="feedback-page">
      <header className="header">
        <nav className="nav-container">
          <div className="logo">Laklight Food Products</div>
          <button className="back-btn" onClick={() => navigate(-1)}>← Back to Dashboard</button>
        </nav>
      </header>

      <div className="main-container">
        <div className="feedback-card">
          <div className="page-header">
            <h1>Order Feedback</h1>
            <p>Help us improve by sharing your experience</p>
          </div>

          <div className="order-summary">
            <h3>Order Information</h3>
            <div className="order-details">
              <div className="order-detail-item">
                <label>Order ID</label>
                <span>#O002</span>
              </div>
              <div className="order-detail-item">
                <label>Order Date</label>
                <span>Oct 16, 2025</span>
              </div>
              <div className="order-detail-item">
                <label>Delivery Date</label>
                <span>Oct 18, 2025</span>
              </div>
              <div className="order-detail-item">
                <label>Total Amount</label>
                <span>LKR 2,400.00</span>
              </div>
            </div>
            <div className="product-list">
              <h4>Ordered Products</h4>
              <div className="product-item">
                <span className="product-name">Mixed Jam Collection</span>
                <span className="product-qty">8 items</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <div className="feedback-section">
              <div className="section-header">
                <div className="section-icon"></div>
                <h3>Rate Your Experience</h3>
              </div>

              <div className="rating-row">
                <span className="rating-label">Product Quality</span>
                <div className="star-rating">
                  {renderStars('productQuality')}
                </div>
              </div>

              <div className="rating-row">
                <span className="rating-label">Packaging</span>
                <div className="star-rating">
                  {renderStars('packaging')}
                </div>
              </div>

              <div className="rating-row">
                <span className="rating-label">Delivery Time</span>
                <div className="star-rating">
                  {renderStars('deliveryTime')}
                </div>
              </div>

              <div className="rating-row">
                <span className="rating-label">Customer Service</span>
                <div className="star-rating">
                  {renderStars('customerService')}
                </div>
              </div>

              <div className="rating-row">
                <span className="rating-label">Value for Money</span>
                <div className="star-rating">
                  {renderStars('valueForMoney')}
                </div>
              </div>
            </div>

            <div className="feedback-section">
              <div className="section-header">
                <div className="section-icon"></div>
                <h3>Additional Comments</h3>
              </div>

              <div className="form-group">
                <label htmlFor="feedback">Tell us more about your experience (Optional)</label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  maxLength="500"
                />
                <div className="character-count">{feedback.length}/500 characters</div>
              </div>
            </div>

            <div className="feedback-section">
              <div className="section-header">
                <div className="section-icon"></div>
                <h3>Areas for Improvement</h3>
              </div>

              <div className="checkbox-group">
                {improvementOptions.map(option => (
                  <div key={option} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={option}
                      checked={improvements.includes(option)}
                      onChange={() => handleImprovementToggle(option)}
                    />
                    <label htmlFor={option}>{option}</label>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Feedback
