import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { config } from '../config'
import { useToast } from '../components/ToastNotification'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBell, faCalendarAlt, faCamera, faCheckCircle,
  faFlagCheckered, faInfoCircle, faCalendarCheck,
  faHome, faPaperPlane, faHistory, faTruck, faUser,
  faCreditCard, faCog, faSignOutAlt, faQuestionCircle,
  faStar, faSeedling, faBoxes, faChevronRight, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'
import { formatSriLankanDate } from '../utils/dateFormatter'
import './FarmerDashboard.css'

// Professional Date Input Component for DD/MM/YYYY
const CustomDateInput = ({ label, value, onChange, min, required }) => {
  const [displayDate, setDisplayDate] = useState('DD/MM/YYYY');
  const dateInputRef = useRef(null);

  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      setDisplayDate(`${day}/${month}/${year}`);
    } else {
      setDisplayDate('DD/MM/YYYY');
    }
  }, [value]);

  const handleContainerClick = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.click();
        }
      } catch (e) {
        dateInputRef.current.click();
      }
    }
  };

  return (
    <div className="sri-lankan-date-container-v2">
      {label && <label className="sri-lankan-date-label-v2">{label}</label>}
      <div className="sri-lankan-date-box-v2" onClick={handleContainerClick}>
        <span className={!value ? 'placeholder' : ''}>{displayDate}</span>
        <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon-v2" />
        <input
          type="date"
          ref={dateInputRef}
          value={value || ''}
          min={min}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="date-input-hidden-v2"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '50%',
            right: '1.25rem',
            transform: 'translateY(-50%)',
            width: '30px',
            height: '30px',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10
          }}
        />
      </div>
    </div>
  );
};


// Utility: get today's date in YYYY-MM-DD
const getToday = () => new Date().toISOString().slice(0, 10);

