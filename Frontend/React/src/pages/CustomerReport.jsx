import Header from '../components/Header'
import Footer from '../components/Footer'

function CustomerReport() {
  return (
    <div>
      <Header isLoggedIn={true} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)', padding: '100px 2rem 2rem' }}>
        <h1>Customer Report</h1>
        <p>View customer analytics and insights</p>
      </div>
      <Footer />
    </div>
  )
}

export default CustomerReport
