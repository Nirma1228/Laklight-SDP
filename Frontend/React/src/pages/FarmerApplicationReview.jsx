import Header from '../components/Header'
import Footer from '../components/Footer'

function FarmerApplicationReview() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Farmer Application Review</h1>
        <p>Review and process farmer applications</p>
      </div>
      <Footer />
    </div>
  )
}

export default FarmerApplicationReview
