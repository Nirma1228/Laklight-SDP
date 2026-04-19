import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { config } from '../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBoxes, faLeaf, faCubes,
  faExclamationCircle, faExclamationTriangle, faClock
} from '@fortawesome/free-solid-svg-icons'
import './AdminInventory.css'

function AdminInventory() {
  const navigate = useNavigate()

  // ── State ──────────────────────────────────────────────────────────────
  const [inventorySubTab, setInventorySubTab] = useState('farmer')
  const [farmerProducts, setFarmerProducts]   = useState([])
  const [finishedProducts, setFinishedProducts] = useState([])
  const [isLoading, setIsLoading]             = useState(true)

  const [searchTerm,    setSearchTerm]    = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [sortFilter,    setSortFilter]    = useState('')

  // Edit modal state (mirrors Employee "Update Status" modal)
  const [isEditModalOpen,  setIsEditModalOpen]  = useState(false)
  const [editingBatch,     setEditingBatch]      = useState(null)   // { productName, batchId, type, currentStock, currentLocation }
  const [editQty,          setEditQty]           = useState('')
  const [editLoc,          setEditLoc]           = useState('')
  const [editSaving,       setEditSaving]        = useState(false)
  const [editMsg,          setEditMsg]           = useState({ text: '', type: '' })

  const adminLinks = [
    { label: 'Admin Home',      path: '/admin-dashboard' },
    { label: 'User Management', path: '/admin/users'     },
    { label: 'Inventory',       path: '/admin/inventory' },
    { label: 'Orders',          path: '/admin/orders'    },
    { label: 'Suppliers',       path: '/admin/suppliers' },
    { label: 'Reports',         path: '/admin/reports'   },
  ]

  // ── Fetch & transform inventory ────────────────────────────────────────
  const fetchInventory = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const res   = await fetch(`${config.API_BASE_URL}/employee/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data  = await res.json()

      if (data.success) {
        // Group raw items into product → batches[]
        const rawMap = {}
        ;(data.raw || []).forEach(item => {
          const key = item.material_name;
          if (!rawMap[key]) {
            // Use material_name as a base for the ID to ensure uniqueness across products
            rawMap[key] = { id: `prod-${key.replace(/\s+/g, '-').toLowerCase()}`, name: key, category: 'raw', batches: [] }
          }
          const expDate     = item.expiry_date ? new Date(item.expiry_date) : null
          const daysUntilExpiry = expDate
            ? Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24))
            : 999
          const stockNum    = Number(item.quantity_units) || 0
          const unit        = item.unit_name || 'kg'

          rawMap[key].batches.push({
            id:            item.raw_inventory_id,
            location:      item.storage_location || 'Unknown',
            grade:         item.grade || 'N/A',
            stock:         `${stockNum} ${unit}`,
            stockRaw:      stockNum,
            receivedDate:  item.received_date
              ? new Date(item.received_date).toISOString().split('T')[0]
              : '—',
            expiry: expDate ? expDate.toISOString().split('T')[0] : '—',
            daysUntilExpiry,
          })
        })
        setFarmerProducts(Object.values(rawMap))

        // Group finished items into product → batches[]
        const finMap = {}
        ;(data.finished || []).forEach(item => {
          const key = item.name
          if (!finMap[key]) {
            // Use name as a base for the ID to ensure uniqueness across products
            finMap[key] = { id: `fin-${key.replace(/\s+/g, '-').toLowerCase()}`, name: key, category: 'processed', batches: [] }
          }
          finMap[key].batches.push({
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
          })
        })
        setFinishedProducts(Object.values(finMap))
      }
    } catch (err) {
      console.error('Inventory fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchInventory() }, [])

  // ── Update Status handler (opens modal) ───────────────────────────────
  const openUpdateModal = (productName, batch, type) => {
    setEditingBatch({
      productName,
      batchId:         batch.id,
      type,
      currentStock:    batch.stockRaw ?? batch.quantity,
      currentLocation: batch.location,
    })
    setEditQty(String(batch.stockRaw ?? batch.quantity))
    setEditLoc(batch.location)
    setEditMsg({ text: '', type: '' })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingBatch) return
    setEditSaving(true)
    try {
      const token   = localStorage.getItem('token') || sessionStorage.getItem('token')
      const typeStr = editingBatch.type === 'raw' ? 'raw' : 'finished'
      const res     = await fetch(`${config.API_BASE_URL}/employee/inventory/${editingBatch.batchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: editQty, location: editLoc, type: typeStr })
      })
      const data = await res.json()
      if (data.success) {
        setEditMsg({ text: 'Updated successfully!', type: 'success' })
        setTimeout(() => {
          setIsEditModalOpen(false)
          fetchInventory()
        }, 1000)
      } else {
        setEditMsg({ text: data.message || 'Update failed.', type: 'error' })
      }
    } catch (err) {
      console.error(err)
      setEditMsg({ text: 'Connection error.', type: 'error' })
    } finally {
      setEditSaving(false)
    }
  }

  const handleAddFruit = async () => {
    const name       = prompt('Fruit / Raw Material Name:'); if (!name) return
    const categoryId = prompt('Category ID (e.g., 2 for Fruits):', '2'); if (!categoryId) return
    const quantity   = prompt('Quantity:', '0'); if (!quantity) return
    const unitId     = prompt('Unit ID (e.g., 1 for kg):', '1'); if (!unitId) return
    const location   = prompt('Storage Location:', 'Cold Storage A'); if (!location) return
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const res   = await fetch(`${config.API_BASE_URL}/employee/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          type: 'raw', name, categoryId, quantity, unitId, location,
          batch:      `B${new Date().toISOString().slice(0,7).replace('-','')}`,
          expiryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
        })
      })
      const data = await res.json()
      if (data.success) { alert('Added successfully'); fetchInventory() }
      else alert(data.message || 'Failed to add')
    } catch (err) { console.error(err); alert('Failed to add item') }
  }

  // ── Filtering & sorting ────────────────────────────────────────────────
  const filteredFarmerProducts = useMemo(() => {
    return farmerProducts
      .filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
        const totalStock  = p.batches.reduce((s, b) => s + (b.stockRaw || 0), 0)
        let matchStatus   = true
        if (statusFilter === 'in-stock')     matchStatus = totalStock >= 50
        if (statusFilter === 'low-stock')    matchStatus = totalStock < 50 && totalStock > 0
        if (statusFilter === 'out-of-stock') matchStatus = totalStock === 0
        return matchSearch && matchStatus
      })
      .sort((a, b) => {
        if (sortFilter === 'name-asc')  return a.name.localeCompare(b.name)
        if (sortFilter === 'name-desc') return b.name.localeCompare(a.name)
        const tA = a.batches.reduce((s, b) => s + (b.stockRaw || 0), 0)
        const tB = b.batches.reduce((s, b) => s + (b.stockRaw || 0), 0)
        if (sortFilter === 'low-stock-priority') {
          const pri = batches => batches.some(b => b.daysUntilExpiry <= 5) ? 3
            : batches.some(b => b.stockRaw < 50) ? 2 : 1
          return pri(b.batches) - pri(a.batches) || tA - tB
        }
        if (sortFilter === 'stock-low')  return tA - tB
        if (sortFilter === 'stock-high') return tB - tA
        return 0
      })
  }, [farmerProducts, searchTerm, statusFilter, sortFilter])

  const filteredFinishedProducts = useMemo(() => {
    return finishedProducts
      .filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
        const totalUnits  = p.batches.reduce((s, b) => s + (b.quantity || 0), 0)
        let matchStatus   = true
        if (statusFilter === 'in-stock')     matchStatus = totalUnits >= 50
        if (statusFilter === 'low-stock')    matchStatus = totalUnits < 50 && totalUnits > 0
        if (statusFilter === 'out-of-stock') matchStatus = totalUnits === 0
        return matchSearch && matchStatus
      })
      .sort((a, b) => {
        if (sortFilter === 'name-asc')  return a.name.localeCompare(b.name)
        if (sortFilter === 'name-desc') return b.name.localeCompare(a.name)
        const tA = a.batches.reduce((s, b) => s + (b.quantity || 0), 0)
        const tB = b.batches.reduce((s, b) => s + (b.quantity || 0), 0)
        if (sortFilter === 'stock-low')  return tA - tB
        if (sortFilter === 'stock-high') return tB - tA
        return 0
      })
  }, [finishedProducts, searchTerm, statusFilter, sortFilter])

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="admin-inventory">
      <Header isLoggedIn={true} customLinks={adminLinks} />

      <div className="ai-main">

        {/* Page header */}
        <div className="ai-page-header">
          <h1 className="ai-page-title">Complete Inventory Control</h1>
          <p className="ai-page-desc">Monitor raw materials and finished products — track stock levels, locations and expiry dates</p>
        </div>

        {/* Card */}
        <div className="ai-card">

          {/* ── Search & Filters (identical to Employee) ── */}
          <div className="inventory-search">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button className="btn-search">Search</button>
            </div>
            <div className="inventory-filters">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
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
                onChange={e => setSortFilter(e.target.value)}
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

          {/* ── Sub-tab toggle (identical to Employee) ── */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e8f5e9', paddingBottom: '0.5rem' }}>
            <button
              onClick={() => setInventorySubTab('farmer')}
              style={{
                padding: '0.4rem 1.25rem', borderRadius: '8px', border: 'none',
                fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                background: inventorySubTab === 'farmer' ? '#2e7d32' : '#f1f5f9',
                color:      inventorySubTab === 'farmer' ? '#fff'    : '#475569',
                boxShadow:  inventorySubTab === 'farmer' ? '0 2px 8px rgba(46,125,50,0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <FontAwesomeIcon icon={faLeaf} style={{ marginRight: '0.4rem' }} />
              Farmer Products
            </button>
            <button
              onClick={() => setInventorySubTab('finished')}
              style={{
                padding: '0.4rem 1.25rem', borderRadius: '8px', border: 'none',
                fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                background: inventorySubTab === 'finished' ? '#2e7d32' : '#f1f5f9',
                color:      inventorySubTab === 'finished' ? '#fff'    : '#475569',
                boxShadow:  inventorySubTab === 'finished' ? '0 2px 8px rgba(46,125,50,0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <FontAwesomeIcon icon={faCubes} style={{ marginRight: '0.4rem' }} />
              Finished Products
            </button>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Loading inventory…</div>
          ) : (
            <>
              {/* ══════════════ FARMER PRODUCTS ══════════════ */}
              {inventorySubTab === 'farmer' && (
                <div className="inventory-column" style={{ width: '100%' }}>
                  {/* Full-width Add button */}
                  <button
                    className="ai-add-btn"
                    onClick={handleAddFruit}
                  >
                    <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '0.5rem' }} />
                    Add New Item
                  </button>

                  {filteredFarmerProducts.length > 0 ? (
                    filteredFarmerProducts.map(product => {
                      const totalStock      = product.batches.reduce((s, b) => s + (b.stockRaw || 0), 0)
                      const isProductLowStock = totalStock <= 50

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
                                {/* Col 1: Storage */}
                                <div>
                                  <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Storage</div>
                                  <span style={{ display: 'inline-block', background: '#e2e8f0', color: '#334155', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                                    {batch.location}
                                  </span>
                                </div>

                                {/* Col 2: Received + Expiry */}
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                  <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Received</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>{batch.receivedDate}</div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Expiry</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: batch.daysUntilExpiry <= 5 ? '#ef4444' : '#334155' }}>
                                      {batch.expiry}
                                      {batch.daysUntilExpiry < 999 && (
                                        <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: batch.daysUntilExpiry <= 5 ? '#ef4444' : '#64748b' }}>
                                          ({batch.daysUntilExpiry}d)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Col 3: Stock + alerts */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                                  <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>Stock</div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
                                    <div style={{
                                      padding: '0.3rem 0.8rem', borderRadius: '50px', fontWeight: '800', fontSize: '0.9rem',
                                      background: batch.daysUntilExpiry <= 5 ? '#fee2e2' : isProductLowStock ? '#fff7ed' : '#f0fdf4',
                                      color:      batch.daysUntilExpiry <= 5 ? '#ef4444' : isProductLowStock ? '#ea580c' : '#16a34a',
                                      display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap'
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
                                  {isProductLowStock && batch.daysUntilExpiry > 5 && (
                                    <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', background: '#fff7ed', color: '#ea580c', borderRadius: '4px', fontWeight: '800', border: '1px solid #fed7aa', whiteSpace: 'nowrap' }}>
                                      LOW STOCK
                                    </span>
                                  )}
                                </div>

                                {/* Col 4: Update Status */}
                                <div>
                                  <button
                                    style={{
                                      padding: '0.55rem 1.2rem', fontSize: '0.82rem', fontWeight: '700', borderRadius: '8px',
                                      background: batch.daysUntilExpiry <= 5 ? '#ef4444' : isProductLowStock ? '#f97316' : '#22c55e',
                                      color: 'white', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all 0.2s'
                                    }}
                                    onClick={() => openUpdateModal(product.name, batch, 'raw')}
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
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No matching farmer products found.</div>
                  )}
                </div>
              )}

              {/* ══════════════ FINISHED PRODUCTS ══════════════ */}
              {inventorySubTab === 'finished' && (
                <div className="inventory-column" style={{ width: '100%' }}>
                  {/* Full-width Add button */}
                  <button
                    className="ai-add-btn"
                    onClick={() => alert('Connect to your add-finished-product flow')}
                  >
                    <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '0.5rem' }} />
                    Add New Item
                  </button>

                  {filteredFinishedProducts.length > 0 ? (
                    filteredFinishedProducts.map(product => {
                      const totalUnits        = product.batches.reduce((s, b) => s + (b.quantity || 0), 0)
                      const isProductLowStock = totalUnits <= 50

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
                              const bbDate         = batch.bestBefore && batch.bestBefore !== '—' ? new Date(batch.bestBefore) : null
                              const diffDays       = bbDate ? Math.ceil((bbDate - new Date()) / (1000 * 60 * 60 * 24)) : 999
                              const isBatchNearExpiry = diffDays <= 90
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
                                  {/* Col 1: Location + Batch + Stock */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                      <span style={{ background: '#e2e8f0', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                        {batch.location}
                                      </span>
                                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                                        Batch ID: <strong style={{ color: '#1e293b' }}>{batch.batch}</strong>
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                      <div style={{
                                        background: isBatchNearExpiry ? '#fee2e2' : isProductLowStock ? '#fff7ed' : '#f0fdf4',
                                        color:      isBatchNearExpiry ? '#ef4444' : isProductLowStock ? '#ea580c' : '#16a34a',
                                        padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: '800', fontSize: '0.85rem',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
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

                                  {/* Col 2: Mfg + Best Before */}
                                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                      <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.5px' }}>Mfg Date</label>
                                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>{batch.manufactured}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                      <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.5px' }}>Best Before</label>
                                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: isBatchNearExpiry ? '#ef4444' : '#334155' }}>{batch.bestBefore}</span>
                                    </div>
                                  </div>

                                  {/* Col 3: Update Status */}
                                  <div style={{ textAlign: 'right' }}>
                                    <button
                                      style={{
                                        padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: '800', borderRadius: '8px',
                                        background: isBatchNearExpiry ? '#ef4444' : isProductLowStock ? '#f97316' : '#22c55e',
                                        color: 'white', border: 'none', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', whiteSpace: 'nowrap'
                                      }}
                                      onClick={() => openUpdateModal(product.name, { ...batch, stockRaw: batch.quantity }, 'finished')}
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
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No matching finished products found.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="ai-footer">
        <p>© 2024 Laklight Food Products. All rights reserved.</p>
      </div>

      {/* ══════════════ UPDATE STATUS MODAL ══════════════ */}
      {isEditModalOpen && editingBatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '420px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 0.25rem', color: '#1e293b', fontSize: '1.1rem', fontWeight: '800' }}>Update Status</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>{editingBatch.productName}</p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
                New Quantity
              </label>
              <input
                type="number"
                value={editQty}
                onChange={e => setEditQty(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Enter quantity"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
                Storage Location
              </label>
              <input
                type="text"
                value={editLoc}
                onChange={e => setEditLoc(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. C03-R04 (Cold Storage A)"
              />
            </div>

            {editMsg.text && (
              <div style={{ marginBottom: '1rem', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600',
                background: editMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                color:      editMsg.type === 'success' ? '#16a34a' : '#dc2626',
                border:     `1px solid ${editMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`
              }}>
                {editMsg.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none', background: '#2e7d32', color: 'white', fontWeight: '700', cursor: editSaving ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: editSaving ? 0.7 : 1 }}
              >
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminInventory
