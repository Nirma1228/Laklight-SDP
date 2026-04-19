import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { config } from '../config';
import { formatSriLankanDate, formatSriLankanDateTime } from '../utils/dateFormatter';
import { generatePDFReport } from '../utils/pdfGenerator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faBoxes, faShoppingCart, faUserTie, faChartBar,
  faBox, faSync, faTruck, faUser, faBell, faExclamationCircle, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './AdminOrderManagement.css';

function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    payment: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Map backend orders to frontend model
        const mapped = data.orders.map(o => {
          // Normalise status names to lowercase for consistent comparison
          const currentStatus = o.order_status ? o.order_status : 'Pending';
          
          return {
            id: o.order_id, // Use order_id
            orderIdNum: o.order_number || `ORD-${o.order_id}`,
            customer: {
              name: o.customer_name,
              phone: o.phone || 'N/A',
              email: o.email || 'N/A',
              address: o.delivery_address || 'N/A'
            },
            productsSummary: o.product_summary || 'No items',
            amount: Number(o.net_amount),
            payment: o.payment_status ? (o.payment_status.charAt(0).toUpperCase() + o.payment_status.slice(1)) : 'Unpaid',
            status: currentStatus,
            date: formatSriLankanDate(o.order_date),
            dateTime: formatSriLankanDateTime(o.order_date),
            paymentMethod: o.payment_method || 'Cash on Delivery'
          };
        });
        setOrders(mapped);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = {
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing' || o.status === 'Ready').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    revenue: orders.filter(o => o.payment === 'Paid').reduce((sum, o) => sum + Number(o.amount), 0)
  };

  const viewOrder = async (order) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/orders/${order.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder({
          ...order,
          products: data.items.map(i => ({
            name: i.name,
            quantity: i.quantity,
            price: Number(i.price_at_purchase)
          })),
          amount: Number(data.order.net_amount)
        });
        setShowModal(true);
      }
    } catch (err) {
      console.error('Fetch order details error:', err);
      alert('Failed to load order details');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prevOrders => prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        alert(data.message || 'Status update failed');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert('Error updating status');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.payment && order.payment !== filters.payment) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!String(order.orderIdNum).toLowerCase().includes(searchLower) &&
        !order.customer.name.toLowerCase().includes(searchLower) &&
        !order.customer.phone.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  const getStatusClass = (status) => {
    const statusMap = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  const getPaymentClass = (payment) => {
    const paymentMap = {
      'Paid': 'payment-paid',
      'paid': 'payment-paid',
      'Pending': 'payment-pending',
      'unpaid': 'payment-pending',
      'Failed': 'payment-failed'
    };
    return paymentMap[payment.toLowerCase()] || '';
  };

  const exportOrders = () => {
    const headers = ['Order ID', 'Customer', 'Products', 'Amount', 'Payment', 'Status', 'Date'];
    const data = filteredOrders.map(o => [
      o.orderIdNum,
      o.customer.name,
      o.productsSummary,
      `LKR ${o.amount.toLocaleString()}`,
      o.payment,
      o.status.toUpperCase(),
      o.date
    ]);

    generatePDFReport({
      title: 'Order Management Report',
      subtitle: `System records for ${filteredOrders.length} orders matching search/filter criteria.`,
      headers,
      data,
      orientation: 'landscape',
      filename: `Laklight_Orders_${new Date().toISOString().split('T')[0]}.pdf`,
      stats: {
        'Total Count': filteredOrders.length.toString(),
        'Total Revenue': `LKR ${filteredOrders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}`,
        'Pending': filteredOrders.filter(o => o.status === 'Pending').length.toString()
      }
    });
  };

  return (
    <div className="admin-order-management">
      <Header
        isLoggedIn={true}
        customLinks={[
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
        ]}
      />

      <main className="dashboard">
        <div className="page-header">
          <h1 className="page-title">📦 Order Management</h1>
          <p>Manage and track all customer orders</p>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
          <div className="stat-card processing">
            <div className="stat-number">{stats.processing}</div>
            <div className="stat-label">Processing</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{stats.delivered}</div>
            <div className="stat-label">Delivered</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">Rs. {stats.revenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Order Status</label>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Ready">Ready</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Payment Status</label>
              <select
                className="filter-select"
                value={filters.payment}
                onChange={(e) => setFilters({ ...filters, payment: e.target.value })}
              >
                <option value="">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Date From</label>
              <input
                type="date"
                className="filter-input"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="filter-group">
              <label>Date To</label>
              <input
                type="date"
                className="filter-input"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search by Order ID, Customer Name, or Phone Number..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <button className="btn btn-success">🔍 Search</button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table">
          <div className="table-header">
            <h3>All Orders</h3>
            <button className="btn btn-primary" onClick={exportOrders}>📥 Export to Excel</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">{order.customer.name}</span>
                      <span className="customer-phone">📞 {order.customer.phone}</span>
                    </div>
                  </td>
                  <td className="order-items">
                    {order.productsSummary}
                  </td>
                  <td className="order-amount">Rs. {Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`payment-badge ${getPaymentClass(order.payment)}`}>
                      {order.payment}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-info btn-small" onClick={() => viewOrder(order)}>
                        View
                      </button>
                      {(order.status === 'Pending' || order.status === 'pending') && (
                        <button
                          className="btn btn-success btn-small"
                          onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                        >
                          Confirm
                        </button>
                      )}
                      {(order.status === 'Processing' || order.status === 'processing' || order.status === 'Confirmed') && (
                        <button
                          className="btn btn-success btn-small"
                          onClick={() => updateOrderStatus(order.id, 'Shipped')}
                        >
                          Ship
                        </button>
                      )}
                      {(order.status === 'Shipped' || order.status === 'shipped') && (
                        <button
                          className="btn btn-success btn-small"
                          onClick={() => updateOrderStatus(order.id, 'Delivered')}
                        >
                          Deliver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="order-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - {selectedOrder.id}</h2>
              <button className="close-modal" onClick={closeModal}>✕</button>
            </div>

            {/* Customer Information */}
            <div className="modal-section">
              <h3>👤 Customer Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Customer Name</span>
                  <span className="detail-value">{selectedOrder.customer.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{selectedOrder.customer.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedOrder.customer.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Delivery Address</span>
                  <span className="detail-value">{selectedOrder.customer.address}</span>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="modal-section">
              <h3>📦 Order Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Order ID</span>
                  <span className="detail-value">{selectedOrder.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Order Date</span>
                  <span className="detail-value">{selectedOrder.dateTime}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Status</span>
                  <span className="detail-value">✅ {selectedOrder.payment}</span>
                </div>
              </div>
            </div>

            {/* Products Ordered */}
            <div className="modal-section">
              <h3>🛒 Products Ordered</h3>
              <ul className="product-list">
                {selectedOrder.products.map((product, index) => (
                  <li key={index} className="product-item">
                    <div>
                      <div className="product-name">{product.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        Qty: {product.quantity} × Rs. {product.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="product-price">Rs. {(product.quantity * product.price).toFixed(2)}</div>
                  </li>
                ))}
                <li className="product-item" style={{ background: '#f1f8e9', fontWeight: 600 }}>
                  <div>Subtotal</div>
                  <div>Rs. {selectedOrder.amount.toFixed(2)}</div>
                </li>
                <li className="product-item" style={{ background: '#e8f5e9' }}>
                  <div style={{ color: '#2e7d32', fontWeight: 600 }}>Delivery Charges</div>
                  <div style={{ color: '#2e7d32', fontWeight: 600 }}>Free</div>
                </li>
                <li className="product-item" style={{ background: '#4caf50', color: 'white', fontSize: '1.1rem' }}>
                  <div style={{ fontWeight: 'bold' }}>Total Amount</div>
                  <div style={{ fontWeight: 'bold' }}>Rs. {selectedOrder.amount.toFixed(2)}</div>
                </li>
              </ul>
            </div>

            {/* Status Update Section */}
            <div className="modal-section status-update-section">
              <h3>Update Order Status</h3>
              <div className="status-buttons">
                <button
                  className="btn btn-success btn-small"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'Confirmed');
                    closeModal();
                  }}
                >
                  Confirm Order
                </button>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'Processing');
                    closeModal();
                  }}
                >
                  Process Order
                </button>
                <button
                  className="btn btn-info btn-small"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'Shipped');
                    closeModal();
                  }}
                >
                  Ship Order
                </button>
                <button
                  className="btn btn-success btn-small"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'Delivered');
                    closeModal();
                  }}
                >
                  Mark Delivered
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'Cancelled');
                    closeModal();
                  }}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminOrderManagement;
