import Header from '../components/Header'
import Footer from '../components/Footer'

function AdminInventory() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Inventory Management</h1>
        <p>Manage product inventory and warehouse locations</p>
      </div>
      <Footer />
    </div>
  )
}

export default AdminInventory
