const db = require('../config/database');

// FR17: Sales Report
exports.getSalesReport = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.order_id, u.full_name as customer_name, o.order_date, 
             o.total_amount, o.discount_amount, o.net_amount, ps.status_name as payment_status,
             (SELECT GROUP_CONCAT(p.name SEPARATOR ', ') FROM order_items oi 
              JOIN products p ON oi.product_id = p.product_id 
              WHERE oi.order_id = o.order_id) as product_list
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.user_id
      LEFT JOIN payment_statuses ps ON o.payment_status_id = ps.payment_status_id
      ORDER BY o.order_date DESC`);

    res.json({
      success: true,
      reportType: 'sales',
      report: { orders }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ message: 'Report failed', error: error.message });
  }
};

// FR17: Inventory Report
exports.getInventoryReport = async (req, res) => {
  try {
    const [rawInventory] = await db.query(`
      SELECT
        ir.raw_inventory_id AS id,
        COALESCE(fs.product_name, ir.material_name) AS material_name,
        mu.unit_name,
        ir.quantity_units,
        ir.storage_location,
        ir.expiry_date,
        ir.received_date,
        qg.grade_name
      FROM inventory_raw ir
      LEFT JOIN farmer_submissions fs ON ir.submission_id = fs.submission_id
      LEFT JOIN measurement_units mu ON ir.unit_id = mu.unit_id
      LEFT JOIN quality_grades qg ON ir.grade_id = qg.grade_id
    `);

    const [finishedInventory] = await db.query(`
      SELECT
        ifin.finished_inventory_id AS id,
        p.name,
        ifin.batch_number,
        ifin.quantity_units,
        ifin.storage_location,
        ifin.expiry_date,
        ifin.manufactured_date
      FROM inventory_finished ifin
      JOIN products p ON ifin.product_id = p.product_id
    `);

    res.json({
      success: true,
      reportType: 'inventory',
      report: { rawInventory, finishedInventory }
    });
  } catch (error) {
    res.status(500).json({ message: 'Report failed', error: error.message });
  }
};

// FR17: Supplier Report
exports.getSupplierReport = async (req, res) => {
  try {
    const [suppliers] = await db.query(`
      SELECT s.*, (SELECT COUNT(*) FROM supply_history sh WHERE sh.supplier_id = s.supplier_id) as delivery_count
      FROM suppliers s`);
    res.json({ success: true, reportType: 'supplier', report: { suppliers } });
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
      SELECT u.user_id, u.full_name, u.email, u.phone, u.address, COALESCE(s.status_name, 'active') as status,
             COUNT(o.order_id) as order_count, 
             COALESCE(SUM(o.net_amount), 0) as total_spent,
             COALESCE(AVG(o.net_amount), 0) as avg_order_value
      FROM users u
      LEFT JOIN user_roles r ON u.role_id = r.role_id
      LEFT JOIN account_statuses s ON u.status_id = s.status_id
      LEFT JOIN orders o ON u.user_id = o.customer_id
      WHERE r.role_name = 'customer' OR u.role_id = 2
      GROUP BY u.user_id`);
    res.json({ success: true, reportType: 'customer', report: { customers } });
  } catch (error) {
    res.status(500).json({ message: 'Report failed', error: error.message });
  }
};
