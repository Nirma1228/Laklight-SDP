import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './GenerateReports.css'

function GenerateReports() {
  const navigate = useNavigate()
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState('month')

  const reports = [
    { id: 'inventory', name: 'Inventory Report', description: 'Stock levels, expiry alerts, and location mapping', icon: '📦' },
    { id: 'sales', name: 'Sales Report', description: 'Revenue analysis and order tracking', icon: '💰' },
    { id: 'supplier', name: 'Supplier Report', description: 'Supplier performance and quality ratings', icon: '🚚' },
    { id: 'customer', name: 'Customer Report', description: 'Customer analytics and loyalty metrics', icon: '👥' }
  ]

  const handleReportSelect = (reportId) => {
    setSelectedReport(reportId)
  }

  const handleGenerate = () => {
    if (!selectedReport) {
      alert('Please select a report type')
      return
    }
    
    // Navigate to the specific report page
    switch(selectedReport) {
      case 'inventory':
        navigate('/admin/inventory-report')
        break
      case 'sales':
        navigate('/admin/sales-report')
        break
      case 'supplier':
        navigate('/admin/supplier-report')
        break
      case 'customer':
        navigate('/admin/customer-report')
        break
      default:
        alert('Report type not found')
    }
  }

  return (
    <div>
      <Header isLoggedIn={true} />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Generate Reports</h1>
            <p className="page-description">Select report type and parameters to generate comprehensive analytics</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</button>
        </div>

        <div className="report-container">
          <div className="report-selector">
            <h2 className="section-title">Report Configuration</h2>
            
            <div className="form-group">
              <label htmlFor="reportType">Report Type *</label>
              <select 
                id="reportType" 
                value={selectedReport} 
                onChange={(e) => handleReportSelect(e.target.value)}
                className="form-control"
              >
                <option value="">Select Report Type</option>
                {reports.map(report => (
                  <option key={report.id} value={report.id}>{report.icon} {report.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateRange">Date Range *</label>
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

            <div className="form-group">
              <label htmlFor="format">Export Format</label>
              <select id="format" className="form-control">
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV File</option>
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleGenerate}
              disabled={!selectedReport}
            >
              Generate Report
            </button>
          </div>

          <div className="report-preview">
            <h2 className="section-title">Report Types</h2>
            
            <div className="report-types-grid">
              {reports.map(report => (
                <div 
                  key={report.id}
                  className={`report-type-card ${selectedReport === report.id ? 'selected' : ''}`}
                  onClick={() => handleReportSelect(report.id)}
                >
                  <div className="report-icon">{report.icon}</div>
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

export default GenerateReports
