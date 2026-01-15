import Header from '../components/Header'
import Footer from '../components/Footer'

function ProductCatalog() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Product Catalog</h1>
        <p>Browse our fresh products</p>
      </div>
      <Footer />
    </div>
  )
}

export default ProductCatalog
