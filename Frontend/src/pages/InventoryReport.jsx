import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import './InventoryReport.css'

function InventoryReport() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reportType = searchParams.get('type') // 'raw' or 'finished'

  const [filters, setFilters] = useState({
    category: reportType === 'raw' ? 'raw' : (reportType === 'finished' ? 'processed' : 'all'),
    status: 'all',
    location: 'all'
  })
  const [inventory, setInventory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(`${config.API_BASE_URL}/reports/inventory`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          // Map backend data to frontend model
          const mapped = [
            ...data.report.rawInventory.map(item => ({
              id: `RAW-${item.id}`,
              name: item.material_name,
              category: 'Raw Materials',
              quantity: item.quantity_units,
              unit: item.unit_name,
              location: item.storage_location,
              expiry: item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A',
              expiryRaw: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : 'N/A',
              status: item.quantity_units < 20 ? 'low' : 'good'
            })),
            ...data.report.finishedInventory.map(item => ({
              id: `FIN-${item.id}`,
              name: item.name,
              category: 'Processed Products',
              quantity: item.quantity_units,
              unit: 'units',
              location: item.storage_location,
              expiry: item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A',
              expiryRaw: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : 'N/A',
              status: item.quantity_units < 10 ? 'low' : 'good'
            }))
          ];
          setInventory(mapped);
        }
      } catch (err) {
        console.error('Fetch inventory report error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [])

  const filteredInventory = inventory.filter(item => {
    // If we are on the specific "Raw Materials" report, only show raw materials
    if (reportType === 'raw') {
      return item.category === 'Raw Materials'
    }
    // If we are on the specific "Finished Products" report, only show processed products
    if (reportType === 'finished') {
      return item.category === 'Processed Products'
    }
    
    // Otherwise use general category filters
    if (filters.category !== 'all' && !item.category.toLowerCase().includes(filters.category)) return false
    if (filters.status !== 'all' && item.status !== filters.status) return false
    if (filters.location !== 'all' && !item.location.toLowerCase().replace(' ', '-').includes(filters.location)) return false
    return true
  })

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const { success, info } = useToast()

  const handleExport = (format) => {
    if (format === 'PDF') {
      window.print();
    } else {
      setTimeout(() => {
        const headers = ['"ID"', '"Product Name"', '"Category"', '"Quantity"', '"Location"', '"Expiry Date"'];
        const rows = filteredInventory.map(i =>
          `"${i.id}","${i.name.replace(/"/g, '""')}","${i.category}","${i.quantity}","${i.location}","${i.expiryRaw}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 500)
    }
  }

  return (
    <div>
      <Header isLoggedIn={true} />
      <div className="container">
        <div className="page-header">
          <h1>{reportType === 'raw' ? 'Raw Materials Inventory' : (reportType === 'finished' ? 'Finished Products Inventory' : 'Inventory Report')}</h1>
          <p>
            {reportType === 'raw'
              ? 'Detailed tracking of raw fruits, vegetables, and unprocessed materials'
              : (reportType === 'finished'
                ? 'Comprehensive monitoring of bottled products, juices, and ready-to-sell items'
                : 'Complete overview of both raw materials and processed production stock')}
          </p>
        </div>

        {reportType === 'all' && (
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
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{filteredInventory.length}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{filteredInventory.filter(i => i.status === 'good').length}</div>
            <div className="stat-label">In Stock</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-number">{filteredInventory.filter(i => i.status === 'low').length}</div>
            <div className="stat-label">Low Stock</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-number">{filteredInventory.filter(i => i.quantity === 0).length}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>

        <div className="report-section">
          <h2>{reportType === 'raw' ? 'Raw Materials Data' : (reportType === 'finished' ? 'Finished Products Data' : 'All Inventory Details')}</h2>
          <div className="action-buttons">
            <button className="btn-action btn-export" onClick={() => handleExport('Excel')}>Export to Excel</button>
            <button className="btn-action btn-export" onClick={() => handleExport('PDF')}>Export to PDF</button>
            <button className="btn-action" onClick={() => navigate('/generate-reports')}>Back to Reports</button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit/Pack</th>
                  <th>Storage Location</th>
                  <th>Expiry Info</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map(item => (
                    <tr key={item.id} className={item.status === 'low' ? 'low-stock-row' : ''}>
                      <td>{item.id}</td>
                      <td style={{ fontWeight: '600' }}>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td>{item.location}</td>
                      <td>{item.expiry}</td>
                      <td>
                        <span className={`stock-badge stock-${item.status}`}>
                          {item.status.toUpperCase()}
                        </span>
                        {item.status === 'low' && (
                          <div style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', fontWeight: 'bold' }}>
                            <i className="fa-solid fa-triangle-exclamation"></i> REORDER SOON
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No inventory items match your current filters.</td>
                  </tr>
                )}
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
