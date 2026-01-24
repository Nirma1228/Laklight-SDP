import { useState, useEffect } from 'react'
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
  const [isLoading, setIsLoading] = useState(false)
  
  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }
  
  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api'
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortFilter, setSortFilter] = useState('')
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all')

  // Load reschedule notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = JSON.parse(localStorage.getItem('employee_notifications') || '[]')
      const pendingNotifications = storedNotifications.filter(n => n.status === 'pending')
      
      // If no notifications, add sample notifications for demo
      if (pendingNotifications.length === 0) {
        const sampleNotifications = [
          {
            id: Date.now() - 1000,
            type: 'delivery-reschedule',
            deliveryId: 'DEL-002',
            product: 'Strawberry - Grade A',
            quantity: '50kg',
            farmerName: 'K.M. Silva',
            oldDate: 'Oct 25, 2025',
            newDate: 'Oct 28, 2025',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            status: 'pending'
          },
          {
            id: Date.now() - 2000,
            type: 'delivery-reschedule',
            deliveryId: 'DEL-005',
            product: 'Fresh Papaya - Grade A',
            quantity: '80kg',
            farmerName: 'R.D. Perera',
            oldDate: 'Oct 27, 2025',
            newDate: 'Oct 30, 2025',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            status: 'pending'
          }
        ]
        setNotifications(sampleNotifications)
      } else {
        setNotifications(pendingNotifications)
      }
    }
    loadNotifications()
    
    // Poll for new notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

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
      location: 'C03-R04 (Cold Storage A)',
      expiry: '2025-09-30',
      daysUntilExpiry: 5,
      stock: '85 kg',
      reorder: '20 kg',
      status: 'critical'
    },
    {
      id: 2,
      name: 'Pineapple Chunks',
      location: 'C02-R01 (Cold Storage B)',
      expiry: '2025-10-15',
      daysUntilExpiry: 20,
      stock: '25 kg',
      reorder: '40 kg',
      status: 'warning'
    },
    {
      id: 3,
      name: 'Fresh Papaya - Grade A',
      location: 'C01-R03 (Cold Storage A)',
      expiry: '2025-10-05',
      daysUntilExpiry: 10,
      stock: '45 kg',
      reorder: '15 kg',
      status: 'good'
    },
    {
      id: 4,
      name: 'Passion Fruit - Grade B',
      location: 'C03-R02 (Cold Storage B)',
      expiry: '2025-10-08',
      daysUntilExpiry: 13,
      stock: '32 kg',
      reorder: '20 kg',
      status: 'good'
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
      status: 'good'
    },
    {
      id: 2,
      name: 'Mango Jelly',
      location: 'Finished Goods - Shelf B',
      batch: 'B202508',
      manufactured: '2025-05-10',
      bestBefore: '2026-02-10',
      quantity: 50,
      status: 'warning'
    },
    {
      id: 3,
      name: 'Wood Apple Juice',
      location: 'Finished Goods - Shelf C',
      batch: 'B202507',
      manufactured: '2025-04-20',
      bestBefore: '2026-01-20',
      quantity: 80,
      status: 'unit-low'
    }
  ])

  // Fetch pending applications from backend
  const fetchPendingApplications = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/employee/applications`, {
        headers:
