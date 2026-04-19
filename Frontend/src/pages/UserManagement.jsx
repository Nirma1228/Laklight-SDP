import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { useToast } from '../components/ToastNotification'
import { config } from '../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers, faBoxes, faShoppingCart, faUserTie, faChartBar
} from '@fortawesome/free-solid-svg-icons'
import './UserManagement.css'

function UserManagement() {
  const navigate = useNavigate()
  const { success, error, info } = useToast()
  const [adminName, setAdminName] = useState(localStorage.getItem('userName') || 'Administrator');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${config.API_BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setAdminName(data.user.full_name);
            localStorage.setItem('userName', data.user.full_name);
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  const adminLinks = [
    { label: 'Admin Home', path: '/admin-dashboard' },
    { label: 'User Management', path: '/admin/users' },
    { label: 'Inventory', path: '/admin/inventory' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Suppliers', path: '/admin/suppliers' },
    { label: 'Reports', path: '/admin/reports' }
  ];
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Fetching users from:', `${config.API_BASE_URL}/admin/users`);
      
      const response = await fetch(`${config.API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      console.log('User management response status:', response.status);

      if (response.status === 401 || response.status === 403) {
        console.warn('Unauthorized access. Redirecting to login...');
        navigate('/login');
        return;
      }

      const data = await response.json()
      console.log('User management raw data:', data);
      
      const usersList = data.users || data.data || (Array.isArray(data) ? data : []);
      console.log('Users list length:', usersList.length);

      if (usersList.length > 0) {
        const mappedUsers = usersList.map(u => ({
          id: u.id || u.user_id,
          name: u.full_name || u.name || 'Unknown User',
          email: u.email || 'No Email',
          role: (u.user_type || u.role || 'customer').toString().toLowerCase(),
          status: (u.status || 'active').toString().toLowerCase(),
          phone: u.phone || 'N/A',
          address: u.address || '',
          location: u.address || 'N/A',
          profileImage: u.profile_image,
          lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
          joinDate: u.join_date ? new Date(u.join_date).toISOString().split('T')[0] : 'N/A'
        }))
        console.log('Mapped users:', mappedUsers);
        setUsers(mappedUsers)
      } else {
        console.log('No users returned from API');
        setUsers([])
      }
    } catch (err) {
      console.error('Fetch users error:', err)
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const [showModal, setShowModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: null, type: 'danger' })
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active',
    phone: '',
    joinDate: ''
  })

  const openAddModal = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '', role: '', status: 'active', phone: '', joinDate: new Date().toISOString().split('T')[0] })
    setShowModal(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData(user)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      let response;
      if (editingUser) {
        // Update existing user
        response = await fetch(`${config.API_BASE_URL}/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fullName: formData.name,
            phone: formData.phone
          })
        })
      } else {
        // Add new user
        const password = prompt('Enter password for new user:');
        if (!password) {
          setLoading(false);
          return;
        }
        response = await fetch(`${config.API_BASE_URL}/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: password,
            role: formData.role
          })
        })
      }

      const data = await response.json()
      if (data.success) {
        success(editingUser ? 'User updated successfully' : 'User created successfully')
        setShowModal(false)
        fetchUsers() // Refresh list
      } else {
        error(data.message || 'Action failed')
      }
    } catch (err) {
      console.error('Submit user error:', err)
      error('Error saving user')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setConfirmConfig({
      title: 'Approve User',
      message: 'Are you sure you want to approve this user account and set it to active?',
      type: 'success',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`${config.API_BASE_URL}/admin/users/${id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'active' })
          })
          if (response.ok) {
            success('User approved successfully');
            fetchUsers();
          } else {
            error('Failed to approve user');
          }
        } catch (err) { 
          console.error(err); 
          error('Error during approval');
        }
        setShowConfirmModal(false);
      }
    })
    setShowConfirmModal(true)
  }

  const handleReject = async (id) => {
    setConfirmConfig({
      title: 'Reject User',
      message: 'Are you sure you want to reject this user? This will set their account to inactive.',
      type: 'warning',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`${config.API_BASE_URL}/admin/users/${id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'inactive' })
          })
          if (response.ok) {
            success('User rejected successfully');
            fetchUsers();
          } else {
            error('Failed to reject user');
          }
        } catch (err) { 
          console.error(err); 
          error('Error during rejection');
        }
        setShowConfirmModal(false);
      }
    })
    setShowConfirmModal(true)
  }

  const handleDelete = async (id) => {
    setConfirmConfig({
      title: 'Delete User',
      message: 'Are you sure you want to permanently delete this user? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`${config.API_BASE_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (response.ok) {
            success('User deleted successfully');
            setUsers(users.filter(u => u.id !== id))
          } else {
            error('Failed to delete user');
          }
        } catch (err) { 
          console.error(err); 
          error('Error during deletion');
        }
        setShowConfirmModal(false);
      }
    })
    setShowConfirmModal(true)
  }

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      if (response.ok || data.success) {
        success(`Account status updated to ${newStatus}`);
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      } else {
        error(data.message || 'Status update failed');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      error('Error updating status');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    const name = user.name ? user.name.toLowerCase() : '';
    const email = user.email ? user.email.toLowerCase() : '';
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    
    // Debug log for one user to see why it might be filtered out
    if (users.indexOf(user) === 0) {
      console.log('Filter Check for', user.name, ':', {
        role: user.role,
        roleFilter,
        status: user.status,
        statusFilter,
        matchesSearch
      });
    }

    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    pending: users.filter(u => u.status === 'pending').length
  }

  return (
    <div className="user-management">
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

      {/* Main Content */}
      <div className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">👥 User Management</h1>
            <p className="page-description">Manage system users, roles, and permissions</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={openAddModal}>+ Add User</button>
            <button className="btn btn-secondary" onClick={() => info('Export functionality coming soon')}>Export</button>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-row">
            <div className="form-group">
              <label>Search Users</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div style={{ paddingTop: '1.7rem' }}>
              <button className="btn btn-primary" onClick={() => info('Filters applied')}>Filter</button>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="user-table-section">
          <div className="section-header">
            <h2 className="section-title">All Users ({filteredUsers.length})</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User Profile</th>
                  <th>Contact Info</th>
                  <th>Role & Status</th>
                  <th>Account Status</th>
                  <th>Primary Address</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td><span className="user-id-text" style={{ fontWeight: '700', color: '#1a56db' }}>#{user.id.toString().padStart(4, '0')}</span></td>
                    <td>
                      <div className="user-profile-cell" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="user-avatar-img" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div className="user-avatar" style={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info-cell">
                        <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{user.email}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.phone}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span className={`role-badge role-${user.role.toLowerCase()}`} style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                          {user.role}
                        </span>
                        <span className={`status-badge status-${user.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="status-toggle-container">
                        <label className="status-toggle">
                          <input 
                            type="checkbox" 
                            checked={user.status === 'active'}
                            onChange={() => handleToggleStatus(user)}
                          />
                          <span className="slider round"></span>
                        </label>
                        <span className={`status-text ${user.status}`}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="location-cell" style={{ fontSize: '0.8rem', maxWidth: '180px' }}>
                        <div style={{ color: '#1e293b', fontWeight: '500', marginBottom: '2px' }}>{user.location}</div>
                        <div style={{ color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.address}>{user.address}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>{user.joinDate}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {user.status === 'pending' && (
                          <button className="btn btn-success btn-small" onClick={() => handleApprove(user.id)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: '600' }}>Approve</button>
                        )}
                        <button className="btn-icon-edit" onClick={() => openEditModal(user)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} title="Edit User">✎</button>
                        <button className="btn-icon-delete" onClick={() => handleDelete(user.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} title="Delete User">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                {!editingUser && (
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="officer">Officer</option>
                    <option value="delivery">Delivery</option>
                    <option value="farmer">Farmer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Join Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal show confirm-modal">
          <div className="modal-content confirm-modal-content">
            <div className={`modal-header confirm-header-${confirmConfig.type}`}>
              <h2 className="modal-title">
                <i className={`fas ${confirmConfig.type === 'danger' ? 'fa-exclamation-triangle' : 
                                  confirmConfig.type === 'success' ? 'fa-check-circle' : 'fa-question-circle'} confirm-icon`}></i>
                {confirmConfig.title}
              </h2>
              <button className="modal-close" onClick={() => setShowConfirmModal(false)}>&times;</button>
            </div>
            <div className="modal-body confirm-modal-body">
              <p>{confirmConfig.message}</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={`btn btn-${confirmConfig.type}`} 
                onClick={confirmConfig.onConfirm}
              >
                Confirm
              </button>
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
    </div>
  )
}

export default UserManagement
