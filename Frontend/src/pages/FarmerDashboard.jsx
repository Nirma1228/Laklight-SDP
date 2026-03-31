import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { config } from '../config'
import { useToast } from '../components/ToastNotification'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import {
  faBell, faCalendarAlt, faCamera, faCheckCircle,
  faFlagCheckered, faInfoCircle, faCalendarCheck,
  faHome, faPaperPlane, faHistory, faTruck, faUser,
  faCreditCard, faCog, faSignOutAlt, faQuestionCircle,
  faStar, faSeedling, faBoxes, faChevronRight, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'
import './FarmerDashboard.css'

// Utility: get today's date in YYYY-MM-DD
const getToday = () => new Date().toISOString().slice(0, 10);



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

function FarmerDashboard() {
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation()

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
    deliveryDate: '',
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
    accountHolderName: '',
    bankName: '',
    branchName: '',
    accountNumber: ''
  })
  const [isBankLoading, setIsBankLoading] = useState(false)
  const [isBankWarningDismissed, setIsBankWarningDismissed] = useState(false)
  const [activeTab, setActiveTab] = useState('home') // 'home', 'submit', 'submissions', 'deliveries'

  const [farmerProfile, setFarmerProfile] = useState({
    fullName: 'Loading...',
    farmName: 'Laklight Supplier',
    email: '',
    phone: '',
    address: '',
    licenseNumber: 'PENDING',
    memberSince: '',
    qualityRating: 'N/A'
  })

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    address: ''
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
          farmName: user.farmName || 'Laklight Supplier', // Backend might not have farmName yet, using fallback
          email: user.email,
          phone: user.phone,
          address: user.address,
          licenseNumber: user.licenseNumber || 'VERIFIED-001',
          memberSince: new Date(user.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          qualityRating: '4.8/5.0' // Placeholder as rating logic might be separate
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
        address: farmerProfile.address
      })
    }
    setIsEditingProfile(!isEditingProfile)
  }

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setIsEditingProfile(false); // Reset to view mode when closed
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${config.API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editFormData.fullName,
          phone: editFormData.phone,
          address: editFormData.address
        })
      })

      if (response.ok) {
        alert('Profile updated successfully!')
        setIsEditingProfile(false)
        fetchProfile() // Refresh profile data
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Connection error. Please try again later.')
    }
  }

  // Fetch submissions from database
  const fetchSubmissions = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/farmer/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedSubmissions = data.submissions.map(sub => ({
          id: sub.id,
          product: sub.product_name,
          grade: formatGrade(sub.grade),
          quantity: `${sub.quantity}${sub.unit || 'kg'}`,
          price: `LKR ${sub.custom_price || sub.price || '0'}`,
          harvestDate: sub.harvest_date ? new Date(sub.harvest_date).toISOString().split('T')[0] : '',
          status: sub.status || 'under-review',
          date: sub.created_at ? new Date(sub.created_at).toISOString().split('T')[0] : '',
          transport: formatTransport(sub.transport),
          category: sub.category,
          deliveryDate: sub.delivery_date ? new Date(sub.delivery_date).toISOString().split('T')[0] : '',
          proposedDate2: sub.proposed_date_2 ? new Date(sub.proposed_date_2).toISOString().split('T')[0] : '',
          proposedDate3: sub.proposed_date_3 ? new Date(sub.proposed_date_3).toISOString().split('T')[0] : '',
          rejectionReason: sub.rejection_reason || '',
          scheduleDate: sub.schedule_date ? new Date(sub.schedule_date).toISOString().split('T')[0] : ''
        }));
        setSubmissions(formattedSubmissions);
        // Update localStorage as backup
        localStorage.setItem('supplier_applications', JSON.stringify(formattedSubmissions));
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
          product: del.product || `${del.product_name} - ${formatGrade(del.grade_name || '')}`,
          quantity: `${del.quantity}${del.unit || 'kg'}`,
          proposedDate: del.proposedDate || '',
          scheduleDate: del.scheduleDate || '',
          transport: formatTransport(del.transport_method || del.transport),
          status: del.status || 'pending',
          proposedRescheduleDate: del.proposedRescheduleDate || null
        }));
        setDeliveries(formattedDeliveries);
        // Update localStorage as backup
        localStorage.setItem('delivery_list', JSON.stringify(formattedDeliveries));
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      // Fall back to localStorage if fetch fails
      const saved = localStorage.getItem('delivery_list');
      if (saved) {
        setDeliveries(JSON.parse(saved));
      }
    }
  };

  const [submissions, setSubmissions] = useState([
    { id: 101, product: 'Alphonso Mangoes', category: 'fruits', quantity: '500kg', price: 'LKR 450/kg', status: 'selected', date: '2024-03-15', grade: 'Grade A', scheduleDate: '2024-03-25' },
    { id: 102, product: 'Smooth Cayenne Pineapple', category: 'fruits', quantity: '200kg', price: 'LKR 300/unit', status: 'under-review', date: '2024-03-18', grade: 'Grade A' },
    { id: 103, product: 'Red Lady Papaya', category: 'fruits', quantity: '150kg', price: 'LKR 180/kg', status: 'not-selected', date: '2024-03-10', grade: 'Grade B', rejectionReason: 'Quantity too high for current demand.' },
  ]);

  const handleConfirmSubmission = (id) => {
    const updated = submissions.map(s =>
      s.id === id ? { ...s, status: 'confirmed' } : s
    )
    setSubmissions(updated)
    // Synchronize back to the shared storage
    localStorage.setItem('supplier_applications', JSON.stringify(updated))
    toast.success('✅ Delivery date confirmed! Your product is now scheduled for pickup.')
  }

  const handleRescheduleSubmission = (id, currentProposed) => {
    const newDate = window.prompt('Please enter your preferred reschedule date (YYYY-MM-DD):', currentProposed)
    if (newDate) {
      const updated = submissions.map(s =>
        s.id === id ? { ...s, scheduleDate: newDate, status: 'under-review' } : s
      )
      setSubmissions(updated)
      localStorage.setItem('supplier_applications', JSON.stringify(updated))
      toast.info('📅 Reschedule request sent! The operations team will review your suggested date.')
    }
  }

  const [deliveries, setDeliveries] = useState([
    { id: 'DEL-2041', product: 'Alphonso Mangoes', quantity: '500kg', scheduleDate: '2024-03-25', transport: 'company', status: 'pending' },
    { id: 'DEL-2038', product: 'Cavendish Bananas', quantity: '300kg', scheduleDate: '2024-03-20', transport: 'self', status: 'completed' },
  ]);

  // Check for updates and notify farmer on load
  useEffect(() => {
    // 1. Check for newly approved submissions
    const approvedCount = submissions.filter(s => s.status === 'selected').length;
    // 2. Check for rejected submissions
    const rejectedCount = submissions.filter(s => s.status === 'not-selected').length;
    // 3. Check for delivery schedules needing confirmation
    const negotiationCount = deliveries.filter(d => d.status === 'pending-confirmation').length;

    if (negotiationCount > 0) {
      setTimeout(() => alert(`🔔 Action Required: You have ${negotiationCount} delivery schedule(s) pending your confirmation. Please check the Delivery Schedule section.`), 1000);
    } else if (approvedCount > 0) {
      // Optional: only notify if we haven't acknowledged them? 
      // For simplicity, just a gentle reminder or rely on the visual badges.
    }
  }, []);

  // Auto-save deliveries to localStorage as backup
  useEffect(() => {
    if (deliveries.length > 0) {
      localStorage.setItem('delivery_list', JSON.stringify(deliveries))
    }
  }, [deliveries])

  // Fetch all data on mount
  useEffect(() => {
    fetchProfile();
    fetchBankDetails();
    fetchSubmissions();
    fetchDeliveries();
  }, []);

  // Check for notifications when submissions change
  useEffect(() => {
    submissions
      .filter(sub => sub.status === 'selected' || sub.status === 'not-selected')
      .forEach(sub => {
        const lastNotified = localStorage.getItem(`notified_${sub.id}`);
        if (lastNotified === sub.status) return; // Already notified for this status

        if (sub.status === 'selected') {
          toast.success(`Your product "${sub.product}" was selected!`);
        } else if (sub.status === 'not-selected') {
          toast.error(`Your product "${sub.product}" was not selected. Reason: ${sub.rejectionReason || 'No reason provided.'}`);
        }
        localStorage.setItem(`notified_${sub.id}`, sub.status);
      });
  }, [submissions]);

  const removeNotification = () => {}; // No longer needed but keeping dummy to prevent broken refs during cleanup

  const handleRescheduleClick = (delivery) => {
    setSelectedDelivery(delivery)
    setIsRescheduleModalOpen(true)
    // Set current scheduled date as default
    const currentDate = delivery.scheduleDate ? new Date(delivery.scheduleDate).toISOString().split('T')[0] : ''
    setNewDeliveryDate(currentDate)
  }

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
    }
    setProducts([...products, newProduct])
  }

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const updateProduct = (id, field, value) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

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

      const promises = validProducts.map(p => {
        // Prepare payload matching backend expectation
        const payload = {
          productName: p.name,
          category: p.category,
          quantity: p.quantity,
          unit: p.unit,
          grade: p.grade,
          customPrice: p.customPrice,
          harvestDate: p.harvestDate,
          transport: p.transport,
          deliveryDate: p.deliveryDate,
          proposedDate2: p.proposedDate2,
          proposedDate3: p.proposedDate3,
          notes: p.notes,
          images: [] // Placeholder until file upload is fully implemented
        }

        return fetch(`${config.API_BASE_URL}/farmer/submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
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
    <div className="farmer-dashboard">
      <Header
        isLoggedIn={true}
        customLinks={[
          { label: t('header.dashboard'), onClick: () => setActiveTab('home') },
          { label: t('header.myProducts'), onClick: () => setActiveTab('submissions') },
          { label: t('header.deliveries'), onClick: () => setActiveTab('deliveries') },
          { label: t('header.bankDetails'), onClick: () => setIsBankModalOpen(true) },
          { label: t('header.profile'), onClick: () => setIsProfileModalOpen(true) }
        ]}
      />

      {/* Dashboard Main Layout */}
      <div className="dashboard-container-v2">
        {/* Sidebar */}
        <aside className="dashboard-sidebar-v2">
          <div className="sidebar-brand">
            <FontAwesomeIcon icon={faSeedling} className="brand-icon" />
            <span>Laklight Farmer</span>
          </div>

          <nav className="sidebar-nav-v2">
            <button
              className={`nav-item-v2 ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <FontAwesomeIcon icon={faHome} />
              <span>{t('farmerDashboard.sidebar.home') || 'Home'}</span>
            </button>
            <button
              className={`nav-item-v2 ${activeTab === 'submit' ? 'active' : ''}`}
              onClick={() => setActiveTab('submit')}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              <span>{t('farmerDashboard.sidebar.submit') || 'Submit Stock'}</span>
            </button>
            <button
              className={`nav-item-v2 ${activeTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              <FontAwesomeIcon icon={faHistory} />
              <span>{t('farmerDashboard.sidebar.submissions') || 'History'}</span>
            </button>
            <button
              className={`nav-item-v2 ${activeTab === 'deliveries' ? 'active' : ''}`}
              onClick={() => setActiveTab('deliveries')}
            >
              <FontAwesomeIcon icon={faTruck} />
              <span>{t('farmerDashboard.sidebar.deliveries') || 'Deliveries'}</span>
            </button>
          </nav>

          <div className="sidebar-divider"></div>

          <nav className="sidebar-nav-v2 secondary">
            <button className="nav-item-v2" onClick={() => setIsProfileModalOpen(true)}>
              <FontAwesomeIcon icon={faUser} />
              <span>{t('farmerDashboard.sidebar.profile') || 'My Profile'}</span>
            </button>
            <button className="nav-item-v2" onClick={() => setIsBankModalOpen(true)}>
              <FontAwesomeIcon icon={faCreditCard} />
              <span>{t('farmerDashboard.sidebar.bank') || 'Payment Setup'}</span>
            </button>
            <button className="nav-item-v2" onClick={() => navigate('/support')}>
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span>{t('farmerDashboard.sidebar.support') || 'Support'}</span>
            </button>
          </nav>

          <div className="sidebar-footer-v2">
            <button className="logout-btn-v2" onClick={() => {
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              navigate('/login');
            }}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>{t('farmerDashboard.sidebar.logout') || 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main-v2">
          {/* Top Banner Notifications */}
          <div className="dashboard-top-notifs">
            {!bankDetails.accountNumber && !isBankWarningDismissed && (
              <div className="top-banner-v2 warning">
                <div className="banner-icon"><FontAwesomeIcon icon={faExclamationTriangle} /></div>
                <div className="banner-content">
                  <strong>Payment Setup Required:</strong> Please enter your bank details to ensure you can receive secure payments.
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
                    <div className="hero-badge-v2">Welcome back, {farmerProfile.fullName.split(' ')[0]}!</div>
                    <h1 className="hero-title-v2">Manage Your Harvest Smarter</h1>
                    <p className="hero-subtitle-v2">Track your fresh produce submissions and logistics from one central dashboard.</p>
                    <div className="hero-actions-v2">
                      <button className="hero-btn-primary" onClick={() => setActiveTab('submit')}>
                        <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: '8px' }} />
                        Submit New Produce
                      </button>
                      <button className="hero-btn-secondary" onClick={() => setActiveTab('deliveries')}>
                        <FontAwesomeIcon icon={faTruck} style={{ marginRight: '8px' }} />
                        View Deliveries
                      </button>
                    </div>
                  </div>
                </section>

                {/* Quick Stats Row */}
                <div className="stats-row-v2">
                  <div className="stat-card-v2">
                    <div className="stat-icon-v2 blue"><FontAwesomeIcon icon={faBoxes} /></div>
                    <div className="stat-info-v2">
                      <span className="stat-value-v2">{submissions.length}</span>
                      <span className="stat-label-v2">Total Submitted</span>
                    </div>
                  </div>
                  <div className="stat-card-v2">
                    <div className="stat-icon-v2 green"><FontAwesomeIcon icon={faCheckCircle} /></div>
                    <div className="stat-info-v2">
                      <span className="stat-value-v2">{submissions.filter(s => s.status === 'selected').length}</span>
                      <span className="stat-label-v2">Accepted Stocks</span>
                    </div>
                  </div>
                  <div className="stat-card-v2">
                    <div className="stat-icon-v2 orange"><FontAwesomeIcon icon={faTruck} /></div>
                    <div className="stat-info-v2">
                      <span className="stat-value-v2">{deliveries.filter(d => d.status === 'pending').length}</span>
                      <span className="stat-label-v2">Pending Logistics</span>
                    </div>
                  </div>
                  <div className="stat-card-v2">
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
                              <span className="activity-date-v2">{sub.date}</span>
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
                        <div className="notice-item-v2 info">
                          <FontAwesomeIcon icon={faInfoCircle} />
                          <span>Seasonal produce requirements updated for next month</span>
                        </div>
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
                              <label>{t('farmerDashboard.submitProductSection.form.productType') || 'Product Type *'}</label>
                              <select
                                required
                                value={product.category}
                                onChange={(e) => updateProduct(product.id, 'category', e.target.value)}
                              >
                                <option value="">{t('farmerDashboard.submitProductSection.form.selectType') || 'Select Type'}</option>
                                <option value="fruits">{t('farmerDashboard.submitProductSection.form.fruits') || 'Fruits'}</option>
                                <option value="vegetables">{t('farmerDashboard.submitProductSection.form.vegetables') || 'Vegetables'}</option>
                                <option value="dairy">{t('farmerDashboard.submitProductSection.form.dairy') || 'Dairy'}</option>
                                <option value="grains">{t('farmerDashboard.submitProductSection.form.grains') || 'Grains'}</option>
                                <option value="other">{t('farmerDashboard.submitProductSection.form.other') || 'Other'}</option>
                              </select>
                            </div>

                            <div className="form-group-v2">
                              <label>{t('farmerDashboard.submitProductSection.form.productName') || 'Produce Name *'}</label>
                              <input
                                type="text"
                                required
                                value={product.name}
                                onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                placeholder={t('farmerDashboard.submitProductSection.form.productNamePlaceholder') || 'e.g. Mangoes'}
                              />
                            </div>

                            <div className="form-group-v2">
                              <label>{t('farmerDashboard.submitProductSection.form.variety') || 'Variety'}</label>
                              <input
                                type="text"
                                value={product.variety || ''}
                                onChange={(e) => updateProduct(product.id, 'variety', e.target.value)}
                                placeholder={t('farmerDashboard.submitProductSection.form.varietyPlaceholder') || 'e.g. Alphonso'}
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
                              <label>Expected Price (LKR per unit)</label>
                              <input
                                type="number"
                                value={product.customPrice}
                                onChange={(e) => updateProduct(product.id, 'customPrice', e.target.value)}
                                placeholder="Optional"
                              />
                            </div>

                            <div className="form-group-v2">
                              <label>Harvest Date *</label>
                              <input
                                type="date"
                                required
                                value={product.harvestDate || ''}
                                onChange={(e) => updateProduct(product.id, 'harvestDate', e.target.value)}
                              />
                            </div>

                            <div className="form-group-v2">
                              <label>Quality Grade *</label>
                              <select
                                required
                                value={product.grade || ''}
                                onChange={(e) => updateProduct(product.id, 'grade', e.target.value)}
                              >
                                <option value="">Select Grade</option>
                                <option value="grade-a">Grade A (Premium)</option>
                                <option value="grade-b">Grade B (Standard)</option>
                                <option value="grade-c">Grade C (Processing)</option>
                              </select>
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
                              <label>Preferred Delivery Dates (Pick 3)</label>
                              <div className="date-selection-v2">
                                <input
                                  type="date"
                                  required
                                  value={product.deliveryDate}
                                  onChange={(e) => updateProduct(product.id, 'deliveryDate', e.target.value)}
                                />
                                <input
                                  type="date"
                                  value={product.proposedDate2}
                                  onChange={(e) => updateProduct(product.id, 'proposedDate2', e.target.value)}
                                />
                                <input
                                  type="date"
                                  value={product.proposedDate3}
                                  onChange={(e) => updateProduct(product.id, 'proposedDate3', e.target.value)}
                                />
                              </div>
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
                            <h4>{sub.product}</h4>
                          </div>
                          <span className={`status-badge-v2 ${sub.status}`}>{sub.status}</span>
                        </div>
                        <div className="sub-body-v2">
                          <div className="sub-info-row-v2">
                            <span>Quantity: <strong>{sub.quantity}</strong></span>
                            <span>Grade: <strong>{sub.grade}</strong></span>
                          </div>
                          <div className="sub-info-row-v2">
                            <span>Price: <strong>{sub.price}</strong></span>
                            <span>Harvest: <strong>{sub.harvestDate}</strong></span>
                          </div>
                        </div>
                        <div className="sub-footer-v2">
                          {sub.status === 'selected' && sub.scheduleDate && (
                            <div className="confirmed-date-v2">
                              <p>Confirmed Pickup: {sub.scheduleDate}</p>
                              <div className="footer-actions">
                                <button className="btn-confirm-mini" onClick={() => handleConfirmSubmission(sub.id)}>Confirm</button>
                                <button className="btn-reschedule-mini" onClick={() => handleRescheduleSubmission(sub.id, sub.scheduleDate)}>Reschedule</button>
                              </div>
                            </div>
                          )}
                          {sub.status === 'confirmed' && (
                            <div className="schedule-confirmed-v2">
                              <FontAwesomeIcon icon={faCheckCircle} /> Scheduled for {sub.scheduleDate}
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
                      <div className="th-v2">Scheduled Date</div>
                      <div className="th-v2">Transport</div>
                      <div className="th-v2">Status</div>
                      <div className="th-v2">Actions</div>
                    </div>
                    {deliveries.length === 0 ? (
                      <div className="table-empty-v2">No active deliveries scheduled.</div>
                    ) : (
                      deliveries.map(delivery => (
                        <div key={delivery.id} className="table-row-v2">
                          <div className="td-v2 font-bold">{delivery.product}</div>
                          <div className="td-v2">{delivery.quantity}</div>
                          <div className="td-v2">{delivery.scheduleDate || 'TBD'}</div>
                          <div className="td-v2">{formatTransport(delivery.transport)}</div>
                          <div className="td-v2">
                            <span className={`delivery-tag-v2 ${delivery.status}`}>{delivery.status}</span>
                          </div>
                          <div className="td-v2">
                            {delivery.status === 'pending' && !delivery.proposedRescheduleDate && (
                              <div className="action-btns-v2">
                                <button className="btn-confirm-v2" onClick={() => handleConfirmClick(delivery)}>Confirm</button>
                                <button className="btn-reschedule-v2" onClick={() => handleRescheduleClick(delivery)}>Reschedule</button>
                              </div>
                            )}
                            {delivery.status === 'confirmed' && <span className="status-text-v2">Awaiting Pickup</span>}
                            {delivery.status === 'completed' && <span className="status-text-v2 success">Completed</span>}
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

      {/* Wrap the following in a fragment to fix adjacent JSX error */}
      <>
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
                    <p><strong>Current Scheduled Date:</strong> {selectedDelivery?.scheduleDate}</p>
                  </div>
                  <div className="form-group">
                    <label htmlFor="newDeliveryDate">Select New Delivery Date *</label>
                    <input
                      type="date"
                      id="newDeliveryDate"
                      value={newDeliveryDate}
                      onChange={(e) => setNewDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
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
                          rows="3"
                          className="edit-input"
                        ></textarea>
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
                        <p>{farmerProfile.licenseNumber}</p>
                      </div>
                      <div className="profile-detail-item">
                        <label>Contact Number</label>
                        <p>{farmerProfile.phone}</p>
                      </div>
                      <div className="profile-detail-item">
                        <label>Email Address</label>
                        <p>{farmerProfile.email}</p>
                      </div>
                      <div className="profile-detail-item">
                        <label>Member Since</label>
                        <p>{farmerProfile.memberSince}</p>
                      </div>
                      <div className="profile-detail-item full-width">
                        <label>Address</label>
                        <p>{farmerProfile.address}</p>
                      </div>
                      <div className="profile-detail-item">
                        <label>Quality Rating</label>
                        <p>{farmerProfile.qualityRating}</p>
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
        {/* Adjacent JSX fix with fragment closure */}
      </>

      {/* Bank Details Modal */}
      {isBankModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBankModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
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
  )
}

export default FarmerDashboard
