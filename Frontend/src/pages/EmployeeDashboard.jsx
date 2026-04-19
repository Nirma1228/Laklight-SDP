import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { config } from '../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle, faFlagCheckered, faHistory,
  faExclamationTriangle, faExclamationCircle, faInfoCircle, faChevronRight,
  faUser, faBoxes, faHandshake, faClipboardList, faTruck,
  faBell, faSync, faLeaf, faCubes, faClock, faPlus,
  faCalendar, faCalendarAlt, faCalendarCheck, faMapMarkerAlt,
  faImage, faCheck, faTimes, faShoppingCart, faMoneyBillWave, faSeedling,
  faBox, faPrint, faMinus, faUsers, faShieldAlt, faTrash, faPaperPlane
} from '@fortawesome/free-solid-svg-icons'
import './EmployeeDashboard.css'

const EmployeeDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('inventory')
  const [inventorySubTab, setInventorySubTab] = useState('farmer')
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isReviewDeliveryOpen, setIsReviewDeliveryOpen] = useState(false)
  const [isDeliveryDetailsOpen, setIsDeliveryDetailsOpen] = useState(false)
  const [currentDelivery, setCurrentDelivery] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [dashboardAlerts, setDashboardAlerts] = useState([])
  const [dismissedAlertIds, setDismissedAlertIds] = useState(
    () => JSON.parse(localStorage.getItem('emp_dismissed_alerts') || '[]')
  )
  const [isNotiDropdownOpen, setIsNotiDropdownOpen] = useState(false)
  const [deliveries, setDeliveries] = useState([])
  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false)
  const [updatingItem, setUpdatingItem] = useState(null)
  const [updateAmount, setUpdateAmount] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortFilter, setSortFilter] = useState('')
  const [timeframeFilter, setTimeframeFilter] = useState('all') // 'all', 'today', 'week', 'month'
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all')
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [customScheduleDate, setCustomScheduleDate] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [notificationType, setNotificationType] = useState('success') // 'success' or 'error'

  // Custom Confirm Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => { },
    confirmText: 'Confirm',
    type: 'primary' // 'primary', 'danger'
  })

  const openConfirm = (config) => {
    setConfirmConfig({
      title: config.title || 'Confirm Action',
      message: config.message || 'Are you sure you want to proceed?',
      onConfirm: () => {
        config.onConfirm();
        setIsConfirmModalOpen(false);
      },
      confirmText: config.confirmText || 'Yes, Proceed',
      type: config.type || 'primary'
    });
    setIsConfirmModalOpen(true);
  }

  const showNotification = (message, type = 'success', farmerId = null, extraData = {}) => {
    setNotificationType(type)
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 4000)

    // Bridge to Farmer Notifications if farmerId is provided
    if (farmerId) {
      const farmerNotifs = JSON.parse(localStorage.getItem('farmer_notifications') || '[]');
      const newNotif = {
        id: Date.now(),
        farmerId: farmerId,
        title: extraData.title || 'System Notification',
        message: extraData.message || message,
        type: type === 'success' ? 'success' : 'info',
        date: new Date().toLocaleString(),
        isRead: false
      };
      localStorage.setItem('farmer_notifications', JSON.stringify([newNotif, ...farmerNotifs]));
    }
  }

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phone: '',
    employeeId: 'EMP-001',
    department: 'Operations',
    position: 'Inventory Manager',
    joinDate: 'January 15, 2024',
    address: '45 Galle Road',
    city: 'Colombo',
    postalCode: '00300',
    notifications: 'all',
    language: 'en'
  })

  // Load user data from localStorage and Database
  useEffect(() => {
    // 1. Initial load from localStorage for fast UI
    const userName = localStorage.getItem('userName');
    if (userName) {
      setProfileData(prev => ({
        ...prev,
        fullName: userName,
        firstName: userName.split(' ')[0],
        lastName: userName.split(' ').slice(1).join(' ')
      }));
    }

    // 2. Fetch fresh data from Database
    const fetchRealProfile = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${config.API_BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setProfileData(prev => ({
              ...prev,
              fullName: data.user.full_name,
              firstName: data.user.full_name.split(' ')[0],
              lastName: data.user.full_name.split(' ').slice(1).join(' '),
              email: data.user.email,
              phone: data.user.phone,
              address: data.user.address
            }));
            localStorage.setItem('userName', data.user.full_name);
          }
        }
      } catch (error) {
        console.error('Error fetching real-time profile:', error);
      }
    };

    fetchRealProfile();
  }, []);

  // Inventory state – loaded from DB on mount
  const [farmerProducts, setFarmerProducts] = useState([])
  const [finishedProducts, setFinishedProducts] = useState([])

  const [supplierApplications, setSupplierApplications] = useState([])

  // Load reschedule notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = JSON.parse(localStorage.getItem('employee_notifications') || '[]')
      setNotifications(storedNotifications.filter(n => n.status === 'pending'))
    }
    loadNotifications()

    // Poll for new notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  // Generate dashboard alerts automatically based on real inventory data
  useEffect(() => {
    const alerts = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // ─── 1. FARMER / RAW MATERIAL PRODUCTS ─────────────────────────────────
    farmerProducts.forEach(product => {
      const totalStock = product.batches.reduce((sum, batch) => {
        // batch.stock can be '50 kg' or a number string — parse numeric part
        return sum + (parseInt(batch.stock) || 0)
      }, 0)

      // Per-batch expiry check
      product.batches.forEach(batch => {
        let daysLeft
        if (batch.daysUntilExpiry !== undefined) {
          daysLeft = batch.daysUntilExpiry
        } else {
          if (!batch.expiry) return
          const expiryDate = new Date(batch.expiry)
          expiryDate.setHours(0, 0, 0, 0)
          daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
        }

        if (daysLeft < 0) {
          alerts.push({
            id: `fp-expired-${batch.id}`,
            type: 'danger',
            category: 'expiry',
            productType: 'raw',
            heading: '🚨 EXPIRED: RAW MATERIAL',
            message: `${product.name} batch at ${batch.location} EXPIRED ${Math.abs(daysLeft)} day(s) ago (${batch.stock}). Remove immediately.`,
            targetTab: 'inventory'
          })
        } else if (daysLeft <= 5) {
          alerts.push({
            id: `fp-expiry-critical-${batch.id}`,
            type: 'danger',
            category: 'expiry',
            productType: 'raw',
            heading: '⌛ CRITICAL EXPIRY: RAW MATERIAL',
            message: `${product.name} at ${batch.location} expires in ${daysLeft} day(s) (${batch.stock}). Use or dispose urgently.`,
            targetTab: 'inventory'
          })
        }
      })

      // Aggregate stock level alerts for the product
      if (totalStock === 0) {
        alerts.push({
          id: `fp-out-${product.id}`,
          type: 'danger',
          category: 'low_stock',
          productType: 'raw',
          heading: '🔴 OUT OF STOCK: RAW MATERIAL',
          message: `${product.name} is completely out of stock. Immediate restocking required.`,
          targetTab: 'inventory'
        })
      } else if (totalStock < 50) {
        alerts.push({
          id: `fp-crit-${product.id}`,
          type: 'danger',
          category: 'low_stock',
          productType: 'raw',
          heading: '🔴 CRITICALLY LOW STOCK',
          message: `${product.name}: only ${totalStock} kg remaining across all locations. Restock urgently.`,
          targetTab: 'inventory'
        })
      }
    })

    // ─── 2. FINISHED / PROCESSED PRODUCTS ──────────────────────────────────
    finishedProducts.forEach(product => {
      const totalUnits = product.batches.reduce((sum, b) => sum + (parseInt(b.quantity) || 0), 0)

      // Per-batch best-before alerts with tiered thresholds
      product.batches.forEach(batch => {
        if (!batch.bestBefore) return
        const bbDate = new Date(batch.bestBefore)
        bbDate.setHours(0, 0, 0, 0)
        const diffDays = Math.ceil((bbDate - today) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
          alerts.push({
            id: `gp-expired-${batch.id}`,
            type: 'danger',
            category: 'expiry',
            productType: 'finished',
            heading: '🚨 EXPIRED: FINISHED PRODUCT',
            message: `${product.name} (Batch ${batch.batch}) EXPIRED ${Math.abs(diffDays)} day(s) ago. Remove from shelves immediately.`,
            targetTab: 'inventory'
          })
        } else if (diffDays <= 30) {
          alerts.push({
            id: `gp-expiry-${batch.id}`,
            type: 'danger',
            category: 'expiry',
            productType: 'finished',
            heading: '⌛ BEST BEFORE ALERT',
            message: `${product.name} (Batch ${batch.batch}) best before in ${diffDays} day(s) — ${batch.quantity} units at ${batch.location}.`,
            targetTab: 'inventory'
          })
        } else if (diffDays <= 90) {
          alerts.push({
            id: `gp-expiry-warn-${batch.id}`,
            type: 'warning',
            category: 'expiry',
            productType: 'finished',
            heading: '⚠️ BEST BEFORE APPROACHING',
            message: `${product.name} (Batch ${batch.batch}) best before in ${diffDays} days — plan sales or promotions.`,
            targetTab: 'inventory'
          })
        }
      })

      // Aggregate unit stock alerts
      if (totalUnits === 0) {
        alerts.push({
          id: `gp-out-${product.id}`,
          type: 'danger',
          category: 'low_stock',
          productType: 'finished',
          heading: '🔴 OUT OF STOCK: FINISHED PRODUCT',
          message: `${product.name} has zero units in stock. Production run needed immediately.`,
          targetTab: 'inventory'
        })
      } else if (totalUnits < 15) {
        alerts.push({
          id: `gp-crit-${product.id}`,
          type: 'danger',
          category: 'low_stock',
          productType: 'finished',
          heading: '🔴 CRITICALLY LOW FINISHED STOCK',
          message: `${product.name}: only ${totalUnits} units remaining across all batches. Schedule production immediately.`,
          targetTab: 'inventory'
        })
      } else if (totalUnits < 50) {
        alerts.push({
          id: `gp-warn-${product.id}`,
          type: 'warning',
          category: 'low_stock',
          productType: 'finished',
          heading: '⚠️ LOW FINISHED STOCK',
          message: `${product.name}: ${totalUnits} units remaining. Consider scheduling a production run soon.`,
          targetTab: 'inventory'
        })
      }
    })

    // ─── 3. PENDING FARMER APPLICATIONS ────────────────────────────────────
    if (supplierApplications && supplierApplications.length > 0) {
      alerts.push({
        id: 'application-notification',
        type: 'info',
        category: 'application',
        productType: 'other',
        heading: '📢 PENDING FARMER APPLICATIONS',
        message: `${supplierApplications.length} supplier application(s) waiting for review and approval.`,
        targetTab: 'suppliers'
      })
    }

    setDashboardAlerts(alerts.filter(a => !dismissedAlertIds.includes(a.id)))
  }, [farmerProducts, finishedProducts, supplierApplications, dismissedAlertIds])

  const dismissAlert = (alertId) => {
    const updated = [...dismissedAlertIds, alertId]
    setDismissedAlertIds(updated)
    localStorage.setItem('emp_dismissed_alerts', JSON.stringify(updated))
  }

  const clearAllAlerts = () => {
    const allIds = dashboardAlerts.map(a => a.id)
    const updated = [...dismissedAlertIds, ...allIds]
    setDismissedAlertIds(updated)
    localStorage.setItem('emp_dismissed_alerts', JSON.stringify(updated))
    setIsNotiDropdownOpen(false)
  }

  // New state for Add Batch
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false)
  const [batchUpdateMode, setBatchUpdateMode] = useState('new') // 'new' or 'adjust'
  const [addBatchData, setAddBatchData] = useState({
    quantity: '',
    manufactured: '',
    bestBefore: '',
    location: '',
    batchCode: ''
  })
  const [adjustData, setAdjustData] = useState({
    amount: '',
    type: 'add' // 'add' or 'reduce'
  })

  // Filtering Logic
  const filteredFarmerProducts = useMemo(() => {
    return farmerProducts
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
        // Remove strict category filter check for raw inventory to ensure items show up
        const totalStock = p.batches.reduce((sum, b) => sum + (parseFloat(b.stockVal) || 0), 0)

        let matchesStatus = true
        if (statusFilter === 'in-stock') matchesStatus = totalStock > 0
        if (statusFilter === 'low-stock') matchesStatus = totalStock < 50 && totalStock > 0
        if (statusFilter === 'out-of-stock') matchesStatus = totalStock === 0

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortFilter === 'name-asc') return a.name.localeCompare(b.name)
        if (sortFilter === 'name-desc') return b.name.localeCompare(a.name)

        const totalA = a.batches.reduce((sum, b) => sum + (parseFloat(b.stockVal) || 0), 0)
        const totalB = b.batches.reduce((sum, b) => sum + (parseFloat(b.stockVal) || 0), 0)

        if (sortFilter === 'low-stock-priority') {
          // Priority: Critical (3) > Warning (2) > Good (1)
          const getPriority = (batches) => {
            if (batches.some(b => b.status === 'critical')) return 3
            if (batches.some(b => b.status === 'warning')) return 2
            return 1
          }
          return getPriority(b.batches) - getPriority(a.batches) || totalA - totalB
        }

        if (sortFilter === 'stock-low') return totalA - totalB
        if (sortFilter === 'stock-high') return totalB - totalA
        return 0
      })
  }, [farmerProducts, searchTerm, categoryFilter, statusFilter, sortFilter])

  const filteredFinishedProducts = useMemo(() => {
    return finishedProducts
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
        // Remove strict category filter check for finished inventory to ensure items show up
        const totalUnits = p.batches.reduce((sum, b) => sum + (parseFloat(b.stockVal) || 0), 0)

        let matchesStatus = true
        if (statusFilter === 'in-stock') matchesStatus = totalUnits >= 50
        if (statusFilter === 'low-stock') matchesStatus = totalUnits < 50 && totalUnits > 0
        if (statusFilter === 'out-of-stock') matchesStatus = totalUnits === 0

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortFilter === 'name-asc') return a.name.localeCompare(b.name)
        if (sortFilter === 'name-desc') return b.name.localeCompare(a.name)

        const totalA = a.batches.reduce((sum, b) => sum + (parseFloat(b.stockVal) || 0), 0)
        const totalB = b.batches.reduce((sum, b) => sum + (parseFloat(b.stockVal) || 0), 0)

        if (sortFilter === 'low-stock-priority') {
          const getPriority = (batches) => {
            if (batches.some(b => {
              const bbDate = new Date(b.bestBefore);
              const diffDays = Math.ceil((bbDate - new Date()) / (1000 * 60 * 60 * 24));
              return diffDays <= 90;
            })) return 3;
            if (batches.some(b => (b.stockVal || 0) < 50)) return 2;
            return 1;
          }
          return getPriority(b.batches) - getPriority(a.batches) || totalA - totalB
        }

        if (sortFilter === 'stock-low') return totalA - totalB
        if (sortFilter === 'stock-high') return totalB - totalA
        return 0
      })
  }, [finishedProducts, searchTerm, categoryFilter, statusFilter, sortFilter])

  const filteredApplications = useMemo(() => {
    return (supplierApplications || [])
      .filter(app => {
        // Show pending (under-review) applications
        const isUnderReview = app.status === 'under-review' || app.status_id === 1;
        if (!isUnderReview) return false

        const pName = app.farmerName || '';
        const prod = app.product || '';

        const matchesSearch = pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prod.toLowerCase().includes(searchTerm.toLowerCase())
        
        // Relax category filter if it's causing issues (many items have null/raw category)
        const matchesCategory = !categoryFilter || 
          (app.category && app.category.toLowerCase() === categoryFilter.toLowerCase()) ||
          (!app.category && categoryFilter === 'raw');
        
        // Timeframe filter logic
        let matchesTimeframe = true
        if (timeframeFilter !== 'all') {
          const subDate = new Date(app.submitted || app.date)
          const now = new Date()
          const diffDays = (now - subDate) / (1000 * 60 * 60 * 24)
          
          if (timeframeFilter === 'today') matchesTimeframe = diffDays < 1
          else if (timeframeFilter === 'week') matchesTimeframe = diffDays < 7
          else if (timeframeFilter === 'month') matchesTimeframe = diffDays < 30
        }

        return matchesSearch && matchesCategory && matchesTimeframe
      })
      .sort((a, b) => {

        const nameA = a.farmerName || '';
        const nameB = b.farmerName || '';

        if (sortFilter === 'name-asc') return nameA.localeCompare(nameB)
        if (sortFilter === 'name-desc') return nameB.localeCompare(nameA)

        // Date sort (assuming submitted date strings)
        if (sortFilter === 'newest') return new Date(b.submitted) - new Date(a.submitted)

        // Quantity sort (parsing '200kg' etc)
        const qtyA = parseInt(a.quantity || '0')
        const qtyB = parseInt(b.quantity || '0')
        if (sortFilter === 'stock-low') return qtyA - qtyB
        if (sortFilter === 'stock-high') return qtyB - qtyA

        // Price sort (parsing 'LKR 180.00/kg')
        if (sortFilter === 'price-low' || sortFilter === 'price-high') {
          const parsePrice = (str) => {
            if (!str) return 0;
            const match = str.match(/[\d.]+/);
            return match ? parseFloat(match[0]) : 0;
          }
          const priceA = parsePrice(a.price)
          const priceB = parsePrice(b.price)
          return sortFilter === 'price-low' ? priceA - priceB : priceB - priceA
        }

        return 0
      })
  }, [supplierApplications, searchTerm, categoryFilter, statusFilter, sortFilter])


  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/orders/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedOrders = data.orders.map(o => ({
          id: o.order_id.toString(),
          refNo: o.order_number,
          customer: o.customer_name,
          address: o.delivery_address || 'N/A',
          phone: o.phone || 'N/A',
          items: o.product_summary || 'No items listed',
          total: parseFloat(o.net_amount),
          payment: o.payment_status,
          method: o.payment_method,
          status: o.order_status,
          date: new Date(o.order_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Session expired. Please log in again.', 'error');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await fetch(`${config.API_BASE_URL}/employee/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      console.log('User fetch detail:', { status: response.status, data });

      if (response.ok && (data.users || data.data)) {
        setUsers(data.users || data.data || []);
      } else {
        const errMsg = data.message || 'Failed to fetch users.';
        console.error('Failed to fetch users:', errMsg);
        showNotification(errMsg, 'error');

        if (response.status === 401) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2500);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Connection error while loading users.', 'error');
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) {
        showNotification('Session expired. Please log in again.', 'error');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await fetch(`${config.API_BASE_URL}/employee/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showNotification(`User status updated to ${newStatus}`);
        fetchUsers();
      } else {
        // Parse error message from backend
        let errMsg = 'Failed to update user status.';
        try {
          const errData = await response.json();
          errMsg = errData.message || errMsg;
        } catch (_) { /* ignore parse errors */ }

        showNotification(errMsg, 'error');

        // If token is invalid/expired, redirect to login
        if (response.status === 401) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2500);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Connection error. Please try again.', 'error');
    }
  };


  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false)

  const handleProcessOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId)
    setSelectedOrder(order)
    setIsPackingSlipOpen(true)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showNotification(`Order #${orderId} status updated to ${newStatus}`);
        fetchOrders(); // Refresh the list
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }

        if (newStatus === 'Delivered') {
          setIsPackingSlipOpen(false);
        }
      } else {
        showNotification('Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Connection error', 'error');
    }
  };

  const togglePaymentStatus = async (orderId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const order = orders.find(o => o.id === orderId);
      if (!order || !token) return;

      const newStatus = order.payment.toLowerCase() === 'paid' ? 'unpaid' : 'paid';

      const response = await fetch(`${config.API_BASE_URL}/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showNotification(`Payment for #${orderId} marked as ${newStatus}`);
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, payment: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) }));
        }
      } else {
        showNotification('Failed to update payment', 'error');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      showNotification('Connection error', 'error');
    }
  };
  // Fetch inventory from database (inventory_raw + inventory_finished)
  const fetchInventoryFromDB = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${config.API_BASE_URL}/employee/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Frontend fetchInventoryFromDB received:', data);
      
      if (!data.success) {
        console.warn('Inventory fetch success: false', data.message);
        return;
      }

      // ── Group raw rows into product → batches[] ──────────────────────
      const rawMap = {};
      (data.raw || []).forEach(item => {
        const name = item.material_name || `Item #${item.raw_inventory_id}`;
        if (!rawMap[name]) {
          rawMap[name] = { id: item.raw_inventory_id, name, category: 'raw', batches: [] };
        }
        const expDate = item.expiry_date ? new Date(item.expiry_date) : null;
        const today   = new Date(); today.setHours(0,0,0,0);
        const daysUntilExpiry = expDate
          ? Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
          : 999;
        const stockNum = parseFloat(item.quantity_units) || 0;
        const unit     = item.unit_name || 'kg';

        rawMap[name].batches.push({
          id:             item.raw_inventory_id,
          location:       item.storage_location || 'Unknown',
          stock:          `${stockNum.toFixed(2)} ${unit}`,
          stockVal:       stockNum,
          receivedDate:   item.received_date
            ? new Date(item.received_date).toISOString().split('T')[0]
            : '—',
          expiry: expDate ? expDate.toISOString().split('T')[0] : '—',
          daysUntilExpiry,
          status: daysUntilExpiry <= 5 ? 'critical'
            : daysUntilExpiry <= 14 ? 'warning' : 'good'
        });
      });
      const finalFarmerProducts = Object.values(rawMap);
      console.log('Final grouped farmer products:', finalFarmerProducts.length);
      setFarmerProducts(finalFarmerProducts);

      // ── Group finished rows into product → batches[] ─────────────────
      const finMap = {};
      (data.finished || []).forEach(item => {
        const name = item.name || `Product #${item.finished_inventory_id}`;
        if (!finMap[name]) {
          finMap[name] = { id: item.finished_inventory_id, name, category: (item.category || 'processed').toLowerCase(), batches: [] };
        }
        finMap[name].batches.push({
          id:           item.finished_inventory_id,
          location:     item.storage_location || 'Finished Goods',
          batch:        item.batch_number || `B${new Date().getFullYear()}`,
          manufactured: item.manufactured_date
            ? new Date(item.manufactured_date).toISOString().split('T')[0]
            : '—',
          bestBefore:   item.expiry_date
            ? new Date(item.expiry_date).toISOString().split('T')[0]
            : '—',
          quantity:     Number(item.quantity_units) || 0,
          stockVal:     Number(item.quantity_units) || 0,
          status:       'good'
        });
      });
      const finalFinishedProducts = Object.values(finMap);
      console.log('Final grouped finished products:', finalFinishedProducts.length);
      setFinishedProducts(finalFinishedProducts);
      setFinishedProducts(Object.values(finMap));
    } catch (err) {
      console.error('Error fetching inventory from DB:', err);
    }
  };

  // Fetch supplier applications from database
  const fetchSupplierApplications = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/employee/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const appsRaw = data.applications || [];
        const formattedApplications = appsRaw.map(app => {
          // Robust image parsing for JSON columns
          let parsedImages = [];
          try {
            if (Array.isArray(app.images)) {
              parsedImages = app.images;
            } else if (typeof app.images === 'string') {
              parsedImages = JSON.parse(app.images);
            }
          } catch (e) {
            console.error('Error parsing application images:', e);
            parsedImages = [];
          }

          return {
            ...app,
            id: app.id,
            farmerName: app.farmerName,
            product: app.product,
            quantity: `${app.quantity} ${app.unit || 'kg'}`,
            price: app.price ? `LKR ${app.price}/kg` : 'N/A',
            harvestDate: app.harvest_date ? new Date(app.harvest_date).toISOString().split('T')[0] : '—',
            submitted: app.submitted ? new Date(app.submitted).toISOString().split('T')[0] : '—',
            transport: app.transport || 'N/A',
            date: app.date ? new Date(app.date).toISOString().split('T')[0] : '—',
            proposed2: app.proposed_date_2 ? new Date(app.proposed_date_2).toISOString().split('T')[0] : (app.date ? new Date(new Date(app.date).setDate(new Date(app.date).getDate() + 1)).toISOString().split('T')[0] : '2026-04-23'),
            proposed3: app.proposed_date_3 ? new Date(app.proposed_date_3).toISOString().split('T')[0] : (app.date ? new Date(new Date(app.date).setDate(new Date(app.date).getDate() + 2)).toISOString().split('T')[0] : '2026-04-24'),
            images: parsedImages,
            category: app.category || 'raw',
            status: app.status || 'under-review'
          };
        });
        setSupplierApplications(formattedApplications);
        // Backup to localStorage
        localStorage.setItem('supplier_applications', JSON.stringify(formattedApplications));
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Fallback to localStorage if fetch fails
      const saved = localStorage.getItem('supplier_applications');
      if (saved) {
        setSupplierApplications(JSON.parse(saved));
      }
    }
  };

  // Fetch deliveries from database
  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/employee/deliveries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Deliveries raw data:', data);
        const formattedDeliveries = data.deliveries.map(del => ({
          id: del.delivery_id || del.id,
          farmer: del.farmer_name,
          product: del.product_name,
          quantity: `${del.quantity}${del.unit || 'kg'}`,
          quantityVal: del.quantity,
          price_per_unit: del.custom_price || 0,
          proposedDate: del.delivery_date ? new Date(del.delivery_date).toISOString().split('T')[0] : 
                        (del.final_delivery_date ? new Date(del.final_delivery_date).toISOString().split('T')[0] : ''),
          scheduleDate: del.scheduled_date ? new Date(del.scheduled_date).toISOString().split('T')[0] : 
                        (del.proposed_reschedule_date ? new Date(del.proposed_reschedule_date).toISOString().split('T')[0] : 
                        (del.final_delivery_date ? new Date(del.final_delivery_date).toISOString().split('T')[0] : '-')),
          transport: del.transport_method || 'N/A',
          status: del.status || 'pending',
          proposed_reschedule_date: del.proposed_reschedule_date ? new Date(del.proposed_reschedule_date).toISOString().split('T')[0] : null,
          reschedule_options: del.reschedule_options ? (typeof del.reschedule_options === 'string' ? JSON.parse(del.reschedule_options) : del.reschedule_options) : []
        }));
        console.log('Formatted Deliveries:', formattedDeliveries);
        setDeliveries(formattedDeliveries);
        // Backup to localStorage
        localStorage.setItem('delivery_list', JSON.stringify(formattedDeliveries));
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      // Fallback to localStorage if fetch fails
      const saved = localStorage.getItem('delivery_list');
      if (saved) {
        setDeliveries(JSON.parse(saved));
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchInventoryFromDB();
    fetchSupplierApplications();
    fetchDeliveries();
    fetchOrders();
    fetchUsers();
  }, []);

  // Auto-save to localStorage as backup
  useEffect(() => {
    if (deliveries.length > 0) {
      localStorage.setItem('delivery_list', JSON.stringify(deliveries));
    }
  }, [deliveries]);

  const showTab = (tabName) => {
    setActiveTab(tabName)
    
    // Refresh data if switching to specific tabs
    if (tabName === 'inventory') fetchInventoryFromDB();
    if (tabName === 'users') fetchUsers();
    if (tabName === 'orders') fetchOrders();
    if (tabName === 'deliveries') fetchDeliveries();
    if (tabName === 'suppliers') fetchSupplierApplications();

    // Automated scroll to section when tab is changed
    setTimeout(() => {
      let sectionId = '';
      switch (tabName) {
        case 'inventory': sectionId = 'current-inventory'; break;
        case 'suppliers': sectionId = 'supplier-applications'; break;
        case 'orders': sectionId = 'order-management'; break;
        case 'deliveries': sectionId = 'delivery-schedule'; break;
        case 'users': sectionId = 'user-management'; break;
        default: sectionId = '';
      }

      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }, 100);
  }

  const approveApplication = (id) => {
    const app = supplierApplications.find(a => a.id === id)
    if (!app) return
    setSelectedApp(app)
    setCustomScheduleDate(app.date)
    setIsApproveModalOpen(true)
  }

  const confirmApproveWithDate = async () => {
    if (!selectedApp || !customScheduleDate) {
      alert('Please provide a valid schedule date.')
      return
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Check if employee is using farmer's proposed date or rescheduling
      const isUsingFarmerDate =
        customScheduleDate === selectedApp.date ||
        customScheduleDate === selectedApp.proposed2 ||
        customScheduleDate === selectedApp.proposed3;

      // Call backend API to approve application
      const response = await fetch(`${config.API_BASE_URL}/employee/applications/${selectedApp.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          scheduledDate: customScheduleDate,
          notes: 'Approved by employee',
          isUsingFarmerDate: isUsingFarmerDate
        })
      });

      if (response.ok) {
        setIsApproveModalOpen(false)
        
        // Refresh data to update Delivery Schedule section
        fetchSupplierApplications();
        fetchDeliveries();

        // Switch tab to deliveries to show the farmer's schedule request
        showTab('deliveries');

        if (isUsingFarmerDate) {
          showNotification(`Application approved with farmer's proposed date!`, 'success', selectedApp.farmer_id || selectedApp.farmerId, {
            title: 'Application Approved',
            message: `Your harvest submission for ${(selectedApp.product_name || selectedApp.productName || '').replace(/organic\s+/i, '')} has been approved for ${customScheduleDate}.`
          })
        } else {
          showNotification(`Application approved with reschedule date.`, 'info', selectedApp.farmer_id || selectedApp.farmerId, {
            title: 'Application Rescheduled',
            message: `Your harvest submission for ${(selectedApp.product_name || selectedApp.productName || '').replace(/organic\s+/i, '')} was rescheduled to ${customScheduleDate}.`
          })
        }
        setSelectedApp(null)

        // Refresh data from database
        fetchSupplierApplications();
        fetchDeliveries();
      } else {
        const data = await response.json();
        showNotification(data.message || 'Failed to approve application', 'error');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      showNotification('Connection error. Please try again.', 'error');
    }
  }

  const rejectApplication = (id) => {
    const app = supplierApplications.find(a => a.id === id);
    if (!app) return;
    setSelectedApp(app);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  }

  const handleConfirmReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      showNotification('Please provide a reason for rejection.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Call backend API to reject application
      const response = await fetch(`${config.API_BASE_URL}/employee/applications/${selectedApp.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason
        })
      });

      if (response.ok) {
        setIsRejectModalOpen(false);
        setRejectionReason('');
        setSelectedApp(null);
        showNotification(`Application rejected.`);

        // Refresh data from database
        fetchSupplierApplications();
      } else {
        const data = await response.json();
        showNotification(data.message || 'Failed to reject application', 'error');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      showNotification('Connection error. Please try again.', 'error');
    }
  }

  const reviewDelivery = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId)
    if (delivery) {
      setCurrentDelivery(delivery)
      setIsReviewDeliveryOpen(true)
    }
  }

  const confirmDeliverySchedule = () => {
    if (currentDelivery) {
      showNotification(`Delivery schedule confirmed for ID: ${currentDelivery.id}`)

      setDeliveries(prev => prev.map(d =>
        d.id === currentDelivery.id
          ? { ...d, status: 'confirmed', scheduleDate: d.proposedDate }
          : d
      ))
      setIsReviewDeliveryOpen(false)
      setCurrentDelivery(null)
    }
  }

  const requestScheduleChange = async () => {
    if (currentDelivery) {
      const newDate = window.prompt('Enter the new proposed date (YYYY-MM-DD):', currentDelivery.proposedDate)
      if (newDate) {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          if (!token) {
            alert('Authentication required');
            return;
          }

          // Call backend API to update delivery schedule
          const response = await fetch(`${config.API_BASE_URL}/employee/deliveries/${currentDelivery.id}/reschedule`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              scheduledDate: newDate
            })
          });

          if (response.ok) {
            showNotification(`Proposed date updated to ${newDate}`)
            setIsReviewDeliveryOpen(false)
            setCurrentDelivery(null)

            // Refresh deliveries from database
            fetchDeliveries();
          } else {
            const data = await response.json();
            showNotification(data.message || 'Failed to update schedule', 'error');
          }
        } catch (error) {
          console.error('Error updating schedule:', error);
          showNotification('Connection error. Please try again.', 'error');
        }
      }
    }
  }

  const viewEmployeeDeliveryDetails = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId)
    if (delivery) {
      setCurrentDelivery(delivery)
      setIsDeliveryDetailsOpen(true)
    }
  }

  const handleApproveReschedule = (notification) => {
    const allNotifications = JSON.parse(localStorage.getItem('employee_notifications') || '[]')
    const updatedNotifications = allNotifications.map(n =>
      n.id === notification.id ? { ...n, status: 'approved' } : n
    )
    localStorage.setItem('employee_notifications', JSON.stringify(updatedNotifications))

    setNotifications(prev => prev.filter(n => n.id !== notification.id))
    showNotification(`Reschedule approved for delivery ${notification.deliveryId}`);
  }

  const handleRejectReschedule = (notification) => {
    const reason = window.prompt('Provide reason for rejection:')
    if (reason && reason.trim()) {
      const allNotifications = JSON.parse(localStorage.getItem('employee_notifications') || '[]')
      const updatedNotifications = allNotifications.map(n =>
        n.id === notification.id ? { ...n, status: 'rejected', rejectionReason: reason } : n
      )
      localStorage.setItem('employee_notifications', JSON.stringify(updatedNotifications))

      setNotifications(prev => prev.filter(n => n.id !== notification.id))
      showNotification(`Reschedule rejected for delivery ${notification.deliveryId}`, 'error');
    }
  }

  const acceptDate = (deliveryId) => {
    openConfirm({
      title: 'Accept Schedule Date',
      message: `Confirm accepting the scheduled date for delivery ${deliveryId}? Farmer will be notified.`,
      confirmText: 'Yes, Accept Date',
      onConfirm: () => {
        showNotification(`Schedule date accepted for Delivery ID: ${deliveryId}`)
        setDeliveries(prev => prev.map(d =>
          d.id === deliveryId ? { ...d, status: 'completed' } : d
        ))
      }
    });
  }

  const rescheduleDelivery = async (deliveryId) => {
    const newDate = window.prompt('Enter new delivery date (YYYY-MM-DD):')
    if (newDate && newDate.trim() !== '') {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          showNotification('Authentication required', 'error');
          return;
        }

        // Call backend API to reschedule delivery
        const response = await fetch(`${config.API_BASE_URL}/employee/deliveries/${deliveryId}/reschedule`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            scheduledDate: newDate
          })
        });

        if (response.ok) {
          showNotification(`Delivery ${deliveryId} rescheduled to ${newDate}`);
          // Refresh deliveries from database
          fetchDeliveries();
        } else {
          const data = await response.json();
          showNotification(data.message || 'Failed to reschedule delivery', 'error');
        }
      } catch (error) {
        console.error('Error rescheduling delivery:', error);
        showNotification('Connection error. Please try again.', 'error');
      }
    }
  }

  const showAddFarmerProductModal = () => {
    const productName = window.prompt("Enter product name:")
    const quantity = window.prompt("Enter quantity (kg or units):")
    const location = window.prompt("Enter storage location (e.g., C03-R04 or Shelf A):")
    const expiryDate = window.prompt("Enter expiry date (YYYY-MM-DD):")

    if (productName && quantity && location && expiryDate) {
      const newProduct = {
        id: farmerProducts.length + 1,
        name: productName,
        batches: [
          {
            id: Date.now(), // Unique ID for the batch
            location: location,
            stock: quantity,
            receivedDate: new Date().toISOString().split('T')[0],
            expiry: expiryDate,
            daysUntilExpiry: 'N/A',
            status: 'good'
          }
        ]
      }
      setFarmerProducts(prev => [...prev, newProduct])
      showNotification(`New inventory item added: ${productName}`)
    }
  }

  const showAddFinishedProductModal = () => {
    const productName = window.prompt("Enter product name:")
    const quantity = window.prompt("Enter quantity:")
    const manufacturingDate = window.prompt("Enter manufacturing date (YYYY-MM-DD):")
    const location = window.prompt("Enter storage location (e.g., Shelf A):")
    const expiryDate = window.prompt("Enter best-before date (YYYY-MM-DD):")

    if (productName && quantity && location && expiryDate && manufacturingDate) {
      const newProduct = {
        id: finishedProducts.length + 1,
        name: productName,
        location: location,
        batch: 'B' + new Date().getFullYear() + Math.floor(Math.random() * 100),
        manufactured: manufacturingDate,
        bestBefore: expiryDate,
        quantity: parseInt(quantity),
        status: 'good'
      }
      setFinishedProducts(prev => [...prev, newProduct])
      showNotification(`New inventory item added: ${productName}`)
    }
  }

  const searchInventory = () => {
    console.log('Searching inventory:', searchTerm)
  }

  const filterDeliveries = () => {
    return deliveries.filter(delivery => {
      // Show deliveries in these statuses:
      // 1. 'scheduled delivery' or 'confirmed' - Employee approved with farmer's date (no farmer action needed)
      // 2. 'pending' - Employee rescheduled, waiting for farmer OR farmer counter-proposed
      // 3. 'confirmed schedule' - Farmer confirmed employee's reschedule
      // 4. 'completed' - Delivery done

      const validStatuses = ['pending', 'scheduled delivery', 'confirmed', 'confirmed schedule', 'completed', 'action required', 'Action Required'];

      // If a specific status filter is selected
      if (deliveryStatusFilter !== 'all') {
        return delivery.status === deliveryStatusFilter && validStatuses.includes(delivery.status);
      }

      // If 'all' is selected, show all valid statuses
      return validStatuses.includes(delivery.status);
    })
  }

  const saveProfile = () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email ||
      !profileData.phone || !profileData.address || !profileData.city || !profileData.postalCode) {
      showNotification('Please fill in all required fields marked with *', 'error')
      return
    }

    showNotification('Profile updated successfully!')
    setIsEditProfileOpen(false)
  }

  const openUpdateModal = (type, item, batch = null) => {
    setUpdatingItem({
      type,
      productId: item.id,
      productName: item.name,
      batchId: batch ? batch.id : null,
      currentQty: batch ? parseInt(batch.stock) : item.quantity,
      unit: type === 'farmer' ? 'kg' : 'units'
    })
    setUpdateAmount('')
    setIsUpdateStockOpen(true)
  }

  const handleStockUpdate = async (adjustmentType) => {
    const amount = parseInt(updateAmount)
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please enter a valid positive number.', 'error')
      return
    }

    const finalAdjustment = adjustmentType === 'add' ? amount : -amount
    const newQuantity = Math.max(0, updatingItem.currentQty + finalAdjustment)

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/employee/inventory/${updatingItem.batchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: newQuantity,
          location: updatingItem.location || 'Warehouse',
          type: updatingItem.type === 'farmer' ? 'raw' : 'finished'
        })
      });

      if (response.ok) {
        showNotification(`Successfully updated ${adjustmentType === 'add' ? 'added' : 'reduced'} ${amount} ${updatingItem.unit} for ${updatingItem.productName}`)
        fetchInventoryFromDB();
        setIsUpdateStockOpen(false)
      } else {
        showNotification('Failed to update stock in database', 'error')
      }
    } catch (error) {
      console.error('Update stock error:', error);
      showNotification('Connection error during update', 'error')
    }
  }

  const handleAddFinishedBatch = async (e) => {
    e.preventDefault()

    const today = new Date().toISOString().split('T')[0];

    // Validation: Received Date must be a past date (or today)
    if (addBatchData.manufactured > today) {
      showNotification(`${updatingItem.type === 'farmer' ? 'Received' : 'Manufacturing'} Date cannot be in the future`, 'error');
      return;
    }

    // Validation: Expiry Date must be a future date (strictly after today)
    if (addBatchData.bestBefore <= today) {
      showNotification(`${updatingItem.type === 'farmer' ? 'Expiry' : 'Best Before'} Date must be a future date`, 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (batchUpdateMode === 'new') {
        const payload = updatingItem.type === 'farmer' ? {
          type: 'raw',
          material_name: updatingItem.productName,
          quantity: addBatchData.quantity,
          received_date: addBatchData.manufactured,
          expiry_date: addBatchData.bestBefore,
          storage_location: addBatchData.location
        } : {
          type: 'finished',
          product_id: updatingItem.productId,
          batch_number: addBatchData.batchCode || `GP-${Math.floor(1000 + Math.random() * 9000)}`,
          manufactured_date: addBatchData.manufactured,
          expiry_date: addBatchData.bestBefore,
          quantity: addBatchData.quantity,
          storage_location: addBatchData.location
        };

        const response = await fetch(`${config.API_BASE_URL}/employee/inventory`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          showNotification('New batch added successfully');
          fetchInventoryFromDB();
        } else {
          showNotification('Failed to add new batch', 'error');
        }
      } else {
        // Handle Adjustment
        const amount = parseInt(adjustData.amount)
        const adj = adjustData.type === 'add' ? amount : -amount
        const newQuantity = Math.max(0, updatingItem.currentQty + adj)

        const response = await fetch(`${config.API_BASE_URL}/employee/inventory/${updatingItem.batchId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            quantity: newQuantity,
            location: updatingItem.location || 'Warehouse',
            type: updatingItem.type === 'farmer' ? 'raw' : 'finished'
          })
        });

        if (response.ok) {
          showNotification('Inventory adjusted successfully');
          fetchInventoryFromDB();
        } else {
          showNotification('Failed to adjust inventory', 'error');
        }
      }
    } catch (error) {
      console.error('Add/Adjust batch error:', error);
      showNotification('System error updating inventory', 'error');
    }

    setIsAddBatchModalOpen(false)
    setAdjustData({ amount: '', type: 'add' })
    setAddBatchData({ quantity: '', manufactured: '', bestBefore: '', location: '', batchCode: '' })
  }

  const deleteInventoryItem = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this inventory item? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/employee/inventory/${id}?type=${type === 'farmer' ? 'raw' : 'finished'}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showNotification('Item deleted successfully');
        fetchInventoryFromDB();
      } else {
        showNotification('Failed to delete item', 'error');
      }
    } catch (error) {
       console.error('Delete inventory error:', error);
       showNotification('Network error during deletion', 'error');
    }
  }

  return (
    <div className="employee-dashboard">
      <Header
        isLoggedIn={true}
        customLinks={[
          {
            label: (
              <>
                <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '8px' }} />
                Inventory Management
              </>
            ),
            onClick: () => showTab('inventory')
          },
          {
            label: (
              <>
                <FontAwesomeIcon icon={faHandshake} style={{ marginRight: '8px' }} />
                Supplier Applications
              </>
            ),
            onClick: () => showTab('suppliers')
          },
          {
            label: (
              <>
                <FontAwesomeIcon icon={faClipboardList} style={{ marginRight: '8px' }} />
                Order Management
              </>
            ),
            onClick: () => showTab('orders')
          },
          {
            label: (
              <>
                <FontAwesomeIcon icon={faTruck} style={{ marginRight: '8px' }} />
                Delivery Schedule
              </>
            ),
            onClick: () => showTab('deliveries')
          },
          {
            label: (
              <>
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                Profile
              </>
            ),
            onClick: () => setIsEditProfileOpen(true)
          }
        ]}
      >
        <div className="notification-center-v2">
          <button className={`noti-toggle-v2 ${isNotiDropdownOpen ? 'active' : ''}`} onClick={() => setIsNotiDropdownOpen(!isNotiDropdownOpen)}>
            <FontAwesomeIcon icon={faBell} />
            {dashboardAlerts.length > 0 && <span className="noti-badge-v2">{dashboardAlerts.length}</span>}
          </button>

          {isNotiDropdownOpen && (
            <div className="noti-dropdown-v2">
              <div className="noti-header-v2">
                <h3>🔔 Notifications</h3>
                <div className="noti-actions-top">
                  {dashboardAlerts.length > 0 && (
                    <button className="noti-clear-all" onClick={clearAllAlerts} title="Clear all notifications">
                      Clear All
                    </button>
                  )}
                  <button className="noti-close-btn" onClick={() => setIsNotiDropdownOpen(false)} title="Close">
                    ✕
                  </button>
                </div>
              </div>
              <div className="noti-body-v2">
                {dashboardAlerts.length === 0 ? (
                  <div className="noti-empty-v2">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <p>All caught up! No active alerts.</p>
                  </div>
                ) : (
                  <>
                    {[
                      { id: 'expiry', label: 'Expiry Alerts', icon: faHistory, color: '#ef4444' },
                      { id: 'low_stock', label: 'Low Stock Alerts', icon: faExclamationTriangle, color: '#f59e0b' },
                      { id: 'application', label: 'Supplier Applications', icon: faHandshake, color: '#3b82f6' }
                    ].map(cat => {
                      const catAlerts = dashboardAlerts.filter(a => a.category === cat.id);
                      if (catAlerts.length === 0) return null;

                      return (
                        <div key={cat.id} className="noti-section-v2">
                          <div className="noti-section-header-v2" style={{ color: cat.color }}>
                            <FontAwesomeIcon icon={cat.icon} />
                            <span>{cat.label} ({catAlerts.length})</span>
                          </div>
                          {catAlerts.map(alert => (
                            <div key={alert.id} className="noti-card-v2" onClick={() => { showTab(alert.targetTab); setIsNotiDropdownOpen(false); }}>
                              <div className="noti-card-info">
                                <span className={`noti-type-badge ${alert.productType || 'other'}`}>
                                  {alert.productType === 'raw' && 'Raw Stock'}
                                  {alert.productType === 'finished' && 'Finished Product'}
                                  {alert.productType === 'other' && (alert.category === 'delivery' ? 'Delivery' : 'Application')}
                                </span>
                                <p className="noti-card-msg">{alert.message}</p>
                              </div>
                              <button
                                className="noti-dismiss-btn"
                                onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                                title="Dismiss notification"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Header>

      {/* Dashboard Content */}
      <main className="dashboard">
        {/* Enhanced Welcome Section with Hero Image */}
        <section className="welcome-banner-hero">
          <div className="hero-background-overlay"></div>
          <div className="hero-content">
            <div className="welcome-header-flex">
              <div className="welcome-badges">
                <div className="current-date-badge">
                  Welcome back, {profileData.firstName || 'Ruwan'}!
                </div>
              </div>
              <div className="welcome-text-container">
                <h1 className="welcome-title-hero">Optimize Your<br />Operations<br />Daily</h1>
                <p className="welcome-subtitle-hero">Oversee warehouse inventory, logistics, and farmer <br />applications from your command center.</p>
                <div className="hero-actions">
                  <button className="hero-btn hero-btn-primary" onClick={() => showTab('inventory')}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Submit New Produce
                  </button>
                  <button className="hero-btn hero-btn-secondary" onClick={() => showTab('deliveries')}>
                    <FontAwesomeIcon icon={faTruck} />
                    View Deliveries
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reschedule Requests Notice Section */}
        {deliveries.some(d => d.status === 'pending' && d.proposed_reschedule_date) && (
          <div className="dashboard-notice-section" style={{
            margin: '0 0 2rem 0',
            padding: '1.5rem',
            background: '#fff',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '1px solid #eef2f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: '800' }}>Important Notice</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Farmers have requested date changes for the following deliveries</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '1.25rem' }}>
              {deliveries.filter(d => d.status === 'pending' && d.proposed_reschedule_date).map(delivery => (
                <div key={delivery.id} style={{
                  padding: '1.25rem',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery #{delivery.id}</span>
                      <h4 style={{ margin: '0.2rem 0', fontSize: '1.1rem', color: '#1e293b' }}>{delivery.farmer}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>{delivery.product} ({delivery.quantity})</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Current Date</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b', textDecoration: 'line-through' }}>{delivery.proposedDate}</span>
                    </div>
                  </div>

                  <div style={{
                    padding: '0.75rem 1rem',
                    background: '#ecfdf5',
                    borderRadius: '10px',
                    border: '1px solid #10b981',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FontAwesomeIcon icon={faCalendarCheck} style={{ color: '#059669' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#065f46' }}>Proposed New Date:</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: '#047857' }}>{delivery.proposed_reschedule_date}</span>
                      {delivery.reschedule_options && delivery.reschedule_options.length > 0 && (
                        <span style={{ fontSize: '0.7rem', color: '#059669', fontStyle: 'italic' }}>
                          Farmer selected from your offered options
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => {
                        openConfirm({
                          title: 'Approve Reschedule',
                          message: `Accept the new date (${delivery.proposed_reschedule_date}) for ${delivery.farmer}'s delivery?`,
                          confirmText: 'Approve & Update',
                          onConfirm: async () => {
                            try {
                              const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                              const response = await fetch(`${config.API_BASE_URL}/employee/deliveries/${delivery.id}/approve-reschedule`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                  scheduledDate: delivery.proposed_reschedule_date
                                })
                              });
                              if (response.ok) {
                                showNotification('Reschedule date approved!');
                                fetchDeliveries();
                              }
                            } catch (e) {
                              showNotification('Error approving date', 'error');
                            }
                          }
                        });
                      }}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#10b981',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FontAwesomeIcon icon={faCheck} /> Approve
                    </button>
                    <button
                      onClick={() => {
                        openConfirm({
                          title: 'Reject Reschedule',
                          message: `Reject the proposed date of ${delivery.proposed_reschedule_date}? You will need to propose a different date.`,
                          confirmText: 'Reject & Propose New',
                          type: 'danger',
                          onConfirm: () => rescheduleDelivery(delivery.id)
                        });
                      }}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #fecaca',
                        background: '#fff1f2',
                        color: '#e11d48',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="stats-grid-enhanced">
          <div className="stat-card-v2 inventory">
              <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={faBoxes} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {farmerProducts.reduce((sum, p) => sum + p.batches.length, 0) + 
                   finishedProducts.reduce((sum, p) => sum + p.batches.length, 0)}
                </div>
                <div className="stat-label">Total Inventory Items</div>
              </div>
              <div className="stat-trend positive">
                <FontAwesomeIcon icon={faBoxes} /> Active
              </div>
            </div>

            <div className="stat-card-v2 alerts danger">
              <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{dashboardAlerts.filter(a => a.category === 'low_stock').length}</div>
                <div className="stat-label">Low Stock Alerts</div>
              </div>
              <div className="stat-trend negative">
                Action Required
              </div>
            </div>

            <div className="stat-card-v2 applications info">
              <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{supplierApplications.length}</div>
                <div className="stat-label">Pending Applications</div>
              </div>
              <div className="stat-trend neutral">
                Review Needed
              </div>
            </div>

            <div className="stat-card-v2 orders primary">
              <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={faClipboardList} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{orders.length}</div>
                <div className="stat-label">Orders Processing</div>
              </div>
              <div className="stat-trend positive">
                In Progress
              </div>
            </div>
          </div>

          {/* Inventory Management Tab */}
        <div className={`tab-content ${activeTab === 'inventory' ? 'active' : ''}`}>
          <div className="dashboard-grid">
            <div id="current-inventory" className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon"></div>
                  <h2>Current Inventory</h2>
                </div>
              </div>

              {/* Inventory Search & Filters Single Row */}
              <div className="inventory-search">
                <div className="search-box">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn-search">Search</button>
                </div>
                <div className="inventory-filters">
                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ minWidth: '130px' }}
                  >
                    <option value="">Stock Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                  <select
                    className="filter-select"
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
                    style={{ minWidth: '120px' }}
                  >
                    <option value="">Sort By</option>
                    <option value="low-stock-priority">Priority: Low Stock First</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="stock-low">Stock: Low to High</option>
                    <option value="stock-high">Stock: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Inventory Sub-Tab Toggle Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e8f5e9', paddingBottom: '0.5rem' }}>
                <button
                  onClick={() => setInventorySubTab('farmer')}
                  style={{
                    padding: '0.4rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    background: inventorySubTab === 'farmer' ? '#2e7d32' : '#f1f5f9',
                    color: inventorySubTab === 'farmer' ? '#fff' : '#475569',
                    boxShadow: inventorySubTab === 'farmer' ? '0 2px 8px rgba(46,125,50,0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FontAwesomeIcon icon={faLeaf} style={{ marginRight: '0.4rem' }} />
                  Inventory Raw
                </button>
                <button
                  onClick={() => setInventorySubTab('finished')}
                  style={{
                    padding: '0.4rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    background: inventorySubTab === 'finished' ? '#2e7d32' : '#f1f5f9',
                    color: inventorySubTab === 'finished' ? '#fff' : '#475569',
                    boxShadow: inventorySubTab === 'finished' ? '0 2px 8px rgba(46,125,50,0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FontAwesomeIcon icon={faCubes} style={{ marginRight: '0.4rem' }} />
                  Finished Products
                </button>
              </div>

              {/* Raw Materials (Farmer Products) Panel */}
              {inventorySubTab === 'farmer' && (
                <div className="inventory-column" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem', gap: '0.5rem' }}>
                    <button
                      className="btn btn-primary"
                      style={{
                        padding: '0.5rem 1.25rem',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        background: '#1e4d2b',
                        boxShadow: '0 4px 12px rgba(30, 77, 43, 0.2)'
                      }}
                      onClick={() => {
                        setUpdatingItem({ type: 'farmer', productName: '', productId: null });
                        setBatchUpdateMode('new');
                        setAddBatchData({ quantity: '', manufactured: new Date().toISOString().split('T')[0], bestBefore: '', location: '', batchCode: '' });
                        setIsAddBatchModalOpen(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} />
                      Add New Raw Material
                    </button>
                    <button className="btn btn-secondary" onClick={fetchInventoryFromDB} title="Refresh Data" style={{ padding: '0.5rem 1rem' }}>
                      <FontAwesomeIcon icon={faSync} />
                    </button>
                  </div>

                  {filteredFarmerProducts.length > 0 ? (
                    filteredFarmerProducts.map(product => {
                      const totalStock = product.batches.reduce((sum, b) => sum + (parseFloat(b.stockVal) || 0), 0);
                      const isProductLowStock = totalStock <= 50;
                      const isProductNearExpiry = product.batches.some(b => b.daysUntilExpiry <= 5);

                      return (
                        <div key={product.id} className="inventory-item nested-inventory" style={{
                          background: isProductNearExpiry ? '#fff1f2' : isProductLowStock ? '#fffaf5' : 'white',
                          borderRadius: '16px',
                          border: `2px solid ${isProductNearExpiry ? '#e11d48' : isProductLowStock ? '#ea580c' : '#e2e8f0'}`,
                          padding: '1.5rem',
                          marginBottom: '2rem',
                          boxShadow: isProductNearExpiry
                            ? '0 10px 15px -3px rgba(225, 29, 72, 0.1), 0 4px 6px -2px rgba(225, 29, 72, 0.05)'
                            : isProductLowStock 
                            ? '0 10px 15px -3px rgba(234, 88, 12, 0.1), 0 4px 6px -2px rgba(234, 88, 12, 0.05)' 
                            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {(isProductLowStock || isProductNearExpiry) && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '5px',
                              height: '100%',
                              background: isProductNearExpiry ? '#e11d48' : '#ea580c'
                            }} />
                          )}
                          <div className="inventory-header" style={{ 
                            marginBottom: '1.5rem', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            borderBottom: `2px solid ${isProductNearExpiry ? '#fecdd3' : isProductLowStock ? '#fed7aa' : '#f1f5f9'}`,
                            paddingBottom: '1rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: isProductNearExpiry ? '#e11d48' : isProductLowStock ? '#ea580c' : '#f0fdf4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: isProductNearExpiry 
                                  ? '0 4px 12px rgba(225, 29, 72, 0.4)' 
                                  : isProductLowStock 
                                  ? '0 4px 12px rgba(234, 88, 12, 0.3)' 
                                  : 'none'
                              }}>
                                <FontAwesomeIcon icon={isProductNearExpiry ? faClock : isProductLowStock ? faExclamationTriangle : faBox} />
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: '800' }}>{product.name}</h4>
                                {isProductNearExpiry ? (
                                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <FontAwesomeIcon icon={faExclamationCircle} style={{marginRight: '4px'}} /> Critical: Items Expiring Soon
                                  </span>
                                ) : isProductLowStock && (
                                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Attention Required: Low Stock Level
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: isProductNearExpiry ? '#be123c' : isProductLowStock ? '#9a3412' : '#94a3b8', marginBottom: '0.2rem' }}>Total Inventory</div>
                              <span style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '900', 
                                background: isProductLowStock ? '#ea580c' : '#f1f5f9', 
                                color: isProductLowStock ? 'white' : '#475569', 
                                padding: '0.5rem 1.25rem', 
                                borderRadius: '50px',
                                border: `1px solid ${isProductLowStock ? '#9a3412' : '#e2e8f0'}`,
                                display: 'inline-block',
                                animation: isProductLowStock ? 'pulse 2s infinite' : 'none'
                              }}>
                                {totalStock.toFixed(2)} kg
                              </span>
                            </div>
                          </div>

                          <div className="batch-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {product.batches.map((batch, index) => (
                              <div key={batch.id} className="batch-item" style={{
                                display: 'grid',
                                gridTemplateColumns: '150px 1fr 180px 180px',
                                gap: '1.5rem',
                                alignItems: 'center',
                                padding: '1rem 1.25rem',
                                background: index % 2 === 0 ? '#f8fafc' : 'white',
                                borderRadius: '12px',
                                border: `1px solid ${batch.daysUntilExpiry <= 5 ? '#fecaca' : '#e2e8f0'}`,
                                transition: 'transform 0.2s',
                                cursor: 'default'
                              }}>
                                {/* Row Header Info for multiple batches */}
                                <div>
                                  <div style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                                    Batch Entry {index + 1}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>#{batch.id}</span>
                                </div>

                                {/* Col 1: Location & Date */}
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                  <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                                      Storage
                                    </div>
                                    <span className="batch-location-tag" style={{
                                      display: 'inline-block',
                                      background: '#e2e8f0',
                                      color: '#334155',
                                      padding: '0.25rem 0.6rem',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      fontWeight: '700',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {batch.location}
                                    </span>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                                      Received
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
                                      {batch.receivedDate}
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                                      Expiry
                                    </div>
                                    <div style={{ 
                                      fontSize: '0.85rem', 
                                      fontWeight: '700', 
                                      color: batch.daysUntilExpiry <= 5 ? 'white' : '#334155',
                                      background: batch.daysUntilExpiry <= 5 ? '#e11d48' : 'transparent',
                                      padding: batch.daysUntilExpiry <= 5 ? '0.2rem 0.6rem' : '0',
                                      borderRadius: '4px',
                                      width: 'fit-content'
                                    }}>
                                      {batch.expiry}
                                    </div>
                                  </div>
                                </div>

                                {/* Col 2: Stock Status */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                  <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                                    Quantity
                                  </div>
                                  <div style={{
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '50px',
                                    fontWeight: '800',
                                    fontSize: '0.9rem',
                                    width: 'fit-content',
                                    background: batch.daysUntilExpiry <= 5 ? '#e11d48' : '#f0fdf4',
                                    color: batch.daysUntilExpiry <= 5 ? 'white' : '#16a34a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    boxShadow: batch.daysUntilExpiry <= 5 ? '0 4px 12px rgba(225, 29, 72, 0.4)' : 'none',
                                    animation: batch.daysUntilExpiry <= 5 ? 'pulse-rose 1.5s infinite' : 'none'
                                  }}>
                                    {batch.daysUntilExpiry <= 5 && <FontAwesomeIcon icon={faClock} />}
                                    {batch.stock}
                                  </div>
                                </div>

                                {/* Col 3: Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  <button
                                    className="btn"
                                    style={{
                                      padding: '0.4rem 0.8rem',
                                      fontSize: '0.75rem',
                                      borderRadius: '6px',
                                      background: '#f1f5f9',
                                      color: '#475569',
                                      border: '1px solid #e2e8f0'
                                    }}
                                    onClick={() => {
                                      setUpdatingItem({
                                        type: 'farmer',
                                        productId: product.id,
                                        productName: product.name,
                                        batchId: batch.id,
                                        currentQty: batch.stockVal,
                                        location: batch.location,
                                        unit: 'kg'
                                      });
                                      setBatchUpdateMode('adjust');
                                      setAdjustData({ amount: '', type: 'add' });
                                      setIsAddBatchModalOpen(true);
                                    }}
                                  >
                                    Adjust
                                  </button>
                                  <button
                                    className="btn"
                                    style={{
                                      padding: '0.4rem 0.8rem',
                                      fontSize: '0.75rem',
                                      borderRadius: '6px',
                                      background: '#fee2e2',
                                      color: '#ef4444',
                                      border: '1px solid #fecaca'
                                    }}
                                    onClick={() => deleteInventoryItem(batch.id, 'farmer')}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No matching raw inventory items found.
                    </div>
                  )}
                </div>
              )}

              {/* Finished Products Panel */}
              {inventorySubTab === 'finished' && (
                <div className="inventory-column" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem', gap: '0.5rem' }}>
                    <button
                      className="btn btn-primary"
                      style={{
                        padding: '0.5rem 1.25rem',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        background: '#1e4d2b',
                        boxShadow: '0 4px 12px rgba(30, 77, 43, 0.2)'
                      }}
                      onClick={() => {
                        setUpdatingItem({ type: 'finished', productName: '', productId: null });
                        setBatchUpdateMode('new');
                        setAddBatchData({ quantity: '', manufactured: new Date().toISOString().split('T')[0], bestBefore: '', location: '', batchCode: '' });
                        setIsAddBatchModalOpen(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} />
                      Add New Finished Product
                    </button>
                    <button className="btn btn-secondary" onClick={fetchInventoryFromDB} title="Refresh Data" style={{ padding: '0.5rem 1rem' }}>
                      <FontAwesomeIcon icon={faSync} />
                    </button>
                  </div>

                  {filteredFinishedProducts.length > 0 ? (
                    filteredFinishedProducts.map(product => {
                      const totalUnits = product.batches.reduce((sum, b) => sum + parseInt(b.quantity), 0);
                      const isProductLowStock = totalUnits <= 50;

                      return (
                        <div key={product.id} className="inventory-item nested-inventory">
                          <div className="inventory-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4>{product.name}</h4>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', background: isProductLowStock ? '#fff7ed' : '#f1f5f9', color: isProductLowStock ? '#ea580c' : '#475569', padding: '0.2rem 0.8rem', borderRadius: '50px' }}>
                              Total: {totalUnits} Units
                            </span>
                          </div>

                          <div className="batch-list">
                            {product.batches.map(batch => {
                              const today = new Date();
                              const bbDate = new Date(batch.bestBefore);
                              const diffDays = Math.ceil((bbDate - today) / (1000 * 60 * 60 * 24));
                              const isBatchNearExpiry = diffDays <= 90;
                              // LOW STOCK uses product-total (isProductLowStock), not per-batch quantity

                              return (
                                <div key={batch.id} className="batch-item" style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'minmax(180px, 1.2fr) 2fr 1fr',
                                  gap: '1.5rem',
                                  alignItems: 'center',
                                  padding: '1rem',
                                  background: '#f8fafc',
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0',
                                  marginBottom: '0.75rem'
                                }}>
                                  <div className="batch-primary-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                      <span className="batch-location-tag" style={{
                                        background: '#e2e8f0',
                                        color: '#475569',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700'
                                      }}>
                                        {batch.location}
                                      </span>
                                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                                        Batch ID: <strong style={{ color: '#1e293b' }}>{batch.batch}</strong>
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                      <div className={`stock-level-badge`} style={{
                                        background: isBatchNearExpiry ? '#fee2e2' : isProductLowStock ? '#fff7ed' : '#f0fdf4',
                                        color: isBatchNearExpiry ? '#ef4444' : isProductLowStock ? '#ea580c' : '#16a34a',
                                        padding: '0.4rem 1rem',
                                        borderRadius: '50px',
                                        fontWeight: '800',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                      }}>
                                        {(isBatchNearExpiry || isProductLowStock) && (
                                          <FontAwesomeIcon icon={isBatchNearExpiry ? faExclamationCircle : faExclamationTriangle} />
                                        )}
                                        {batch.quantity} units
                                      </div>
                                      {isBatchNearExpiry && (
                                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', background: '#fee2e2', color: '#ef4444', borderRadius: '4px', fontWeight: '800', border: '1px solid #fecaca' }}>
                                          {diffDays <= 0 ? 'EXPIRED' : `EXPIRES IN ${diffDays}d`}
                                        </span>
                                      )}
                                      {!isBatchNearExpiry && isProductLowStock && (
                                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', background: '#fff7ed', color: '#ea580c', borderRadius: '4px', fontWeight: '800', border: '1px solid #fed7aa' }}>
                                          LOW STOCK
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="batch-dates-info" style={{ display: 'flex', gap: '2rem', alignItems: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                      <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.5px' }}>Mfg Date</label>
                                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>{batch.manufactured}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                      <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.5px' }}>Best Before</label>
                                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: isBatchNearExpiry ? '#ef4444' : '#334155' }}>
                                        {batch.bestBefore}
                                      </span>
                                    </div>
                                  </div>

                                  <div style={{ textAlign: 'right', display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                    <button
                                      className="btn"
                                      style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        borderRadius: '6px',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        border: '1px solid #e2e8f0'
                                      }}
                                      onClick={() => {
                                        setUpdatingItem({
                                          type: 'finished',
                                          productId: product.id,
                                          productName: product.name,
                                          batchId: batch.id,
                                          currentQty: batch.quantity,
                                          location: batch.location,
                                          unit: 'units'
                                        });
                                        setBatchUpdateMode('adjust');
                                        setAdjustData({ amount: '', type: 'add' });
                                        setIsAddBatchModalOpen(true);
                                      }}
                                    >
                                      Adjust Stock
                                    </button>
                                    <button
                                      className="btn"
                                      style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        borderRadius: '6px',
                                        background: '#fee2e2',
                                        color: '#ef4444',
                                        border: '1px solid #fecaca'
                                      }}
                                      onClick={() => deleteInventoryItem(batch.id, 'finished')}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No matching finished products found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Supplier Applications Tab */}
        <div className={`tab-content ${activeTab === 'suppliers' ? 'active' : ''}`}>
          <div className="dashboard-grid">
            <div id="supplier-applications" className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon"></div>
                  <h2>Pending Supplier Applications</h2>
                </div>
              </div>

              {/* Application Search & Filters */}
              <div className="inventory-search">
                <div className="search-box">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by farmer name or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn-search">Search</button>
                </div>
                 <div className="inventory-filters" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ minWidth: '160px' }}
                  >
                    <option value="">All Categories</option>
                    <option value="raw">Raw Materials</option>
                    <option value="fruits">Fruits</option>
                    <option value="vegetables">Vegetables</option>
                  </select>

                  <select
                    className="filter-select"
                    value={timeframeFilter}
                    onChange={(e) => setTimeframeFilter(e.target.value)}
                    style={{ minWidth: '130px' }}
                  >
                    <option value="all">Timeframe</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>

                  <select
                    className="filter-select"
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
                    style={{ minWidth: '130px' }}
                  >
                    <option value="">Sort By</option>
                    <option value="newest">Newest First</option>
                    <option value="name-asc">Farmer: A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="stock-high">Quantity: High-Low</option>
                  </select>
                </div>
              </div>

              {filteredApplications.length > 0 ? (
                <div className="app-cards-grid">
                  {filteredApplications.map(app => {
                    return (
                      <div key={app.id} className="app-card">
                        {/* Card Header */}
                        <div className="app-card-header">
                          <div className="app-farmer-info">
                            <div className="app-farmer-avatar">
                              {(app.farmerName || 'F').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="app-farmer-name">{app.farmerName}</h3>
                              <span className="app-submitted-label">
                                <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} /> Submitted: {app.submitted || app.date || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Product Highlight */}
                        <div className="app-product-highlight">
                          <span className="app-product-icon"><FontAwesomeIcon icon={faLeaf} /></span>
                          <span className="app-product-name">{app.product}</span>
                        </div>

                        {/* Info Chips Grid */}
                        <div className="app-info-grid">
                          <div className="app-info-chip">
                            <span className="app-info-label"><FontAwesomeIcon icon={faBoxes} style={{ marginRight: '5px' }} /> Quantity</span>
                            <span className="app-info-value">{app.quantity}</span>
                          </div>
                          <div className="app-info-chip">
                            <span className="app-info-label"><FontAwesomeIcon icon={faMoneyBillWave} style={{ marginRight: '5px' }} /> Price</span>
                            <span className="app-info-value">{app.price}</span>
                          </div>
                          <div className="app-info-chip">
                            <span className="app-info-label"><FontAwesomeIcon icon={faSeedling} style={{ marginRight: '5px' }} /> Harvest Date</span>
                            <span className="app-info-value">{app.harvestDate || 'N/A'}</span>
                          </div>
                          <div className="app-info-chip">
                            <span className="app-info-label"><FontAwesomeIcon icon={faTruck} style={{ marginRight: '5px' }} /> Transport</span>
                            <span className="app-info-value">{app.transport || 'N/A'}</span>
                          </div>
                          <div className="app-info-chip">
                            <span className="app-info-label"><FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: '5px' }} /> Delivery Date 1</span>
                            <span className="app-info-value">{app.date || 'N/A'}</span>
                          </div>
                          <div className="app-info-chip">
                            <span className="app-info-label"><FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: '5px' }} /> Delivery Date 2</span>
                            <span className="app-info-value">{app.proposed2 || '—'}</span>
                          </div>
                          <div className="app-info-chip">
                            <span className="app-info-label"><FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: '5px' }} /> Delivery Date 3</span>
                            <span className="app-info-value">{app.proposed3 || '—'}</span>
                          </div>
                        </div>

                        {/* Submitted Images */}
                        <div className="app-images-section">
                          <span className="app-images-label"><FontAwesomeIcon icon={faImage} style={{ marginRight: '5px' }} /> Submitted Images</span>
                          <div className="app-image-gallery">
                            {(app.images || []).map((img, idx) => (
                              <img
                                key={idx}
                                src={img.startsWith('http') || img.startsWith('data:') ? img : `${config.API_BASE_URL.replace('/api', '')}${img}`}
                                alt={`Product Image ${idx + 1}`}
                                className="app-thumbnail"
                                onClick={() => window.open(img.startsWith('http') || img.startsWith('data:') ? img : `${config.API_BASE_URL.replace('/api', '')}${img}`, '_blank')}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                            {(!app.images || app.images.length === 0) && (
                              <span className="app-no-images">No images submitted</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="app-card-actions">
                          <button
                            className="app-btn-approve"
                            onClick={() => approveApplication(app.id)}
                          >
                                  <FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }} />
                                  Approve & Schedule
                          </button>
                          <button
                            className="app-btn-reject"
                            onClick={() => rejectApplication(app.id)}
                          >
                                  <FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />
                                  Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                  No pending supplier applications match your criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Management Tab */}
        <div className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`}>
          <div className="dashboard-grid">
            {/* Processing Orders List */}
            <div id="order-management" className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon"></div>
                  <h2>Processing Orders</h2>
                </div>
              </div>

              <div className="order-cards-grid">
                {orders.filter(o => o.status !== 'Completed' && o.status !== 'Delivered' && o.status !== 'Cancelled').length > 0 ? (
                  orders.filter(o => o.status !== 'Completed' && o.status !== 'Delivered' && o.status !== 'Cancelled').map(order => (
                    <div key={order.id} className="order-premium-card">
                      <div className="order-card-top">
                        <div className="order-id-section">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 className="order-id-text">Order #{order.id}</h4>
                            <span style={{ fontSize: '0.65rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{order.refNo}</span>
                          </div>
                          <span className="order-date-text"><FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} /> {order.date}</span>
                        </div>
                        <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="order-card-body">
                        <div className="order-customer-row">
                          <div className="customer-avatar">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                          <div className="customer-info-text">
                            <span className="customer-name-bold">{order.customer}</span>
                            <span className="customer-meta">{order.phone}</span>
                            <span className="customer-meta" style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                              <FontAwesomeIcon icon={faTruck} style={{ marginRight: '5px' }} /> {order.address}
                            </span>
                          </div>
                        </div>

                        <div className="order-items-summary">
                          <span className="items-label"><FontAwesomeIcon icon={faBoxes} style={{ marginRight: '5px' }} /> Ordered Items</span>
                          <p className="items-content">{order.items}</p>
                        </div>

                        <div className="order-financials">
                          <div className="payment-meta">
                            <span className="items-label"><FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '5px' }} /> Payment ({order.method})</span>
                            <span className={`status-badge ${order.payment === 'Paid' || order.payment === 'Completed' ? 'status-confirmed' : 'status-pending'}`} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>
                              {order.payment}
                            </span>
                          </div>
                          <div className="order-total-block">
                            <span className="total-label">Subtotal</span>
                            <span className="total-amount-large">LKR {order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="order-card-actions">
                        <button
                          className={order.status === 'Ready' ? 'btn-premium-process' : 'btn-premium-update'}
                          onClick={() => handleProcessOrder(order.id)}
                        >
                          {order.status === 'Ready' ? (
                            <>
                              <FontAwesomeIcon icon={faSync} />
                              Process Fulfillment
                            </>
                          ) : (
                            'Update Status'
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', width: '100%', color: '#94a3b8' }}>
                    <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                    <p>No active orders in the queue.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Orders History */}
            <div className="dashboard-card" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
              <div className="card-header" style={{ borderBottom: '2px solid #e0e0e0' }}>
                <div className="card-title">
                  <div className="card-icon"></div>
                  <h2>Order History (Completed)</h2>
                </div>
              </div>

              <div className="history-table-container">
                <table className="premium-history-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Reference No</th>
                      <th>Customer Details</th>
                      <th>Shipping Address</th>
                      <th>Items Summary</th>
                      <th>Payment Status</th>
                      <th>Method</th>
                      <th>Final Total</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.status === 'Delivered').length > 0 ? (
                      orders.filter(o => o.status === 'Delivered').map(order => (
                        <tr key={order.id}>
                          <td><span className="history-id-text">{order.id}</span></td>
                          <td><span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', fontFamily: 'monospace' }}>{order.refNo}</span></td>
                          <td>
                            <div className="history-customer-cell">
                              <span className="history-cust-name">{order.customer}</span>
                              <span className="history-cust-phone">{order.phone}</span>
                            </div>
                          </td>
                          <td>
                            <div className="history-address-text" style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '200px' }}>
                              {order.address}
                            </div>
                          </td>
                          <td>
                            <div className="history-items-text" title={order.items}>
                              {order.items}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${order.payment === 'Paid' || order.payment === 'Completed' ? 'status-confirmed' : 'status-pending'}`} style={{ fontSize: '0.65rem' }}>
                              {order.payment}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>{order.method}</span>
                          </td>
                          <td><span className="history-total-text">LKR {order.total.toFixed(2)}</span></td>
                          <td><span className="history-date-text">{order.date}</span></td>
                          <td>
                            <span className={`status-badge status-${order.status.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.7rem' }}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          No completed orders found in history.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Schedule Tab */}
        <div className={`tab-content ${activeTab === 'deliveries' ? 'active' : ''}`}>
          <div className="dashboard-grid">
            <div id="delivery-schedule" className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon"><FontAwesomeIcon icon={faTruck} /></div>
                  <h2>Farmer Delivery Schedule Requests</h2>
                </div>
                <p className="card-subtitle" style={{ marginTop: '0.5rem', color: '#666' }}>
                  Manage delivery schedules - scheduled deliveries, pending farmer responses, and confirmed schedules
                </p>
              </div>

              <div className="inventory-filters" style={{ marginBottom: '1rem' }}>
                <select
                  className="filter-select"
                  value={deliveryStatusFilter}
                  onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                >
                  <option value="all">All Delivery Schedules</option>
                  <option value="scheduled delivery">Scheduled Delivery</option>
                  <option value="pending">Waiting for Farmer Response</option>
                  <option value="confirmed">Confirmed (Ready to Complete)</option>
                  <option value="confirmed schedule">Confirmed Schedule</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="table-container">
                <table className="delivery-schedule-table">
                  <thead>
                    <tr>
                      <th>Delivery ID</th>
                      <th>Farmer</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Proposed Date</th>
                      <th>Schedule Date</th>
                      <th>Transport</th>
                      <th>Status</th>
                      <th>Schedule Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterDeliveries().length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                          <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#cbd5e1' }}>
                            <FontAwesomeIcon icon={faBoxes} />
                          </div>
                          <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>No delivery schedules</p>
                          <p style={{ fontSize: '0.9rem' }}>Deliveries will appear here after you approve supplier applications.</p>
                        </td>
                      </tr>
                    ) : (
                      filterDeliveries().map(delivery => (
                        <tr key={delivery.id} data-status={delivery.status}>
                          <td>{delivery.id}</td>
                          <td>{delivery.farmer}</td>
                          <td>{delivery.product}</td>
                          <td>{delivery.quantity}</td>
                          <td>{delivery.proposedDate}</td>
                          <td>{delivery.scheduleDate === '-' ? '-' : <strong>{delivery.scheduleDate}</strong>}</td>
                          <td>{delivery.transport}</td>
                          <td>
                            <span className={`status-badge ${(['action required', 'Action Required', 'pending'].includes(delivery.status)) ? 'status-pending' : `status-${delivery.status.toLowerCase().replace(/\s+/g, '-')}`}`}>
                              {delivery.status === 'scheduled delivery' && 'Scheduled Delivery'}
                              {(delivery.status === 'action required' || delivery.status === 'Action Required') && 'Waiting for Farmer Response'}
                              {delivery.status === 'pending' && delivery.proposed_reschedule_date && 'Farmer Counter-Proposed Date'}
                              {delivery.status === 'pending' && !delivery.proposed_reschedule_date && 'Waiting for Farmer Response'}
                              {delivery.status === 'confirmed' && 'Confirmed'}
                              {delivery.status === 'confirmed schedule' && 'Confirmed Schedule'}
                              {delivery.status === 'completed' && 'Completed'}
                              {delivery.status === 'cancelled' && 'Cancelled'}
                            </span>
                          </td>
                          <td>
                            {delivery.status === 'scheduled delivery' && (
                              <div className="action-btn-group">
                                <button
                                  className="btn-action btn-confirm"
                                  onClick={() => {
                                    openConfirm({
                                      title: 'Complete Delivery',
                                      message: `Are you sure you want to mark delivery ${delivery.id} as completed?`,
                                      confirmText: 'Mark Completed',
                                      onConfirm: async () => {
                                        try {
                                          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                                          const response = await fetch(`${config.API_BASE_URL}/employee/deliveries/${delivery.id}/complete`, {
                                            method: 'PUT',
                                            headers: {
                                              'Content-Type': 'application/json',
                                              'Authorization': `Bearer ${token}`
                                            }
                                          });
                                          if (response.ok) {
                                            showNotification('Delivery marked as completed!');
                                            fetchDeliveries();
                                          }
                                        } catch (error) {
                                          console.error('Error:', error);
                                          showNotification('Connection error', 'error');
                                        }
                                      }
                                    });
                                  }}
                                >
                                  Mark Complete
                                </button>
                              </div>
                            )}
                            {((delivery.status === 'pending' && !delivery.proposed_reschedule_date) || delivery.status === 'action required' || delivery.status === 'Action Required') && (
                              <div className="action-btn-group">
                                <button
                                  className="btn-action btn-confirm"
                                  style={{ cursor: 'default', pointerEvents: 'none', opacity: '0.9' }}
                                >
                                  Waiting for Farmer Response
                                </button>
                              </div>
                            )}
                            {delivery.status === 'pending' && delivery.proposed_reschedule_date && (
                              <div className="action-btn-group">
                                <button
                                  className="btn-action btn-confirm"
                                  onClick={() => {
                                    openConfirm({
                                      title: 'Complete Delivery',
                                      message: `Are you sure you want to mark delivery ${delivery.id} as completed?`,
                                      confirmText: 'Mark Completed',
                                      onConfirm: async () => {
                                        try {
                                          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                                          const response = await fetch(`${config.API_BASE_URL}/employee/deliveries/${delivery.id}/complete`, {
                                            method: 'PUT',
                                            headers: {
                                              'Content-Type': 'application/json',
                                              'Authorization': `Bearer ${token}`
                                            }
                                          });
                                          if (response.ok) {
                                            showNotification('Delivery marked as completed!');
                                            fetchDeliveries();
                                          }
                                        } catch (error) {
                                          console.error('Error:', error);
                                          showNotification('Connection error', 'error');
                                        }
                                      }
                                    });
                                  }}
                                  title="Mark delivery as completed"
                                >
                                  Mark Complete
                                </button>
                                <button
                                  className="btn-action btn-reschedule"
                                  onClick={() => rescheduleDelivery(delivery.id)}
                                  title="Propose a different date"
                                >
                                  Reschedule
                                </button>
                              </div>
                            )}
                            {delivery.status === 'confirmed schedule' && (
                              <div className="action-btn-group">
                                <button
                                  className="btn-action btn-confirm"
                                  onClick={() => {
                                    openConfirm({
                                      title: 'Complete Delivery',
                                      message: `Are you sure you want to mark delivery ${delivery.id} as completed?`,
                                      confirmText: 'Mark Completed',
                                      onConfirm: async () => {
                                        try {
                                          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                                          const response = await fetch(`${config.API_BASE_URL}/employee/deliveries/${delivery.id}/complete`, {
                                            method: 'PUT',
                                            headers: {
                                              'Content-Type': 'application/json',
                                              'Authorization': `Bearer ${token}`
                                            }
                                          });
                                          if (response.ok) {
                                            showNotification('Delivery marked as completed!');
                                            fetchDeliveries();
                                          }
                                        } catch (error) {
                                          console.error('Error:', error);
                                          showNotification('Connection error', 'error');
                                        }
                                      }
                                    });
                                  }}
                                >
                                  Mark Complete
                                </button>
                              </div>
                            )}
                            {delivery.status === 'confirmed' && (
                              <div className="action-btn-group">
                                <button
                                  className="btn-action btn-confirm"
                                  onClick={() => {
                                    openConfirm({
                                      title: 'Complete Delivery',
                                      message: `Are you sure you want to mark delivery ${delivery.id} as completed?`,
                                      confirmText: 'Mark Completed',
                                      onConfirm: async () => {
                                        try {
                                          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                                          const response = await fetch(`${config.API_BASE_URL}/employee/deliveries/${delivery.id}/complete`, {
                                            method: 'PUT',
                                            headers: {
                                              'Content-Type': 'application/json',
                                              'Authorization': `Bearer ${token}`
                                            }
                                          });
                                          if (response.ok) {
                                            showNotification('Delivery marked as completed!');
                                            fetchDeliveries();
                                          }
                                        } catch (error) {
                                          console.error('Error:', error);
                                          showNotification('Connection error', 'error');
                                        }
                                      }
                                    });
                                  }}
                                >
                                  Mark Complete
                                </button>
                              </div>
                            )}
                            {delivery.status === 'completed' && (
                              <div className="action-btn-group">
                                <button
                                  className="btn-action btn-secondary"
                                  onClick={() => viewEmployeeDeliveryDetails(delivery.id)}
                                >
                                  View
                                </button>
                              </div>
                            )}
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Edit Profile</h2>
              <button className="close" onClick={() => setIsEditProfileOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form>
                {/* Personal Information */}
                <div className="profile-section">
                  <h3 className="section-title">Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Employee Information */}
                <div className="profile-section">
                  <h3 className="section-title">Employee Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Employee ID</label>
                      <input type="text" value={profileData.employeeId} disabled />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input type="text" value={profileData.department} disabled />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Position</label>
                      <input type="text" value={profileData.position} disabled />
                    </div>
                    <div className="form-group">
                      <label>Join Date</label>
                      <input type="text" value={profileData.joinDate} disabled />
                    </div>
                  </div>
                </div>

                {/* Contact Address */}
                <div className="profile-section">
                  <h3 className="section-title">Contact Address</h3>
                  <div className="form-group">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code *</label>
                      <input
                        type="text"
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="profile-section">
                  <h3 className="section-title">Account Settings</h3>
                  <div className="form-group">
                    <label>Email Notifications</label>
                    <select
                      value={profileData.notifications}
                      onChange={(e) => setProfileData({ ...profileData, notifications: e.target.value })}
                    >
                      <option value="all">All Notifications</option>
                      <option value="critical">Critical Only</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Preferred Language</label>
                    <select
                      value={profileData.language}
                      onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="si">Sinhala</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setIsEditProfileOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={saveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Delivery Modal */}
      {isReviewDeliveryOpen && currentDelivery && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Review Delivery Schedule</h2>
              <button className="close" onClick={() => setIsReviewDeliveryOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ lineHeight: 2 }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Delivery Information</h3>
                <p><strong>Delivery ID:</strong> {currentDelivery.id}</p>
                <p><strong>Farmer:</strong> {currentDelivery.farmer}</p>
                <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Product Details</h3>
                <p><strong>Product:</strong> {currentDelivery.product}</p>
                <p><strong>Quantity:</strong> {currentDelivery.quantity}</p>
                <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Logistics</h3>
                <p><strong>Proposed Date:</strong> {currentDelivery.proposedDate}</p>
                <p><strong>Transport Method:</strong> {currentDelivery.transport}</p>
                <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
                <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                  <strong>Action Required:</strong> Review the delivery details and confirm the schedule or request changes if needed.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setIsReviewDeliveryOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-secondary"
                style={{ background: '#dc3545' }}
                onClick={requestScheduleChange}
              >
                Request Change
              </button>
              <button className="btn btn-save" onClick={confirmDeliverySchedule}>
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Details Modal */}
      {isDeliveryDetailsOpen && currentDelivery && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Delivery Details</h2>
              <button className="close" onClick={() => setIsDeliveryDetailsOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ lineHeight: 2 }}>
                <p><strong>Delivery ID:</strong> {currentDelivery.id}</p>
                <p><strong>Farmer:</strong> {currentDelivery.farmer}</p>
                <p><strong>Product:</strong> {currentDelivery.product}</p>
                <p><strong>Quantity:</strong> {currentDelivery.quantity}</p>
                <p><strong>Proposed Date:</strong> {currentDelivery.proposedDate}</p>
                {currentDelivery.scheduleDate !== '-' && (
                  <p><strong>Confirmed Date:</strong> {currentDelivery.scheduleDate}</p>
                )}
                <p><strong>Transport Method:</strong> {currentDelivery.transport}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge status-${currentDelivery.status}`}>
                    {currentDelivery.status.charAt(0).toUpperCase() + currentDelivery.status.slice(1)}
                  </span>
                </p>

                {currentDelivery.status === 'completed' && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1.2rem',
                    background: '#f0fdf4',
                    borderRadius: '12px',
                    border: '1px solid #bcf0da',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <h3 style={{ color: '#166534', fontSize: '1rem', margin: 0, borderBottom: '1px solid #bcf0da', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <FontAwesomeIcon icon={faMoneyBillWave} style={{ marginRight: '8px' }} />
                      Farmer Payment Amount
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>Unit Price:</span>
                      <span style={{ fontWeight: '600' }}>LKR {currentDelivery.price_per_unit || 0}/kg</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>Net Quantity:</span>
                      <span style={{ fontWeight: '600' }}>{currentDelivery.quantity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '2px dashed #bcf0da' }}>
                      <span style={{ fontWeight: '800', color: '#166534' }}>Total Payout:</span>
                      <span style={{ fontWeight: '800', color: '#166534', fontSize: '1.2rem' }}>
                        LKR {((currentDelivery.quantityVal || 0) * (currentDelivery.price_per_unit || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setIsDeliveryDetailsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {isUpdateStockOpen && updatingItem && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Update Stock Level</h2>
              <button className="close" onClick={() => setIsUpdateStockOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ color: '#2e7d32' }}>{updatingItem.productName}</h3>
                <p style={{ color: '#666' }}>Current Stock: <strong>{updatingItem.currentQty} {updatingItem.unit}</strong></p>
                {updatingItem.batchId && <small>Batch ID: {updatingItem.batchId}</small>}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Enter Amount to Adjust ({updatingItem.unit}):</label>
                <input
                  type="number"
                  className="search-input"
                  style={{ borderRadius: '8px', padding: '0.8rem' }}
                  placeholder="e.g. 10"
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  min="1"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  className="btn btn-success"
                  style={{ background: '#2e7d32' }}
                  onClick={() => handleStockUpdate('add')}
                >
                  <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} /> Add Stock
                </button>
                <button
                  className="btn btn-danger"
                  style={{ background: '#dc3545' }}
                  onClick={() => handleStockUpdate('reduce')}
                >
                  <FontAwesomeIcon icon={faMinus} style={{ marginRight: '8px' }} /> Reduce Stock
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setIsUpdateStockOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packing Slip & Order details Modal */}
      {isPackingSlipOpen && selectedOrder && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                <FontAwesomeIcon icon={faBox} style={{ marginRight: '10px' }} /> Order Packing Slip
              </h2>
              <button className="close" onClick={() => setIsPackingSlipOpen(false)}>×</button>
            </div>
            <div className="modal-body" id="printable-label">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: '#2e7d32', margin: 0 }}>LAKLIGHT FOODS</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Operations & Fulfillment</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ margin: 0 }}>Order #{selectedOrder.id}</h4>
                  <p style={{ margin: 0, color: '#666' }}>{selectedOrder.date}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h4 style={{ color: '#666', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Shipping Address</h4>
                  <p style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>{selectedOrder.customer}</p>
                  <p style={{ margin: '0' }}>{selectedOrder.address}</p>
                  <p style={{ margin: '0.5rem 0' }}>Phone: {selectedOrder.phone}</p>
                </div>
                <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#666', margin: '0 0 0.5rem 0' }}>Fulfillment Status</h4>
                  <select
                    className="filter-select"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  >
                    <option value="Ready">Ready to Process</option>
                    <option value="Processing">Packing in Progress</option>
                    <option value="Shipped">Out for Delivery</option>
                    <option value="Delivered">Fully Fulfilled</option>
                    <option value="Hold">On Hold</option>
                  </select>
                </div>

                <div style={{ background: '#f0f4f8', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: '#666', margin: 0 }}>Payment Status</h4>
                    <span className={`status-badge ${selectedOrder.payment.toLowerCase() === 'paid' ? 'status-confirmed' : 'status-pending'}`} style={{ padding: '0.3rem 0.8rem' }}>
                      <FontAwesomeIcon icon={selectedOrder.payment.toLowerCase() === 'paid' ? faCheckCircle : faClock} style={{ marginRight: '5px' }} />
                      {selectedOrder.payment}
                    </span>
                  </div>
                  <button
                    onClick={() => togglePaymentStatus(selectedOrder.id)}
                    style={{
                      background: 'white',
                      border: '1px solid #cbd5e1',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    Mark as {selectedOrder.payment.toLowerCase() === 'paid' ? 'unpaid' : 'paid'}
                  </button>
                </div>
              </div>

              <h4 style={{ color: '#666' }}>Order Items</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem' }}>Description</th>
                    <th style={{ padding: '0.8rem' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{selectedOrder.items}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>LKR {selectedOrder.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, background: '#1976d2' }}
                  onClick={() => window.print()}
                >
                  <FontAwesomeIcon icon={faPrint} style={{ marginRight: '8px' }} /> Print Packing Label
                </button>
                <button
                  className="btn btn-save"
                  style={{ flex: 1 }}
                  onClick={() => setIsPackingSlipOpen(false)}
                >
                  Keep Working
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Application Modal */}
      {isApproveModalOpen && selectedApp && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Approve & Schedule</h2>
              <button className="close" onClick={() => setIsApproveModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#2e7d32' }}>{selectedApp.farmerName}</h3>
                <p>Product: <strong>{selectedApp.product}</strong> ({selectedApp.quantity})</p>
              </div>

              <div style={{ background: '#f5f5f5', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', color: '#666' }}>Farmer's Proposed Dates (Pick one):</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <button
                    className="btn-date-option"
                    type="button"
                    style={{
                      padding: '0.8rem',
                      borderRadius: '12px',
                      border: customScheduleDate === selectedApp.date ? '2px solid #2e7d32' : '1px solid #edf2f7',
                      background: customScheduleDate === selectedApp.date ? '#e8f5e9' : 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onClick={() => setCustomScheduleDate(selectedApp.date)}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className={customScheduleDate === selectedApp.date ? 'text-primary' : 'text-muted'} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: '#718096', display: 'block' }}>Option 1</span>
                      <strong style={{ fontSize: '1.05rem', color: customScheduleDate === selectedApp.date ? '#1b5e20' : '#2d3748' }}>{selectedApp.date}</strong>
                    </div>
                    {customScheduleDate === selectedApp.date && <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#2e7d32' }} />}
                  </button>
                  {selectedApp.proposed2 && (
                    <button
                      className="btn-date-option"
                      type="button"
                      style={{
                        padding: '0.8rem',
                        borderRadius: '12px',
                        border: customScheduleDate === selectedApp.proposed2 ? '2px solid #2e7d32' : '1px solid #edf2f7',
                        background: customScheduleDate === selectedApp.proposed2 ? '#e8f5e9' : 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onClick={() => setCustomScheduleDate(selectedApp.proposed2)}
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} className={customScheduleDate === selectedApp.proposed2 ? 'text-primary' : 'text-muted'} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.85rem', color: '#718096', display: 'block' }}>Option 2</span>
                        <strong style={{ fontSize: '1.05rem', color: customScheduleDate === selectedApp.proposed2 ? '#1b5e20' : '#2d3748' }}>{selectedApp.proposed2}</strong>
                      </div>
                      {customScheduleDate === selectedApp.proposed2 && <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#2e7d32' }} />}
                    </button>
                  )}
                  {selectedApp.proposed3 && (
                    <button
                      className="btn-date-option"
                      type="button"
                      style={{
                        padding: '0.8rem',
                        borderRadius: '12px',
                        border: customScheduleDate === selectedApp.proposed3 ? '2px solid #2e7d32' : '1px solid #edf2f7',
                        background: customScheduleDate === selectedApp.proposed3 ? '#e8f5e9' : 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onClick={() => setCustomScheduleDate(selectedApp.proposed3)}
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} className={customScheduleDate === selectedApp.proposed3 ? 'text-primary' : 'text-muted'} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.85rem', color: '#718096', display: 'block' }}>Option 3</span>
                        <strong style={{ fontSize: '1.05rem', color: customScheduleDate === selectedApp.proposed3 ? '#1b5e20' : '#2d3748' }}>{selectedApp.proposed3}</strong>
                      </div>
                      {customScheduleDate === selectedApp.proposed3 && <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#2e7d32' }} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Confirmed Schedule Date:</label>
                <input
                  type="date"
                  className="search-input"
                  style={{ borderRadius: '8px', padding: '0.8rem', width: '100%' }}
                  value={customScheduleDate}
                  onChange={(e) => setCustomScheduleDate(e.target.value)}
                  required
                />
                <small style={{ color: '#666' }}>You can adjust the date if needed before confirming.</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setIsApproveModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={confirmApproveWithDate}>
                Approve & Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {isRejectModalOpen && selectedApp && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ color: '#d32f2f' }}>Reject Application</h2>
              <button className="close" onClick={() => { setIsRejectModalOpen(false); setSelectedApp(null); }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <p>Reject application for <strong>{selectedApp.product}</strong> from <strong>{selectedApp.farmerName}</strong>?</p>
              </div>

              <div className="form-group">
                <label>Reason for Rejection: *</label>
                <textarea
                  className="search-input"
                  style={{
                    borderRadius: '8px',
                    padding: '0.8rem',
                    width: '100%',
                    minHeight: '120px',
                    resize: 'vertical',
                    border: '1px solid #ddd',
                    marginTop: '0.5rem'
                  }}
                  placeholder="Please provide a clear reason for the farmer..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
                <small style={{ color: '#666' }}>This reason will be visible to the farmer on their dashboard.</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => { setIsRejectModalOpen(false); setSelectedApp(null); }}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                style={{ background: '#d32f2f', color: 'white' }}
                onClick={handleConfirmReject}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="modal" style={{ display: 'block', zIndex: 10002 }}>
          <div className="modal-content" style={{ maxWidth: '450px', borderRadius: '20px', padding: '0' }}>
            <div className={`modal-header ${confirmConfig.type === 'danger' ? 'bg-danger-soft' : ''}`} style={{ borderBottom: 'none', padding: '2rem 2rem 1rem' }}>
              <h2 className="modal-title" style={{ width: '100%', textAlign: 'center', fontSize: '1.5rem', color: confirmConfig.type === 'danger' ? '#dc2626' : '#1e293b' }}>
                {confirmConfig.title}
              </h2>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '0 2.5rem 2rem' }}>
              <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: '1.6', margin: '0' }}>
                {confirmConfig.message}
              </p>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', padding: '0 2rem 2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                className="btn-premium-update"
                style={{ padding: '0.8rem', borderRadius: '12px' }}
                onClick={() => setIsConfirmModalOpen(false)}
              >
                No, Cancel
              </button>
              <button
                className={confirmConfig.type === 'danger' ? 'btn-danger' : 'btn-premium-process'}
                style={{ padding: '0.8rem', borderRadius: '12px', margin: '0' }}
                onClick={confirmConfig.onConfirm}
              >
                {confirmConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {successMessage && (
        <div className={`success-toast ${notificationType === 'error' ? 'error-toast' : ''}`} style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: notificationType === 'error' ? 'rgba(220, 38, 38, 0.95)' : 'rgba(46, 125, 50, 0.95)',
          color: 'white',
          padding: '1.2rem 2.2rem',
          borderRadius: '16px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 10005,
          fontWeight: '700',
          backdropFilter: 'blur(8px)',
          animation: 'toastPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <FontAwesomeIcon icon={notificationType === 'error' ? faExclamationCircle : faCheckCircle} style={{ fontSize: '1.4rem' }} />
          <strong>{successMessage}</strong>
        </div>
      )}

      {/* Update Product Batch Modal - Farmer & Finished */}
      {isAddBatchModalOpen && updatingItem && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {updatingItem.type === 'farmer' ? (
                  <><FontAwesomeIcon icon={faLeaf} style={{ marginRight: '10px' }} /> Farmer Stock Update</>
                ) : (
                  <><FontAwesomeIcon icon={faBoxes} style={{ marginRight: '10px' }} /> Inventory Update</>
                )}
              </h2>
              <button className="close" onClick={() => setIsAddBatchModalOpen(false)}>×</button>
            </div>

            <div className="modal-tab-container" style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <button
                type="button"
                className={`modal-tab ${batchUpdateMode === 'new' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: batchUpdateMode === 'new' ? '3px solid #2e7d32' : 'none',
                  color: batchUpdateMode === 'new' ? '#2e7d32' : '#64748b',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
                onClick={() => setBatchUpdateMode('new')}
              >
                {updatingItem.type === 'farmer' ? (
                  <><FontAwesomeIcon icon={faTruck} style={{ marginRight: '8px' }} /> New Delivery</>
                ) : (
                  <><FontAwesomeIcon icon={faSync} style={{ marginRight: '8px' }} /> New Production Run</>
                )}
              </button>
              <button
                type="button"
                className={`modal-tab ${batchUpdateMode === 'adjust' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: batchUpdateMode === 'adjust' ? '3px solid #2e7d32' : 'none',
                  color: batchUpdateMode === 'adjust' ? '#2e7d32' : '#64748b',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setBatchUpdateMode('adjust');
                  setAdjustData(prev => ({ ...prev, type: 'reduce' }));
                }}
              >
                Reduce Batch
              </button>
            </div>

            <form onSubmit={handleAddFinishedBatch}>
              <div className="modal-body">
                <div style={{ marginBottom: '1.25rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Current Product:</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{updatingItem.productName}</div>
                    </div>
                    {batchUpdateMode === 'adjust' && (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Target Batch:</span>
                        <div style={{ fontWeight: '800', color: '#2e7d32' }}>#{updatingItem.batchCode}</div>
                      </div>
                    )}
                  </div>
                </div>

                {batchUpdateMode === 'new' ? (
                  <>
                    {/* Quantity row - only for non-farmer  */}
                    {updatingItem.type !== 'farmer' && (
                      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label>Units Quantity *</label>
                          <input
                            type="number"
                            placeholder="e.g. 50"
                            className="search-input"
                            value={addBatchData.quantity}
                            onChange={(e) => setAddBatchData({ ...addBatchData, quantity: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Shelf / Location *</label>
                          <input
                            type="text"
                            placeholder="e.g. Shelf A"
                            className="search-input"
                            value={addBatchData.location}
                            onChange={(e) => setAddBatchData({ ...addBatchData, location: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Farmer-specific quantity + structured location */}
                    {updatingItem.type === 'farmer' && (
                      <>
                        <div className="form-group">
                          <label>Quantity (kg) *</label>
                          <input
                            type="number"
                            placeholder="e.g. 30"
                            className="search-input"
                            value={addBatchData.quantity}
                            onChange={(e) => setAddBatchData({ ...addBatchData, quantity: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Storage Location *</label>
                          {/* Structured builder: C[col]-R[row] (Cold Storage [unit]) */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#334155' }}>C</span>
                            <input
                              type="number"
                              min="1" max="99"
                              placeholder="02"
                              className="search-input"
                              style={{ width: '62px', textAlign: 'center', padding: '0.5rem 0.3rem', fontWeight: '700', fontSize: '1rem' }}
                              value={addBatchData._locCol || ''}
                              onChange={(e) => {
                                const col = String(e.target.value).padStart(2, '0');
                                const row = addBatchData._locRow ? String(addBatchData._locRow).padStart(2, '0') : '';
                                const unit = addBatchData._locUnit || 'A';
                                const location = row ? `C${col}-R${row} (Cold Storage ${unit})` : '';
                                setAddBatchData({ ...addBatchData, _locCol: e.target.value, location });
                              }}
                              required
                            />
                            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#334155' }}>- R</span>
                            <input
                              type="number"
                              min="1" max="99"
                              placeholder="01"
                              className="search-input"
                              style={{ width: '62px', textAlign: 'center', padding: '0.5rem 0.3rem', fontWeight: '700', fontSize: '1rem' }}
                              value={addBatchData._locRow || ''}
                              onChange={(e) => {
                                const row = String(e.target.value).padStart(2, '0');
                                const col = addBatchData._locCol ? String(addBatchData._locCol).padStart(2, '0') : '';
                                const unit = addBatchData._locUnit || 'A';
                                const location = col ? `C${col}-R${row} (Cold Storage ${unit})` : '';
                                setAddBatchData({ ...addBatchData, _locRow: e.target.value, location });
                              }}
                              required
                            />
                            <span style={{ fontWeight: '800', fontSize: '1rem', color: '#334155', whiteSpace: 'nowrap' }}>(Cold Storage</span>
                            <select
                              className="filter-select"
                              style={{ width: '68px', padding: '0.5rem 0.3rem', fontWeight: '700', textAlign: 'center' }}
                              value={addBatchData._locUnit || 'A'}
                              onChange={(e) => {
                                const unit = e.target.value;
                                const col = addBatchData._locCol ? String(addBatchData._locCol).padStart(2, '0') : '';
                                const row = addBatchData._locRow ? String(addBatchData._locRow).padStart(2, '0') : '';
                                const location = col && row ? `C${col}-R${row} (Cold Storage ${unit})` : '';
                                setAddBatchData({ ...addBatchData, _locUnit: unit, location });
                              }}
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                            <span style={{ fontWeight: '800', fontSize: '1rem', color: '#334155' }}>)</span>
                          </div>
                          {/* Live preview of the composed location */}
                          {addBatchData.location && (
                            <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.9rem', background: '#e8f5e9', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#2e7d32', display: 'inline-block', border: '1px solid #a7f3d0' }}>
                              <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '5px' }} /> {addBatchData.location}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label>{updatingItem.type === 'farmer' ? 'Received Date *' : 'Manufacturing Date *'}</label>
                      <input
                        type="date"
                        className="search-input"
                        max={new Date().toISOString().split('T')[0]}
                        value={addBatchData.manufactured}
                        onChange={(e) => setAddBatchData({ ...addBatchData, manufactured: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>{updatingItem.type === 'farmer' ? 'Expiry Date *' : 'Best Before Date *'}</label>
                      <input
                        type="date"
                        className="search-input"
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        value={addBatchData.bestBefore}
                        onChange={(e) => setAddBatchData({ ...addBatchData, bestBefore: e.target.value })}
                        required
                      />
                    </div>

                    {updatingItem.type !== 'farmer' && (
                      <div className="form-group">
                        <label>Batch Code (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. B202510"
                          className="search-input"
                          value={addBatchData.batchCode}
                          onChange={(e) => setAddBatchData({ ...addBatchData, batchCode: e.target.value })}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ background: '#fff1f2', padding: '1.25rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '40px', height: '40px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <FontAwesomeIcon icon={faSync} />
                      </div>
                      <div>
                        <div style={{ color: '#991b1b', fontWeight: '800', fontSize: '1rem' }}>Stock Reduction Mode</div>
                        <div style={{ color: '#b91c1c', fontSize: '0.75rem', fontWeight: '600' }}>This will subtract units from the selected batch.</div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#991b1b', fontWeight: '800' }}>
                        {updatingItem.type === 'farmer' ? 'Amount to Reduce (kg):' : 'Unit Quantity to Reduce:'}
                      </label>
                      <input
                        type="number"
                        className="search-input"
                        style={{ marginTop: '0.5rem', fontSize: '1.2rem', padding: '1rem', border: '2px solid #fca5a5' }}
                        placeholder="e.g. 10"
                        value={adjustData.amount}
                        onChange={(e) => setAdjustData({ ...adjustData, amount: e.target.value, type: 'reduce' })}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel" onClick={() => setIsAddBatchModalOpen(false)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-save"
                  style={{ background: batchUpdateMode === 'new' ? '#2e7d32' : (adjustData.type === 'add' ? '#2e7d32' : '#ef4444') }}
                >
                  {batchUpdateMode === 'new'
                    ? (updatingItem.type === 'farmer' ? 'Save Delivery Record' : 'Save Production Record')
                    : `Confirm ${adjustData.type === 'add' ? 'Addition' : 'Reduction'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default EmployeeDashboard
