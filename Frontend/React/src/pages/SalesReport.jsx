import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './SalesReport.css'

function SalesReport() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    dateRange: 'month',
    paymentStatus: 'all',
    customerType: 'all'
  })

  const sales = [
    { id: 'ORD-001', customer: 'Asoka Perera', date: 'Oct 15, 2025', products: 'Mango Cordial', quantity: '15x', subtotal: 'LKR 3,750', discount: '10% Wholesale', total: 'LKR 3,375', payment: 'completed', type: 'wholesale' },
    { id: 'ORD-002', customer: 'Nimal Silva', date: 'Oct 16, 2025', products: 'Strawberry Jam', quantity: '8x', subtotal: 'LKR 2,400', discount: '-', total: 'LKR 2,400', payment: 'completed', type: 'regular' },
    { id: 'ORD-003', customer: 'Kasun Fernando', date: 'Oct 17, 2025', products: 'Mixed Fruit Jam', quantity: '5x', subtotal: 'LKR 1,650', discount: '-', total: 'LKR 1,650', payment: 'pending', type: 'regular' },
    { id: 'ORD-004', customer: 'ABC Restaurant', date: 'Oct 17, 2025', products: 'Chili Sauce', quantity: '25x', subtotal: 'LKR 5,000', discount: '10% Bulk', total: 'LKR 4,500', payment: 'completed', type: 'wholesale' },
    { id: 'ORD-005', customer: 'Dilini Jayawardena', date: 'Oct 18, 2025', products: 'Pineapple Jam', quantity: '3x', subtotal: 'LKR 990', discount: '-', total: 'LKR 990', payment: 'completed', type: 'retail' },
    { id: 'ORD-006', customer: 'Green Valley Hotel', date: 'Oct 18, 2025', products: 'Mango Cordial, Lime Cordial', quantity: '20x', subtotal: 'LKR 5,500', discount: '15% Wholesale', total: 'LKR 4,675', payment: 'completed', type: 'wholesale' },
    { id: 'ORD-007', customer: 'Rajitha Wickramasinghe', date: 'Oct 18, 2025', products: 'Strawberry Jam', quantity: '4x', subtotal: 'LKR 1,200', discount: '-', total: 'LKR 1,200', payment: 'failed', type: 'regular' },
    { id: 'ORD-008', customer: 'Samantha Kumara', date: 'Oct 18, 2025', products: 'Mixed Fruit Cordial', quantity: '6x', subtotal: 'LKR 1,800', discount: '-', total: 'LKR 1,800', payment: 'completed', type: 'regular' },
    { id: 'ORD-009', customer: 'Sunshine Cafe', date: 'Oct 18, 2025', products: 'Papaya Jam', quantity: '12x', subtotal: 'LKR 3,600', discount: '10% Bulk', total: 'LKR 3,240', payment: 'completed', type: 'wholesale' },
    { id: 'ORD-010', customer: 'Priyanka De Silva', date: 'Oct 18, 2025', products: 'Mango Jam', quantity: '7x', subtotal: 'LKR 2,100', discount: '-', total: 'LKR 2,100', payment: 'pending', type: 'regular' }
  ]

  const filteredSales = sales.filter(sale => {
    if (filters.paymentStatus !== 'all' && sale.payment !== filters.paymentStatus) return false
    if (filters.customerType !== 'all' && sale.type !== filters.customerType) return false
    return true
  })

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleExport = (format) => {
    alert(`Exporting Sales Report to ${format}...\n\nFile: Sales_Report_${new Date().toISOString().split('T')[0]}.${format === 'Excel' ? 'xlsx' : 'pdf'}`)
  }

  return (
    <div>
      <Header isLoggedIn={true} />
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
            <div className="stat-number">LKR 1.2M</div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-trend">↑ 15% from last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">342</div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-trend">↑ 8% from last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">LKR 3,509</div>
            <div className="stat-label">Average Order Value</div>
            <div className="stat-trend">↑ 6% from last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">LKR 125K</div>
            <div className="stat-label">Wholesale Discounts</div>
            <div className="stat-trend down">↑ 12% from last month</div>
          </div>
        </div>

        <div className="report-section">
          <h2>Sales Transaction Details</h2>
          <div className="action-buttons">
            <button className="btn-action btn-export" onClick={() => handleExport('Excel')}>Export to Excel</button>
            <button className="btn-action btn-export" onClick={() => handleExport('PDF')}>Export to PDF</button>
            <button className="btn-action" onClick={() => navigate('/admin/generate-reports')}>Back to Reports</button>
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
                {filteredSales.map(sale => (
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

export default SalesReport
