import Header from '../components/Header'
import Footer from '../components/Footer'

function SystemSettings() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>System Settings</h1>
        <p>Configure system preferences and settings</p>
      </div>
      <Footer />
    </div>
  )
}

export default SystemSettings
