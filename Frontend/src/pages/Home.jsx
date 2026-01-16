import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Home.css'

function Home() {
  useEffect(() => {
    // Animation on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp')
        }
      })
    }, observerOptions)

    // Observe all cards and features
    document.querySelectorAll('.type-card, .feature-item, .stat-item').forEach(el => {
      observer.observe(el)
    })

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    })

    // Counter animation for stats
    const animateCounters = () => {
      const counters = document.querySelectorAll('.stat-number')
      counters.forEach(counter => {
        const target = counter.getAttribute('data-target')
        const suffix = counter.getAttribute('data-suffix') || '+'
        let count = 0
        const increment = target / 100

        const updateCounter = () => {
          if (count < target) {
            count += increment
            counter.innerText = Math.ceil(count) + suffix
            requestAnimationFrame(updateCounter)
          } else {
            counter.innerText = target + suffix
          }
        }

        updateCounter()
      })
    }

    // Trigger counter animation when stats section is visible
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters()
          statsObserver.disconnect()
        }
      })
    }, { threshold: 0.5 })

    const statsSection = document.querySelector('.stats')
    if (statsSection) {
      statsObserver.observe(statsSection)
    }

    return () => {
      observer.disconnect()
      statsObserver.disconnect()
    }
  }, [])

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1 className="animate-fadeInUp">Fresh Food Products, From Farm to Table</h1>
          <p className="animate-fadeInUp">Experience quality and freshness with our locally products</p>
          <div className="hero-buttons animate-fadeInUp">
            <Link to="/login" className="btn btn-primary btn-large">Shop Fresh Products</Link>
            <Link to="/login" className="btn btn-secondary btn-large">Join as Farmer</Link>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section id="user-types" className="user-types">
        <div className="container">
          <h2 className="section-title">Who Are You?</h2>
          <div className="types-grid">
            <div className="type-card">
              <div className="type-icon">👤</div>
              <h3>Customer</h3>
              <p>Browse fresh fruits, enjoy wholesale discounts on bulk orders (12+ pieces), and get doorstep delivery of premium quality products.</p>
              <Link to="/login" className="btn btn-primary">Shop Now</Link>
            </div>
            <div className="type-card">
              <div className="type-icon">🌾</div>
              <h3>Farmer</h3>
              <p>Submit your product details, get fair prices, schedule deliveries, and track your applications through our farmer-friendly portal.</p>
              <Link to="/login" className="btn btn-primary">Join as Farmer</Link>
            </div>
            <div className="type-card">
              <div className="type-icon">👷</div>
              <h3>Employee</h3>
              <p>Manage inventory with real-time tracking, handle warehouse locations (cupboard & rack system), and process farmer applications.</p>
              <Link to="/login" className="btn btn-primary">Employee Portal</Link>
            </div>
            <div className="type-card">
              <div className="type-icon">👨‍💼</div>
              <h3>Administrator</h3>
              <p>Access comprehensive analytics, generate business reports, manage users, and oversee system operations.</p>
              <Link to="/login" className="btn btn-primary">Admin Dashboard</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">System Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🛒</div>
              <div className="feature-content">
                <h4>E-commerce Platform</h4>
                <p>Complete online shopping experience with secure payments, order tracking, and customer feedback system.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <div className="feature-content">
                <h4>Wholesale Discounts</h4>
                <p>Automatic discounts applied for bulk orders of 12+ pieces, encouraging larger purchases and better value.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📦</div>
              <div className="feature-content">
                <h4>Smart Warehouse Management</h4>
                <p>Real-time location tracking with detailed mapping (3rd cupboard, 4th rack) for efficient inventory management.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚠️</div>
              <div className="feature-content">
                <h4>Expiry Alert System</h4>
                <p>Automated alerts for product expiry dates, reducing waste and ensuring fresh product delivery.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <div className="feature-content">
                <h4>Delivery Scheduling</h4>
                <p>Smart scheduling system for farmer deliveries with real-time coordination and status tracking.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <div className="feature-content">
                <h4>Mobile Responsive</h4>
                <p>Fully responsive design works seamlessly across desktop, tablet, and mobile devices.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number" data-target="500" data-suffix="+">500+</div>
            <div className="stat-label">Registered Farmers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="2000" data-suffix="+">2,000+</div>
            <div className="stat-label">Happy Customers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="50" data-suffix="+">50+</div>
            <div className="stat-label">Fruit Varieties</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="99.5" data-suffix="%">99.5%</div>
            <div className="stat-label">Fresh Delivery Rate</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join our growing community of customers and suppliers</p>
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary btn-large">Shop Fresh Products</Link>
            <Link to="/login" className="btn btn-secondary btn-large">Join as Farmer</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
