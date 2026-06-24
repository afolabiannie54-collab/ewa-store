'use client'

import { useState, useEffect } from 'react'

export default function AdminPromosPage() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '',
    expiryDate: '',
    usageLimit: '',
    oneTimePerCustomer: false
  })

  useEffect(() => {
    fetchPromos()
  }, [])

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promos')
      const data = await res.json()
      setPromos(data.promos || [])
    } catch (err) {
      setError('Failed to load promo codes')
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          discountValue: Number(form.discountValue),
          minimumOrderAmount: Number(form.minimumOrderAmount) || 0,
          usageLimit: Number(form.usageLimit)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setForm({ code: '', discountType: 'percentage', discountValue: '', minimumOrderAmount: '', expiryDate: '', usageLimit: '', oneTimePerCustomer: false })
      fetchPromos()

    } catch (err) {
      setError('Something went wrong')
    }
  }

  const toggleActive = async (promo) => {
    await fetch(`/api/admin/promos/${promo._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !promo.active })
    })
    fetchPromos()
  }

  const toggleOneTimePerCustomer = async (promo) => {
    await fetch(`/api/admin/promos/${promo._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oneTimePerCustomer: !promo.oneTimePerCustomer })
    })
    fetchPromos()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this promo code?')) return
    await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' })
    fetchPromos()
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '24px' }}>Promo Codes</h1>

      <form onSubmit={handleSubmit} style={{
        background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px',
        padding: '24px', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'
      }}>
        <div>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Code</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6CEB8' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Discount Type</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6CEB8' }}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
            Discount Value {form.discountType === 'percentage' ? '(%)' : '(₦)'}
          </label>
          <input
            type="number"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6CEB8' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Min. Order Amount (₦)</label>
          <input
            type="number"
            value={form.minimumOrderAmount}
            onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6CEB8' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Expiry Date</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6CEB8' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Usage Limit</label>
          <input
            type="number"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6CEB8' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>One Per Customer</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={form.oneTimePerCustomer}
              onChange={(e) => setForm({ ...form, oneTimePerCustomer: e.target.checked })}
            />
            Limit to one use per email
          </label>
        </div>

        {error && <p style={{ color: '#C0392B', fontSize: '13px', gridColumn: '1 / -1' }}>{error}</p>}

        <button
          type="submit"
          style={{
            gridColumn: '1 / -1', padding: '12px', borderRadius: '100px',
            background: '#606C38', color: '#FEFAE0', border: 'none', fontSize: '13px', cursor: 'pointer'
          }}
        >
          Create Promo Code
        </button>
      </form>

      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#283618' }}>
              <th style={{ padding: '12px', color: '#FEFAE0', fontSize: '12px', textAlign: 'left' }}>Code</th>
              <th style={{ padding: '12px', color: '#FEFAE0', fontSize: '12px', textAlign: 'left' }}>Discount</th>
              <th style={{ padding: '12px', color: '#FEFAE0', fontSize: '12px', textAlign: 'left' }}>Used</th>
              <th style={{ padding: '12px', color: '#FEFAE0', fontSize: '12px', textAlign: 'left' }}>Expires</th>
              <th style={{ padding: '12px', color: '#FEFAE0', fontSize: '12px', textAlign: 'left' }}>Active</th>
              <th style={{ padding: '12px', color: '#FEFAE0', fontSize: '12px', textAlign: 'left' }}>One Per Customer</th>
              <th style={{ padding: '12px', color: '#FEFAE0', fontSize: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map(promo => (
              <tr key={promo._id} style={{ borderBottom: '1px solid #D6CEB8' }}>
                <td style={{ padding: '12px', fontSize: '13px' }}>{promo.code}</td>
                <td style={{ padding: '12px', fontSize: '13px' }}>
                  {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₦${promo.discountValue.toLocaleString()}`}
                </td>
                <td style={{ padding: '12px', fontSize: '13px' }}>{promo.usedCount} / {promo.usageLimit}</td>
                <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(promo.expiryDate).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  <input type="checkbox" checked={promo.active} onChange={() => toggleActive(promo)} />
                </td>
                <td style={{ padding: '12px' }}>
                  <input type="checkbox" checked={!!promo.oneTimePerCustomer} onChange={() => toggleOneTimePerCustomer(promo)} />
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleDelete(promo._id)} style={{ color: '#C0392B', fontSize: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}