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
  faBell, faSync, faLeaf, faCubes, faClock, faPlus
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
  const [isNotiDropdownOpen, setIsNotiDropdownOpen] = useState(false)

  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false)
  const [updatingItem, setUpdatingItem] = useState(null)
  const [updateAmount, setUpdateAmount] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortFilter, setSortFilter] = useState('')
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all')
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [customScheduleDate, setCustomScheduleDate] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const showNotification = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
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

  const [farmerProducts, setFarmerProducts] = useState([
    {
      id: 1,
      name: 'Mango',
      batches: [
        { id: 101, location: 'C03-R04 (Cold Storage A)', stock: '50 kg', receivedDate: '2025-09-20', expiry: '2025-09-30', daysUntilExpiry: 5, status: 'critical' },
        { id: 102, location: 'C01-R02 (Cold Storage A)', stock: '35 kg', receivedDate: '2025-09-25', expiry: '2025-10-05', daysUntilExpiry: 10, status: 'good' }
      ],
      category: 'raw'
    },
    {
      id: 2,
      name: 'Pineapple',
      batches: [
        { id: 201, location: 'C02-R01 (Cold Storage B)', stock: '25 kg', receivedDate: '2025-09-18', expiry: '2025-10-15', daysUntilExpiry: 20, status: 'warning' }
      ],
      category: 'raw'
    },
    {
      id: 3,
      name: 'Papaya',
      batches: [
        { id: 301, location: 'C01-R03 (Cold Storage A)', stock: '90 kg', receivedDate: '2025-09-22', expiry: '2025-10-05', daysUntilExpiry: 10, status: 'good' }
      ],
      category: 'raw'
    },
    {
      id: 4,
      name: 'Passion Fruit',
      batches: [
        { id: 401, location: 'C03-R02 (Cold Storage B)', stock: '100 kg', receivedDate: '2025-09-21', expiry: '2025-10-08', daysUntilExpiry: 13, status: 'good' }
      ],
      category: 'raw'
    }
  ])

  const [finishedProducts, setFinishedProducts] = useState([
    {
      id: 1,
      name: 'Lime Mix',
      category: 'processed',
      batches: [
        { id: 101, location: 'Finished Goods - Shelf A', batch: 'B202509', manufactured: '2025-09-01', bestBefore: '2026-11-01', quantity: 120, status: 'good' }
      ]
    },
    {
      id: 2,
      name: 'Mango Jelly',
      category: 'processed',
      batches: [
        { id: 201, location: 'Finished Goods - Shelf B', batch: 'B202508', manufactured: '2025-05-10', bestBefore: '2026-06-10', quantity: 50, status: 'warning' }
      ]
    },
    {
      id: 3,
      name: 'Wood Apple Juice',
      category: 'processed',
      batches: [
        { id: 301, location: 'Finished Goods - Shelf C', batch: 'B202507', manufactured: '2025-04-20', bestBefore: '2026-12-20', quantity: 80, status: 'unit-low' }
      ]
    },
    {
      id: 4,
      name: 'Mango Cordial',
      category: 'processed',
      batches: [
        { id: 401, location: 'Finished Goods - Shelf D', batch: 'B202510', manufactured: '2025-10-01', bestBefore: '2026-12-01', quantity: 200, status: 'good' }
      ]
    },
    {
      id: 5,
      name: 'Passion Fruit Juice',
      category: 'processed',
      batches: [
        { id: 501, location: 'Finished Goods - Shelf E', batch: 'B202511', manufactured: '2025-11-15', bestBefore: '2027-01-15', quantity: 45, status: 'unit-low' }
      ]
    },
    {
      id: 6,
      name: 'Mixed Fruit Jam',
      category: 'processed',
      batches: [
        { id: 601, location: 'Finished Goods - Shelf F', batch: 'B202512', manufactured: '2025-12-01', bestBefore: '2027-03-01', quantity: 15, status: 'unit-low' }
      ]
    },
    {
      id: 7,
      name: 'Ginger Beer Extract',
      category: 'processed',
      batches: [
        { id: 701, location: 'Finished Goods - Shelf G', batch: 'B202513', manufactured: '2026-01-10', bestBefore: '2027-05-10', quantity: 300, status: 'good' }
      ]
    },
    {
      id: 8,
      name: 'Custard Powder',
      category: 'processed',
      batches: [
        { id: 801, location: 'Finished Goods - Shelf H', batch: 'B202514', manufactured: '2026-02-05', bestBefore: '2027-06-05', quantity: 500, status: 'good' }
      ]
    }
  ])

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

  // Generate dashboard alerts automatically
  useEffect(() => {
    const alerts = []

    // 1. Check Farmer Products - Sum total stock per fruit type before alerting
    farmerProducts.forEach(product => {
      const totalStock = product.batches.reduce((sum, batch) => sum + parseInt(batch.stock), 0)

      // Check for expirations on individual batches (always critical)
      product.batches.forEach(batch => {
        if (batch.status === 'critical' && batch.daysUntilExpiry <= 5) {
          alerts.push({
            id: `fp-expiry-${batch.id}`,
            type: 'danger',
            category: 'expiry',
            productType: 'raw',
            heading: '⌛ EXPIRY ALERT: FARMER PRODUCT',
            message: `${product.name} at ${batch.location} expires in ${batch.daysUntilExpiry} days (${batch.stock}).`,
            targetTab: 'inventory'
          })
        }
      })

      // Check aggregated stock levels
      if (totalStock < 50) {
        alerts.push({
          id: `fp-total-crit-${product.id}`,
          type: 'danger',
          category: 'critical',
          productType: 'raw',
          heading: '🔴 CRITICAL TOTAL STOCK',
          message: `Total ${product.name} stock is critically low: only ${totalStock} kg remaining across all locations.`,
          targetTab: 'inventory'
        })
      } else if (totalStock < 100) {
        alerts.push({
          id: `fp-total-warn-${product.id}`,
          type: 'warning',
          category: 'warning',
          productType: 'raw',
          heading: '⚠️ LOW TOTAL STOCK',
          message: `Total ${product.name} stock is low: ${totalStock} kg remaining. Consider reordering.`,
          targetTab: 'inventory'
        })
      }
    })

    // 2. Check Finished Products for low stock and expiry
    finishedProducts.forEach(product => {
      const totalUnits = product.batches.reduce((sum, b) => sum + parseInt(b.quantity), 0)

      // Expiry Alerts for each batch
      product.batches.forEach(batch => {
        const today = new Date();
        const bbDate = new Date(batch.bestBefore);
        const diffDays = Math.ceil((bbDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays <= 5 && diffDays >= 0) {
          alerts.push({
            id: `gp-expiry-${batch.id}`,
            type: 'danger',
            category: 'expiry',
            productType: 'finished',
            heading: '⌛ BEST BEFORE ALERT',
            message: `${product.name} (Batch ${batch.batch}) expires in ${diffDays} days.`,
            targetTab: 'inventory'
          })
        }
      })

      // Aggregate Low Stock Alert for product
      if (totalUnits < 50) {
        alerts.push({
          id: `gp-low-total-${product.id}`,
          type: 'warning',
          category: 'warning',
          productType: 'finished',
          heading: '⚠️ CRITICAL LOW TOTAL STOCK',
          message: `${product.name} total across all batches is low: ${totalUnits} units remaining.`,
          targetTab: 'inventory'
        })
      }
    })

    // 3. Check for Pending Farmer Applications
    if (supplierApplications && supplierApplications.length > 0) {
      alerts.push({
        id: 'application-notification',
        type: 'info',
        category: 'application',
        heading: '📢 PENDING FARMER APPLICATIONS',
        message: `You have ${supplierApplications.length} new supplier applications waiting for review and approval.`,
        targetTab: 'suppliers'
      })
    }

    setDashboardAlerts(alerts)
  }, [farmerProducts, finishedProducts, supplierApplications])

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
        const matchesCategory = !categoryFilter || p.category === categoryFilter
        const totalStock = p.batches.reduce((sum, b) => sum + parseInt(b.stock), 0)

        let matchesStatus = true
        if (statusFilter === 'in-stock') matchesStatus = totalStock >= 100
        if (statusFilter === 'low-stock') matchesStatus = totalStock < 100 && totalStock > 0
        if (statusFilter === 'out-of-stock') matchesStatus = totalStock === 0

        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        if (sortFilter === 'name-asc') return a.name.localeCompare(b.name)
        if (sortFilter === 'name-desc') return b.name.localeCompare(a.name)

        const totalA = a.batches.reduce((sum, b) => sum + parseInt(b.stock), 0)
        const totalB = b.batches.reduce((sum, b) => sum + parseInt(b.stock), 0)

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
        const matchesCategory = !categoryFilter || p.category === categoryFilter
        const totalUnits = p.batches.reduce((sum, b) => sum + parseInt(b.quantity), 0)

        let matchesStatus = true
        if (statusFilter === 'in-stock') matchesStatus = totalUnits >= 100
        if (statusFilter === 'low-stock') matchesStatus = totalUnits < 100 && totalUnits > 0
        if (statusFilter === 'out-of-stock') matchesStatus = totalUnits === 0

        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        if (sortFilter === 'name-asc') return a.name.localeCompare(b.name)
        if (sortFilter === 'name-desc') return b.name.localeCompare(a.name)

        const totalA = a.batches.reduce((sum, b) => sum + parseInt(b.quantity), 0)
        const totalB = b.batches.reduce((sum, b) => sum + parseInt(b.quantity), 0)

        if (sortFilter === 'low-stock-priority') {
          const getPriority = (batches) => {
            if (batches.some(b => {
              const bbDate = new Date(b.bestBefore);
              const diffDays = Math.ceil((bbDate - new Date()) / (1000 * 60 * 60 * 24));
              return diffDays <= 90;
            })) return 3;
            if (batches.some(b => b.quantity < 50)) return 2;
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
    return supplierApplications
      .filter(app => {
        // Show only pending (under-review) applications in this dashboard
        if (app.status !== 'under-review') return false

        const pName = app.farmerName || '';
        const prod = app.product || '';

        const matchesSearch = pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prod.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = !categoryFilter || app.category === categoryFilter

        // Use Status Filter for Quality Grade mapping
        const grade = app.qualityGrade || app.grade || '';
        let matchesStatus = true
        if (statusFilter === 'in-stock') matchesStatus = grade === 'Grade A'
        if (statusFilter === 'low-stock') matchesStatus = grade === 'Grade B'
        if (statusFilter === 'out-of-stock') matchesStatus = grade === 'Grade C'

        return matchesSearch && matchesCategory && matchesStatus
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


  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('order_list')
    if (saved) return JSON.parse(saved)
    return [
      {
        id: 'O001',
        customer: 'Asoka Perera',
        address: '123 Main Street, Colombo',
        phone: '+94 71 234 5678',
        items: '15x Fresh Mango Cordial (Wholesale Discount Applied)',
        total: 3375.00,
        payment: 'Completed',
        status: 'Ready',
        date: 'Sept 20, 2025'
      },
      {
        id: 'O003',
        customer: 'Sarah Wilson',
        address: '45 Lake View Road, Kandy',
        phone: '+94 77 987 6543',
        items: '8x Mixed Jam Collection',
        total: 2400.00,
        payment: 'Pending',
        status: 'Hold',
        date: 'Sept 21, 2025'
      },
      {
        id: 'O004',
        customer: 'ABC Restaurant',
        address: 'Restaurant Row, Galle Road, Colombo',
        phone: '+94 11 555 1234',
        items: '25x Chili Sauce (Bulk Order - 10% Discount)',
        total: 4500.00,
        payment: 'Completed',
        status: 'Ready',
        date: 'Sept 22, 2025'
      },
      {
        id: 'O005',
        customer: 'Nimali Siriwardena',
        address: '89 Kandy Road, Kiribathgoda',
        phone: '+94 77 123 4455',
        items: '5x Mango Jelly, 2x Wood Apple Juice',
        total: 1200.00,
        payment: 'Completed',
        status: 'Completed',
        date: 'Sept 15, 2025'
      },
      {
        id: 'O006',
        customer: 'Kamal Gunaratne',
        address: '12 Temple Road, Negombo',
        phone: '+94 71 888 2233',
        items: '12x Lime Mix (Wholesale)',
        total: 1620.00,
        payment: 'Completed',
        status: 'Completed',
        date: 'Sept 16, 2025'
      },
      {
        id: 'O007',
        customer: 'Sunethra Jayawardena',
        address: '45/1 Flower Road, Colombo 07',
        phone: '+94 76 555 9900',
        items: '10x Passion Fruit Juice',
        total: 2500.00,
        payment: 'Completed',
        status: 'Completed',
        date: 'Sept 17, 2025'
      },
      {
        id: 'O008',
        customer: 'Priyantha Perera',
        address: '67 Circular Road, Kurunegala',
        phone: '+94 70 333 4444',
        items: '20x Mixed Fruit Jam',
        total: 4800.00,
        payment: 'Completed',
        status: 'Completed',
        date: 'Sept 18, 2025'
      },
      {
        id: 'O009',
        customer: 'Dilini Silva',
        address: 'B2 Galle Face Terrace, Colombo 03',
        phone: '+94 72 111 2222',
        items: '3x Ginger Beer Extract, 5x Lime Mix',
        total: 1850.00,
        payment: 'Completed',
        status: 'Completed',
        date: 'Sept 19, 2025'
      }
    ]
  })

  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false)

  const handleProcessOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId)
    setSelectedOrder(order)
    setIsPackingSlipOpen(true)
  }

  const updateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    )
    setOrders(updated)
    localStorage.setItem('order_list', JSON.stringify(updated))

    // If selecting order being viewed in modal, update it
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }

    if (newStatus === 'Completed') {
      showNotification(`Order #${orderId} fulfilled successfully!`)
      setIsPackingSlipOpen(false)
    } else {
      showNotification(`Order #${orderId} status: ${newStatus}`)
    }
  }

  const [deliveries, setDeliveries] = useState([])

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
        const formattedApplications = data.applications.map(app => ({
          id: app.submission_id || app.id,
          farmerName: app.farmer_name,
          product: `${app.product_name} - ${app.grade || 'N/A'}`,
          quantity: `${app.quantity}${app.unit || 'kg'}`,
          price: app.custom_price ? `LKR ${app.custom_price}/kg` : 'N/A',
          harvestDate: app.harvest_date ? new Date(app.harvest_date).toISOString().split('T')[0] : '',
          qualityGrade: app.grade || 'N/A',
          license: app.license || 'N/A',
          submitted: app.created_at ? new Date(app.created_at).toISOString().split('T')[0] : '',
          transport: app.transport_method || app.transport || 'N/A',
          date: app.delivery_date ? new Date(app.delivery_date).toISOString().split('T')[0] : '',
          proposedDate2: app.proposed_date_2 ? new Date(app.proposed_date_2).toISOString().split('T')[0] : '',
          proposedDate3: app.proposed_date_3 ? new Date(app.proposed_date_3).toISOString().split('T')[0] : '',
          images: app.images || [],
          category: app.category || 'raw',
          status: app.status || 'under-review'
        }));
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
        const formattedDeliveries = data.deliveries.map(del => ({
          id: del.delivery_id || del.id,
          farmer: del.farmer_name,
          product: `${del.product_name} - ${del.grade || 'N/A'}`,
          quantity: `${del.quantity}${del.unit || 'kg'}`,
          proposedDate: del.delivery_date ? new Date(del.delivery_date).toISOString().split('T')[0] : '',
          scheduleDate: del.scheduled_date ? new Date(del.scheduled_date).toISOString().split('T')[0] : '-',
          transport: del.transport_method || 'N/A',
          status: del.status || 'pending',
          proposed_reschedule_date: del.proposed_reschedule_date ? new Date(del.proposed_reschedule_date).toISOString().split('T')[0] : null
        }));
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
    fetchSupplierApplications();
    fetchDeliveries();
  }, []);

  // Auto-save to localStorage as backup
  useEffect(() => {
    if (deliveries.length > 0) {
      localStorage.setItem('delivery_list', JSON.stringify(deliveries));
    }
  }, [deliveries]);

  const showTab = (tabName) => {
    setActiveTab(tabName)
    // Automated scroll to section when tab is changed
    setTimeout(() => {
      let sectionId = '';
      switch (tabName) {
        case 'inventory': sectionId = 'current-inventory'; break;
        case 'suppliers': sectionId = 'supplier-applications'; break;
        case 'orders': sectionId = 'order-management'; break;
        case 'deliveries': sectionId = 'delivery-schedule'; break;
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
        customScheduleDate === selectedApp.proposedDate2 ||
        customScheduleDate === selectedApp.proposedDate3;

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
        if (isUsingFarmerDate) {
          showNotification(`Application approved with farmer's proposed date!`)
        } else {
          showNotification(`Application approved with reschedule date. Waiting for farmer confirmation.`)
        }
        setSelectedApp(null)

        // Refresh data from database
        fetchSupplierApplications();
        fetchDeliveries();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Connection error. Please try again.');
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
      alert('Please provide a reason for rejection.');
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
        alert(data.message || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Connection error. Please try again.');
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
      alert(`Delivery schedule confirmed!\n\nDelivery ID: ${currentDelivery.id}\n\nThe farmer has been notified. The delivery is now confirmed and scheduled for pickup/delivery.`)

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
            alert(data.message || 'Failed to update schedule');
          }
        } catch (error) {
          console.error('Error updating schedule:', error);
          alert('Connection error. Please try again.');
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

    alert(`✅ Reschedule approved!\n\nDelivery ${notification.deliveryId} has been rescheduled to ${notification.newDate}\nFarmer will be notified.`)
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

      alert(`❌ Reschedule rejected!\n\nDelivery ${notification.deliveryId} will keep original date.\nFarmer will be notified with reason.`)
    }
  }

  const acceptDate = (deliveryId) => {
    if (window.confirm(`Accept the scheduled date for delivery ${deliveryId}?`)) {
      alert(`✅ Schedule date accepted!\n\nDelivery ID: ${deliveryId}\n\nThe farmer has been notified that the delivery date is confirmed and accepted.`)

      setDeliveries(prev => prev.map(d =>
        d.id === deliveryId ? { ...d, status: 'completed' } : d
      ))
    }
  }

  const rescheduleDelivery = async (deliveryId) => {
    const newDate = window.prompt('Enter new delivery date (YYYY-MM-DD):')
    if (newDate && newDate.trim() !== '') {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          alert('Authentication required');
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
          alert(`📅 Delivery rescheduled!\n\nDelivery ID: ${deliveryId}\nNew Date: ${newDate}\n\nThe farmer has been notified of the new delivery date.`)

          // Refresh deliveries from database
          fetchDeliveries();
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to reschedule delivery');
        }
      } catch (error) {
        console.error('Error rescheduling delivery:', error);
        alert('Connection error. Please try again.');
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
      alert(`✅ New inventory item added!\n\nProduct: ${productName}\nBatch Location: ${location}\nQuantity: ${quantity}\nExpiry: ${expiryDate}`)
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
      alert(`✅ New inventory item added!\n\nProduct: ${productName}\nQuantity: ${quantity}\nLocation: ${location}\nExpiry: ${expiryDate}\nManufactured: ${manufacturingDate}`)
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

      const validStatuses = ['pending', 'scheduled delivery', 'confirmed', 'confirmed schedule', 'completed'];

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
      alert('Please fill in all required fields marked with *')
      return
    }

    alert('Profile updated successfully!\n\nYour changes have been saved.')
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

  const handleStockUpdate = (adjustmentType) => {
    const amount = parseInt(updateAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number.')
      return
    }

    const finalAdjustment = adjustmentType === 'add' ? amount : -amount

    if (updatingItem.type === 'farmer') {
      setFarmerProducts(prev => prev.map(p => {
        if (p.id === updatingItem.productId) {
          return {
            ...p,
            batches: p.batches.map(b => {
              if (b.id === updatingItem.batchId) {
                const newStock = Math.max(0, parseInt(b.stock) + finalAdjustment)
                return { ...b, stock: `${newStock} kg` }
              }
              return b
            })
          }
        }
        return p
      }))
    } else if (updatingItem.type === 'finished') {
      setFinishedProducts(prev => prev.map(p => {
        if (p.id === updatingItem.productId) {
          return {
            ...p,
            batches: p.batches.map(b => {
              if (b.id === updatingItem.batchId) {
                const newQty = Math.max(0, b.quantity + finalAdjustment)
                return { ...b, quantity: newQty }
              }
              return b
            })
          }
        }
        return p
      }))
    }

    setIsUpdateStockOpen(false)
    alert(`Successfully ${adjustmentType === 'add' ? 'added' : 'reduced'} ${amount} ${updatingItem.unit} for ${updatingItem.productName}`)
  }

  const handleAddFinishedBatch = (e) => {
    e.preventDefault()

    if (updatingItem.type === 'farmer') {
      // === FARMER PRODUCT BATCH HANDLING ===
      if (batchUpdateMode === 'new') {
        // Add a brand-new delivery batch under this farmer product
        const newBatch = {
          id: Date.now(),
          location: addBatchData.location,
          stock: `${addBatchData.quantity} kg`,
          receivedDate: addBatchData.manufactured,  // 'manufactured' field reused for Received date
          expiry: addBatchData.bestBefore,
          daysUntilExpiry: Math.ceil((new Date(addBatchData.bestBefore) - new Date()) / (1000 * 60 * 60 * 24)),
          status: 'good'
        }
        setFarmerProducts(prev => prev.map(p => {
          if (p.id === updatingItem.productId) {
            return { ...p, batches: [...p.batches, newBatch] }
          }
          return p
        }))
        setSuccessMessage(`New delivery batch added for ${updatingItem.productName}!`)
      } else {
        // Reduce stock from an existing batch
        const amount = parseInt(adjustData.amount)
        setFarmerProducts(prev => prev.map(p => {
          if (p.id === updatingItem.productId) {
            return {
              ...p,
              batches: p.batches.map(b => {
                if (b.id === updatingItem.batchId) {
                  const adj = adjustData.type === 'add' ? amount : -amount
                  const newStock = Math.max(0, parseInt(b.stock) + adj)
                  return { ...b, stock: `${newStock} kg` }
                }
                return b
              })
            }
          }
          return p
        }))
        setSuccessMessage(`${updatingItem.productName} batch updated!`)
      }
    } else {
      // === FINISHED PRODUCT BATCH HANDLING ===
      if (batchUpdateMode === 'new') {
        const newBatch = {
          id: Date.now(),
          batch: addBatchData.batchCode || `GP-${Math.floor(1000 + Math.random() * 9000)}`,
          quantity: parseInt(addBatchData.quantity),
          manufactured: addBatchData.manufactured,
          bestBefore: addBatchData.bestBefore,
          location: addBatchData.location,
          status: 'good'
        }

        setFinishedProducts(prev => prev.map(p => {
          if (p.id === updatingItem.productId) {
            return { ...p, batches: [...p.batches, newBatch] }
          }
          return p
        }))
        setSuccessMessage(`Successfully added new production batch for ${updatingItem.productName}`)
      } else {
        const amount = parseInt(adjustData.amount)
        setFinishedProducts(prev => prev.map(p => {
          if (p.id === updatingItem.productId) {
            return {
              ...p,
              batches: p.batches.map(b => {
                if (b.id === updatingItem.batchId) {
                  const adj = adjustData.type === 'add' ? amount : -amount
                  const newQty = Math.max(0, b.quantity + adj)
                  return { ...b, quantity: newQty }
                }
                return b
              })
            }
          }
          return p
        }))
        setSuccessMessage(`Successfully updated ${updatingItem.productName} (Batch ${updatingItem.batchCode})`)
      }
    }

    setIsAddBatchModalOpen(false)
    setAdjustData({ amount: '', type: 'add' })
    setAddBatchData({ quantity: '', manufactured: '', bestBefore: '', location: '', batchCode: '' })
    setTimeout(() => setSuccessMessage(''), 3000)
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
                <h3>Notifications Center</h3>
                <div className="noti-actions-top">
                  <span className="alert-count">{dashboardAlerts.length} Active Issues</span>
                </div>
              </div>
              <div className="noti-body-v2">
                {dashboardAlerts.length === 0 ? (
                  <div className="noti-empty-v2">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <p>All items are up to date</p>
                  </div>
                ) : (
                  <>
                    {[
                      { id: 'expiry', label: 'Expiry Alerts', icon: faHistory, color: '#f87171' },
                      { id: 'critical', label: 'Critical Stock', icon: faExclamationTriangle, color: '#ef4444' },
                      { id: 'warning', label: 'Low Stock', icon: faExclamationCircle, color: '#f59e0b' },
                      { id: 'application', label: 'Applications', icon: faHandshake, color: '#3b82f6' }
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
                                  {alert.productType === 'raw' ? 'Raw Stock' : alert.productType === 'finished' ? 'Finished Product' : 'Application'}
                                </span>
                                <p className="noti-card-msg">{alert.message}</p>
                              </div>
                              <FontAwesomeIcon icon={faChevronRight} className="noti-arrow" />
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
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1 className="welcome-title">Employee Dashboard</h1>
          <p>Manage inventory, review supplier applications, and oversee manufacturing operations for Laklights Food Products.</p>


          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">156</div>
              <div className="stat-label">Total Inventory Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">8</div>
              <div className="stat-label">Low Stock Alerts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{supplierApplications.length}</div>
              <div className="stat-label">Pending Applications</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{orders.length}</div>
              <div className="stat-label">Orders Processing</div>
            </div>
          </div>
        </section>


        {/* Inventory Management Tab */}
        <div className={`tab-content ${activeTab === 'inventory' ? 'active' : ''}`}>
          {/* Reschedule Notifications */}
          {notifications.length > 0 && (
            <div className="notifications-section">
              <div className="notifications-header">
                <h3><FontAwesomeIcon icon={faBell} style={{ marginRight: '0.5rem', color: '#f59e0b' }} /> Delivery Reschedule Requests ({notifications.length})</h3>
              </div>
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-content">
                    <h4><FontAwesomeIcon icon={faSync} style={{ marginRight: '0.4rem', color: '#3b82f6' }} /> Delivery Reschedule Request</h4>
                    <div className="notification-details">
                      <div className="detail-row">
                        <span className="detail-label">Delivery ID:</span>
                        <span className="detail-value">{notification.deliveryId}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Product:</span>
                        <span className="detail-value">{notification.product}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Farmer:</span>
                        <span className="detail-value">{notification.farmerName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Quantity:</span>
                        <span className="detail-value">{notification.quantity || 'N/A'}</span>
                      </div>
                      <div className="date-comparison">
                        <div className="date-box current-date">
                          <label>Current Date</label>
                          <span>{notification.oldDate}</span>
                        </div>
                        <div className="date-arrow">→</div>
                        <div className="date-box requested-date">
                          <label>Requested Date</label>
                          <span>{notification.newDate}</span>
                        </div>
                      </div>
                      <p className="notification-time">
                        📅 Requested: {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="notification-actions">
                    <button
                      className="btn btn-approve"
                      onClick={() => handleApproveReschedule(notification)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn btn-reject"
                      onClick={() => handleRejectReschedule(notification)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="dashboard-grid">
            <div id="current-inventory" className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon"></div>
                  <h2>Current Inventory</h2>
                </div>
              </div>

              {/* Inventory Search & Filters Single Row */}
              <div className="inventory-search" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'nowrap', marginBottom: '1.8rem' }}>
                <div style={{ flex: 1, display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ minWidth: '140px' }}
                  >
                    <option value="">All Categories</option>
                    <option value="raw">Raw Materials</option>
                    <option value="processed">Processed Products</option>
                    <option value="packaging">Packaging Materials</option>
                  </select>
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
                  Farmer Products
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

              {/* Farmer Products Panel */}
              {inventorySubTab === 'farmer' && (
                <div className="inventory-column" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                    <button
                      className="btn btn-primary"
                      style={{
                        padding: '0.5rem 1.25rem',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        background: '#1e4d2b',
                        boxShadow: '0 4px 12px rgba(30, 77, 43, 0.2)'
                      }}
                      onClick={showAddFarmerProductModal}
                    >
                      <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '0.5rem' }} />
                      Add New Item
                    </button>
                  </div>

                  <div className="expiry-warning-v3">
                    <strong>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      Critical Alerts
                    </strong>
                    <ul style={{ margin: '0.4rem 0 0 0', padding: '0', listStyle: 'none', color: '#7c2d12', fontSize: '0.85rem' }}>
                      <li style={{ marginBottom: '0.3rem' }}>• Pineapples are needed quickly.</li>
                      <li>• Fresh Mango approaching expiry in 3 days.</li>
                    </ul>
                  </div>

                  {filteredFarmerProducts.length > 0 ? (
                    filteredFarmerProducts.map(product => {
                      const totalStock = product.batches.reduce((sum, b) => sum + parseInt(b.stock), 0);
                      const isProductLowStock = totalStock < 50;

                      return (
                        <div key={product.id} className="inventory-item nested-inventory">
                          <div className="inventory-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4>{product.name}</h4>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', background: isProductLowStock ? '#fff7ed' : '#f1f5f9', color: isProductLowStock ? '#ea580c' : '#475569', padding: '0.2rem 0.8rem', borderRadius: '50px' }}>
                              Total: {totalStock} kg
                            </span>
                          </div>

                          <div className="batch-list">
                            {product.batches.map(batch => (
                              <div key={batch.id} className="batch-item" style={{
                                display: 'grid',
                                gridTemplateColumns: '200px 1fr auto auto',
                                gap: '1.5rem',
                                alignItems: 'center',
                                padding: '0.9rem 1.2rem',
                                background: '#f8fafc',
                                borderRadius: '10px',
                                border: `1px solid ${batch.daysUntilExpiry <= 5 ? '#fecaca' : '#e2e8f0'}`,
                                marginBottom: '0.6rem'
                              }}>
                                {/* Col 1: Location */}
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

                                {/* Col 2: Dates */}
                                <div style={{ display: 'flex', gap: '2rem' }}>
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
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: batch.daysUntilExpiry <= 5 ? '#ef4444' : '#334155' }}>
                                      {batch.expiry}
                                      <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: batch.daysUntilExpiry <= 5 ? '#ef4444' : '#64748b' }}>
                                        ({batch.daysUntilExpiry}d)
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Col 3: Stock + Alerts */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                                  <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                                    Stock
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
                                    <div style={{
                                      padding: '0.3rem 0.8rem',
                                      borderRadius: '50px',
                                      fontWeight: '800',
                                      fontSize: '0.9rem',
                                      background: batch.daysUntilExpiry <= 5 ? '#fee2e2' : isProductLowStock ? '#fffbeb' : '#f0fdf4',
                                      color: batch.daysUntilExpiry <= 5 ? '#ef4444' : isProductLowStock ? '#d97706' : '#16a34a',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {(batch.daysUntilExpiry <= 5 || isProductLowStock) && (
                                        <FontAwesomeIcon icon={batch.daysUntilExpiry <= 5 ? faExclamationCircle : faExclamationTriangle} />
                                      )}
                                      {batch.stock}
                                    </div>
                                  </div>
                                  {batch.daysUntilExpiry <= 5 && (
                                    <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', background: '#fee2e2', color: '#ef4444', borderRadius: '4px', fontWeight: '800', border: '1px solid #fecaca', whiteSpace: 'nowrap' }}>
                                      <FontAwesomeIcon icon={faClock} style={{ marginRight: '0.25rem' }} />
                                      NEAR EXPIRY: {batch.daysUntilExpiry}d
                                    </span>
                                  )}
                                  {isProductLowStock && (
                                    <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', background: '#fffbeb', color: '#f59e0b', borderRadius: '4px', fontWeight: '800', border: '1px solid #fef3c7', whiteSpace: 'nowrap' }}>
                                      LOW STOCK
                                    </span>
                                  )}
                                </div>

                                {/* Col 4: Update Button */}
                                <div>
                                  <button
                                    className="btn"
                                    style={{
                                      padding: '0.55rem 1.2rem',
                                      fontSize: '0.82rem',
                                      fontWeight: '700',
                                      borderRadius: '8px',
                                      background: batch.daysUntilExpiry <= 5 ? '#ef4444' : isProductLowStock ? '#f59e0b' : '#22c55e',
                                      color: 'white',
                                      border: 'none',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => {
                                      setUpdatingItem({
                                        type: 'farmer',
                                        productId: product.id,
                                        productName: product.name,
                                        batchId: batch.id,
                                        batchCode: batch.location,
                                        currentStock: batch.stock
                                      });
                                      setAddBatchData({ quantity: '', manufactured: '', bestBefore: '', location: '', batchCode: '' });
                                      setAdjustData({ amount: '', type: 'reduce' });
                                      setBatchUpdateMode('adjust');
                                      setIsAddBatchModalOpen(true);
                                    }}
                                  >
                                    Update Status
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No matching farmer products found.
                    </div>
                  )}
                </div>
              )}

              {/* Finished Products Panel */}
              {inventorySubTab === 'finished' && (
                <div className="inventory-column" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                    <button
                      className="btn btn-primary"
                      style={{
                        padding: '0.5rem 1.25rem',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        background: '#1e4d2b',
                        boxShadow: '0 4px 12px rgba(30, 77, 43, 0.2)'
                      }}
                      onClick={showAddFinishedProductModal}
                    >
                      <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '0.5rem' }} />
                      Add New Item
                    </button>
                  </div>

                  <div className="expiry-warning-v3">
                    <strong>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      Production Alerts
                    </strong>
                    <ul style={{ margin: '0.4rem 0 0 0', padding: '0', listStyle: 'none', color: '#7c2d12', fontSize: '0.85rem' }}>
                      <li style={{ marginBottom: '0.3rem' }}>• Mango Jelly Stock is Low (50 units).</li>
                      <li>• Wood Apple Juice stock approaching best-before in 120 days (80 units).</li>
                    </ul>
                  </div>

                  {filteredFinishedProducts.length > 0 ? (
                    filteredFinishedProducts.map(product => {
                      const totalUnits = product.batches.reduce((sum, b) => sum + parseInt(b.quantity), 0);
                      const isProductLowStock = totalUnits < 50;

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
                              const isBatchLowStock = batch.quantity < 50;

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
                                        background: isBatchNearExpiry ? '#fee2e2' : isProductLowStock ? '#fffbeb' : '#f0fdf4',
                                        color: isBatchNearExpiry ? '#ef4444' : isProductLowStock ? '#d97706' : '#16a34a',
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
                                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', background: '#fffbeb', color: '#f59e0b', borderRadius: '4px', fontWeight: '800', border: '1px solid #fef3c7' }}>
                                          LOW STOCK ALERT
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

                                  <div style={{ textAlign: 'right' }}>
                                    <button
                                      className="btn"
                                      style={{
                                        padding: '0.6rem 1.25rem',
                                        fontSize: '0.85rem',
                                        fontWeight: '800',
                                        borderRadius: '8px',
                                        background: isBatchNearExpiry ? '#ef4444' : isProductLowStock ? '#f59e0b' : '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        whiteSpace: 'nowrap'
                                      }}
                                      onClick={() => {
                                        setUpdatingItem({
                                          type: 'finished-new-batch',
                                          productId: product.id,
                                          productName: product.name,
                                          batchId: batch.id,
                                          batchCode: batch.batch
                                        });
                                        setAddBatchData({
                                          quantity: '',
                                          manufactured: '',
                                          bestBefore: '',
                                          location: '',
                                          batchCode: ''
                                        });
                                        setBatchUpdateMode('new');
                                        setIsAddBatchModalOpen(true);
                                      }}
                                    >
                                      Update Status
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
                <div className="inventory-filters">
                  <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="raw">Raw Materials</option>
                    <option value="processed">Processed Products</option>
                  </select>
                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Quality Level</option>
                    <option value="in-stock">Grade A</option>
                    <option value="low-stock">Grade B</option>
                    <option value="out-of-stock">Grade C</option>
                  </select>
                  <select
                    className="filter-select"
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
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
                filteredApplications.map(app => (
                  <div key={app.id} className="application-item">
                    <div className="farmer-name">{app.farmerName}</div>
                    <p><strong>Product:</strong> {app.product}</p>
                    <p><strong>Quantity:</strong> {app.quantity} | <strong>Price:</strong> {app.price}</p>
                    <p><strong>Harvest Date:</strong> {app.harvestDate} | <strong>Quality Grade:</strong> {app.qualityGrade || app.grade}</p>
                    <p><strong>License:</strong> {app.license} | <strong>Submitted:</strong> {app.submitted}</p>
                    <p><strong>Transport:</strong> {app.transport} | <strong>Date:</strong> {app.date}</p>

                    <div className="submitted-images">
                      <p><strong>Submitted Images:</strong></p>
                      <div className="image-gallery">
                        {(app.images || []).map((img, idx) => (
                          <img
                            key={idx}
                            src={img.startsWith('http') ? img : `https://via.placeholder.com/150x150?text=${img}`}
                            alt={`Product Image ${idx + 1}`}
                            className="product-thumbnail"
                          />
                        ))}
                        {(!app.images || app.images.length === 0) && <span style={{ color: '#999', fontStyle: 'italic' }}>No images submitted</span>}
                      </div>
                    </div>

                    <div className="application-actions">
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => approveApplication(app.id)}
                      >
                        Approve & Schedule
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => rejectApplication(app.id)}
                      >
                        Reject
                      </button>
                      <button className="btn btn-secondary btn-small">View Details</button>
                    </div>
                  </div>
                ))
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

              {orders.filter(o => o.status !== 'Completed').length > 0 ? (
                orders.filter(o => o.status !== 'Completed').map(order => (
                  <div key={order.id} className="inventory-item">
                    <div className="inventory-details">
                      <h4>Order #{order.id} - {order.customer}</h4>
                      <div>{order.items}</div>
                      <div>Total: LKR {order.total.toFixed(2)} | Payment: {order.payment}</div>
                    </div>
                    <div className={`stock-level stock-${order.status === 'Ready' ? 'good' : 'low'}`} style={{
                      background: order.status === 'Packing' ? '#fff3cd' : order.status === 'Delivering' ? '#e3f2fd' : '',
                      color: order.status === 'Packing' ? '#856404' : order.status === 'Delivering' ? '#0d47a1' : ''
                    }}>
                      {order.status}
                    </div>
                    <div>{order.date}</div>
                    <div>
                      <button
                        className={`btn btn-${order.status === 'Ready' ? 'primary' : 'secondary'} btn-small`}
                        onClick={() => handleProcessOrder(order.id)}
                      >
                        {order.status === 'Ready' ? 'Process Fulfillment' : 'Update Status'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                  No active orders to process.
                </div>
              )}
            </div>

            {/* Completed Orders History */}
            <div className="dashboard-card" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
              <div className="card-header" style={{ borderBottom: '2px solid #e0e0e0' }}>
                <div className="card-title">
                  <div className="card-icon"></div>
                  <h2>Order History (Completed)</h2>
                </div>
              </div>

              <div className="deliveries-table">
                <div className="deliveries-header">
                  <div className="delivery-col">Order ID</div>
                  <div className="delivery-col">Customer</div>
                  <div className="delivery-col">Items</div>
                  <div className="delivery-col">Total</div>
                  <div className="delivery-col">Date</div>
                  <div className="delivery-col">Status</div>
                </div>
                {orders.filter(o => o.status === 'Completed').length > 0 ? (
                  orders.filter(o => o.status === 'Completed').map(order => (
                    <div key={order.id} className="delivery-row">
                      <div className="delivery-col"><strong>{order.id}</strong></div>
                      <div className="delivery-col">{order.customer}</div>
                      <div className="delivery-col" style={{ fontSize: '0.85rem' }}>{order.items}</div>
                      <div className="delivery-col">LKR {order.total.toFixed(2)}</div>
                      <div className="delivery-col">{order.date}</div>
                      <div className="delivery-col">
                        <span className="status-badge status-confirmed">Fulfilled</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#888', gridColumn: '1 / -1' }}>
                    No completed orders found in history.
                  </div>
                )}
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
                  <option value="pending">Pending Farmer Response</option>
                  <option value="confirmed">✅ Confirmed (Ready to Complete)</option>
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
                          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
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
                            <span className={`status-badge status-${delivery.status}`}>
                              {delivery.status === 'scheduled delivery' && 'Scheduled Delivery'}
                              {delivery.status === 'pending' && delivery.proposed_reschedule_date && 'Farmer Counter-Proposed Date'}
                              {delivery.status === 'pending' && !delivery.proposed_reschedule_date && 'Pending Farmer Response'}
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
                                  onClick={async () => {
                                    if (window.confirm(`Mark delivery ${delivery.id} as completed?`)) {
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
                                      }
                                    }
                                  }}
                                >
                                  Mark Complete
                                </button>
                              </div>
                            )}
                            {delivery.status === 'pending' && !delivery.proposed_reschedule_date && (
                              <div className="action-btn-group">
                                <button
                                  className="btn-action btn-secondary"
                                  style={{ cursor: 'default', opacity: '0.7', pointerEvents: 'none' }}
                                >
                                  Waiting for Farmer Response
                                </button>
                              </div>
                            )}
                            {delivery.status === 'pending' && delivery.proposed_reschedule_date && (
                              <div className="action-btn-group">
                                <button
                                  className="btn-action btn-confirm"
                                  onClick={async () => {
                                    if (window.confirm(`Mark delivery ${delivery.id} as completed?`)) {
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
                                      }
                                    }
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
                                  onClick={async () => {
                                    if (window.confirm(`Mark delivery ${delivery.id} as completed?`)) {
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
                                      }
                                    }
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
                                  onClick={async () => {
                                    if (window.confirm(`Mark delivery ${delivery.id} as completed?`)) {
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
                                      }
                                    }
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
                      )))}
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
                  ➕ Add Stock
                </button>
                <button
                  className="btn btn-danger"
                  style={{ background: '#dc3545' }}
                  onClick={() => handleStockUpdate('reduce')}
                >
                  ➖ Reduce Stock
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
              <h2 className="modal-title">📦 Order Packing Slip</h2>
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
                    <option value="Packing">📦 Packing in Progress</option>
                    <option value="Delivering">🚚 Out for Delivery</option>
                    <option value="Completed">✅ Fully Fulfilled</option>
                    <option value="Hold">⚠️ On Hold</option>
                  </select>
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
                  🖨️ Print Packing Label
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
                    style={{
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: customScheduleDate === selectedApp.date ? '2px solid #2e7d32' : '1px solid #ddd',
                      background: customScheduleDate === selectedApp.date ? '#e8f5e9' : 'white',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCustomScheduleDate(selectedApp.date)}
                  >
                    📅 Option 1: <strong>{selectedApp.date}</strong>
                  </button>
                  {selectedApp.proposedDate2 && (
                    <button
                      className="btn-date-option"
                      style={{
                        padding: '0.8rem',
                        borderRadius: '8px',
                        border: customScheduleDate === selectedApp.proposedDate2 ? '2px solid #2e7d32' : '1px solid #ddd',
                        background: customScheduleDate === selectedApp.proposedDate2 ? '#e8f5e9' : 'white',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCustomScheduleDate(selectedApp.proposedDate2)}
                    >
                      📅 Option 2: <strong>{selectedApp.proposedDate2}</strong>
                    </button>
                  )}
                  {selectedApp.proposedDate3 && (
                    <button
                      className="btn-date-option"
                      style={{
                        padding: '0.8rem',
                        borderRadius: '8px',
                        border: customScheduleDate === selectedApp.proposedDate3 ? '2px solid #2e7d32' : '1px solid #ddd',
                        background: customScheduleDate === selectedApp.proposedDate3 ? '#e8f5e9' : 'white',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCustomScheduleDate(selectedApp.proposedDate3)}
                    >
                      📅 Option 3: <strong>{selectedApp.proposedDate3}</strong>
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

      {/* Success Notification Toast */}
      {successMessage && (
        <div className="success-toast" style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: '#2e7d32',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <span style={{ fontSize: '1.5rem' }}>✅</span>
          <strong>{successMessage}</strong>
        </div>
      )}

      {/* Update Product Batch Modal - Farmer & Finished */}
      {isAddBatchModalOpen && updatingItem && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {updatingItem.type === 'farmer' ? '🌿 Farmer Stock Update' : '📦 Inventory Update'}
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
                {updatingItem.type === 'farmer' ? '🚚 New Delivery' : 'New Production Run'}
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
                              📍 {addBatchData.location}
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
