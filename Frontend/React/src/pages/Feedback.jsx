import Header from '../components/Header'
import Footer from '../components/Footer'

function Feedback() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Customer Feedback</h1>
        <p>Share your experience with us</p>
      </div>
      <Footer />
    </div>
  )
}

export default Feedback
