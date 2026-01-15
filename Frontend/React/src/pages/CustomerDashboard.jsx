import Header from '../components/Header'
import Footer from '../components/Footer'

function CustomerDashboard() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Customer Dashboard</h1>
        <p>View your orders and account details</p>
      </div>
      <Footer />
    </div>
  )
}

export default CustomerDashboard
