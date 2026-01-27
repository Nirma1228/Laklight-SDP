const db = require('../config/database');

// FR17: Sales Report
exports.getSalesReport = async (req, res) => {
  try {
    const [sales] = await db.query(`
      SELECT DATE(order_date) as date, COUNT(*) as orders, SUM(net_amount) as revenue
      FROM orders o
      JOIN payment_statuses ps ON o.payment_status_id = ps.payment_status_id
      WHERE ps.status_name = 'paid'
      GROUP BY DATE(order_date) ORDER BY date DESC`);
    res.json({ success: true, reportType: 'sales', sales });
  } catch (error) {
    res.status(500).json({ message: 'Report failed', error: error.message });
  }
};

// FR17: Inventory Report
exports.getInventoryReport = async (req, res) => {
  try {
    const [raw] = await db.query('SELECT ir.*, rt.material_name FROM inventory_raw ir JOIN raw_material_types rt ON ir.material_type_id = rt.material_type_id');
    const [finished] = await db.query('SELECT ifin.*, p.name FROM inventory_finished ifin JOIN products p ON ifin.product_id = p.product_id');
    res.json({ success: true, reportType: 'inventory', raw, finished });
  } catch (error) {
    res.status(500).json({ message: 'Report failed', error: error.message });
  }
};

// FR17: Supplier Report
exports.getSupplierReport = async (req, res) => {
  try {
    const [suppliers] = await db.query(`
      SELECT fp.*, u.full_name as owner_name 
      FROM farmer_profiles fp
      JOIN users u ON fp.farmer_id = u.user_id`);
    res.json({ success: true, reportType: 'supplier', suppliers });
  } catch (error) {
    res.status(500).json({ message: 'Report failed', error: error.message });
  }
};

// FR17: Generate custom report
exports.generateCustomReport = async (req, res) => {
  try {
    const { reportType, parameters } = req.body;
    const userId = req.user.userId;

    let reportData = {};

    switch (reportType) {
      case 'sales':
        reportData = await exports.getSalesReport({ query: parameters }, res);
        break;
      case 'inventory':
        reportData = await exports.getInventoryReport({}, res);
        break;
      case 'supplier':
        reportData = await exports.getSupplierReport({}, res);
        break;
      case 'customer':
        reportData = await exports.getCustomerReport({}, res);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Save report generation record
    const [result] = await db.query(
      'INSERT INTO reports (report_type, report_data, generated_by, date_range) VALUES (?, ?, ?, ?)',
      [reportType, JSON.stringify(parameters), userId, parameters.dateRange || null]
    );

    res.json({
      success: true,
      message: 'Report generated successfully',
      reportId: result.insertId,
      reportType
    });
  } catch (error) {
    console.error('Generate custom report error:', error);
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
};

// Get report by ID
exports.getReportById = async (req, res) => {
  try {
    const reportId = req.params.id;

    const [reports] = await db.query(
      `SELECT r.*, r.report_id as id, u.full_name as generated_by_name
       FROM reports r
       JOIN users u ON r.generated_by = u.user_id
       WHERE r.report_id = ?`,
      [reportId]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      success: true,
      report: reports[0]
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
};

// Download report (generate downloadable format)
exports.downloadReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    const [reports] = await db.query('SELECT * FROM reports WHERE report_id = ?', [reportId]);

    if (reports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = reports[0];

    // In production, generate PDF or Excel file
    // For now, return JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=report-${reportId}.json`);
    res.send(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ message: 'Failed to download report', error: error.message });
  }
};
// FR17: Customer Report
exports.getCustomerReport = async (req, res) => {
  try {
    const [customers] = await db.query(`
      SELECT u.*, COUNT(o.order_id) as order_count, SUM(o.net_amount) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.user_id = o.customer_id
      JOIN user_roles r ON u.role_id = r.role_id
      WHERE r.role_name = 'customer'
      GROUP BY u.user_id`);
    res.json({ success: true, reportType: 'customer', customers });
  } catch (error) {
    res.status(500).json({ message: 'Report failed', error: error.message });
  }
};
