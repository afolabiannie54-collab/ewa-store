'use client'

import { useState, useEffect } from 'react'
import Loader from '@/components/Loader'

export default function AdminShippingPage() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/admin/shipping')
      const data = await res.json()
      setRates(data.rates || [])
    } catch (err) {
      console.error('Failed to load shipping rates')
    }
    setLoading(false)
  }

  const startEdit = (rate) => {
    setEditingId(rate._id)
    setEditValue(String(rate.rate))
  }

  const saveEdit = async (id) => {
    await fetch(`/api/admin/shipping/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate: Number(editValue) })
    })
    setEditingId(null)
    fetchRates()
  }

  if (loading) return (
    <div className="bg-cream min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '8px' }}>Shipping Rates</h1>
      <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '32px' }}>Set delivery costs by region</p>

      {rates.map(rate => (
        <div key={rate._id} style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#283618' }}>{rate.tier}</p>
          </div>

          {editingId === rate._id ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>₦</span>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{ width: '100px', padding: '8px 12px', borderRadius: '10px', border: '1px solid #D6CEB8' }}
              />
              <button onClick={() => saveEdit(rate._id)} style={{ padding: '8px 16px', borderRadius: '100px', background: '#606C38', color: '#FEFAE0', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
                Save
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#283618' }}>₦{rate.rate.toLocaleString()}</p>
              <button onClick={() => startEdit(rate)} style={{ padding: '8px 16px', borderRadius: '100px', background: 'transparent', color: '#606C38', border: '1px solid #D6CEB8', fontSize: '12px', cursor: 'pointer' }}>
                Edit
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}