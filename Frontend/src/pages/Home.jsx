import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShoppingBasket,
  faSeedling,
  faUserTie,
  faChartLine,
  faTruckLoading,
  faPercentage,
  faWarehouse,
  faBell,
  faMobileAlt,
  faCheckCircle,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Home.css'

function Home() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal')
        }
      })
    }, observerOptions)

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      observer.observe(el)
    })

    // Counter animation
    const counters = document.querySelectorAll('.stat-number')
    const animateCounters = () => {
      counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'))
        const suffix = counter.getAttribute('data-suffix') || ''
        let count = 0
        const speed = 2000
        const increment = target / (speed / 16)

        const updateCount = () => {
          if (count < target) {
            count += increment
            counter.innerText = (Math.ceil(count * 10) / 10).toFixed(target % 1 === 0 ? 0 : 1) + suffix
            requestAnimationFrame(updateCount)
          } else {
            counter.innerText = target + suffix
          }
        }
        updateCount()
      })
    }

    const statsSection = document.querySelector('.stats-section')
    if (statsSection) {
      const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          animateCounters()
          statsObserver.disconnect()
        }
      }, { threshold: 0.5 })
      statsObserver.observe(statsSection)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="home-container">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <div className="hero-main-layout">
            <div className="hero-text-wrapper reveal-on-scroll">
              <span className="hero-badge">100% Organic & Local</span>
              <h1>Premium Food Products <br />Direct From <span>Nature's Heart</span></h1>
              <p>Bringing the freshest harvest from Sri Lanka's finest farms directly to your doorstep. Quality you can taste, freshness you can trust.</p>
              <div className="hero-cta">
                <Link to="/login" className="btn btn-primary-premium">
                  Explore Shop <FontAwesomeIcon icon={faShoppingBasket} />
                </Link>
                <Link to="/login" className="btn btn-outline-premium">
                  Partner with Us <FontAwesomeIcon icon={faSeedling} />
                </Link>
              </div>
            </div>

            <div className="hero-stats-wrapper reveal-on-scroll">
              <div className="hero-stat-item">
                <span className="stat-icon-mini"><FontAwesomeIcon icon={faCheckCircle} /></span>
                <div>
                  <strong>Quality Guaranteed</strong>
                  <p>Triple-checked for freshness</p>
                </div>
              </div>
              <div className="hero-stat-item">
                <span className="stat-icon-mini"><FontAwesomeIcon icon={faTruckLoading} /></span>
                <div>
                  <strong>Fast Delivery</strong>
                  <p>Within 24 hours of harvest</p>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Ecosystem Portals INTEGRATED into Hero */}
          <div className="hero-portals-grid reveal-on-scroll">
            {[
              {
                title: 'Customer',
                icon: faShoppingBasket,
                desc: 'Browse a premium selection of fresh produce with automatic wholesale discounts.',
                color: 'green',
                link: '/login'
              },
              {
                title: 'Farmer',
                icon: faSeedling,
                desc: 'Direct access to marketplace, fair pricing, and smart delivery scheduling.',
                color: 'emerald',
                link: '/login'
              },
              {
                title: 'Employee',
                icon: faUserTie,
                desc: 'Streamlined warehouse management, real-time inventory and logistics control.',
                color: 'gold',
                link: '/login'
              },
              {
                title: 'Admin',
                icon: faChartLine,
                desc: 'Comprehensive oversight, advanced analytics and system-wide management.',
                color: 'dark',
                link: '/login'
              }
            ].map((portal, idx) => (
              <div key={idx} className={`hero-portal-card delay-${idx}`}>
                <div className={`portal-icon-box ${portal.color}`}>
                  <FontAwesomeIcon icon={portal.icon} />
                </div>
                <h3>{portal.title}</h3>
                <p>{portal.desc}</p>
                <Link to={portal.link} className="hero-portal-link">
                  Access Portal <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container stats-flex">
          <div className="stat-box reveal-on-scroll">
            <span className="stat-number" data-target="500" data-suffix="+">0</span>
            <span className="stat-label">Trusted Farmers</span>
          </div>
          <div className="stat-box reveal-on-scroll">
            <span className="stat-number" data-target="2000" data-suffix="+">0</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat-box reveal-on-scroll">
            <span className="stat-number" data-target="50" data-suffix="+">0</span>
            <span className="stat-label">Fruit Varieties</span>
          </div>
          <div className="stat-box reveal-on-scroll">
            <span className="stat-number" data-target="99.5" data-suffix="%">0</span>
            <span className="stat-label">Delivery Success</span>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="features-section container">
        <div className="section-header reveal-on-scroll">
          <h2>Why Choose <span>Laklight</span>?</h2>
          <p className="section-tagline">We combine traditional farming values with cutting-edge technology.</p>
        </div>
        <div className="features-grid-premium">
          {[
            { icon: faPercentage, title: 'Wholesale Advantage', desc: 'Dynamic pricing automatically applies discounts for bulk orders of 12+ items.' },
            { icon: faWarehouse, title: 'Smart Warehousing', desc: 'Advanced tracking maps products to precise shelf locations for peak efficiency.' },
            { icon: faBell, title: 'Expiry Management', desc: 'Intelligent alerts ensure zero waste and maximum freshness for every delivery.' },
            { icon: faTruckLoading, title: 'Optimized Logistics', desc: 'Seamless communication between farmers and warehouse for rapid fulfillment.' },
            { icon: faMobileAlt, title: 'Mobile First', desc: 'Full-featured experience across all devices for management on the go.' },
            { icon: faCheckCircle, title: 'Quality Assurance', desc: 'Strict grade-based classification ensures you get exactly what you pay for.' }
          ].map((f, i) => (
            <div key={i} className="feature-card-premium reveal-on-scroll">
              <div className="feature-icon-premium">
                <FontAwesomeIcon icon={f.icon} />
              </div>
              <div className="feature-info-premium">
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="premium-cta">
        <div className="cta-glass-box container reveal-on-scroll">
          <div className="cta-content-premium">
            <h2 className="reveal-on-scroll">Ready to Experience <br /><span>The Purest Quality?</span></h2>
            <p className="reveal-on-scroll">Join the Laklight community today and transform how you source and supply fresh food.</p>
            <div className="cta-actions-premium reveal-on-scroll">
              <Link to="/login" className="btn btn-primary-premium">Get Started Now</Link>
            </div>
          </div>
          <div className="cta-visual reveal-on-scroll"></div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
