import Header from '../components/Header'
import Footer from '../components/Footer'

function AdminOrderManagement() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Order Management</h1>
        <p>Process and track customer orders</p>
      </div>
      <Footer />
    </div>
  )
}

export default AdminOrderManagement
