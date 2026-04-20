import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import { generatePDFReport } from '../utils/pdfGenerator'
import { formatSriLankanDate } from '../utils/dateFormatter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers, faBoxes, faShoppingCart, faUserTie, faChartBar
} from '@fortawesome/free-solid-svg-icons'
import './GenerateReports.css'

function GenerateReports() {
  const navigate = useNavigate()
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState('month')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [isExporting, setIsExporting] = useState(false)
  const [filterText, setFilterText] = useState('')

  const reports = [
    { id: 'inventory-raw', name: 'Raw Materials Inventory', description: 'Track fruits and other unprocessed stock', icon: 'fa-solid fa-apple-whole', color: '#e53935' },
    { id: 'inventory-finished', name: 'Finished Products Inventory', description: 'Monitor bottled juices and ready items', icon: 'fa-solid fa-bottle-water', color: '#43a047' },
    { id: 'sales', name: 'Sales Report', description: 'Revenue analysis and order tracking', icon: 'fa-solid fa-chart-line', color: '#fb8c00' },
    { id: 'supplier', name: 'Supplier Report', description: 'Supplier performance and quality ratings', icon: 'fa-solid fa-truck-field', color: '#1e88e5' },
    { id: 'customer', name: 'Customer Report', description: 'Customer analytics and loyalty metrics', icon: 'fa-solid fa-users', color: '#8e24aa' }
  ]

  const { warning, error, success } = useToast()

  const getDates = () => {
    if (dateRange !== 'custom') {
      const today = new Date();
      let start = new Date();
      
      switch (dateRange) {
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
          return { start: null, end: null };
      }
      return { 
        start: start.toISOString().split('T')[0], 
        end: today.toISOString().split('T')[0] 
      };
    }
    return { start: startDate, end: endDate };
  };

  const handleExportPDF = async () => {
    if (!selectedReport) {
      warning('Please select a report type first.')
      return
    }

    if (dateRange === 'custom') {
      if (!startDate || !endDate) {
        warning('Please select both start and end dates for custom range.')
        return
      }
      if (new Date(startDate) > new Date(endDate)) {
        error('Start date cannot be after end date.')
        return
      }
      if (new Date(startDate) > new Date()) {
        warning('Start date cannot be in the future.')
        return
      }
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

      const { start, end } = getDates();
      const res = await fetch(`${config.API_BASE_URL}/reports/${endpoint}?startDate=${start || ''}&endDate=${end || ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      if (!data.success || !data.report) throw new Error('Invalid report data received from server');

      const reportDate = new Date().toISOString().split('T')[0];
      const rangeSubtitle = dateRange === 'custom' 
        ? `Period: ${startDate} to ${endDate}`
        : `Comprehensive analysis generated for the ${dateRange} period.`;

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
          subtitle: rangeSubtitle,
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
          subtitle: rangeSubtitle,
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
          subtitle: rangeSubtitle,
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
          subtitle: rangeSubtitle,
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

    if (dateRange === 'custom') {
      if (!startDate || !endDate) {
        warning('Please select both start and end dates for custom range.')
        return
      }
      if (new Date(startDate) > new Date(endDate)) {
        error('Start date cannot be after end date.')
        return
      }
      if (new Date(startDate) > new Date()) {
        warning('Start date cannot be in the future.')
        return
      }
    }

    const { start, end } = getDates();
    const queryParams = `?startDate=${start || ''}&endDate=${end || ''}&rangeType=${dateRange}`;

    // Navigate to the specific report page
    switch (selectedReport) {
      case 'inventory-raw':
        navigate(`/admin/reports/inventory${queryParams}&type=raw`)
        break
      case 'inventory-finished':
        navigate(`/admin/reports/inventory${queryParams}&type=finished`)
        break
      case 'sales':
        navigate(`/admin/reports/sales${queryParams}`)
        break
      case 'supplier':
        navigate(`/admin/reports/supplier${queryParams}`)
        break
      case 'customer':
        navigate(`/admin/reports/customer${queryParams}`)
        break
      default:
        error('Report type configuration not found.')
    }
  }

  const adminNavLinks = [
    {
      label: (
        <>
          <FontAwesomeIcon icon={faUsers} style={{ marginRight: '8px' }} />
          USER MANAGEMENT
        </>
      ),
      path: '/admin/users'
    },
    {
      label: (
        <>
          <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '8px' }} />
          INVENTORY
        </>
      ),
      path: '/admin/inventory'
    },
    {
      label: (
        <>
          <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} />
          ORDER MANAGEMENT
        </>
      ),
      path: '/admin/orders'
    },
    {
      label: (
        <>
          <FontAwesomeIcon icon={faUserTie} style={{ marginRight: '8px' }} />
          SUPPLIER RELATIONS
        </>
      ),
      path: '/admin/suppliers'
    },
    {
      label: (
        <>
          <FontAwesomeIcon icon={faChartBar} style={{ marginRight: '8px' }} />
          ANALYTICS & REPORTS
        </>
      ),
      path: '/admin/reports'
    }
  ]

  const userTypeRaw = localStorage.getItem('userType') || sessionStorage.getItem('userType');
  const userType = userTypeRaw ? userTypeRaw.toLowerCase() : '';
  const isAdmin = userType === 'admin' || userType === 'administrator';
  const dashboardPath = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

  return (
    <div>
      <Header isLoggedIn={true} customLinks={isAdmin ? adminNavLinks : []} />
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
          <button className="btn-back-dashboard" onClick={() => navigate(dashboardPath)}>
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

              {dateRange === 'custom' && (
                <div className="custom-date-range animate-fade-in" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginTop: '10px',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>FROM</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>TO</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      min={startDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
              )}

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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'white',
                border: '1.5px solid #e2e8f0',
                borderRadius: '30px',
                padding: '0 16px',
                width: '300px',
                height: '44px',
                boxSizing: 'border-box'
              }}>
                <FontAwesomeIcon icon={faChartBar} style={{ color: '#a0aec0', fontSize: '14px', flexShrink: 0, display: 'none' }} />
                <span style={{ color: '#a0aec0', fontSize: '14px', flexShrink: 0 }}>🔍</span>
                <input
                  type="text"
                  placeholder="Filter report types..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    background: 'transparent',
                    color: '#2d3748',
                    minWidth: 0
                  }}
                />
                {filterText && (
                  <button
                    onClick={() => setFilterText('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', flexShrink: 0, lineHeight: 1 }}
                    title="Clear filter"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="reports-bento-grid">
              {reports
                .filter(r =>
                  r.name.toLowerCase().includes(filterText.toLowerCase()) ||
                  r.description.toLowerCase().includes(filterText.toLowerCase())
                )
                .map(report => (
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
                        {selectedReport === report.id && <span className="selected-tag">Selected ✓</span>}
                      </div>
                    </div>
                    <div className="module-bg-shade" style={{ background: report.color }}></div>
                  </div>
                ))
              }
              {reports.filter(r =>
                r.name.toLowerCase().includes(filterText.toLowerCase()) ||
                r.description.toLowerCase().includes(filterText.toLowerCase())
              ).length === 0 && (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#94a3b8',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px dashed #e2e8f0'
                }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                  <p style={{ fontWeight: '600', margin: 0 }}>No reports match <strong>"{filterText}"</strong></p>
                  <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0' }}>Try a different keyword like "Sales", "Inventory", or "Supplier"</p>
                </div>
              )}
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

