import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './SupplierReport.css'

function SupplierReport() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    status: 'all',
    rating: 'all',
    region: 'all'
  })

  const suppliers = [
    { id: 'SUP-001', name: 'Green Valley Farm', address: '123 Green Valley Road, Kandy', products: 'Mango, Strawberry', rating: '4.8/5.0', deliveries: 45, status: 'active', ratingClass: 'excellent' },
    { id: 'SUP-002', name: 'Sunrise Organic Farm', address: '45 Sunrise Lane, Matale', products: 'Papaya, Pineapple', rating: '4.2/5.0', deliveries: 38, status: 'active', ratingClass: 'good' },
    { id: 'SUP-003', name: 'Tropical Harvest Ltd', address: '78 Harvest Street, Colombo', products: 'Coconut, Banana', rating: '4.7/5.0', deliveries: 52, status: 'active', ratingClass: 'excellent' },
    { id: 'SUP-004', name: 'Mountain Fresh Produce', address: '12 Mountain View, Nuwara Eliya', products: 'Avocado, Passion Fruit', rating: '4.0/5.0', deliveries: 15, status: 'pending', ratingClass: 'good' },
    { id: 'SUP-005', name: 'Coastal Growers Co-op', address: '56 Coastal Road, Galle', products: 'Lime, Orange', rating: '3.8/5.0', deliveries: 28, status: 'active', ratingClass: 'average' },
    { id: 'SUP-006', name: 'Highland Orchards', address: '89 Highland Avenue, Badulla', products: 'Tomato', rating: '4.6/5.0', deliveries: 41, status: 'active', ratingClass: 'excellent' },
    { id: 'SUP-007', name: 'Valley View Farms', address: '34 Valley Road, Negombo', products: 'Watermelon, Melon', rating: '4.3/5.0', deliveries: 33, status: 'active', ratingClass: 'good' },
    { id: 'SUP-008', name: 'Riverside Agriculture', address: '67 Riverside Drive, Matara', products: 'Dragon Fruit, Guava', rating: '3.5/5.0', deliveries: 22, status: 'active', ratingClass: 'average' }
  ]

  const filteredSuppliers = suppliers.filter(supplier => {
    if (filters.status !== 'all' && supplier.status !== filters.status) return false
    if (filters.rating !== 'all' && supplier.ratingClass !== filters.rating) return false
    if (filters.region !== 'all' && !supplier.address.toLowerCase().replace(' ', '-').includes(filters.region)) return false
    return true
  })

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleExport = (format) => {
    alert(`Exporting Supplier Report to ${format}...\n\nFile: Supplier_Report_${new Date().toISOString().split('T')[0]}.${format === 'Excel' ? 'xlsx' : 'pdf'}`)
  }

  return (
    <div>
      <Header isLoggedIn={true} />
      <div className="container">
        <div className="page-header">
          <h1>Supplier Report</h1>
          <p>Comprehensive analysis of supplier performance, quality ratings, and delivery schedules</p>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="rating">Quality Rating</label>
            <select id="rating" name="rating" value={filters.rating} onChange={handleFilterChange}>
              <option value="all">All Ratings</option>
              <option value="excellent">Excellent (4.5+)</option>
              <option value="good">Good (3.5-4.4)</option>
              <option value="average">Average (2.5-3.4)</option>
              <option value="poor">Poor (&lt;2.5)</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="region">Address</label>
            <select id="region" name="region" value={filters.region} onChange={handleFilterChange}>
              <option value="all">All Regions</option>
              <option value="central">Central Province</option>
              <option value="western">Western Province</option>
              <option value="southern">Southern Province</option>
            </select>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">45</div>
            <div className="stat-label">Total Suppliers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">4.2</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">95%</div>
            <div className="stat-label">On-Time Delivery</div>
          </div>
        </div>

        <div className="report-section">
          <h2>Supplier Performance Details</h2>
          <div className="action-buttons">
            <button className="btn-action btn-export" onClick={() => handleExport('Excel')}>Export to Excel</button>
            <button className="btn-action btn-export" onClick={() => handleExport('PDF')}>Export to PDF</button>
            <button className="btn-action" onClick={() => navigate('/admin/generate-reports')}>Back to Reports</button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Supplier ID</th>
                  <th>Supplier Name</th>
                  <th>Address</th>
                  <th>Products Supplied</th>
                  <th>Quality Rating</th>
                  <th>Total Deliveries</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map(supplier => (
                  <tr key={supplier.id}>
                    <td>{supplier.id}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.address}</td>
                    <td>{supplier.products}</td>
                    <td>
                      <span className={`rating-badge rating-${supplier.ratingClass}`}>
                        {supplier.rating}
                      </span>
                    </td>
                    <td>{supplier.deliveries}</td>
                    <td>
                      <span className={`status-badge status-${supplier.status}`}>
                        {supplier.status === 'active' ? 'Active' : 'Pending Review'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-action" onClick={() => alert(`Viewing details for ${supplier.id}`)}>View</button>
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

export default SupplierReport
