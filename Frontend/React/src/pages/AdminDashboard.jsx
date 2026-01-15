import Header from '../components/Header'
import Footer from '../components/Footer'

function AdminDashboard() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Admin Dashboard</h1>
        <p>Manage your system operations</p>
      </div>
      <Footer />
    </div>
  )
}

export default AdminDashboard
