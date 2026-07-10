'use client'

import { useState, useEffect } from 'react'
import Loader from '@/components/Loader'
import ConfirmModal from '@/components/ConfirmModal'
import AdminEmptyState from '@/components/AdminEmptyState'
import FieldError from '@/components/FieldError'
import { isRequired } from '@/lib/validation'

export default function AdminPromosPage() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '',
    expiryDate: '',
    usageLimit: '',
    oneTimePerCustomer: false
  })

  useEffect(() => { fetchPromos() }, [])

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

  const validate = () => {
    const errors = {}
    if (!isRequired(form.code)) errors.code = 'Code is required'
    if (!isRequired(form.discountValue)) errors.discountValue = 'Value is required'
    if (!isRequired(form.expiryDate)) errors.expiryDate = 'Expiry date is required'
    if (!isRequired(form.usageLimit)) errors.usageLimit = 'Usage limit is required'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          code: form.code.trim().toUpperCase(),
          discountValue: Number(form.discountValue),
          minimumOrderAmount: Number(form.minimumOrderAmount) || 0,
          usageLimit: Number(form.usageLimit)
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        setSubmitting(false)
        return
      }
      setForm({ code: '', discountType: 'percentage', discountValue: '', minimumOrderAmount: '', expiryDate: '', usageLimit: '', oneTimePerCustomer: false })
      setFieldErrors({})
      fetchPromos()
    } catch (err) {
      setError('Something went wrong')
    }
    setSubmitting(false)
  }

  const toggleActive = async (promo) => {
    const res = await fetch(`/api/admin/promos/${promo._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !promo.active })
    })
    if (res.ok) fetchPromos()
  }

  const toggleOneTimePerCustomer = async (promo) => {
    const res = await fetch(`/api/admin/promos/${promo._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oneTimePerCustomer: !promo.oneTimePerCustomer })
    })
    if (res.ok) fetchPromos()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/admin/promos/${deleteTarget._id}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) {
      setDeleteTarget(null)
      fetchPromos()
    }
  }

  const inputClass = 'w-full rounded-[12px] border-[2px] border-forest/15 bg-cream px-4 py-3 text-[14px] text-forest placeholder:text-forest/35 outline-none transition-colors focus:border-olive'

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Marketing</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[48px] leading-none mb-10" style={{ letterSpacing: '-0.02em' }}>
        Promo Codes
      </h1>

      {/* ADD FORM */}
      <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8 mb-6">
        <h2 className="font-display font-bold text-forest text-[18px] mb-6">Create Promo Code</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-5">

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Code</label>
              <input
                type="text" placeholder="e.g. SAVE20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className={fieldErrors.code ? inputClass.replace('border-forest/15', 'border-error') : inputClass}
              />
              <FieldError message={fieldErrors.code} />
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₦)</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">
                Value {form.discountType === 'percentage' ? '(%)' : '(₦)'}
              </label>
              <input
                type="number" min="0"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className={fieldErrors.discountValue ? inputClass.replace('border-forest/15', 'border-error') : inputClass}
              />
              <FieldError message={fieldErrors.discountValue} />
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Min. Order (₦)</label>
              <input
                type="number" min="0" placeholder="0"
                value={form.minimumOrderAmount}
                onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className={fieldErrors.expiryDate ? inputClass.replace('border-forest/15', 'border-error') : inputClass}
              />
              <FieldError message={fieldErrors.expiryDate} />
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Usage Limit</label>
              <input
                type="number" min="1"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className={fieldErrors.usageLimit ? inputClass.replace('border-forest/15', 'border-error') : inputClass}
              />
              <FieldError message={fieldErrors.usageLimit} />
            </div>

          </div>

          <label className="flex items-center gap-2.5 text-[13px] font-medium text-forest cursor-pointer mb-5">
            <input
              type="checkbox"
              checked={form.oneTimePerCustomer}
              onChange={(e) => setForm({ ...form, oneTimePerCustomer: e.target.checked })}
              className="accent-olive w-4 h-4"
            />
            Limit to one use per customer
          </label>

          {error && <p className="text-[13px] text-error mb-4">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-8 py-4 hover:bg-forest transition-colors disabled:opacity-60"
          >
            {submitting ? <Loader size="sm" color="cream" /> : 'Create Promo Code'}
          </button>
        </form>
      </div>

      {/* PROMO TABLE */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="md" color="olive" />
        </div>
      ) : (
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden">
          {promos.length === 0 ? (
            <AdminEmptyState
              icon={<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>}
              title="No promo codes yet"
              description="Create your first promo code using the form above."
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-forest">
                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Code</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Discount</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Used</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Expires</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Active</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">1×/Customer</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {promos.map((promo, i) => (
                  <tr
                    key={promo._id}
                    className={`hover:bg-cream/60 transition-colors ${i < promos.length - 1 ? 'border-b-[1.5px] border-border' : ''}`}
                  >
                    <td className="px-6 py-4 font-bold text-forest text-[14px] font-mono tracking-wider">{promo.code}</td>
                    <td className="px-6 py-4 text-[13px] font-bold text-forest">
                      {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₦${promo.discountValue.toLocaleString()}`}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-forest/60">
                      {promo.usedCount} / {promo.usageLimit}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-forest/60">
                      {new Date(promo.expiryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={promo.active} onChange={() => toggleActive(promo)} aria-label={`${promo.code} active`} className="accent-olive w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={!!promo.oneTimePerCustomer} onChange={() => toggleOneTimePerCustomer(promo)} aria-label={`${promo.code} one time per customer`} className="accent-olive w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(promo)}
                        className="text-[13px] font-bold text-error hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.code}"?`}
        message="This promo code will be permanently removed and can no longer be used."
        confirmLabel="Delete"
        danger
        loading={deleting}
      />

    </div>
  )
}