import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './InventoryReport.css'

function InventoryReport() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    location: 'all'
  })

  const inventory = [
    { id: 'INV-001', name: 'Mango Cordial', category: 'Processed Products', quantity: 500, unit: 'bottles', location: 'Warehouse A', expiry: '2025-11-15', status: 'good' },
    { id: 'INV-002', name: 'Lime Mix', category: 'Processed Products', quantity: 250, unit: 'bottles', location: 'Warehouse A', expiry: '2025-10-30', status: 'good' },
    { id: 'INV-003', name: 'Papaya Jam', category: 'Processed Products', quantity: 320, unit: 'jars', location: 'Warehouse B', expiry: '2025-12-20', status: 'good' },
    { id: 'INV-004', name: 'Avocado Spread', category: 'Processed Products', quantity: 150, unit: 'jars', location: 'Cold Storage', expiry: '2025-11-05', status: 'low' },
    { id: 'INV-005', name: 'Orange Cordial', category: 'Processed Products', quantity: 95, unit: 'bottles', location: 'Warehouse A', expiry: '2025-10-25', status: 'low' },
    { id: 'INV-006', name: 'Mango Jam', category: 'Processed Products', quantity: 95, unit: 'jars', location: 'Warehouse B', expiry: '2025-12-10', status: 'low' },
    { id: 'INV-007', name: 'Lime Cordial', category: 'Processed Products', quantity: 420, unit: 'bottles', location: 'Warehouse A', expiry: '2025-11-22', status: 'good' },
    { id: 'INV-008', name: 'Mixed Fruit Jam', category: 'Processed Products', quantity: 280, unit: 'jars', location: 'Warehouse B', expiry: '2025-12-15', status: 'good' },
    { id: 'INV-009', name: 'Pineapple Cordial', category: 'Processed Products', quantity: 180, unit: 'bottles', location: 'Warehouse A', expiry: '2025-11-18', status: 'low' },
    { id: 'INV-010', name: 'Strawberry Jam', category: 'Processed Products', quantity: 0, unit: 'jars', location: 'Warehouse B', expiry: 'N/A', status: 'out' }
  ]

  const filteredInventory = inventory.filter(item => {
    if (filters.category !== 'all' && !item.category.toLowerCase().includes(filters.category)) return false
    if (filters.status !== 'all' && item.status !== filters.status) return false
    if (filters.location !== 'all' && !item.location.toLowerCase().replace(' ', '-').includes(filters.location)) return false
    return true
  })

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleExport = (format) => {
    alert(`Exporting Inventory Report to ${format}...\n\nFile: Inventory_Report_${new Date().toISOString().split('T')[0]}.${format === 'Excel' ? 'xlsx' : 'pdf'}`)
  }

  return (
    <div>
      <Header isLoggedIn={true} />
      <div className="container">
        <div className="page-header">
          <h1>Inventory Report</h1>
          <p>Comprehensive overview of stock levels, expiry alerts, location mapping, and turnover rates</p>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="all">All Categories</option>
              <option value="raw">Raw Materials</option>
              <option value="processed">Processed Products</option>
              <option value="packaging">Packaging Materials</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="status">Stock Status</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="all">All Status</option>
              <option value="good">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <select id="location" name="location" value={filters.location} onChange={handleFilterChange}>
              <option value="all">All Locations</option>
              <option value="warehouse-a">Warehouse A</option>
              <option value="warehouse-b">Warehouse B</option>
              <option value="cold-storage">Cold Storage</option>
            </select>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">156</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">142</div>
            <div className="stat-label">In Stock</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-number">10</div>
            <div className="stat-label">Low Stock</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-number">4</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>

        <div className="report-section">
          <h2>Inventory Details</h2>
          <div className="action-buttons">
            <button className="btn-action btn-export" onClick={() => handleExport('Excel')}>Export to Excel</button>
            <button className="btn-action btn-export" onClick={() => handleExport('PDF')}>Export to PDF</button>
            <button className="btn-action" onClick={() => navigate('/admin/generate-reports')}>Back to Reports</button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Location</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.location}</td>
                    <td>{item.expiry}</td>
                    <td>
                      <span className={`stock-badge stock-${item.status}`}>
                        {item.status === 'good' ? 'In Stock' : item.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                      </span>
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

export default InventoryReport
