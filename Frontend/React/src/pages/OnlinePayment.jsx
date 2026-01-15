import Header from '../components/Header'
import Footer from '../components/Footer'

function OnlinePayment() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Online Payment</h1>
        <p>Complete your purchase securely</p>
      </div>
      <Footer />
    </div>
  )
}

export default OnlinePayment
