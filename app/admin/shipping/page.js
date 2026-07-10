'use client'

import { useState, useEffect } from 'react'
import Loader from '@/components/Loader'

export default function AdminShippingPage() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => { fetchRates() }, [])

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

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveEdit = async (id) => {
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: Number(editValue) })
      })
      if (!res.ok) {
        const data = await res.json()
        setSaveError(data.error || 'Failed to save')
        return
      }
      setEditingId(null)
      fetchRates()
    } catch (err) {
      setSaveError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Logistics</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[48px] leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
        Shipping Rates
      </h1>
      <p className="text-[14px] text-forest/50 font-medium mb-10">Set delivery costs per region</p>

      <div className="flex flex-col gap-4 max-w-[640px]">
        {rates.map(rate => (
          <div key={rate._id} className="rounded-[20px] border-[1.5px] border-border bg-surface p-6 md:p-7 flex items-center justify-between gap-6">
            <div>
              <p className="text-[16px] font-bold text-forest">{rate.tier}</p>
            </div>

            {editingId === rate._id ? (
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[14px] font-bold text-forest/50">₦</span>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => { setEditValue(e.target.value); setSaveError('') }}
                    className="w-[110px] rounded-[10px] border-[2px] border-olive bg-cream px-3.5 py-2.5 text-[14px] font-bold text-forest outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(rate._id)}
                    disabled={saving}
                    className="rounded-full bg-olive text-cream text-[12px] font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-forest transition-colors disabled:opacity-60"
                  >
                    {saving ? <Loader size="sm" color="cream" /> : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="rounded-full border-[1.5px] border-border text-forest/60 text-[12px] font-bold uppercase tracking-wide px-5 py-2.5 hover:border-olive transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {saveError && <p className="text-[12px] text-error">{saveError}</p>}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <p className="font-display font-bold text-forest text-[24px]">₦{rate.rate.toLocaleString()}</p>
                <button
                  onClick={() => startEdit(rate)}
                  className="rounded-full border-[1.5px] border-border text-forest text-[12px] font-bold uppercase tracking-wide px-5 py-2.5 hover:border-olive transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
