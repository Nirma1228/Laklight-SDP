import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './UserManagement.css'

function UserManagement() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([
    { id: 1, name: 'Hirun Perera', email: 'Hirun@laklight.com', role: 'admin', status: 'active', phone: '0771234567', joinDate: '2023-01-15' },
    { id: 2, name: 'Sarah Fdo', email: 'sarah@laklight.com', role: 'employee', status: 'active', phone: '0772345678', joinDate: '2023-02-20' },
    { id: 3, name: 'Asoka Perera', email: 'asoka@email.com', role: 'customer', status: 'active', phone: '0773456789', joinDate: '2023-05-10' },
    { id: 4, name: 'Kamal Herath', email: 'Kamal@farm.lk', role: 'supplier', status: 'active', phone: '0774567890', joinDate: '2023-03-15' },
    { id: 5, name: 'Sachini Bandara', email: 'Sachini@laklight.com', role: 'employee', status: 'active', phone: '0775678901', joinDate: '2023-06-01' },
    { id: 6, name: 'Dwini Adikari', email: 'duwini@supplier.lk', role: 'supplier', status: 'pending', phone: '0776789012', joinDate: '2024-01-10' },
    { id: 7, name: 'Kusal Rathnayake', email: 'Kusal@email.com', role: 'customer', status: 'inactive', phone: '0777890123', joinDate: '2022-12-05' }
  ])

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

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id))
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
      {/* Header */}
      <div className="header">
        <div className="nav-container">
          <div className="logo">
            <span>🌿</span>
            Laklight Food Products
          </div>
          <div className="user-info">
            <span className="admin-badge">ADMIN</span>
            <span>Administrator</span>
            <button className="btn btn-secondary" onClick={() => navigate('/admin-dashboard')}>Dashboard</button>
          </div>
        </div>
      </div>

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
