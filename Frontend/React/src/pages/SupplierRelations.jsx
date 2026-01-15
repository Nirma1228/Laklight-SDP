import Header from '../components/Header'
import Footer from '../components/Footer'

function SupplierRelations() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Supplier Relations</h1>
        <p>Manage supplier relationships and communications</p>
      </div>
      <Footer />
    </div>
  )
}

export default SupplierRelations
