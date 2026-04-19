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
        <div className="page-header">
          <div className="header-info">
            <h1 className="page-title">
              <i className="fa-solid fa-file-invoice-dollar title-icon"></i>
              Generate Reports
            </h1>
            <p className="page-description">Select report type and parameters to generate comprehensive analytics</p>
          </div>
          <button className="btn btn-secondary back-btn" onClick={() => navigate('/admin/dashboard')}>
            <i className="fa-solid fa-arrow-left"></i>
            BACK TO DASHBOARD
          </button>
        </div>

        <div className="report-container">
          <div className="report-selector glass-card">
            <h2 className="section-title">
              <i className="fa-solid fa-gear"></i>
              Report Configuration
            </h2>

            <div className="form-group">
              <label htmlFor="reportType">Report Type *</label>
              <div className="select-wrapper">
                <i className="fa-solid fa-list-check select-icon"></i>
                <select
                  id="reportType"
                  value={selectedReport}
                  onChange={(e) => handleReportSelect(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select Report Type</option>
                  {reports.map(report => (
                    <option key={report.id} value={report.id}>{report.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dateRange">Date Range *</label>
              <div className="select-wrapper">
                <i className="fa-solid fa-calendar-days select-icon"></i>
                <select
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="form-control"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="format">Export Format</label>
              <div className="select-wrapper">
                <i className="fa-solid fa-file-export select-icon"></i>
                <select id="format" className="form-control">
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV File</option>
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary generate-btn"
              onClick={handleGenerate}
              disabled={!selectedReport}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              Generate Report
            </button>
          </div>

          <div className="report-preview glass-card">
            <h2 className="section-title">
              <i className="fa-solid fa-layer-group"></i>
              Report Types
            </h2>

            <div className="report-types-grid">
              {reports.map(report => (
                <div
                  key={report.id}
                  className={`report-type-card ${selectedReport === report.id ? 'selected' : ''}`}
                  onClick={() => handleReportSelect(report.id)}
                  style={selectedReport === report.id ? { '--accent-color': report.color } : {}}
                >
                  <div className="report-icon" style={{ backgroundColor: `${report.color}15`, color: report.color }}>
                    <i className={report.icon}></i>
                  </div>
                  <h3>{report.name}</h3>
                  <p>{report.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default GenerateReports;

