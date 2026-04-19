import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useToast } from '../components/ToastNotification'
import './GenerateReports.css'

function GenerateReports() {
  const navigate = useNavigate()
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState('month')

  const reports = [
    { id: 'inventory-raw', name: 'Raw Materials Inventory', description: 'Track fruits and other unprocessed stock', icon: 'fa-solid fa-apple-whole', color: '#e53935' },
    { id: 'inventory-finished', name: 'Finished Products Inventory', description: 'Monitor bottled juices and ready items', icon: 'fa-solid fa-bottle-water', color: '#43a047' },
    { id: 'sales', name: 'Sales Report', description: 'Revenue analysis and order tracking', icon: 'fa-solid fa-chart-line', color: '#fb8c00' },
    { id: 'supplier', name: 'Supplier Report', description: 'Supplier performance and quality ratings', icon: 'fa-solid fa-truck-field', color: '#1e88e5' },
    { id: 'customer', name: 'Customer Report', description: 'Customer analytics and loyalty metrics', icon: 'fa-solid fa-users', color: '#8e24aa' }
  ]

  const handleReportSelect = (reportId) => {
    setSelectedReport(reportId)
  }

  const { warning, error } = useToast()

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
                  disabled={!selectedReport}
                >
                  <i className="fa-solid fa-bolt"></i>
                  PROCEED TO REPORT
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

