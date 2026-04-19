import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import { generatePDFReport } from '../utils/pdfGenerator'
import './SupplierReport.css'

function SupplierReport() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    status: 'all',
    rating: 'all',
    region: 'all'
  })
  const [suppliers, setSuppliers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(`${config.API_BASE_URL}/reports/supplier`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSuppliers(data.report.suppliers.map(s => ({
            id: `SUP-${s.supplier_id}`,
            name: s.farm_name,
            address: s.location || 'N/A',
            products: s.product_types || 'Produce',
            rating: `${s.rating}/5.0`,
            deliveries: s.delivery_count || 0,
            status: s.status.toLowerCase(),
            ratingClass: s.rating >= 4.5 ? 'excellent' : s.rating >= 3.5 ? 'good' : 'average'
          })));
        }
      } catch (err) {
        console.error('Fetch supplier report error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [])

  const filteredSuppliers = suppliers.filter(supplier => {
    if (filters.status !== 'all' && supplier.status !== filters.status) return false
    if (filters.rating !== 'all' && supplier.ratingClass !== filters.rating) return false
    if (filters.region !== 'all' && !supplier.address.toLowerCase().replace(' ', '-').includes(filters.region)) return false
    return true
  })

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const { success } = useToast()

  const handleExport = (format) => {
    if (format === 'PDF') {
      const headers = ['ID', 'Supplier Name', 'Address', 'Products', 'Rating', 'Deliveries', 'Status'];
      const data = filteredSuppliers.map(s => [
        s.id,
        s.name,
        s.address,
        s.products,
        s.rating,
        s.deliveries,
        s.status.toUpperCase()
      ]);

      generatePDFReport({
        title: 'Supplier Performance Report',
        subtitle: `Analyzing performance metrics for ${filteredSuppliers.length} active suppliers.`,
        headers,
        data,
        orientation: 'landscape',
        filename: `Laklight_Supplier_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        stats: {
          'Total Suppliers': suppliers.length.toString(),
          'Average Rating': (suppliers.reduce((sum, s) => sum + parseFloat(s.rating), 0) / (suppliers.length || 1)).toFixed(1),
          'On-Time Delivery': '95%'
        }
      });
      success('Supplier Report downloaded as PDF');
    } else {
      setTimeout(() => {
        const headers = ['"ID"', '"Farm Name"', '"Region"', '"Rating"', '"Deliveries"'];
        const rows = filteredSuppliers.map(s =>
          `"${s.id}","${s.name.replace(/"/g, '""')}","${s.address.replace(/"/g, '""')}","${s.rating}","${s.deliveries}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Supplier_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        success('Supplier Report downloaded as CSV');
      }, 500)
    }
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
            <div className="stat-number">{suppliers.length}</div>
            <div className="stat-label">Total Suppliers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {(suppliers.reduce((sum, s) => sum + parseFloat(s.rating), 0) / (suppliers.length || 1)).toFixed(1)}
            </div>
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
            <button className="btn-action" onClick={() => navigate('/generate-reports')}>Back to Reports</button>
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
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map(supplier => (
                    <tr key={supplier.id}>
                      <td>{supplier.id}</td>
                      <td style={{ fontWeight: '600' }}>{supplier.name}</td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No supplier performance data match your current filters.</td>
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

export default SupplierReport
