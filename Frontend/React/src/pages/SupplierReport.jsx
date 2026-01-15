import Header from '../components/Header'
import Footer from '../components/Footer'

function SupplierReport() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Supplier Report</h1>
        <p>View supplier performance and statistics</p>
      </div>
      <Footer />
    </div>
  )
}

export default SupplierReport
