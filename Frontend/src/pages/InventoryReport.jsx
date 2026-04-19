import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import { generatePDFReport } from '../utils/pdfGenerator'
import { formatSriLankanDate } from '../utils/dateFormatter'
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
          const mapped = [
            ...(data.report.rawInventory || []).map(item => ({
              id: item.id ? `RAW-${item.id}` : 'N/A',
              name: item.material_name || 'Unknown Material',
              category: 'Raw Materials',
              quantity: item.quantity_units || 0,
              unit: item.unit_name || 'units',
              location: item.storage_location || 'Warehouse',
               expiry: formatSriLankanDate(item.expiry_date),
              expiryRaw: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : 'N/A',
              status: (item.quantity_units || 0) < 20 ? 'low' : 'good'
            })),
            ...(data.report.finishedInventory || []).map(item => ({
              id: item.id ? `FIN-${item.id}` : 'N/A',
              name: item.name || 'Unknown Product',
              category: 'Processed Products',
              quantity: item.quantity_units || 0,
              unit: 'units',
              location: item.storage_location || 'Warehouse',
               expiry: formatSriLankanDate(item.expiry_date),
              expiryRaw: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : 'N/A',
              status: (item.quantity_units || 0) < 10 ? 'low' : 'good'
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
    if (reportType === 'raw') return item.category === 'Raw Materials'
    if (reportType === 'finished') return item.category === 'Processed Products'
    
    if (filters.category !== 'all' && !item.category.toLowerCase().includes(filters.category)) return false
    if (filters.status !== 'all' && item.status !== filters.status) return false
    if (filters.location !== 'all' && !item.location.toLowerCase().replace(' ', '-').includes(filters.location)) return false
    return true
  })

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const { success } = useToast()

  const handleExport = (format) => {
    if (format === 'PDF') {
      const headers = ['ID', 'Product Name', 'Category', 'Quantity', 'Unit', 'Location', 'Expiry', 'Status'];
      const data = filteredInventory.map(i => [
        i.id,
        i.name,
        i.category,
        i.quantity,
        i.unit,
        i.location,
        i.expiry,
        i.status.toUpperCase()
      ]);

      generatePDFReport({
        title: reportType === 'raw' ? 'Raw Materials Inventory' : (reportType === 'finished' ? 'Finished Products Inventory' : 'Inventory Master Report'),
        subtitle: `Current stock levels and storage positions for ${filteredInventory.length} items.`,
        headers,
        data,
        orientation: 'landscape',
        filename: `Laklight_Inventory_${reportType || 'master'}_${new Date().toISOString().split('T')[0]}.pdf`,
        stats: {
          'Total Items': filteredInventory.length.toString(),
          'Items in Stock': filteredInventory.filter(i => i.status === 'good').length.toString(),
          'Low Stock Alerts': filteredInventory.filter(i => i.status === 'low').length.toString(),
          'Out of Stock': filteredInventory.filter(i => i.quantity === 0).length.toString()
        }
      });
      success('Inventory Report downloaded as PDF');
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
        success('Inventory Report downloaded as CSV');
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

        {(!reportType || reportType === 'all') && (
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
