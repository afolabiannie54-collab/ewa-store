'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NIGERIAN_STATES } from '@/lib/shipping'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const emptyForm = { label: 'Home', fullName: '', phone: '', street: '', city: '', state: '', isDefault: false }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/users/me/addresses')
      const data = await res.json()
      setAddresses(data.addresses || [])
    } catch (err) {
      console.error('Failed to load addresses')
    }
    setLoading(false)
  }

  const resetForm = () => {
    setForm(emptyForm)
    setShowForm(false)
    setEditingId(null)
    setError('')
  }

  const handleEdit = (address) => {
    setForm(address)
    setEditingId(address._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const url = editingId ? `/api/users/me/addresses/${editingId}` : '/api/users/me/addresses'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      resetForm()
      fetchAddresses()
    } catch (err) {
      setError('Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return
    await fetch(`/api/users/me/addresses/${id}`, { method: 'DELETE' })
    fetchAddresses()
  }

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '8px' }}>Address Book</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', marginTop: '20px' }}>
        <Link href="/account" style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #D6CEB8', color: '#283618', fontSize: '12px', textDecoration: 'none' }}>Profile</Link>
        <Link href="/account/addresses" style={{ padding: '8px 16px', borderRadius: '100px', background: '#606C38', color: '#FEFAE0', fontSize: '12px', textDecoration: 'none' }}>Addresses</Link>
        <Link href="/wishlist" style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #D6CEB8', color: '#283618', fontSize: '12px', textDecoration: 'none' }}>Wishlist</Link>
      </div>

      {addresses.map(addr => (
        <div key={addr._id} style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#283618' }}>
              {addr.label} {addr.isDefault && <span style={{ fontSize: '10px', color: '#606C38' }}>(Default)</span>}
            </p>
          </div>
          <p style={{ fontSize: '13px', color: '#283618', lineHeight: 1.6, marginBottom: '12px' }}>
            {addr.fullName}<br/>
            {addr.phone}<br/>
            {addr.street}, {addr.city}, {addr.state}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleEdit(addr)} style={{ padding: '6px 14px', borderRadius: '100px', background: 'transparent', color: '#606C38', border: '1px solid #D6CEB8', fontSize: '11px', cursor: 'pointer' }}>
              Edit
            </button>
            <button onClick={() => handleDelete(addr._id)} style={{ padding: '6px 14px', borderRadius: '100px', background: 'transparent', color: '#C0392B', border: '1px solid #C0392B', fontSize: '11px', cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        </div>
      ))}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: '12px 24px', borderRadius: '100px', background: '#606C38', color: '#FEFAE0', border: 'none', fontSize: '13px', cursor: 'pointer' }}
        >
          + Add New Address
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px', marginTop: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#283618', marginBottom: '16px' }}>
            {editingId ? 'Edit Address' : 'New Address'}
          </h2>

          <input
            type="text" placeholder="Label (e.g. Home, Office)" value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
          />
          <input
            type="text" placeholder="Full Name" value={form.fullName} required
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
          />
          <input
            type="tel" placeholder="Phone" value={form.phone} required
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
          />
          <input
            type="text" placeholder="Street Address" value={form.street} required
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
          />
          <input
            type="text" placeholder="City" value={form.city} required
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
          />
          <select
            value={form.state} required
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
          >
            <option value="">Select State</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '16px' }}>
            <input
              type="checkbox" checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Set as default address
          </label>

          {error && <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ padding: '12px 24px', borderRadius: '100px', background: '#606C38', color: '#FEFAE0', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
              {editingId ? 'Save Changes' : 'Add Address'}
            </button>
            <button type="button" onClick={resetForm} style={{ padding: '12px 24px', borderRadius: '100px', background: 'transparent', color: '#7A7A5C', border: '1px solid #D6CEB8', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}