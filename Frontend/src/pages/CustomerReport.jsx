import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './CustomerReport.css'

function CustomerReport() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    status: 'all',
    loyalty: 'all',
    region: 'all'
  })

  const customers = [
    { id: 'CUST-001', name: 'Asoka Perera', region: 'Colombo', orders: 45, spent: 'LKR 285,000', avgOrder: 'LKR 63,333', status: 'active', loyalty: 'platinum' },
    { id: 'CUST-002', name: 'Nimal Silva', region: 'Kandy', orders: 32, spent: 'LKR 178,000', avgOrder: 'LKR 55,625', status: 'active', loyalty: 'gold' },
    { id: 'CUST-003', name: 'Kasun Fernando', region: 'Colombo', orders: 58, spent: 'LKR 325,000', avgOrder: 'LKR 56,034', status: 'active', loyalty: 'platinum' },
    { id: 'CUST-004', name: 'Dilini Jayawardena', region: 'Galle', orders: 18, spent: 'LKR 82,500', avgOrder: 'LKR 45,833', status: 'active', loyalty: 'silver' },
    { id: 'CUST-005', name: 'Rajitha Wickramasinghe', region: 'Jaffna', orders: 8, spent: 'LKR 35,000', avgOrder: 'LKR 43,750', status: 'inactive', loyalty: 'bronze' },
    { id: 'CUST-006', name: 'Samantha Kumara', region: 'Colombo', orders: 28, spent: 'LKR 145,000', avgOrder: 'LKR 51,786', status: 'active', loyalty: 'gold' },
    { id: 'CUST-007', name: 'Priyanka De Silva', region: 'Kandy', orders: 22, spent: 'LKR 98,000', avgOrder: 'LKR 44,545', status: 'active', loyalty: 'silver' },
    { id: 'CUST-008', name: 'Chaminda Ranasinghe', region: 'Galle', orders: 12, spent: 'LKR 52,000', avgOrder: 'LKR 43,333', status: 'active', loyalty: 'bronze' },
    { id: 'CUST-009', name: 'Malini Gunasekara', region: 'Colombo', orders: 52, spent: 'LKR 298,000', avgOrder: 'LKR 57,308', status: 'active', loyalty: 'platinum' },
    { id: 'CUST-010', name: 'Ruwan Wijesinghe', region: 'Kandy', orders: 35, spent: 'LKR 168,000', avgOrder: 'LKR 48,000', status: 'active', loyalty: 'gold' }
  ]

  const filteredCustomers = customers.filter(customer => {
    if (filters.status !== 'all' && customer.status !== filters.status) return false
    if (filters.loyalty !== 'all' && customer.loyalty !== filters.loyalty) return false
    if (filters.region !== 'all' && !customer.region.toLowerCase().includes(filters.region)) return false
    return true
  })

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleExport = (format) => {
    alert(`Exporting Customer Report to ${format}...\n\nFile: Customer_Report_${new Date().toISOString().split('T')[0]}.${format === 'Excel' ? 'xlsx' : 'pdf'}`)
  }

  return (
    <div>
      <Header isLoggedIn={true} />
      <div className="container">
        <div className="page-header">
          <h1>Customer Report</h1>
          <p>Comprehensive analysis of customer behavior, order patterns, and loyalty metrics</p>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="loyalty">Loyalty Tier</label>
            <select id="loyalty" name="loyalty" value={filters.loyalty} onChange={handleFilterChange}>
              <option value="all">All Tiers</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="region">Region</label>
            <select id="region" name="region" value={filters.region} onChange={handleFilterChange}>
              <option value="all">All Regions</option>
              <option value="colombo">Colombo</option>
              <option value="kandy">Kandy</option>
              <option value="galle">Galle</option>
              <option value="jaffna">Jaffna</option>
            </select>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">1,248</div>
            <div className="stat-label">Total Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1,156</div>
            <div className="stat-label">Active Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">LKR 45K</div>
            <div className="stat-label">Avg Order Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">78%</div>
            <div className="stat-label">Retention Rate</div>
          </div>
        </div>

        <div className="report-section">
          <h2>Customer Performance Details</h2>
          <div className="action-buttons">
            <button className="btn-action btn-export" onClick={() => handleExport('Excel')}>Export to Excel</button>
            <button className="btn-action btn-export" onClick={() => handleExport('PDF')}>Export to PDF</button>
            <button className="btn-action" onClick={() => navigate('/admin/generate-reports')}>Back to Reports</button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Region</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                  <th>Avg Order Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.region}</td>
                    <td>{customer.orders}</td>
                    <td>{customer.spent}</td>
                    <td>{customer.avgOrder}</td>
                    <td>
                      <span className={`status-badge status-${customer.status}`}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button className="btn-action" onClick={() => alert(`Viewing details for ${customer.id}`)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CustomerReport
