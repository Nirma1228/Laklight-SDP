import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import { generatePDFReport } from '../utils/pdfGenerator'
import { formatSriLankanDate } from '../utils/dateFormatter'
import './GenerateReports.css'

function GenerateReports() {
  const navigate = useNavigate()
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState('month')
  const [isExporting, setIsExporting] = useState(false)

  const reports = [
    { id: 'inventory-raw', name: 'Raw Materials Inventory', description: 'Track fruits and other unprocessed stock', icon: 'fa-solid fa-apple-whole', color: '#e53935' },
    { id: 'inventory-finished', name: 'Finished Products Inventory', description: 'Monitor bottled juices and ready items', icon: 'fa-solid fa-bottle-water', color: '#43a047' },
    { id: 'sales', name: 'Sales Report', description: 'Revenue analysis and order tracking', icon: 'fa-solid fa-chart-line', color: '#fb8c00' },
    { id: 'supplier', name: 'Supplier Report', description: 'Supplier performance and quality ratings', icon: 'fa-solid fa-truck-field', color: '#1e88e5' },
    { id: 'customer', name: 'Customer Report', description: 'Customer analytics and loyalty metrics', icon: 'fa-solid fa-users', color: '#8e24aa' }
  ]

  const { warning, error, success } = useToast()

  const handleExportPDF = async () => {
    if (!selectedReport) {
      warning('Please select a report type first.')
      return
    }

    setIsExporting(true)
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      let endpoint = '';
      
      if (selectedReport.includes('inventory')) {
        endpoint = 'inventory';
      } else {
        endpoint = selectedReport;
      }

      const res = await fetch(`${config.API_BASE_URL}/reports/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      if (!data.success || !data.report) throw new Error('Invalid report data received from server');

      const reportDate = new Date().toISOString().split('T')[0];

      if (selectedReport === 'sales') {
        const orders = data.report.orders || [];
        const headers = ['Order ID', 'Customer', 'Date', 'Products', 'Total', 'Status'];
        const tableData = orders.map(o => [
          o.order_id ? `ORD-${o.order_id}` : 'N/A',
          o.customer_name || 'Generic Customer',
          formatSriLankanDate(o.order_date),
          o.product_list || 'Items',
          `LKR ${Number(o.net_amount || 0).toLocaleString()}`,
          (o.payment_status || 'PENDING').toUpperCase()
        ]);

        const totalRev = orders.reduce((sum, o) => sum + Number(o.net_amount || 0), 0);

        generatePDFReport({
          title: 'Sales Performance Report',
          subtitle: `Comprehensive sales analysis generated for the ${dateRange} period.`,
          headers,
          data: tableData,
          orientation: 'landscape',
          filename: `Laklight_Sales_Summary_${reportDate}.pdf`,
          stats: {
            'Total Orders': orders.length.toString(),
            'Total Revenue': `LKR ${totalRev.toLocaleString()}`,
            'Avg Order': `LKR ${Math.round(totalRev / (orders.length || 1)).toLocaleString()}`
          }
        });
      } else if (selectedReport.startsWith('inventory')) {
        const type = selectedReport === 'inventory-raw' ? 'rawInventory' : 'finishedInventory';
        const rawData = data.report[type] || [];
        const isRaw = selectedReport === 'inventory-raw';
        
        const headers = ['ID', 'Name', 'Category', 'Quantity', 'Unit', 'Location', 'Expiry'];
        const tableData = rawData.map(item => [
          item.id ? (isRaw ? `RAW-${item.id}` : `FIN-${item.id}`) : 'N/A',
          isRaw ? (item.material_name || 'Unknown Material') : (item.name || 'Unknown Product'),
          isRaw ? 'Raw Materials' : 'Processed Products',
          item.quantity_units || 0,
          isRaw ? (item.unit_name || 'units') : 'units',
          item.storage_location || 'Warehouse',
          formatSriLankanDate(item.expiry_date)
        ]);

        generatePDFReport({
          title: isRaw ? 'Raw Materials Inventory' : 'Finished Products Inventory',
          subtitle: `Current stock levels as of ${new Date().toLocaleString()}`,
          headers,
          data: tableData,
          orientation: 'landscape',
          filename: `Laklight_Inventory_${isRaw ? 'Raw' : 'Finished'}_${reportDate}.pdf`,
          stats: {
            'Total Items': rawData.length.toString(),
            'Status': 'Real-time sync'
          }
        });
      } else if (selectedReport === 'supplier') {
        const suppliers = data.report.suppliers || [];
        const headers = ['ID', 'Supplier Name', 'Address', 'Products', 'Rating', 'Status'];
        const tableData = suppliers.map(s => [
          s.supplier_id ? `SUP-${s.supplier_id}` : 'N/A',
          s.farm_name || 'Unknown Farm',
          s.location || 'N/A',
          s.product_types || 'Produce',
          `${s.rating || 0}/5.0`,
          (s.status || 'ACTIVE').toUpperCase()
        ]);

        generatePDFReport({
          title: 'Supplier Performance Report',
          subtitle: 'Directory and performance metrics for all onboarded suppliers.',
          headers,
          data: tableData,
          orientation: 'landscape',
          filename: `Laklight_Suppliers_${reportDate}.pdf`,
          stats: {
            'Total Count': suppliers.length.toString(),
            'Avg Rating': (suppliers.reduce((sum, s) => sum + parseFloat(s.rating || 0), 0) / (suppliers.length || 1)).toFixed(1)
          }
        });
      } else if (selectedReport === 'customer') {
        const customers = data.report.customers || [];
        const headers = ['ID', 'Customer Name', 'Region', 'Orders', 'Spent', 'Status'];
        const tableData = customers.map(c => [
          c.user_id ? `CUST-${c.user_id}` : 'N/A',
          c.full_name || 'Guest User',
          c.address ? c.address.split(',').pop().trim() : 'N/A',
          c.order_count || 0,
          `LKR ${Number(c.total_spent || 0).toLocaleString()}`,
          (c.status || 'ACTIVE').toUpperCase()
        ]);

        generatePDFReport({
          title: 'Customer Analytics Report',
          subtitle: 'Engagement and lifetime value metrics for registered accounts.',
          headers,
          data: tableData,
          orientation: 'landscape',
          filename: `Laklight_Customers_${reportDate}.pdf`,
          stats: {
            'Total Base': customers.length.toString(),
            'Active Users': customers.filter(u => u.status?.toLowerCase() === 'active').length.toString()
          }
        });
      }

      success(`${selectedReport.replace('-', ' ').toUpperCase()} downloaded correctly.`);
    } catch (err) {
      console.error('Report Generation Error:', err);
      error(err.message || 'Failed to generate report. Please try again.');
    } finally {
      setIsExporting(false)
    }
  }

  const handleGenerate = () => {
    if (!selectedReport) {
      warning('Please select a report type before generating.')
      return
    }

    // Navigate to the specific report page
    switch (selectedReport) {
      case 'inventory-raw':
        navigate('/admin/reports/inventory?type=raw')
        break
      case 'inventory-finished':
        navigate('/admin/reports/inventory?type=finished')
        break
      case 'sales':
        navigate('/admin/reports/sales')
        break
      case 'supplier':
        navigate('/admin/reports/supplier')
        break
      case 'customer':
        navigate('/admin/reports/customer')
        break
      default:
        error('Report type configuration not found.')
    }
  }

  return (
    <div>
      <Header isLoggedIn={true} />
      <div className="main-content">
        <div className="page-header decorative-header">
          <div className="header-info">
            <h1 className="page-title animate-fade-in">
              <div className="title-icon-wrapper">
                <i className="fa-solid fa-chart-pie title-icon"></i>
              </div>
              <span className="title-text">Analytics & Reports</span>
            </h1>
            <p className="page-description">Generate comprehensive business intelligence and operational insights</p>
          </div>
          <button className="btn-back-dashboard" onClick={() => navigate('/admin/dashboard')}>
            <i className="fa-solid fa-house"></i>
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="report-layout-grid">
          <div className="report-config-sidebar card-beautified">
            <div className="card-header-beautified">
              <h3><i className="fa-solid fa-sliders-h"></i> Configuration</h3>
            </div>
            
            <div className="config-body">
              <div className="form-group-beautified">
                <label>Report Module</label>
                <div className="custom-select-wrapper">
                  <select
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    className="custom-select"
                  >
                    <option value="">Select Module</option>
                    {reports.map(report => (
                      <option key={report.id} value={report.id}>{report.name}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down select-arrow"></i>
                </div>
              </div>

              <div className="form-group-beautified">
                <label>Temporal Analysis</label>
                <div className="custom-select-wrapper">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="custom-select"
                  >
                    <option value="today">Today's Data</option>
                    <option value="week">Current Week</option>
                    <option value="month">Monthly Overview</option>
                    <option value="quarter">Quarterly Review</option>
                    <option value="year">Annual Summary</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <i className="fa-solid fa-calendar-alt select-arrow"></i>
                </div>
              </div>

              <div className="form-group-beautified">
                <label>Output Format</label>
                <div className="format-pills">
                  <button className="format-pill active"><i className="fa-solid fa-file-pdf"></i> PDF</button>
                  <button className="format-pill"><i className="fa-solid fa-file-excel"></i> XLSX</button>
                  <button className="format-pill"><i className="fa-solid fa-file-csv"></i> CSV</button>
                </div>
              </div>

              <div className="config-footer">
                <button
                  className="btn-generate-premium"
                  onClick={handleGenerate}
                  disabled={!selectedReport || isExporting}
                >
                  <i className="fa-solid fa-bolt"></i>
                  PROCEED TO VIEW
                </button>
                <button
                  className="btn-export-secondary"
                  onClick={handleExportPDF}
                  disabled={!selectedReport || isExporting}
                >
                  <i className={`fa-solid ${isExporting ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                  {isExporting ? 'EXPORTING...' : 'EXPORT SELECTION'}
                </button>
                <p className="helper-text"><i className="fa-solid fa-circle-info"></i> All reports are generated with real-time data</p>
              </div>
            </div>
          </div>

          <div className="report-display-main">
            <div className="display-header">
              <h2><i className="fa-solid fa-cubes"></i> Available Analytical Modules</h2>
              <div className="search-reports">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Filter report types..." />
              </div>
            </div>

            <div className="reports-bento-grid">
              {reports.map(report => (
                <div
                  key={report.id}
                  className={`report-bento-card ${selectedReport === report.id ? 'active-module' : ''}`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="module-icon" style={{ '--accent-color': report.color }}>
                    <i className={report.icon}></i>
                  </div>
                  <div className="module-info">
                    <h4 className="module-name">{report.name}</h4>
                    <p className="module-desc">{report.description}</p>
                    <div className="module-footer">
                      <span className="tag">Analytics</span>
                      {selectedReport === report.id && <span className="selected-tag">Selected</span>}
                    </div>
                  </div>
                  <div className="module-bg-shade" style={{ background: report.color }}></div>
                </div>
              ))}
            </div>

            <div className="insights-footer card-beautified">
              <div className="insight-item">
                <div className="insight-icon"><i className="fa-solid fa-lightbulb"></i></div>
                <div className="insight-text">
                  <strong>Did you know?</strong>
                  <p>Comparing Quarterly reviews often reveals seasonal supply trends with higher accuracy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default GenerateReports;

