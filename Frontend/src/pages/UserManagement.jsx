import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { config } from '../config'
import './UserManagement.css'

function UserManagement() {
  const navigate = useNavigate()
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
          const data = await response.json();
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
  const [error, setError] = useState(null)

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        // Map backend fields to frontend model
        const mappedUsers = data.users.map(u => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          role: u.user_type, // Backend returns 'user_type'
          status: u.status,
          phone: u.phone,
          joinDate: new Date(u.join_date).toISOString().split('T')[0]
        }))
        setUsers(mappedUsers)
      } else {
        throw new Error(data.message || 'Failed to fetch users')
      }
    } catch (err) {
      console.error('Fetch users error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const [showModal, setShowModal] = useState(false)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...formData, id: u.id } : u))
    } else {
      setUsers([...users, { ...formData, id: Date.now() }])
    }
    setShowModal(false)
  }

  const handleApprove = async (id) => {
    if (!confirm('Approve this user account?')) return;
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
        alert('User approved successfully');
        fetchUsers(); // Refresh list
      } else {
        alert('Failed to approve user');
      }
    } catch (err) {
      console.error(err);
      alert('Error approving user');
    }
  }

  const handleReject = async (id) => {
    if (!confirm('Reject this user (set to inactive)?')) return;
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
        alert('User rejected successfully');
        fetchUsers();
      } else {
        alert('Failed to reject user');
      }
    } catch (err) {
      console.error(err);
      alert('Error rejecting user');
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${config.API_BASE_URL}/admin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          setUsers(users.filter(u => u.id !== id))
        } else {
          alert('Failed to delete user');
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting user');
      }
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    pending: users.filter(u => u.status === 'pending').length
  }

  return (
    <div className="user-management">
      <Header isLoggedIn={true} customLinks={adminLinks} />

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
            <button className="btn btn-secondary" onClick={() => alert('Export users')}>Export</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.admins}</div>
            <div className="stat-label">Administrators</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Approval</div>
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
              <button className="btn btn-primary" onClick={() => alert('Apply filters')}>Filter</button>
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
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="user-avatar">{user.name.charAt(0)}</div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td>{user.phone}</td>
                    <td>{user.joinDate}</td>
                    <td>
                      <div className="action-buttons">
                        {user.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-small" onClick={() => handleApprove(user.id)} style={{ backgroundColor: '#2e7d32', color: 'white' }}>Approve</button>
                            <button className="btn btn-danger btn-small" onClick={() => handleReject(user.id)} style={{ backgroundColor: '#c62828', color: 'white' }}>Reject</button>
                          </>
                        )}
                        <button className="btn btn-warning btn-small" onClick={() => openEditModal(user)}>Edit</button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDelete(user.id)}>Delete</button>
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
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                    <option value="customer">Customer</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
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
