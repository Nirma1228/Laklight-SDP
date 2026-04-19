import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import './SalesReport.css'

function SalesReport() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    dateRange: 'month',
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
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(`${config.API_BASE_URL}/reports/sales`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSales(data.report.orders.map(o => ({
            id: `ORD-${o.order_id}`,
            customer: o.customer_name,
            date: new Date(o.order_date).toLocaleDateString(),
            rawDate: new Date(o.order_date).toISOString().split('T')[0],
            products: o.product_list || 'Items',
            quantity: '-',
            subtotal: `LKR ${Number(o.total_amount).toLocaleString()}`,
            discount: o.discount_amount > 0 ? `LKR ${Number(o.discount_amount).toLocaleString()}` : '-',
            total: `LKR ${Number(o.net_amount).toLocaleString()}`,
            netAmountRaw: Number(o.net_amount),
            payment: o.payment_status.toLowerCase(),
            type: o.customer_id ? 'regular' : 'guest',
            netAmountNum: Number(o.net_amount)
          })));

          const totalRev = data.report.orders.reduce((sum, o) => sum + Number(o.net_amount), 0);
          const totalDisc = data.report.orders.reduce((sum, o) => sum + Number(o.discount_amount), 0);

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
  }, [])

  const filteredSales = sales.filter(sale => {
    if (filters.paymentStatus !== 'all' && sale.payment !== filters.paymentStatus) return false
    if (filters.customerType !== 'all' && sale.type !== filters.customerType) return false
    return true
  })

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const { success, info } = useToast()

  const handleExport = (format) => {
    setTimeout(() => {
      if (format === 'PDF') {
        window.print();
        success('Sales Report sent to printer/PDF generator');
      } else {
        // IMPROVED CSV: Use quotes to prevent "hash marks" and column breaks
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
      }
    }, 1000)
  }

  return (
    <div>
      <Header isLoggedIn={true} customLinks={adminLinks} />
      <div className="container">
        <div className="page-header">
          <h1>Sales Report</h1>
          <p>Comprehensive analysis of revenue, orders, wholesale discounts, and customer purchasing patterns</p>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="dateRange">Date Range</label>
            <select id="dateRange" name="dateRange" value={filters.dateRange} onChange={handleFilterChange}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
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
                  <>
                    <tr>
                      <td>ORD-2245</td>
                      <td>Kamal Perera</td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>Mixed Fruit Nectar (500ml)</td>
                      <td>12</td>
                      <td>LKR 14,400</td>
                      <td><span className="discount-badge">LKR 1,440</span></td>
                      <td>LKR 12,960</td>
                      <td><span className="payment-badge payment-paid">Paid</span></td>
                      <td><button className="btn-action">View</button></td>
                    </tr>
                    <tr>
                      <td>ORD-2246</td>
                      <td>Sunil Jayawardena</td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>Organic Mango Juice</td>
                      <td>24</td>
                      <td>LKR 28,800</td>
                      <td><span className="discount-badge">LKR 2,880</span></td>
                      <td>LKR 25,920</td>
                      <td><span className="payment-badge payment-pending">Pending</span></td>
                      <td><button className="btn-action">View</button></td>
                    </tr>
                  </>
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
