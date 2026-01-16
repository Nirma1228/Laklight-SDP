import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AdminOrderManagement.css';

function AdminOrderManagement() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-2025-1523',
      customer: { name: 'Asoka Perera', phone: '0771234567', email: 'asoka.perera@email.com', address: '123, Main Street, Colombo 07' },
      products: [
        { name: 'Fresh Mango Cordial - 750ml', quantity: 3, price: 750 },
        { name: 'Lime Mix - 500ml', quantity: 2, price: 600 }
      ],
      amount: 3450,
      payment: 'Paid',
      status: 'Pending',
      date: 'Oct 14, 2025',
      dateTime: 'Oct 14, 2025 - 10:30 AM',
      paymentMethod: 'Card Payment'
    },
    {
      id: 'ORD-2025-1522',
      customer: { name: 'Nimal Silva', phone: '0779876543', email: 'nimal.silva@email.com', address: '456, Lake Road, Kandy' },
      products: [
        { name: 'Wood Apple Juice', quantity: 5, price: 600 },
        { name: 'Chili Sauce', quantity: 2, price: 450 }
      ],
      amount: 4200,
      payment: 'Paid',
      status: 'Processing',
      date: 'Oct 13, 2025',
      dateTime: 'Oct 13, 2025 - 09:15 AM',
      paymentMethod: 'Online Banking'
    },
    {
      id: 'ORD-2025-1521',
      customer: { name: 'Kamala Fernando', phone: '0763456789', email: 'kamala.f@email.com', address: '789, Hill Street, Galle' },
      products: [
        { name: 'Mango Jelly', quantity: 15, price: 350 },
        { name: 'Passion Fruit Cordial', quantity: 10, price: 600 }
      ],
      amount: 8750,
      payment: 'Paid',
      status: 'Shipped',
      date: 'Oct 12, 2025',
      dateTime: 'Oct 12, 2025 - 11:45 AM',
      paymentMethod: 'Card Payment'
    },
    {
      id: 'ORD-2025-1520',
      customer: { name: 'Roshan Jayawardena', phone: '0712345678', email: 'roshan.j@email.com', address: '321, Beach Road, Negombo' },
      products: [
        { name: 'Lime Mix', quantity: 4, price: 600 },
        { name: 'Wood Apple Juice', quantity: 3, price: 600 }
      ],
      amount: 2980,
      payment: 'Paid',
      status: 'Delivered',
      date: 'Oct 11, 2025',
      dateTime: 'Oct 11, 2025 - 08:30 AM',
      paymentMethod: 'Cash on Delivery'
    },
    {
      id: 'ORD-2025-1519',
      customer: { name: 'Sarah Wilson', phone: '0778765432', email: 'sarah.w@email.com', address: '654, Park Avenue, Colombo 05' },
      products: [{ name: 'Mixed Products', quantity: 8, price: 300 }],
      amount: 2400,
      payment: 'Pending',
      status: 'Cancelled',
      date: 'Oct 10, 2025',
      dateTime: 'Oct 10, 2025 - 14:20 PM',
      paymentMethod: 'Card Payment'
    },
    {
      id: 'ORD-2025-1518',
      customer: { name: 'ABC Restaurant', phone: '0115678901', email: 'abc.rest@email.com', address: '987, Restaurant Street, Colombo 03' },
      products: [{ name: 'Chili Sauce - Bulk Order', quantity: 25, price: 620 }],
      amount: 15500,
      payment: 'Paid',
      status: 'Confirmed',
      date: 'Oct 14, 2025',
      dateTime: 'Oct 14, 2025 - 07:00 AM',
      paymentMethod: 'Bank Transfer'
    }
  ]);

  const [filters, setFilters] = useState({
    status: '',
    payment: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const stats = {
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing' || o.status === 'Confirmed').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    revenue: orders.filter(o => o.payment === 'Paid').reduce((sum, o) => sum + o.amount, 0)
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const filteredOrders = orders.filter(order => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.payment && order.payment !== filters.payment) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!order.id.toLowerCase().includes(searchLower) &&
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
      'Pending': 'payment-pending',
      'Failed': 'payment-failed'
    };
    return paymentMap[payment] || '';
  };

  const exportOrders = () => {
    alert('Exporting orders to Excel...');
  };

  return (
    <div className="admin-order-management">
      <Header isLoggedIn={true} />
      
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
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
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
                onChange={(e) => setFilters({...filters, payment: e.target.value})}
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
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label>Date To</label>
              <input 
                type="date" 
                className="filter-input"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
          </div>
          <div className="search-box">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by Order ID, Customer Name, or Phone Number..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
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
                    {order.products.map((p, i) => (
                      <div key={i}>{p.name} ({p.quantity})</div>
                    ))}
                  </td>
                  <td className="order-amount">Rs. {order.amount.toLocaleString()}</td>
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
                      {order.status === 'Pending' && (
                        <button 
                          className="btn btn-success btn-small"
                          onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'Processing' && (
                        <button 
                          className="btn btn-success btn-small"
                          onClick={() => updateOrderStatus(order.id, 'Shipped')}
                        >
                          Ship
                        </button>
                      )}
                      {order.status === 'Shipped' && (
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
                      <div style={{fontSize: '0.85rem', color: '#666'}}>
                        Qty: {product.quantity} × Rs. {product.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="product-price">Rs. {(product.quantity * product.price).toFixed(2)}</div>
                  </li>
                ))}
                <li className="product-item" style={{background: '#f1f8e9', fontWeight: 600}}>
                  <div>Subtotal</div>
                  <div>Rs. {selectedOrder.amount.toFixed(2)}</div>
                </li>
                <li className="product-item" style={{background: '#e8f5e9'}}>
                  <div style={{color: '#2e7d32', fontWeight: 600}}>Delivery Charges</div>
                  <div style={{color: '#2e7d32', fontWeight: 600}}>Free</div>
                </li>
                <li className="product-item" style={{background: '#4caf50', color: 'white', fontSize: '1.1rem'}}>
                  <div style={{fontWeight: 'bold'}}>Total Amount</div>
                  <div style={{fontWeight: 'bold'}}>Rs. {selectedOrder.amount.toFixed(2)}</div>
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