// Utility: get future date
const getFutureDate = (days, baseDate = null) => {
  const d = baseDate ? new Date(baseDate) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Format Helpers
const formatGrade = (g) => {
  if (!g) return '';
  // Check if it's already formatted (starts with Grade with capital G)
  if (g.startsWith('Grade')) return g;

  const map = { 'grade-a': 'Grade A', 'grade-b': 'Grade B', 'grade-c': 'Grade C' };
  // If not in map, try title case
  return map[g] || g.charAt(0).toUpperCase() + g.slice(1);
};

const formatTransport = (t) => {
  if (!t) return '';
  const map = { 'self': 'Self Transport', 'company': 'Company Truck Pickup' };
  return map[t] || t;
};

const formatStatus = (s) => {
  if (!s) return 'Pending';
  return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

function FarmerDashboard() {
  const navigate = useNavigate()
  const toast = useToast()

  // Initialize data on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchSubmissions();
    fetchDeliveries();
    fetchBankDetails();
    fetchDeliveryHistory();
  }, []);

  const [products, setProducts] = useState([{
    id: 1,
    name: '',
    category: '',
    variety: '',
    quantity: '',
    unit: 'kg',
    customPrice: '',
    harvestDate: '',
    grade: '',
    transport: '',
    deliveryDate: getFutureDate(3),
    proposedDate2: '',
    proposedDate3: '',
    storage: '',
    images: null,
    notes: ''
  }])


  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [newDeliveryDate, setNewDeliveryDate] = useState('')
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: 'Randila Pamod',
    bankName: 'Sampath Bank',
    branchName: 'Gokarella',
    accountNumber: '1234567890'
  })
  const [isBankLoading, setIsBankLoading] = useState(false)
  const [isBankWarningDismissed, setIsBankWarningDismissed] = useState(false)
  const [activeTab, setActiveTab] = useState('home') // 'home', 'submit', 'submissions', 'deliveries'
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  // Load notifications from localStorage
  useEffect(() => {
    const savedNotifs = localStorage.getItem('farmer_notifications');
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('farmer_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      date: formatSriLankanDate(new Date()),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const [farmerProfile, setFarmerProfile] = useState({
    fullName: 'Randila Pamod',
    farmName: 'Laklight Supplier',
    email: 'nethmini1228@gmail.com',
    phone: '0705282626',
    address: 'Kandulawa, Gokarella',
    city: 'Gokarella',
    postalCode: '',
    district: '',
    licenseNumber: 'PENDING',
    memberSince: '',
    qualityRating: 'N/A'
  })

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    district: ''
  })

  // Fetch farmer profile from backend
  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        setFarmerProfile({
          fullName: user.full_name,
          farmName: user.farmName || 'Laklight Supplier',
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          postalCode: user.postal_code,
          district: user.district,
          licenseNumber: user.licenseNumber || `F-${user.id.toString().padStart(4, '0')}`,
          memberSince: formatSriLankanDate(user.join_date),
          qualityRating: '4.8/5.0'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch bank details
  const fetchBankDetails = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/farmer/bank-details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.bankDetails) {
          setBankDetails({
            accountHolderName: data.bankDetails.account_holder_name,
            bankName: data.bankDetails.bank_name,
            branchName: data.bankDetails.branch_name,
            accountNumber: data.bankDetails.account_number
          });
        }
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setIsBankLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${config.API_BASE_URL}/farmer/bank-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bankDetails)
      });

      if (response.ok) {
        toast.success('Bank details saved successfully!');
        setIsBankModalOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to save bank details');
      }
    } catch (error) {
      console.error('Error saving bank details:', error);
      toast.error('Connection error');
    } finally {
      setIsBankLoading(false);
    }
  };

  const handleEditToggle = (e) => {
    if (e) e.preventDefault();
    if (!isEditingProfile) {
      // Entering edit mode - initialize form data with current profile values
      setEditFormData({
        fullName: farmerProfile.fullName,
        phone: farmerProfile.phone,
        address: farmerProfile.address,
        city: farmerProfile.city || '',
        postalCode: farmerProfile.postalCode || '',
        district: farmerProfile.district || ''
      });
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setIsEditingProfile(false); // Reset to view mode when closed
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editFormData.fullName,
          phone: editFormData.phone,
          address: editFormData.address,
          city: editFormData.city,
          postal_code: editFormData.postalCode,
          district: editFormData.district
        })
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setIsEditingProfile(false);
        fetchProfile(); // Refresh profile data
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Connection error. Please try again later.');
    }
  };

  // Fetch submissions from database
  const fetchSubmissions = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('No token found, skipping fetchSubmissions');
        return;
      }

      console.log('Fetching submissions from backend...');
      const response = await fetch(`${config.API_BASE_URL}/farmer/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Submissions received:', data.submissions);
        const formattedSubmissions = data.submissions.map(sub => ({
          id: sub.id,
          product: sub.product_name,
          variety: sub.variety || '',
          grade: formatGrade(sub.grade_enum || sub.grade || ''),
          quantity: `${sub.quantity}${(sub.unit || 'kg').replace(/bottle/i, 'kg')}`,
          price: `LKR ${sub.custom_price || sub.price || '0'}`,
          harvestDate: sub.harvest_date ? new Date(sub.harvest_date).toISOString().split('T')[0] : '',
          status: sub.status || 'under-review',
          date: sub.submission_date ? new Date(sub.submission_date).toISOString().split('T')[0] : '',
          transport: formatTransport(sub.transport_method || ''),
          category: sub.category,
          deliveryDate: sub.delivery_date ? new Date(sub.delivery_date).toISOString().split('T')[0] : '',
          proposedDate2: sub.proposed_date_2 ? new Date(sub.proposed_date_2).toISOString().split('T')[0] : '',
          proposedDate3: sub.proposed_date_3 ? new Date(sub.proposed_date_3).toISOString().split('T')[0] : '',
          storageInstructions: sub.storage_instructions || '',
          notes: sub.notes || '',
          images: sub.images, // Store image data (stringified JSON array)
          rejectionReason: sub.rejection_reason || '',
          scheduleDate: sub.schedule_date ? new Date(sub.schedule_date).toISOString().split('T')[0] : ''
        }));
        setSubmissions(formattedSubmissions);
        // Update localStorage as backup
        localStorage.setItem('supplier_applications', JSON.stringify(formattedSubmissions));
      } else {
        console.error('Failed to fetch submissions:', response.status);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      // Fall back to localStorage if fetch fails
      const saved = localStorage.getItem('supplier_applications');
      if (saved) {
        setSubmissions(JSON.parse(saved));
      }
    }
  };

  // Fetch deliveries from database
  const fetchDeliveries = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/farmer/deliveries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedDeliveries = data.deliveries.map(del => ({
          id: del.id || `DEL-${del.delivery_id}`,
          product: del.product || (del.product_name ? del.product_name.replace(/organic\s+/i, '') : 'Unknown Product'),
          quantity: `${del.quantity}${(del.unit || 'kg').replace(/bottle/i, 'kg')}`,
          proposedDate: del.proposedDate || '',
          scheduleDate: del.scheduleDate || '',
          transport: formatTransport(del.transport_method || del.transport),
          status: (['confirmed', 'confirmed schedule', 'scheduled delivery'].includes((del.status || '').toLowerCase()) ? 'pending' : (del.status || 'pending').toLowerCase()),
          proposedRescheduleDate: del.proposedRescheduleDate || null,
          sellPrice: del.custom_price || del.unit_price || del.price || 'N/A'
        }));

        // Set all deliveries to the main deliveries list so they remain visible
        setDeliveries(formattedDeliveries);

        // Filter for completed deliveries for historical records (internal use)
        const historicalDeliveries = formattedDeliveries.filter(d => d.status === 'completed' || d.status === 'delivered');
        setDeliveryHistory(historicalDeliveries);


        // Update localStorage as backup
        localStorage.setItem('delivery_list', JSON.stringify(formattedDeliveries));
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      // Fall back to localStorage if fetch fails
      const saved = localStorage.getItem('delivery_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDeliveries(parsed);
        setDeliveryHistory(parsed.filter(d => d.status === 'completed'));
      }
    }
  };

  const fetchDeliveryHistory = () => {
    // This is now handled within fetchDeliveries for data consistency
    // But we keep the function call for future dedicated endpoint expansion if needed
  };

  const [submissions, setSubmissions] = useState([]);

  const [deliveries, setDeliveries] = useState([]);

  const [deliveryHistory, setDeliveryHistory] = useState([]);

  const handleConfirmSubmission = (id) => {
    const updated = submissions.map(s =>
      s.id === id ? { ...s, status: 'confirmed' } : s
    );
    setSubmissions(updated);
    // Synchronize back to the shared storage
    localStorage.setItem('supplier_applications', JSON.stringify(updated));
    toast.success('✅ Delivery date confirmed! Your product is now scheduled for pickup.');
  };

  const handleRescheduleSubmission = (id, currentProposed) => {
    const newDate = window.prompt('Please enter your preferred reschedule date (YYYY-MM-DD):', currentProposed);
    if (newDate) {
      const updated = submissions.map(s =>
        s.id === id ? { ...s, scheduleDate: newDate, status: 'under-review' } : s
      );
      setSubmissions(updated);
      localStorage.setItem('supplier_applications', JSON.stringify(updated));
      toast.info('📅 Reschedule request sent! The operations team will review your suggested date.');
    }
  };

  // Check for updates and notify farmer on load
  useEffect(() => {
    // 1. Check for newly approved submissions
    const approvedCount = submissions.filter(s => s.status === 'selected').length;
    // 2. Check for rejected submissions
    const rejectedCount = submissions.filter(s => s.status === 'not-selected').length;
    // 3. Check for delivery schedules needing confirmation
    const negotiationCount = deliveries.filter(d => d.status === 'pending-confirmation').length;

    if (negotiationCount > 0) {
      addNotification('Action Required', `You have ${negotiationCount} delivery schedule(s) pending confirmation.`, 'warning');
    }
  }, [submissions, deliveries]);

  // Check for notifications when submissions change
  useEffect(() => {
    submissions
      .filter(sub => sub.status === 'selected' || sub.status === 'not-selected')
      .forEach(sub => {
        const lastNotified = localStorage.getItem(`notified_${sub.id}`);
        if (lastNotified === sub.status) return; // Already notified for this status

        if (sub.status === 'selected') {
          addNotification('Product Selected!', `Your product "${sub.product}" was selected by the operations team.`, 'success');
        } else if (sub.status === 'not-selected') {
          addNotification('Application Rejected', `Your product "${sub.product}" was not selected. Reason: ${sub.rejectionReason || 'No reason provided.'}`, 'error');
        }
        localStorage.setItem(`notified_${sub.id}`, sub.status);
      });
  }, [submissions]);

  const handleRescheduleClick = (delivery) => {
    setSelectedDelivery(delivery);
    setIsRescheduleModalOpen(true);
    // Set current scheduled date as default
    const currentDate = delivery.scheduleDate ? new Date(delivery.scheduleDate).toISOString().split('T')[0] : '';
    setNewDeliveryDate(currentDate);
  };

  // Reschedule delivery handler (with backend update)
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDelivery || !newDeliveryDate) return;

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const res = await fetch(`${config.API_BASE_URL}/farmer/deliveries/${selectedDelivery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rescheduleDate: newDeliveryDate
        })
      });

      if (res.ok) {
        toast.success('Delivery reschedule request sent to employee for approval!');
        setIsRescheduleModalOpen(false);
        setSelectedDelivery(null);
        setNewDeliveryDate('');
        // Refresh deliveries
        fetchDeliveries();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to send reschedule request.');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Connection error. Please try again.');
    }
  }

  const addProduct = () => {
    const newProduct = {
      id: products.length + 1,
      name: '',
      category: '',
      variety: '',
      quantity: '',
      unit: 'kg',
      customPrice: '',
      harvestDate: '',
      grade: '',
      transport: '',
      deliveryDate: '',
      proposedDate2: '',
      proposedDate3: '',
      storage: '',
      images: null,
      notes: ''
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id, field, value) => {
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id !== id) return p;


      return { ...p, [field]: value };
    }));
  };

  // Helper to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault()
    const validProducts = products.filter(p => p.name && p.quantity)

    if (validProducts.length === 0) {
      toast.warning('Please fill in at least one complete product form.')
      return
    }

    try {
      const token = getAuthToken()
      if (!token) return

      const promises = validProducts.map(async (p) => {
        const formData = new FormData();
        formData.append('productName', p.name);
        formData.append('category', p.category);
        formData.append('variety', p.variety || '');
        formData.append('quantity', p.quantity);
        formData.append('unit', p.unit);
        formData.append('grade', p.grade);
        formData.append('customPrice', p.customPrice || '');
        formData.append('harvestDate', p.harvestDate);
        formData.append('transport', p.transport);
        formData.append('deliveryDate', p.deliveryDate);
        formData.append('proposedDate2', p.proposedDate2 || '');
        formData.append('proposedDate3', p.proposedDate3 || '');
        formData.append('storageInstructions', p.storage || '');
        formData.append('notes', p.notes || '');

        if (p.images && p.images.length > 0) {
          Array.from(p.images).forEach((file) => {
            formData.append('images', file);
          });
        }

        return fetch(`${config.API_BASE_URL}/farmer/submissions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }).then(async res => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            // Extract validation errors if present
            const backendError = errorData.message || (errorData.errors && errorData.errors[0]?.msg) || 'Submission failed';
            throw new Error(backendError);
          }
          return res.json()
        })
      })

      const results = await Promise.all(promises)

      toast.success(`Successfully submitted ${validProducts.length} product(s) to database!`)

      // Refresh submissions and deliveries from database
      await fetchSubmissions();
      await fetchDeliveries();

      // Reset Form
      setProducts([{
        id: 1,
        name: '',
        category: '',
        variety: '',
        quantity: '',
        unit: 'kg',
        customPrice: '',
        harvestDate: '',
        grade: '',
        transport: '',
        deliveryDate: '',
        proposedDate2: '',
        proposedDate3: '',
        images: null,
        notes: ''
      }])

    } catch (error) {
      console.error('Submission error:', error)
      toast.error(`Failed to submit products: ${error.message}`)
    }
  }

  // Confirm delivery handler
  const handleConfirmClick = async (delivery) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Authentication required');
        return;
      }

      const res = await fetch(`${config.API_BASE_URL}/farmer/deliveries/${delivery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });

      if (res.ok) {
        toast.success('Delivery confirmed!');
        // Refresh deliveries from database
        fetchDeliveries();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to confirm delivery.');
      }
    } catch (err) {
      console.error('Error confirming delivery:', err);
      toast.error('Connection error. Please try again.');
    }
  };



  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 90;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <div className="farmer-dashboard">
      {/* Dashboard Main Layout */}
      <div className="dashboard-container-v2">
        {/* Sidebar */}
        <aside className="dashboard-sidebar-v2">
          <div className="sidebar-brand">
            <img src="/images/Logo.png" alt="Laklight" className="brand-logo-img" />
          </div>

          <nav className="sidebar-nav-v2">
            <button
              className={`nav-item-v2 ${activeTab === 'home' && !isBankModalOpen && !isProfileModalOpen ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <FontAwesomeIcon icon={faHome} />
              <span>DASHBOARD</span>
            </button>
            <button
              className={`nav-item-v2 ${activeTab === 'submit' && !isBankModalOpen && !isProfileModalOpen ? 'active' : ''}`}
              onClick={() => setActiveTab('submit')}
            >
              <FontAwesomeIcon icon={faSeedling} />
              <span>MY PRODUCTS</span>
            </button>
            <button
              className={`nav-item-v2 ${activeTab === 'deliveries' && !isBankModalOpen && !isProfileModalOpen ? 'active' : ''}`}
              onClick={() => setActiveTab('deliveries')}
            >
              <FontAwesomeIcon icon={faTruck} />
              <span>DELIVERIES</span>
            </button>
            <button
              className={`nav-item-v2 ${isBankModalOpen ? 'active' : ''}`}
              onClick={() => setIsBankModalOpen(true)}
            >
              <FontAwesomeIcon icon={faCreditCard} />
              <span>BANK DETAILS</span>
            </button>
            <button
              className={`nav-item-v2 ${isProfileModalOpen ? 'active' : ''}`}
              onClick={() => setIsProfileModalOpen(true)}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>PROFILE</span>
            </button>
            <button
              className={`nav-item-v2 ${activeTab === 'submissions' && !isBankModalOpen && !isProfileModalOpen ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              <FontAwesomeIcon icon={faHistory} />
              <span>MY HISTORY</span>
            </button>
          </nav>

          <div className="sidebar-footer-v2">
            <button className="logout-btn-v2" onClick={() => {
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              navigate('/login');
            }}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main-v2">
          {/* Top Header with Notifications */}
          <div className="dashboard-header-v2">
            <div className="header-search-v2">
              <input type="text" placeholder="Search resources..." className="top-search-input" />
            </div>

            <div className="header-controls-v2">
              <div className="notif-wrapper-v2">
                <button
                  className={`notif-trigger-v2 ${notifications.some(n => !n.isRead) ? 'has-new' : ''}`}
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <FontAwesomeIcon icon={faBell} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="notif-badge-v2">{notifications.filter(n => !n.isRead).length}</span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="notif-dropdown-v2 fade-in">
                    <div className="notif-header-v2">
                      <div className="notif-title-row">
                        <h4>Notifications</h4>
                        {notifications.length > 0 && (
                          <span className="notif-count-pill">{notifications.filter(n => !n.isRead).length} New</span>
                        )}
                      </div>
                      <button className="clear-all-btn" onClick={() => setNotifications([])}>Clear All</button>
                    </div>
                    <div className="notif-list-v2">
                      {notifications.length === 0 ? (
                        <div className="notif-empty-v2">
                          <div className="empty-notif-icon">
                            <FontAwesomeIcon icon={faBell} />
                          </div>
                          <p>All caught up!</p>
                          <span>No new notifications at the moment.</span>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`notif-item-v2 ${n.type} ${!n.isRead ? 'unread' : ''}`} onClick={() => markAsRead(n.id)}>
                            <div className="notif-icon-v3">
                              <FontAwesomeIcon icon={
                                n.type === 'success' ? faCheckCircle :
                                  n.type === 'error' ? faExclamationTriangle :
                                    n.type === 'warning' ? faExclamationTriangle : faInfoCircle
                              } />
                            </div>
                            <div className="notif-content-v3">
                              <div className="notif-item-header">
                                <span className="notif-title">{n.title}</span>
                                <button className="notif-remove-btn" onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}>×</button>
                              </div>
                              <p className="notif-msg">{n.message}</p>
                              <span className="notif-time">{n.date}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="notif-footer-v2">
                        <button onClick={() => setIsNotificationOpen(false)}>Close View</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="header-user-v2">
                <div className="user-text-v2">
                  <span className="user-name-v2">{farmerProfile.fullName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Banner Notifications */}
          <div className="dashboard-top-notifs">
            {!bankDetails.accountNumber && !isBankWarningDismissed && (
              <div className="top-banner-v2 warning fade-in">
                <div className="banner-content">
                  <div className="banner-icon"><FontAwesomeIcon icon={faExclamationTriangle} /></div>
                  <span><strong>Payment Setup Required:</strong> Please enter your bank details to ensure you can receive secure payments.</span>
                </div>
                <div className="banner-actions">
                  <button className="banner-btn-primary" onClick={() => setIsBankModalOpen(true)}>Setup Now</button>
                  <button className="banner-btn-close" onClick={() => setIsBankWarningDismissed(true)}>×</button>
                </div>
              </div>
            )}
          </div>

          <div className="content-scroll-area">
            {activeTab === 'home' && (
              <div className="tab-pane-v2 fade-in">
                {/* Hero Banner Section */}
                <section className="dashboard-hero-v2">
                  <div className="hero-overlay-v2"></div>
                  <img
                    src="/images/farmer_banner.png"
                    alt="Farmer Hero"
                    className="hero-image-v2"
                  />
                  <div className="hero-content-v2">
                    <span className="welcome-chip-v2">Welcome back, {farmerProfile.fullName}!</span>
                    <h1 className="hero-title-v2">Manage Your Harvest Smarter</h1>
                    <p className="hero-subtitle-v2">Track your fresh produce submissions and logistics from one central dashboard.</p>
                    <div className="hero-actions-v2">
                      <button className="btn-hero-primary" onClick={() => setActiveTab('submit')}>
                        <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: '8px' }} />
                        Submit New Produce
                      </button>
                      <button className="btn-hero-secondary" onClick={() => setActiveTab('deliveries')}>
                        <FontAwesomeIcon icon={faTruck} style={{ marginRight: '8px' }} />
                        View Deliveries
                      </button>
                    </div>
                  </div>
                </section>

                {/* Quick Stats Row */}
                <div className="stats-row-v2">
                  <div className="stat-card-v2 blue">
                    <div className="stat-icon-v2 blue"><FontAwesomeIcon icon={faBoxes} /></div>
                    <div className="stat-info-v2">
                      <span className="stat-value-v2">{submissions.length}</span>
                      <span className="stat-label-v2">Total Submitted</span>
                    </div>
                  </div>
                  <div className="stat-card-v2 green">
                    <div className="stat-icon-v2 green"><FontAwesomeIcon icon={faCheckCircle} /></div>
                    <div className="stat-info-v2">
                      <span className="stat-value-v2">{submissions.filter(s => s.status === 'selected').length}</span>
                      <span className="stat-label-v2">Accepted Stocks</span>
                    </div>
                  </div>
                  <div className="stat-card-v2 orange">
                    <div className="stat-icon-v2 orange"><FontAwesomeIcon icon={faTruck} /></div>
                    <div className="stat-info-v2">
                      <span className="stat-value-v2">{deliveries.filter(d => d.status === 'pending').length}</span>
                      <span className="stat-label-v2">Pending Logistics</span>
                    </div>
                  </div>
                  <div className="stat-card-v2 gold">
                    <div className="stat-icon-v2 gold"><FontAwesomeIcon icon={faStar} /></div>
                    <div className="stat-info-v2">
                      <span className="stat-value-v2">{farmerProfile.qualityRating}</span>
                      <span className="stat-label-v2">Trust Score</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Highlights Grid */}
                <div className="dashboard-grid-v2">
                  <div className="grid-main-v2">
                    <div className="section-card-v2">
                      <div className="section-header-v2">
                        <h3>Recent Activity</h3>
                        <button className="view-all-link" onClick={() => setActiveTab('submissions')}>View History</button>
                      </div>
                      <div className="activity-list-v2">
                        {submissions.slice(0, 3).map(sub => (
                          <div key={sub.id} className="activity-item-v2">
                            <div className="activity-icon-v2"><FontAwesomeIcon icon={faHistory} /></div>
                            <div className="activity-details-v2">
                              <p className="activity-text-v2">Submitted {sub.product} ({sub.quantity})</p>
                              <span className="activity-date-v2">{formatSriLankanDate(sub.date)}</span>
                            </div>
                            <span className={`status-tag-v2 ${sub.status}`}>{sub.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid-side-v2">
                    <div className="section-card-v2">
                      <div className="section-header-v2">
                        <h3>Important Notices</h3>
                      </div>
                      <div className="notices-list-v2">
                        {!bankDetails.accountNumber && (
                          <div className="notice-item-v2 warning" onClick={() => setIsBankModalOpen(true)}>
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <span>Missing bank details for payments</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submit' && (
              <div className="tab-pane-v2 fade-in">
                <div className="section-header-standalone">
                  <h2>Suggest Your Stock</h2>
                  <p>Provide details about your harvest to be considered for our catalog.</p>
                </div>
                <div className="dashboard-card-v2">
                  <form onSubmit={handleSubmitAll}>
                    <div id="products-container">
                      {products.map((product, index) => (
                        <div key={product.id} className="product-form-v2">
                          <div className="product-form-header-v2">
                            <span className="product-form-title-v2">Produce Item {index + 1}</span>
                            {products.length > 1 && (
                              <button type="button" className="remove-product-btn" onClick={() => removeProduct(product.id)}>
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="form-grid-v2">
                            <div className="form-group-v2">
                              <label>Product Type *</label>
                              <select
                                required
                                value={product.category}
                                onChange={(e) => updateProduct(product.id, 'category', e.target.value)}
                              >
                                <option value="">Select Type</option>
                                <option value="fruits">Fruits</option>
                                <option value="vegetables">Vegetables</option>
                                <option value="dairy">Dairy</option>
                                <option value="grains">Grains</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            <div className="form-group-v2">
                              <label>Produce Name *</label>
                              <input
                                type="text"
                                required
                                value={product.name}
                                onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                placeholder='e.g. Mangoes'
                              />
                            </div>

                            <div className="form-group-v2">
                              <label>Variety</label>
                              <input
                                type="text"
                                value={product.variety || ''}
                                onChange={(e) => updateProduct(product.id, 'variety', e.target.value)}
                                placeholder='e.g. Alphonso'
                              />
                            </div>

                            <div className="form-group-v2">
                              <label>Quantity *</label>
                              <div className="input-group-v2">
                                <input
                                  type="number"
                                  required
                                  value={product.quantity}
                                  onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                                />
                                <select
                                  value={product.unit}
                                  onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                                >
                                  <option value="kg">kg</option>
                                  <option value="L">Liters</option>
                                  <option value="units">Units</option>
                                </select>
                              </div>
                            </div>

                            <div className="form-group-v2">
                              <label>Expected Sell Price (LKR per unit)</label>
                              <input
                                type="number"
                                value={product.customPrice}
                                onChange={(e) => updateProduct(product.id, 'customPrice', e.target.value)}
                                placeholder="Enter your price"
                              />
                            </div>

                            <div className="form-group-v2">
                              <CustomDateInput
                                label="Harvest Date *"
                                required={true}
                                value={product.harvestDate}
                                onChange={(val) => updateProduct(product.id, 'harvestDate', val)}
                              />
                            </div>

                            <div className="form-group-v2">
                              <label>Transport Method *</label>
                              <select
                                required
                                value={product.transport}
                                onChange={(e) => updateProduct(product.id, 'transport', e.target.value)}
                              >
                                <option value="">Select Method</option>
                                <option value="company">Laklight Pickup</option>
                                <option value="self">Self Delivery</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row-v2">
                            <div className="form-group-v2">
                              <label>Preferred Delivery Dates (Pick 3) - After Harvest Date</label>
                              <div className="date-selection-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                <CustomDateInput
                                  label="Delivery Date 1"
                                  required={true}
                                  min={product.harvestDate ? product.harvestDate : getToday()}
                                  value={product.deliveryDate}
                                  onChange={(val) => {
                                    if (val) {
                                      const d2 = getFutureDate(1, val);
                                      const d3 = getFutureDate(2, val);
                                      setProducts(prev => prev.map(p =>
                                        p.id === product.id
                                          ? { ...p, deliveryDate: val, proposedDate2: d2, proposedDate3: d3 }
                                          : p
                                      ));
                                    } else {
                                      updateProduct(product.id, 'deliveryDate', val);
                                    }
                                  }}
                                />
                                <CustomDateInput
                                  label="Delivery Date 2"
                                  required={true}
                                  min={product.harvestDate ? product.harvestDate : getToday()}
                                  value={product.proposedDate2}
                                  onChange={(val) => updateProduct(product.id, 'proposedDate2', val)}
                                />
                                <CustomDateInput
                                  label="Delivery Date 3"
                                  required={true}
                                  min={product.harvestDate ? product.harvestDate : getToday()}
                                  value={product.proposedDate3}
                                  onChange={(val) => updateProduct(product.id, 'proposedDate3', val)}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="form-row-v2" style={{ marginTop: '1rem' }}>
                            <div className="form-group-v2">
                              <label>Additional Notes</label>
                              <textarea
                                placeholder="Add any special instructions or notes about this product..."
                                value={product.notes || ''}
                                onChange={(e) => updateProduct(product.id, 'notes', e.target.value)}
                                style={{
                                  width: '100%',
                                  minHeight: '80px',
                                  padding: '12px',
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: '#f8fafc',
                                  fontSize: '0.95rem',
                                  resize: 'vertical',
                                  outline: 'none',
                                  transition: 'border-color 0.2s'
                                }}
                              />
                            </div>
                          </div>

                          <div className="form-group-v2 full-width">
                            <label>Product Image</label>
                            <div className="image-upload-dropzone" onClick={() => document.getElementById(`images-${product.id}`).click()}>
                              <input
                                type="file"
                                id={`images-${product.id}`}
                                accept="image/*"
                                multiple
                                onChange={(e) => updateProduct(product.id, 'images', e.target.files)}
                                style={{ display: 'none' }}
                              />
                              <FontAwesomeIcon icon={faCamera} className="upload-icon-v2" />
                              <p>Click to upload produce photos</p>
                              {product.images && <p className="file-count">{product.images.length} files selected</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="form-footer-actions-v2">
                      <button type="button" className="btn-outline-v2" onClick={addProduct}>
                        Add Another Product
                      </button>
                      <button type="submit" className="btn-primary-v2">
                        Submit All for Review
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="tab-pane-v2 fade-in">
                <div className="section-header-standalone">
                  <h2>My Submissions</h2>
                  <p>Track the status of your product offers.</p>
                </div>
                <div className="submissions-grid-v2">
                  {submissions.length === 0 ? (
                    <div className="empty-state-v2">
                      <FontAwesomeIcon icon={faHistory} />
                      <p>No submissions found. Start by suggesting your stock!</p>
                      <button className="btn-primary-v2" onClick={() => setActiveTab('submit')}>Submit Now</button>
                    </div>
                  ) : (
                    submissions.map(sub => (
                      <div key={sub.id} className="submission-card-v2">
                        <div className="sub-header-v2">
                          <div>
                            <span className="sub-category-v2">{sub.category}</span>
                            <h4>{sub.product} {sub.variety && <small style={{ fontWeight: 'normal', color: '#666' }}>({sub.variety})</small>}</h4>
                          </div>
                          <span className={`status-badge-v2 ${sub.status}`}>{formatStatus(sub.status)}</span>
                        </div>
                        <div className="sub-body-v2">
                          <div className="sub-info-row-v2">
                            <span>Quantity: <strong>{sub.quantity}</strong></span>
                            <span>Grade: <strong>{sub.grade}</strong></span>
                          </div>
                          <div className="sub-info-row-v2">
                            <span>Price: <strong>{sub.price}</strong></span>
                            <span>Harvest: <strong>{formatSriLankanDate(sub.harvestDate)}</strong></span>
                            <span>&nbsp;&nbsp;Delivery: <strong>{formatSriLankanDate(sub.deliveryDate)}</strong></span>
                          </div>
                          {sub.storageInstructions && (
                            <div className="sub-info-row-v2" style={{ marginTop: '5px' }}>
                              <span style={{ fontSize: '0.85rem' }}>Storage: <em>{sub.storageInstructions}</em></span>
                            </div>
                          )}

                          {/* Render Submission Images */}
                          {sub.images && (
                            <div className="submission-images-preview" style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                              {(() => {
                                try {
                                  const parsedImages = typeof sub.images === 'string' ? JSON.parse(sub.images) : sub.images;
                                  if (Array.isArray(parsedImages)) {
                                    return parsedImages.map((img, idx) => (
                                      <img
                                        key={idx}
                                        src={`${config.API_BASE_URL.replace('/api', '')}${img}`}
                                        alt={`Product ${idx}`}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                        onClick={() => window.open(`${config.API_BASE_URL.replace('/api', '')}${img}`, '_blank')}
                                      />
                                    ));
                                  }
                                } catch (e) {
                                  return null;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                        <div className="sub-footer-v2">
                          {sub.status === 'selected' && sub.scheduleDate && (
                            <div className="confirmed-date-v2">
                              <p>Confirmed Pickup: {formatSriLankanDate(sub.scheduleDate)}</p>
                              <small className="notice-text">Review and manage in Delivery Schedule tab</small>
                            </div>
                          )}
                          {sub.status === 'confirmed' && (
                            <div className="schedule-confirmed-v2">
                              <FontAwesomeIcon icon={faCheckCircle} /> Scheduled for {formatSriLankanDate(sub.scheduleDate)}
                            </div>
                          )}
                          {sub.status === 'not-selected' && sub.rejectionReason && (
                            <div className="rejection-box-v2">
                              <p><strong>Note:</strong> {sub.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Delivery History Section */}
                <div className="section-header-standalone" style={{ marginTop: '3rem' }}>
                  <h2>Delivery History</h2>
                  <p>Historical records of your completed deliveries and payments.</p>
                </div>
                <div className="deliveries-container-v2">
                  <div className="deliveries-table-v2">
                    <div className="table-header-v2">
                      <div className="th-v2">Product</div>
                      <div className="th-v2">Quantity</div>
                      <div className="th-v2">Total Paid</div>
                      <div className="th-v2">Completion Date</div>
                      <div className="th-v2">Transport</div>
                      <div className="th-v2">Status</div>
                    </div>
                    {deliveryHistory.length === 0 ? (
                      <div className="table-empty-v2">No completed delivery records found.</div>
                    ) : (
                      deliveryHistory.map(history => (
                        <div key={history.id} className="table-row-v2 completed">
                          <div className="td-v2 font-bold">{history.product}</div>
                          <div className="td-v2">{history.quantity}</div>
                          <div className="td-v2">LKR {history.sellPrice}</div>
                          <div className="td-v2">{history.scheduleDate ? formatSriLankanDate(history.scheduleDate) : 'N/A'}</div>
                          <div className="td-v2">{formatTransport(history.transport)}</div>
                          <div className="td-v2">
                            <span className="delivery-tag-v2 completed">Completed</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deliveries' && (
              <div className="tab-pane-v2 fade-in">
                <div className="section-header-standalone">
                  <h2>Delivery Schedule</h2>
                  <p>Manage pickup times and logistics for your confirmed orders.</p>
                </div>
                <div className="deliveries-container-v2">
                  <div className="deliveries-table-v2">
                    <div className="table-header-v2">
                      <div className="th-v2">Product</div>
                      <div className="th-v2">Quantity</div>
                      <div className="th-v2">Sell Price</div>
                      <div className="th-v2">Scheduled Date</div>
                      <div className="th-v2">Transport</div>
                      <div className="th-v2">Status</div>
                      <div className="th-v2">Actions</div>
                    </div>
                    {deliveries.length === 0 ? (
                      <div className="table-empty-v2">No active deliveries scheduled.</div>
                    ) : (
                      deliveries.map(delivery => (
                        <div key={delivery.id} className={`table-row-v2 ${delivery.status}`}>
                          <div className="td-v2 font-bold">{delivery.product}</div>
                          <div className="td-v2">{delivery.quantity}</div>
                          <div className="td-v2">LKR {delivery.sellPrice}</div>
                          <div className="td-v2">{delivery.scheduleDate ? formatSriLankanDate(delivery.scheduleDate) : 'TBD'}</div>
                          <div className="td-v2">{formatTransport(delivery.transport)}</div>
                          <div className="td-v2">
                            <span className={`delivery-tag-v2 ${delivery.status}`}>{delivery.status}</span>
                          </div>
                          <div className="td-v2 text-center">
                            {(delivery.status === 'action required' && !delivery.proposedRescheduleDate) && (
                              <div className="action-btns-v2">
                                <button className="btn-confirm-v2" onClick={() => handleConfirmClick(delivery)}>
                                  <FontAwesomeIcon icon={faCheckCircle} /> Confirm
                                </button>
                                <button className="btn-reschedule-v2" onClick={() => handleRescheduleClick(delivery)}>
                                  <FontAwesomeIcon icon={faCalendarAlt} /> Reschedule
                                </button>
                              </div>
                            )}

                            {delivery.status === 'action required' && delivery.proposedRescheduleDate && (
                              <div className="reschedule-action-box">
                                <div className="reschedule-info">
                                  <FontAwesomeIcon icon={faExclamationTriangle} className="warn-icon" />
                                  <span>Employee proposed: <strong>{formatSriLankanDate(delivery.proposedRescheduleDate)}</strong></span>
                                </div>
                                <div className="action-btns-v2 compact">
                                  <button className="btn-confirm-v2" onClick={() => handleConfirmClick(delivery)}>
                                    Accept Date
                                  </button>
                                  <button className="btn-reschedule-v2" onClick={() => handleRescheduleClick(delivery)}>
                                    Reschedule Again
                                  </button>
                                </div>
                              </div>
                            )}

                            {delivery.status === 'confirmed' && (
                              <div className="status-badge-container">
                                <span className="status-text-v2 success">
                                  <FontAwesomeIcon icon={faCalendarCheck} /> Ready
                                </span>
                                <small className="status-subtext">
                                  {delivery.transport.toLowerCase().includes('self') ? 'Drop-off' : 'Pickup'} scheduled
                                </small>
                              </div>
                            )}
                            {(delivery.status === 'completed' || delivery.status === 'delivered') && (
                              <span className="status-text-v2 success">
                                <FontAwesomeIcon icon={faCheckCircle} /> Completed
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>


        {/* Reschedule Modal */}
        {isRescheduleModalOpen && (
          <div className="modal-overlay" onClick={() => setIsRescheduleModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Reschedule Delivery</h3>
                <button
                  className="modal-close"
                  onClick={() => setIsRescheduleModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleRescheduleSubmit}>
                <div className="modal-body">
                  <div className="delivery-info">
                    <p><strong>Delivery ID:</strong> {selectedDelivery?.id}</p>
                    <p><strong>Product:</strong> {selectedDelivery?.product}</p>
                    <p><strong>Quantity:</strong> {selectedDelivery?.quantity}</p>
                    <p><strong>Current Scheduled Date:</strong> {formatSriLankanDate(selectedDelivery?.scheduleDate)}</p>
                    <div className="form-group">
                      <CustomDateInput
                        label="Select New Delivery Date *"
                        required={true}
                        min={new Date().toISOString().split('T')[0]}
                        value={newDeliveryDate}
                        onChange={(val) => setNewDeliveryDate(val)}
                      />
                    </div>
                  </div>
                  <p className="reschedule-note">
                    ⓘ Your reschedule request will be sent to the employee dashboard for approval.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsRescheduleModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {isProfileModalOpen && (
          <div className="modal-overlay" onClick={handleCloseProfileModal}>
            <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>My Profile</h3>
                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseProfileModal}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                {isEditingProfile ? (
                  <form onSubmit={handleProfileUpdate} id="profile-edit-form">
                    <div className="profile-details-grid">
                      <div className="profile-detail-item full-width">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={editFormData.fullName}
                          onChange={handleEditChange}
                          required
                          className="edit-input"
                        />
                      </div>
                      <div className="profile-detail-item">
                        <label>Contact Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={editFormData.phone}
                          onChange={handleEditChange}
                          required
                          className="edit-input"
                        />
                      </div>
                      <div className="profile-detail-item">
                        <label>Email Address</label>
                        <p>{farmerProfile.email}</p>
                        <small>(Cannot be changed)</small>
                      </div>
                      <div className="profile-detail-item full-width">
                        <label>Address *</label>
                        <textarea
                          name="address"
                          value={editFormData.address}
                          onChange={handleEditChange}
                          required
                          rows="2"
                          className="edit-input"
                        ></textarea>
                      </div>
                      <div className="profile-detail-item">
                        <label>City *</label>
                        <input
                          type="text"
                          name="city"
                          value={editFormData.city}
                          onChange={handleEditChange}
                          required
                          className="edit-input"
                        />
                      </div>
                      <div className="profile-detail-item">
                        <label>Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={editFormData.postalCode}
                          onChange={handleEditChange}
                          className="edit-input"
                        />
                      </div>
                      <div className="profile-detail-item">
                        <label>District</label>
                        <input
                          type="text"
                          name="district"
                          value={editFormData.district}
                          onChange={handleEditChange}
                          className="edit-input"
                        />
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="profile-header-main">
                      <div className="profile-avatar">
                        <img src="/images/Logo.png" alt="Laklight Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                      </div>
                      <div className="profile-title-group">
                        <h4>{farmerProfile.fullName}</h4>
                        <p>{farmerProfile.farmName}</p>
                        <span className="approval-status status-approved" style={{ margin: '0.5rem 0' }}>✓ Verified Farmer</span>
                      </div>
                    </div>

                    <div className="profile-details-grid">
                      <div className="profile-detail-item">
                        <label>Farmer ID / License</label>
                        <p>{farmerProfile.licenseNumber || 'F-0001'}</p>
                      </div>
                      <div className="profile-detail-item">
                        <label>Contact Number</label>
                        <p>{farmerProfile.phone || 'N/A'}</p>
                      </div>
                      <div className="profile-detail-item">
                        <label>Email Address</label>
                        <p>{farmerProfile.email}</p>
                      </div>
                      <div className="profile-detail-item">
                        <label>Member Since</label>
                        <p>{farmerProfile.memberSince || 'Apr 2026'}</p>
                      </div>
                      <div className="profile-detail-item full-width">
                        <label>Full Address</label>
                        <p>
                          {farmerProfile.address}
                          {farmerProfile.city ? `, ${farmerProfile.city}` : ''}
                          {farmerProfile.district ? `, ${farmerProfile.district}` : ''}
                          {farmerProfile.postalCode ? ` (${farmerProfile.postalCode})` : ''}
                          {!farmerProfile.address && !farmerProfile.city && 'No address provided'}
                        </p>
                      </div>
                      <div className="profile-detail-item">
                        <label>Quality Rating</label>
                        <p>{farmerProfile.qualityRating || 'N/A'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                {isEditingProfile ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="profile-edit-form"
                      className="btn btn-primary"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsProfileModalOpen(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleEditToggle}
                    >
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <div className="footer-bottom">
            <p>&copy; 2024 Laklight Food Products. All rights reserved.</p>
          </div>
        </div>


      {/* Bank Details Modal */}
      {isBankModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBankModalOpen(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Bank Details for Payments</h3>
              <button className="modal-close" onClick={() => setIsBankModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleBankSubmit}>
              <div className="modal-body">
                <p className="reschedule-note">Enter your bank account information to receive secure payments from Laklight.</p>
                <div className="form-group">
                  <label>Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                    placeholder="Exact name as in bank book"
                  />
                </div>
                <div className="form-group">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    placeholder="e.g., Bank of Ceylon"
                  />
                </div>
                <div className="form-group">
                  <label>Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.branchName}
                    onChange={(e) => setBankDetails({ ...bankDetails, branchName: e.target.value })}
                    placeholder="e.g., Colombo Main"
                  />
                </div>
                <div className="form-group">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.accountNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^[0-9\b]+$/.test(val)) {
                        setBankDetails({ ...bankDetails, accountNumber: val });
                      }
                    }}
                    placeholder="Your account number"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsBankModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isBankLoading}>
                  {isBankLoading ? 'Saving...' : 'Save Bank Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>

  )
}

export default FarmerDashboard
