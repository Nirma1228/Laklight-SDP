import Header from '../components/Header'
import Footer from '../components/Footer'

function InventoryReport() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Inventory Report</h1>
        <p>View inventory statistics and analytics</p>
      </div>
      <Footer />
    </div>
  )
}

export default InventoryReport
