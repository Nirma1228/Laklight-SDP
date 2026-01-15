import Header from '../components/Header'
import Footer from '../components/Footer'

function FarmerDashboard() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Farmer Dashboard</h1>
        <p>Submit products and track deliveries</p>
      </div>
      <Footer />
    </div>
  )
}

export default FarmerDashboard
