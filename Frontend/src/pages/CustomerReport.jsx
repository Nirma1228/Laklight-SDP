import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import './CustomerReport.css'

function CustomerReport() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    status: 'all',
    loyalty: 'all',
    region: 'all'
  })
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(`${config.API_BASE_URL}/reports/customer`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCustomers(data.report.customers.map(c => ({
            id: `CUST-${c.user_id}`,
            name: c.full_name,
            region: c.address ? c.address.split(',').pop().trim() : 'N/A',
            orders: c.order_count || 0,
            spent: `LKR ${Number(c.total_spent).toLocaleString()}`,
            avgOrder: `LKR ${Number(c.avg_order_value).toLocaleString()}`,
            spentNum: Number(c.total_spent),
            status: c.status.toLowerCase(),
            loyalty: c.order_count > 10 ? 'platinum' : c.order_count > 5 ? 'gold' : 'silver'
          })));
        }
      } catch (err) {
        console.error('Fetch customer report error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [])

  const filteredCustomers = customers.filter(customer => {
    if (filters.status !== 'all' && customer.status !== filters.status) return false
    if (filters.loyalty !== 'all' && customer.loyalty !== filters.loyalty) return false
    if (filters.region !== 'all' && !customer.region.toLowerCase().includes(filters.region)) return false
    return true
  })

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const { success, info } = useToast()

  const handleExport = (format) => {
    info(`Preparing ${format} export...`)

    setTimeout(() => {
      if (format === 'PDF') {
        window.print();
        success('Customer Report sent to printer/PDF generator');
      } else {
        const headers = ['"ID"', '"Customer Name"', '"Region"', '"Orders"', '"Total Spent"'];
        const rows = filteredCustomers.map(c =>
          `"${c.id}","${c.name.replace(/"/g, '""')}","${c.region.replace(/"/g, '""')}","${c.orders}","${c.spent.replace(/"/g, '""')}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Customer_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        success('Customer Report downloaded as CSV (Excel compatible)');
      }
    }, 1000)
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
            <div className="stat-number">{customers.length}</div>
            <div className="stat-label">Total Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{customers.filter(c => c.status === 'active').length}</div>
            <div className="stat-label">Active Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              LKR {Math.round(customers.reduce((sum, c) => sum + (c.spentNum || 0), 0) / (customers.reduce((sum, c) => sum + (c.orders || 0), 0) || 1)).toLocaleString()}
            </div>
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
            <button className="btn-action" onClick={() => navigate('/generate-reports')}>Back to Reports</button>
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
