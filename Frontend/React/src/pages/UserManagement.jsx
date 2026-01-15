import Header from '../components/Header'
import Footer from '../components/Footer'

function UserManagement() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>User Management</h1>
        <p>Manage system users and permissions</p>
      </div>
      <Footer />
    </div>
  )
}

export default UserManagement
