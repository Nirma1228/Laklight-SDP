import Header from '../components/Header'
import Footer from '../components/Footer'

function FarmerFeedback() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Farmer Feedback</h1>
        <p>View and manage farmer feedback</p>
      </div>
      <Footer />
    </div>
  )
}

export default FarmerFeedback
