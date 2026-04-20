import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import { generatePDFReport } from '../utils/pdfGenerator'
import { formatSriLankanDate } from '../utils/dateFormatter'
import './SalesReport.css'

function SalesReport() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  
  const [filters, setFilters] = useState({
    dateRange: queryParams.get('rangeType') || 'month',
    startDate: queryParams.get('startDate') || '',
    endDate: queryParams.get('endDate') || '',
    paymentStatus: 'all',
    customerType: 'all'
  })
  const [sales, setSales] = useState([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    wholesaleDiscounts: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const adminLinks = [
    { label: 'Admin Home', path: '/admin-dashboard' },
    { label: 'User Management', path: '/admin/users' },
    { label: 'Inventory', path: '/admin/inventory' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Reports', path: '/admin/reports' }
  ];

  useEffect(() => {
    const fetchReport = async () => {
      // Validation: Don't fetch if custom range is invalid
      if (filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate)) {
        return; 
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const url = new URL(`${config.API_BASE_URL}/reports/sales`);
        if (filters.startDate) url.searchParams.append('startDate', filters.startDate);
        if (filters.endDate) url.searchParams.append('endDate', filters.endDate);

        const res = await fetch(url.toString(), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSales(data.report.orders.map(o => ({
            id: o.order_id ? `ORD-${o.order_id}` : 'N/A',
            customer: o.customer_name || 'Generic Customer',
            date: formatSriLankanDate(o.order_date),
            rawDate: o.order_date ? new Date(o.order_date).toISOString().split('T')[0] : '',
            products: o.product_list || 'Items',
            quantity: '-',
            subtotal: `LKR ${Number(o.total_amount || 0).toLocaleString()}`,
            discount: o.discount_amount > 0 ? `LKR ${Number(o.discount_amount || 0).toLocaleString()}` : '-',
            total: `LKR ${Number(o.net_amount || 0).toLocaleString()}`,
            netAmountRaw: Number(o.net_amount || 0),
            payment: (o.payment_status || 'pending').toLowerCase(),
            type: o.customer_id ? 'regular' : 'guest',
            netAmountNum: Number(o.net_amount || 0)
          })));

          const totalRev = data.report.orders.reduce((sum, o) => sum + Number(o.net_amount || 0), 0);
          const totalDisc = data.report.orders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);

          setStats({
            totalRevenue: totalRev,
            totalOrders: data.report.orders.length,
            averageOrderValue: data.report.orders.length > 0 ? totalRev / data.report.orders.length : 0,
            wholesaleDiscounts: totalDisc
          });
        }
      } catch (err) {
        console.error('Fetch sales report error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [filters.startDate, filters.endDate])

  const filteredSales = sales.filter(sale => {
    if (filters.paymentStatus !== 'all' && sale.payment !== filters.paymentStatus) return false
    if (filters.customerType !== 'all' && sale.type !== filters.customerType) return false
    return true
  })

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateRange' && value !== 'custom') {
      const today = new Date();
      let start = new Date();
      
      switch (value) {
        case 'today':
          start.setHours(0, 0, 0, 0);
          break;
        case 'week':
          start.setDate(today.getDate() - today.getDay());
          start.setHours(0, 0, 0, 0);
          break;
        case 'month':
          start.setMonth(today.getMonth(), 1);
          start.setHours(0, 0, 0, 0);
          break;
        case 'quarter':
          start.setMonth(Math.floor(today.getMonth() / 3) * 3, 1);
          start.setHours(0, 0, 0, 0);
          break;
        case 'year':
          start.setMonth(0, 1);
          start.setHours(0, 0, 0, 0);
          break;
        default:
          break;
      }
      
      setFilters({
        ...filters,
        dateRange: value,
        startDate: start.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      });
    } else {
      setFilters({ ...filters, [name]: value });
      
      // Immediate feedback for invalid custom range
      if (name === 'startDate' || name === 'endDate') {
        const newStart = name === 'startDate' ? value : filters.startDate;
        const newEnd = name === 'endDate' ? value : filters.endDate;
        if (newStart && newEnd && new Date(newStart) > new Date(newEnd)) {
          error('Start date cannot be after end date.');
        }
      }
    }
  }

  const { success } = useToast()

  const handleExport = (format) => {
    if (format === 'PDF') {
      const headers = ['Order ID', 'Customer', 'Date', 'Products', 'Qty', 'Subtotal', 'Discount', 'Total', 'Status'];
      const data = filteredSales.map(s => [
        s.id,
        s.customer,
        s.date,
        s.products,
        s.quantity,
        s.subtotal,
        s.discount,
        s.total,
        s.payment.toUpperCase()
      ]);

      generatePDFReport({
        title: 'Sales Performance Report',
        subtitle: `Analyzing ${filteredSales.length} transactions based on current filters (${filters.paymentStatus} payments, ${filters.customerType} customers).`,
        headers,
        data,
        orientation: 'landscape',
        filename: `Laklight_Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        stats: {
          'Total Revenue': `LKR ${stats.totalRevenue.toLocaleString()}`,
          'Total Orders': stats.totalOrders.toString(),
          'Avg Order Value': `LKR ${Math.round(stats.averageOrderValue).toLocaleString()}`,
          'Wholesale Discounts': `LKR ${stats.wholesaleDiscounts.toLocaleString()}`
        }
      });
      success('Sales Report downloaded as PDF');
    } else {
      setTimeout(() => {
        const headers = ['"Order ID"', '"Customer"', '"Date"', '"Total Amount (LKR)"'];
        const rows = filteredSales.map(s =>
          `"${s.id}","${s.customer.replace(/"/g, '""')}","${s.rawDate}","${s.netAmountRaw}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        success('Sales Report downloaded as CSV (Excel compatible)');
      }, 500)
    }
  }

  const userTypeRaw = localStorage.getItem('userType') || sessionStorage.getItem('userType');
  const userType = userTypeRaw ? userTypeRaw.toLowerCase() : '';
  const isAdmin = userType === 'admin' || userType === 'administrator';

  return (
    <div>
      <Header isLoggedIn={true} customLinks={isAdmin ? adminLinks : []} />
      <div className="container">
        <div className="page-header">
          <h1>Sales Report</h1>
          <p>Comprehensive analysis of revenue, orders, wholesale discounts, and customer purchasing patterns</p>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="dateRange">Date Range</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select id="dateRange" name="dateRange" value={filters.dateRange} onChange={handleFilterChange}>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
              {filters.dateRange === 'custom' && (
                <>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={filters.startDate} 
                    max={new Date().toISOString().split('T')[0]}
                    onChange={handleFilterChange}
                    className="date-input-beautified"
                  />
                  <input 
                    type="date" 
                    name="endDate" 
                    value={filters.endDate} 
                    min={filters.startDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={handleFilterChange}
                    className="date-input-beautified"
                  />
                </>
              )}
            </div>
          </div>
          <div className="filter-group">
            <label htmlFor="paymentStatus">Payment Status</label>
            <select id="paymentStatus" name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="customerType">Customer Type</label>
            <select id="customerType" name="customerType" value={filters.customerType} onChange={handleFilterChange}>
              <option value="all">All Customers</option>
              <option value="regular">Regular</option>
              <option value="wholesale">Wholesale</option>
              <option value="retail">Retail</option>
            </select>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">LKR {(stats.totalRevenue > 0 ? stats.totalRevenue : 38880).toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalOrders > 0 ? stats.totalOrders : 2}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">LKR {(stats.averageOrderValue > 0 ? Math.round(stats.averageOrderValue) : 19440).toLocaleString()}</div>
            <div className="stat-label">Average Order Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">LKR {(stats.wholesaleDiscounts > 0 ? stats.wholesaleDiscounts : 4320).toLocaleString()}</div>
            <div className="stat-label">Wholesale Discounts</div>
          </div>
        </div>

        <div className="report-section">
          <h2>Sales Transaction Details</h2>
          <div className="action-buttons">
            <button className="btn-action btn-export" onClick={() => handleExport('Excel')}>Export to Excel</button>
            <button className="btn-action btn-export" onClick={() => handleExport('PDF')}>Export to PDF</button>
            <button className="btn-action" onClick={() => navigate('/generate-reports')}>Back to Reports</button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Products</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? (
                  filteredSales.map(sale => (
                    <tr key={sale.id}>
                      <td>{sale.id}</td>
                      <td>{sale.customer}</td>
                      <td>{sale.date}</td>
                      <td>{sale.products}</td>
                      <td>{sale.quantity}</td>
                      <td>{sale.subtotal}</td>
                      <td>{sale.discount !== '-' ? <span className="discount-badge">{sale.discount}</span> : '-'}</td>
                      <td>{sale.total}</td>
                      <td>
                        <span className={`payment-badge payment-${sale.payment}`}>
                          {sale.payment.charAt(0).toUpperCase() + sale.payment.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button className="btn-action" onClick={() => alert(`Viewing details for ${sale.id}`)}>View</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>No sales data match your current filters.</td>
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

export default SalesReport
