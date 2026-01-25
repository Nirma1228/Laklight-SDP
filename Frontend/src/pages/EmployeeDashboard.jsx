import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './EmployeeDashboard.css'

const EmployeeDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('inventory')
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isReviewDeliveryOpen, setIsReviewDeliveryOpen] = useState(false)
  const [isDeliveryDetailsOpen, setIsDeliveryDetailsOpen] = useState(false)
  const [currentDelivery, setCurrentDelivery] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [dashboardAlerts, setDashboardAlerts] = useState([])

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
  const [customScheduleDate, setCustomScheduleDate] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [profileData, setProfileData] = useState({
    firstName: 'Nimal',
    lastName: 'Fernando',
    email: 'nimal.fernando@laklights.com',
    phone: '+94 77 345 6789',
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

  const [farmerProducts, setFarmerProducts] = useState([
    {
      id: 1,
      name: 'Fresh Mango - Grade A',
      batches: [
        { id: 101, location: 'C03-R04 (Cold Storage A)', stock: '50 kg', receivedDate: '2025-09-20', expiry: '2025-09-30', daysUntilExpiry: 5, status: 'critical' },
        { id: 102, location: 'C01-R02 (Cold Storage A)', stock: '35 kg', receivedDate: '2025-09-25', expiry: '2025-10-05', daysUntilExpiry: 10, status: 'warning' }
      ],
      category: 'raw'
    },
    {
      id: 2,
      name: 'Pineapple Chunks',
      batches: [
        { id: 201, location: 'C02-R01 (Cold Storage B)', stock: '25 kg', receivedDate: '2025-09-18', expiry: '2025-10-15', daysUntilExpiry: 20, status: 'warning' }
      ],
      category: 'raw'
    },
    {
      id: 3,
      name: 'Fresh Papaya - Grade A',
      batches: [
        { id: 301, location: 'C01-R03 (Cold Storage A)', stock: '45 kg', receivedDate: '2025-09-22', expiry: '2025-10-05', daysUntilExpiry: 10, status: 'good' }
      ],
      category: 'raw'
    },
    {
      id: 4,
      name: 'Passion Fruit - Grade B',
      batches: [
        { id: 401, location: 'C03-R02 (Cold Storage B)', stock: '32 kg', receivedDate: '2025-09-21', expiry: '2025-10-08', daysUntilExpiry: 13, status: 'good' }
      ],
      category: 'raw'
    }
  ])

  const [finishedProducts, setFinishedProducts] = useState([
    {
      id: 1,
      name: 'Lime Mix',
      location: 'Finished Goods - Shelf A',
      batch: 'B202509',
      manufactured: '2025-09-01',
      bestBefore: '2026-04-01',
      quantity: 120,
      status: 'good',
      category: 'processed'
    },
    {
      id: 2,
      name: 'Mango Jelly',
      location: 'Finished Goods - Shelf B',
      batch: 'B202508',
      manufactured: '2025-05-10',
      bestBefore: '2026-02-10',
      quantity: 50,
      status: 'warning',
      category: 'processed'
    },
    {
      id: 3,
      name: 'Wood Apple Juice',
      location: 'Finished Goods - Shelf C',
      batch: 'B202507',
      manufactured: '2025-04-20',
      bestBefore: '2026-01-20',
      quantity: 80,
      status: 'unit-low',
      category: 'processed'
    }
  ])

  const [supplierApplications, setSupplierApplications] = useState(() => {
    const saved = localStorage.getItem('supplier_applications')
    if (saved) return JSON.parse(saved)
    return [
      {
        id: 1,
        farmerName: 'Mountain Fresh Farm - Badulla',
        product: 'Fresh Mango - Grade A',
        quantity: '200kg',
        price: 'LKR 180.00/kg',
        harvestDate: '2025-09-20',
        qualityGrade: 'Grade A',
        license: 'AG2025078',
        submitted: '2025-09-21',
        transport: 'Self Transport',
        date: '2025-09-25',
        images: ['Mango+1', 'Mango+2', 'Quality+Cert'],
        category: 'raw',
        status: 'under-review'
      },
      {
        id: 2,
        farmerName: 'Sunrise Plantation - Matale',
        product: 'Strawberry - Grade B',
        quantity: '80kg',
        price: 'LKR 350.00/kg',
        harvestDate: '2025-09-22',
        qualityGrade: 'Grade B',
        license: 'AG2025045',
        submitted: '2025-09-20',
        transport: 'Company Truck Pickup',
        date: '2025-09-25',
        images: ['Strawberry+1', 'Strawberry+2', 'Farm+View'],
        category: 'raw',
        status: 'under-review'
      },
      {
        id: 3,
        farmerName: 'Golden Valley Farms - Nuwara Eliya',
        product: 'Passion Fruit - Grade A',
        quantity: '60kg',
        price: 'LKR 450.00/kg',
        harvestDate: '2025-09-23',
        qualityGrade: 'Grade A',
        license: 'AG2025123',
        submitted: '2025-09-22',
        transport: 'Self Transport',
        date: '2025-09-26',
        images: ['Passion+Fruit', 'Quality+Check', 'Packaging'],
        category: 'raw',
        status: 'under-review'
      }
    ]
  })

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
            heading: '⌛ EXPIRY ALERT: FARMER PRODUCT',
            message: `${product.name} at ${batch.location} expires in ${batch.daysUntilExpiry} days (${batch.stock}).`
          })
        }
      })

      // Check aggregated stock levels
      if (totalStock < 50) {
        alerts.push({
          id: `fp-total-crit-${product.id}`,
          type: 'danger',
          heading: '🔴 CRITICAL TOTAL STOCK',
          message: `Total ${product.name} stock is critically low: only ${totalStock} kg remaining across all locations.`
        })
      } else if (totalStock < 100) {
        alerts.push({
          id: `fp-total-warn-${product.id}`,
          type: 'warning',
          heading: '⚠️ LOW TOTAL STOCK',
          message: `Total ${product.name} stock is low: ${totalStock} kg remaining. Consider reordering.`
        })
      }
    })

    // 2. Check Finished Products for low stock and expiry
    finishedProducts.forEach(product => {
      // Calculate days until Best Before
      const today = new Date();
      const bestBeforeDate = new Date(product.bestBefore);
      const diffTime = bestBeforeDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Expiry Alert (5 days before)
      if (diffDays <= 5 && diffDays >= 0) {
        alerts.push({
          id: `gp-expiry-${product.id}`,
          type: 'danger',
          heading: '⌛ BEST BEFORE ALERT: FINISHED PRODUCT',
          message: `${product.name} (Batch ${product.batch}) is approaching its best-before date in ${diffDays} days.`
        })
      }

      // Stock Level Alerts
      if (product.status === 'unit-low') {
        alerts.push({
          id: `gp-crit-${product.id}`,
          type: 'danger',
          heading: '🔴 CRITICAL STOCK ALERT: FINISHED PRODUCT',
          message: `${product.name} is extremely low (${product.quantity} units). Batch: ${product.batch}`
        })
      } else if (product.status === 'warning') {
        alerts.push({
          id: `gp-warn-${product.id}`,
          type: 'warning',
          heading: '⚠️ LOW STOCK WARNING: FINISHED PRODUCT',
          message: `${product.name} stock is decreasing (${product.quantity} units).`
        })
      }
    })

    // 3. Check for Pending Farmer Applications
    if (supplierApplications.length > 0) {
      alerts.push({
        id: 'application-notification',
        type: 'info',
        heading: '📢 PENDING FARMER APPLICATIONS',
        message: `You have ${supplierApplications.length} new supplier applications waiting for review and approval.`
      })
    }

    setDashboardAlerts(alerts)
  }, [farmerProducts, finishedProducts, supplierApplications])

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

        let matchesStatus = true
        if (statusFilter === 'in-stock') matchesStatus = p.quantity >= 100
        if (statusFilter === 'low-stock') matchesStatus = p.quantity < 100 && p.quantity > 0
        if (statusFilter === 'out-of-stock') matchesStatus = p.quantity === 0

        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        if (sortFilter === 'name-asc') return a.name.localeCompare(b.name)
        if (sortFilter === 'name-desc') return b.name.localeCompare(a.name)

        if (sortFilter === 'low-stock-priority') {
          const statusMap = { 'unit-low': 3, 'warning': 2, 'good': 1 }
          return (statusMap[b.status] || 0) - (statusMap[a.status] || 0) || a.quantity - b.quantity
        }

        if (sortFilter === 'stock-low') return a.quantity - b.quantity
        if (sortFilter === 'stock-high') return b.quantity - a.quantity
        return 0
      })
  }, [finishedProducts, searchTerm, categoryFilter, statusFilter, sortFilter])

  const filteredApplications = useMemo(() => {
    return supplierApplications
      .filter(app => {
        // Show only pending (under-review) applications in this dashboard
        if (app.status !== 'under-review') return false

        const matchesSearch = app.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.product.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = !categoryFilter || app.category === categoryFilter

        // Use Status Filter for Quality Grade mapping
        let matchesStatus = true
        if (statusFilter === 'in-stock') matchesStatus = app.qualityGrade === 'Grade A'
        if (statusFilter === 'low-stock') matchesStatus = app.qualityGrade === 'Grade B'
        if (statusFilter === 'out-of-stock') matchesStatus = app.qualityGrade === 'Grade C'

        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        if (sortFilter === 'name-asc') return a.farmerName.localeCompare(b.farmerName)
        if (sortFilter === 'name-desc') return b.farmerName.localeCompare(a.farmerName)

        // Date sort (assuming submitted date strings)
        if (sortFilter === 'newest') return new Date(b.submitted) - new Date(a.submitted)

        // Quantity sort (parsing '200kg' etc)
        const qtyA = parseInt(a.quantity)
        const qtyB = parseInt(b.quantity)
        if (sortFilter === 'stock-low') return qtyA - qtyB
        if (sortFilter === 'stock-high') return qtyB - qtyA

        // Price sort (parsing 'LKR 180.00/kg')
        if (sortFilter === 'price-low' || sortFilter === 'price-high') {
          const parsePrice = (str) => {
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

  const [deliveries, setDeliveries] = useState(() => {
    const defaultDeliveries = [
      { id: 'DEL-1001', farmer: 'Green Valley Farm', product: 'Fresh Mango - Grade A', quantity: '100kg', proposedDate: '2025-10-22', scheduleDate: '-', transport: 'Company Truck Pickup', status: 'pending' },
      { id: 'DEL-1004', farmer: 'Sunrise Organic Farm', product: 'Papaya - Grade A', quantity: '80kg', proposedDate: '2025-10-23', scheduleDate: '-', transport: 'Self Transport', status: 'pending' },
      { id: 'DEL-1010', farmer: 'Highland Farms - Nuwara Eliya', product: 'Strawberry - Grade A', quantity: '50kg', proposedDate: '2025-10-25', scheduleDate: '2025-10-27', transport: 'Self Transport', status: 'pending-confirmation' },
      { id: 'DEL-1015', farmer: 'Golden Valley - Matale', product: 'Passion Fruit - Grade A', quantity: '40kg', proposedDate: '2025-10-28', scheduleDate: '-', transport: 'Company Truck Pickup', status: 'pending' },
      { id: 'DEL-1020', farmer: 'Mountain Oasis - Badulla', product: 'Papaya - Grade A', quantity: '120kg', proposedDate: '2025-10-20', scheduleDate: '2025-10-22', transport: 'Self Transport', status: 'pending-confirmation' },
      { id: 'DEL-1025', farmer: 'Valley Greens - Nuwara Eliya', product: 'Pineapple - Grade B', quantity: '90kg', proposedDate: '2025-10-25', scheduleDate: '2025-10-26', transport: 'Company Truck Pickup', status: 'pending-confirmation' }
    ]

    const saved = localStorage.getItem('delivery_list')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Merge: keep all saved, but ensure the new sample IDs are there if missing
      const existingIds = new Set(parsed.map(d => d.id))
      const newItems = defaultDeliveries.filter(d => !existingIds.has(d.id))
      return [...parsed, ...newItems]
    }
    return defaultDeliveries
  })

  // Auto-save deliveries
  useEffect(() => {
    localStorage.setItem('delivery_list', JSON.stringify(deliveries))
  }, [deliveries])

  const showTab = (tabName) => {
    setActiveTab(tabName)
  }

  const approveApplication = (farmName) => {
    const app = supplierApplications.find(a => a.farmerName === farmName)
    if (!app) return
    setSelectedApp(app)
    setCustomScheduleDate(app.date)
    setIsApproveModalOpen(true)
  }

  const confirmApproveWithDate = () => {
    if (!selectedApp || !customScheduleDate) {
      alert('Please provide a valid schedule date.')
      return
    }

    const updatedApplications = supplierApplications.map(a =>
      a.farmerName === selectedApp.farmerName ? {
        ...a,
        status: 'selected',
        scheduleDate: customScheduleDate,
        originalProposedDate: a.date
      } : a
    )
    setSupplierApplications(updatedApplications)
    localStorage.setItem('supplier_applications', JSON.stringify(updatedApplications))

    // Also create a entry in Deliveries tab for negotiation
    const newDelivery = {
      id: `DEL-${Date.now()}`,
      farmer: selectedApp.farmerName,
      product: selectedApp.product,
      quantity: selectedApp.quantity,
      proposedDate: selectedApp.date,
      scheduleDate: customScheduleDate,
      transport: selectedApp.transport,
      status: customScheduleDate !== selectedApp.date ? 'pending-confirmation' : 'confirmed'
    }
    setDeliveries(prev => [...prev, newDelivery])

    setIsApproveModalOpen(false)
    showNotification(`Application from ${selectedApp.farmerName} approved!`)
    setSelectedApp(null)
  }

  const rejectApplication = (farmName) => {
    const reason = window.prompt(`Reject application from ${farmName}?\n\nPlease provide reason for rejection:`)
    if (reason && reason.trim()) {
      alert(`❌ Application from ${farmName} has been rejected.\n\nReason: ${reason}\n\nFarmer will receive notification with feedback.`)

      const updatedApplications = supplierApplications.map(app =>
        app.farmerName === farmName ? { ...app, status: 'not-selected', rejectionReason: reason } : app
      )
      setSupplierApplications(updatedApplications)
      localStorage.setItem('supplier_applications', JSON.stringify(updatedApplications))
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

  const requestScheduleChange = () => {
    if (currentDelivery) {
      const newDate = window.prompt('Enter the new proposed date (YYYY-MM-DD):', currentDelivery.proposedDate)
      if (newDate) {
        setDeliveries(prev => prev.map(d =>
          d.id === currentDelivery.id
            ? { ...d, status: 'pending-confirmation', scheduleDate: newDate }
            : d
        ))
        showNotification(`Proposed date updated to ${newDate}`)
        setIsReviewDeliveryOpen(false)
        setCurrentDelivery(null)
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

  const rescheduleDelivery = (deliveryId) => {
    const newDate = window.prompt('Enter new delivery date (e.g., Oct 26, 2025):')
    if (newDate && newDate.trim() !== '') {
      alert(`📅 Delivery rescheduled!\n\nDelivery ID: ${deliveryId}\nNew Date: ${newDate}\n\nThe farmer has been notified of the new delivery date.`)

      setDeliveries(prev => prev.map(d =>
        d.id === deliveryId ? { ...d, scheduleDate: newDate } : d
      ))
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
      if (deliveryStatusFilter === 'all') return true
      return delivery.status === deliveryStatusFilter
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
    } else {
      setFinishedProducts(prev => prev.map(p => {
        if (p.id === updatingItem.productId) {
          const newQty = Math.max(0, p.quantity + finalAdjustment)
          return { ...p, quantity: newQty }
        }
        return p
      }))
    }

    setIsUpdateStockOpen(false)
    alert(`Successfully ${adjustmentType === 'add' ? 'added' : 'reduced'} ${amount} ${updatingItem.unit} for ${updatingItem.productName}`)
  }

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="header">
        <nav className="nav-container">
          <Link to="/home" style={{ textDecoration: 'none', color: 'white' }}>
            <div className="logo">
              <img src="/images/Logo.png" alt="Laklights Food Products" className="logo-img" />
              Laklights Food Products
            </div>
          </Link>
          <ul className="nav-menu">
            <li><Link to="/home">Dashboard</Link></li>
            <li><a href="#inventory">Inventory</a></li>
            <li><a href="#suppliers">Suppliers</a></li>
            <li><a href="#orders">Orders</a></li>
          </ul>
          <div className="user-info">
            <span>Employee: {profileData.firstName} {profileData.lastName}</span>
            <button className="btn btn-primary" onClick={() => setIsEditProfileOpen(true)}>
              Edit Profile
            </button>
            <Link to="/" className="btn btn-secondary">Logout</Link>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1 className="welcome-title">Employee Dashboard</h1>
          <p>Manage inventory, review supplier applications, and oversee manufacturing operations for Laklights Food Products.</p>

          {/* Dashboard Alert Banners */}
          {dashboardAlerts.length > 0 && (
            <div className="dashboard-alerts">
              {dashboardAlerts.map(alert => (
                <div key={alert.id} className={`alert-banner alert-${alert.type}`}>
                  <div className="alert-content">
                    <span className="alert-heading">{alert.heading}</span>
                    <p className="alert-message">{alert.message}</p>
                  </div>
                  <button className="alert-close" onClick={() => setDashboardAlerts(prev => prev.filter(a => a.id !== alert.id))}>×</button>
                </div>
              ))}
            </div>
          )}

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

        {/* Dashboard Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => showTab('inventory')}
          >
            Inventory Management
          </button>
          <button
            className={`tab-button ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => showTab('suppliers')}
          >
            Supplier Applications
          </button>
          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => showTab('orders')}
          >
            Order Management
          </button>
          <button
            className={`tab-button ${activeTab === 'deliveries' ? 'active' : ''}`}
            onClick={() => showTab('deliveries')}
          >
            Delivery Schedule
          </button>
        </div>

        {/* Inventory Management Tab */}
        <div className={`tab-content ${activeTab === 'inventory' ? 'active' : ''}`}>
          {/* Reschedule Notifications */}
          {notifications.length > 0 && (
            <div className="notifications-section">
              <div className="notifications-header">
                <h3>🔔 Delivery Reschedule Requests ({notifications.length})</h3>
              </div>
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-content">
                    <h4>🔄 Delivery Reschedule Request</h4>
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
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon"></div>
                  <h2>Current Inventory</h2>
                </div>
              </div>

              {/* Inventory Search */}
              <div className="inventory-search">
                <div className="search-box">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search inventory by product name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn-search" onClick={searchInventory}>
                    Search
                  </button>
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
                    <option value="packaging">Packaging Materials</option>
                  </select>
                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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

              <div className="inventory-split">
                {/* Farmer Products Column */}
                <div className="inventory-column">
                  <h3>Farmer Products</h3>
                  <button
                    className="btn btn-primary btn-small"
                    style={{ marginBottom: '0.5rem' }}
                    onClick={showAddFarmerProductModal}
                  >
                    Add New Item
                  </button>

                  <div className="expiry-warning" style={{ marginTop: '0.5rem' }}>
                    <strong>⚠️ Critical Alert:</strong>
                    <ul style={{ margin: '0.5rem 0 0 1.25rem', color: '#7a2c2c' }}>
                      <li>Pineapples are needed quickly.</li>
                      <li>Fresh Mango approaching expiry in 3 days.</li>
                    </ul>
                  </div>

                  {filteredFarmerProducts.length > 0 ? (
                    filteredFarmerProducts.map(product => (
                      <div key={product.id} className="inventory-item nested-inventory">
                        <div className="inventory-header">
                          <h4>{product.name}</h4>
                          <span className="total-stock-label">
                            Total: {product.batches.reduce((sum, b) => sum + parseInt(b.stock), 0)} kg
                          </span>
                        </div>

                        <div className="batch-list">
                          {product.batches.map(batch => (
                            <div key={batch.id} className="batch-item">
                              <div className="batch-info">
                                <div className="batch-meta">
                                  <strong>Location:</strong> {batch.location}
                                </div>
                                <div className="batch-meta">
                                  <span>Rec: {batch.receivedDate}</span> | <span>Exp: {batch.expiry} ({batch.daysUntilExpiry}d)</span>
                                </div>
                              </div>
                              <div className={`stock-level stock-${batch.status}`}>{batch.stock}</div>
                              <button
                                className={`btn btn-${batch.status === 'critical' ? 'danger' : batch.status === 'warning' ? 'primary' : 'success'} btn-small`}
                                onClick={() => openUpdateModal('farmer', product, batch)}
                              >
                                Update
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No matching farmer products found.
                    </div>
                  )}
                </div>

                {/* Finished Products Column */}
                <div className="inventory-column">
                  <h3>Finished Products</h3>
                  <button
                    className="btn btn-primary btn-small"
                    style={{ marginBottom: '0.5rem' }}
                    onClick={showAddFinishedProductModal}
                  >
                    Add New Item
                  </button>

                  <div className="expiry-warning" style={{ marginTop: '0.5rem' }}>
                    <strong>⚠️ Critical Alert:</strong>
                    <ul style={{ margin: '0.5rem 0 0 1.25rem', color: '#7a2c2c' }}>
                      <li>Mango Jelly Stock is Low (50 units).</li>
                      <li>Wood Apple Juice stock approaching best-before in 120 days (80 units).</li>
                    </ul>
                  </div>

                  {filteredFinishedProducts.length > 0 ? (
                    filteredFinishedProducts.map(product => (
                      <div key={product.id} className="inventory-item">
                        <div className="inventory-details">
                          <h4>{product.name}</h4>
                          <div className="inventory-location">Location: {product.location}</div>
                          <div>Batch: {product.batch} | Manufactured: {product.manufactured} | Best Before: {product.bestBefore}</div>
                          <div>Current Quantity: {product.quantity} units</div>
                        </div>
                        <div className={`stock-level stock-${product.status}`}>{product.quantity} units</div>
                        <div>
                          <button
                            className={`btn btn-${product.status === 'unit-low' ? 'danger' : product.status === 'warning' ? 'primary' : 'success'} btn-small`}
                            onClick={() => openUpdateModal('finished', product)}
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No matching finished products found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Applications Tab */}
        <div className={`tab-content ${activeTab === 'suppliers' ? 'active' : ''}`}>
          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
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
                    <p><strong>Harvest Date:</strong> {app.harvestDate} | <strong>Quality Grade:</strong> {app.qualityGrade}</p>
                    <p><strong>License:</strong> {app.license} | <strong>Submitted:</strong> {app.submitted}</p>
                    <p><strong>Transport:</strong> {app.transport} | <strong>Date:</strong> {app.date}</p>

                    <div className="submitted-images">
                      <p><strong>Submitted Images:</strong></p>
                      <div className="image-gallery">
                        {app.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={`https://via.placeholder.com/150x150?text=${img}`}
                            alt={`Product Image ${idx + 1}`}
                            className="product-thumbnail"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="application-actions">
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => approveApplication(app.farmerName)}
                      >
                        Approve & Schedule
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => rejectApplication(app.farmerName)}
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
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
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
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon">🚚</div>
                  <h2>Farmer Delivery Schedule Requests</h2>
                </div>
              </div>

              <div className="inventory-filters" style={{ marginBottom: '1rem' }}>
                <select
                  className="filter-select"
                  value={deliveryStatusFilter}
                  onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
                    {filterDeliveries().map(delivery => (
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
                            {delivery.status === 'pending' && 'Pending Review'}
                            {delivery.status === 'pending-confirmation' && 'Pending Date Confirmation'}
                            {delivery.status === 'confirmed' && 'Confirmed'}
                            {delivery.status === 'completed' && 'Completed'}
                            {delivery.status === 'cancelled' && 'Cancelled'}
                          </span>
                        </td>
                        <td>
                          {delivery.status === 'pending' && (
                            <button
                              className="btn-action"
                              onClick={() => reviewDelivery(delivery.id)}
                            >
                              Review
                            </button>
                          )}
                          {delivery.status === 'pending-confirmation' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn-action btn-confirm"
                                onClick={() => {
                                  setDeliveries(prev => prev.map(d => d.id === delivery.id ? { ...d, status: 'confirmed', scheduleDate: d.scheduleDate } : d))
                                  showNotification('Schedule accepted!')
                                }}
                              >
                                Accept
                              </button>
                              <button
                                className="btn-action btn-reschedule"
                                style={{ background: '#ff9800' }}
                                onClick={() => reviewDelivery(delivery.id)}
                              >
                                Date Reschedule
                              </button>
                            </div>
                          )}
                          {delivery.status === 'confirmed' && (
                            <>
                              <button
                                className="btn-action"
                                style={{ background: '#4caf50', color: 'white' }}
                                onClick={() => acceptDate(delivery.id)}
                              >
                                Accept Date
                              </button>
                              <button
                                className="btn-action"
                                style={{ background: '#ff9800', color: 'white', marginLeft: '0.5rem' }}
                                onClick={() => rescheduleDelivery(delivery.id)}
                              >
                                Reschedule
                              </button>
                            </>
                          )}
                          {delivery.status === 'completed' && (
                            <button
                              className="btn-action btn-secondary"
                              onClick={() => viewEmployeeDeliveryDetails(delivery.id)}
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
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

              <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #ffc107' }}>
                <p style={{ margin: 0 }}><strong>Farmer's Proposed Date:</strong> {selectedApp.date}</p>
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

      <Footer />
    </div>
  )
}

export default EmployeeDashboard
