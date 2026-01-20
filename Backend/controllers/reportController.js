const db = require('../config/database');

// FR17: Generate sales report
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    let dateGrouping = 'DATE(order_date)';
    if (groupBy === 'week') {
      dateGrouping = 'YEARWEEK(order_date)';
    } else if (groupBy === 'month') {
      dateGrouping = 'DATE_FORMAT(order_date, "%Y-%m")';
    } else if (groupBy === 'year') {
      dateGrouping = 'YEAR(order_date)';
    }

    let query = `
      SELECT 
        ${dateGrouping} as period,
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        SUM(CASE WHEN order_status = 'Delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_orders
      FROM orders
      WHERE payment_status = 'Paid'
    `;
    const params = [];

    if (startDate) {
      query += ' AND order_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND order_date <= ?';
      params.push(endDate);
    }

    query += ` GROUP BY ${dateGrouping} ORDER BY period DESC`;

    const [salesData] = await db.query(query, params);

    // Get top-selling products
    const [topProducts] = await db.query(`
      SELECT 
        p.name, p.category,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'Paid'
      ${startDate ? 'AND o.order_date >= ?' : ''}
      ${endDate ? 'AND o.order_date <= ?' : ''}
      GROUP BY oi.product_id
      ORDER BY total_sold DESC
      LIMIT 10
    `, params);

    // Calculate totals
    const totals = salesData.reduce((acc, row) => ({
      totalOrders: acc.totalOrders + row.total_orders,
      totalRevenue: acc.totalRevenue + parseFloat(row.total_revenue),
      deliveredOrders: acc.deliveredOrders + row.delivered_orders,
      cancelledOrders: acc.cancelledOrders + row.cancelled_orders
    }), { totalOrders: 0, totalRevenue: 0, deliveredOrders: 0, cancelledOrders: 0 });

    res.json({
      success: true,
      reportType: 'sales',
      period: { startDate, endDate },
      summary: totals,
      salesData,
      topProducts
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ message: 'Failed to generate sales report', error: error.message });
  }
};

// FR17: Generate inventory report
exports.getInventoryReport = async (req, res) => {
  try {
    const [inventoryStats] = await db.query(`
      SELECT 
        type,
        COUNT(*) as item_count,
        SUM(stock) as total_stock,
        SUM(CASE WHEN status = 'good' THEN 1 ELSE 0 END) as good_condition,
        SUM(CASE WHEN status IN ('low', 'critical') THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as expiring_soon
      FROM inventory
      GROUP BY type
    `);

    const [lowStockItems] = await db.query(`
      SELECT * FROM inventory 
      WHERE status IN ('low', 'critical')
      ORDER BY stock ASC
    `);

    const [expiringItems] = await db.query(`
      SELECT * FROM inventory 
      WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)
      AND expiry_date >= CURDATE()
      ORDER BY expiry_date ASC
    `);

    const [productStock] = await db.query(`
      SELECT id, name, category, stock, availability
      FROM products
      WHERE availability != 'out-of-stock'
      ORDER BY stock ASC
    `);

    res.json({
      success: true,
      reportType: 'inventory',
      summary: inventoryStats,
      lowStockItems,
      expiringItems,
      productStock
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ message: 'Failed to generate inventory report', error: error.message });
  }
};

// FR17: Generate supplier report
exports.getSupplierReport = async (req, res) => {
  try {
    const [suppliers] = await db.query(`
      SELECT 
        s.*,
        COUNT(sh.id) as delivery_count,
        SUM(sh.price) as total_value,
        AVG(s.rating) as avg_rating
      FROM suppliers s
      LEFT JOIN supply_history sh ON s.id = sh.supplier_id
      WHERE s.status = 'Active'
      GROUP BY s.id
      ORDER BY total_value DESC
    `);

    const [supplierPerformance] = await db.query(`
      SELECT 
        s.farm_name,
        s.owner_name,
        s.rating,
        s.total_deliveries,
        COUNT(fs.id) as submissions_count,
        SUM(CASE WHEN fs.status = 'selected' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN fs.status = 'not-selected' THEN 1 ELSE 0 END) as rejected
      FROM suppliers s
      LEFT JOIN users u ON u.email = s.owner_name
      LEFT JOIN farmer_submissions fs ON u.id = fs.farmer_id
      WHERE s.status = 'Active'
      GROUP BY s.id
      ORDER BY s.rating DESC
    `);

    const [recentDeliveries] = await db.query(`
      SELECT sh.*, s.farm_name, s.owner_name
      FROM supply_history sh
      JOIN suppliers s ON sh.supplier_id = s.id
      ORDER BY sh.supply_date DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      reportType: 'supplier',
      suppliers,
      supplierPerformance,
      recentDeliveries
    });
  } catch (error) {
    console.error('Supplier report error:', error);
    res.status(500).json({ message: 'Failed to generate supplier report', error: error.message });
  }
};

// FR17: Generate customer report
exports.getCustomerReport = async (req, res) => {
  try {
    const [customerInsights] = await db.query(`
      SELECT 
        u.id, u.full_name, u.email, u.phone,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as avg_order_value,
        MAX(o.order_date) as last_order_date
      FROM users u
      LEFT JOIN orders o ON u.id = o.customer_id AND o.payment_status = 'Paid'
      WHERE u.user_type = 'customer'
      GROUP BY u.id
      ORDER BY total_spent DESC
    `);

    const [customersByMonth] = await db.query(`
      SELECT 
        DATE_FORMAT(join_date, '%Y-%m') as month,
        COUNT(*) as new_customers
      FROM users
      WHERE user_type = 'customer'
      AND join_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(join_date, '%Y-%m')
      ORDER BY month DESC
    `);

    const [customerFeedback] = await db.query(`
      SELECT 
        u.full_name,
        f.product_quality,
        f.packaging,
        f.delivery_time,
        f.customer_service,
        f.value_for_money,
        (f.product_quality + f.packaging + f.delivery_time + f.customer_service + f.value_for_money) / 5 as overall_rating,
        f.submitted_at
      FROM feedback f
      JOIN users u ON f.customer_id = u.id
      ORDER BY f.submitted_at DESC
      LIMIT 20
    `);

    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT u.id) as total_customers,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_revenue,
        AVG(CASE WHEN u.id IS NOT NULL THEN order_count ELSE 0 END) as avg_orders_per_customer
      FROM users u
      LEFT JOIN orders o ON u.id = o.customer_id AND o.payment_status = 'Paid'
      LEFT JOIN (
        SELECT customer_id, COUNT(*) as order_count
        FROM orders
        WHERE payment_status = 'Paid'
        GROUP BY customer_id
      ) oc ON u.id = oc.customer_id
      WHERE u.user_type = 'customer'
    `);

    res.json({
      success: true,
      reportType: 'customer',
      summary: stats[0],
      topCustomers: customerInsights.slice(0, 10),
      customersByMonth,
      recentFeedback: customerFeedback
    });
  } catch (error) {
    console.error('Customer report error:', error);
    res.status(500).json({ message: 'Failed to generate customer report', error: error.message });
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
      `SELECT r.*, u.full_name as generated_by_name
       FROM reports r
       JOIN users u ON r.generated_by = u.id
       WHERE r.id = ?`,
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

    const [reports] = await db.query('SELECT * FROM reports WHERE id = ?', [reportId]);

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
