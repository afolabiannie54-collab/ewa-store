'use client'

import { useState, useEffect } from 'react'
import { NIGERIAN_STATES } from '@/lib/shipping'
import Loader from '@/components/Loader'
import FieldError from '@/components/FieldError'
import AccountNav from '@/components/AccountNav'
import ConfirmModal from '@/components/ConfirmModal'
import { isRequired, isValidPhone } from '@/lib/validation'
import { useToast } from '@/lib/useToast'

export default function AddressesPage() {
  const showToast = useToast()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

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
    setFieldErrors({})
  }

  const handleEdit = (address) => {
    setForm(address)
    setEditingId(address._id)
    setShowForm(true)
    setFieldErrors({})
  }

  const validate = () => {
    const errors = {}
    if (!isRequired(form.fullName)) errors.fullName = 'Please enter a full name'
    if (!isValidPhone(form.phone)) errors.phone = 'Please enter a valid Nigerian phone number (e.g. 08012345678)'
    if (!isRequired(form.street)) errors.street = 'Please enter a street address'
    if (!isRequired(form.city)) errors.city = 'Please enter a city'
    if (!isRequired(form.state)) errors.state = 'Please select a state'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)

    try {
      const url = editingId ? `/api/users/me/addresses/${editingId}` : '/api/users/me/addresses'
      const method = editingId ? 'PUT' : 'POST'

      const trimmedForm = {
        ...form,
        fullName: form.fullName?.trim(),
        phone: form.phone?.trim(),
        street: form.street?.trim(),
        city: form.city?.trim(),
        label: form.label?.trim(),
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedForm)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setSaving(false)
        return
      }

      showToast(editingId ? 'Address updated' : 'Address added')
      resetForm()
      fetchAddresses()
    } catch (err) {
      setError('Something went wrong')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/users/me/addresses/${deleteTarget}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    fetchAddresses()
  }

  const inputClass = (hasError) =>
    `w-full rounded-[12px] border-[2px] bg-surface px-5 py-3.5 text-[14px] text-forest placeholder:text-forest/35 outline-none transition-colors mb-1 ${
      hasError ? 'border-error' : 'border-forest/15 focus:border-olive'
    }`

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[640px] mx-auto px-6 py-12 md:py-16">

        <h1 className="font-display font-bold text-forest text-[44px] md:text-[60px] leading-none mb-2" style={{ letterSpacing: '-0.02em' }}>
          Address Book
        </h1>
        <p className="text-forest/55 text-[15px] mb-10">Manage where your orders get delivered</p>

        <AccountNav />

        <div className="flex flex-col gap-4 mb-7">
          {addresses.map(addr => (
            <div key={addr._id} className="rounded-[18px] border-[1.5px] border-border bg-surface p-6">
              <div className="flex items-center gap-2.5 mb-3">
                <p className="font-display font-bold text-forest text-[16px]">{addr.label}</p>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-olive bg-olive/10 px-2.5 py-1 rounded-full">Default</span>
                )}
              </div>
              <p className="text-[14px] text-forest/75 leading-relaxed mb-5">
                {addr.fullName}<br />
                {addr.phone}<br />
                {addr.street}, {addr.city}, {addr.state}
              </p>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(addr)} className="rounded-full border-[1.5px] border-border text-forest px-5 py-2 text-[12px] font-bold uppercase tracking-wide hover:border-olive transition-colors">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(addr._id)} className="rounded-full border-[1.5px] border-error text-error px-5 py-2 text-[12px] font-bold uppercase tracking-wide hover:bg-error hover:text-cream transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-olive text-cream px-8 py-3.5 text-[13px] font-bold uppercase tracking-wide hover:bg-forest transition-colors"
          >
            + Add New Address
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} noValidate className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
            <h2 className="font-display font-bold text-forest text-[19px] mb-6">
              {editingId ? 'Edit Address' : 'New Address'}
            </h2>

            <input
              type="text" placeholder="Label (e.g. Home, Office)" value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className={`${inputClass(false)} mb-4`}
            />

            <div className="mb-4">
              <input
                type="text" placeholder="Full Name" value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={inputClass(fieldErrors.fullName)}
              />
              <FieldError message={fieldErrors.fullName} />
            </div>

            <div className="mb-4">
              <input
                type="text" placeholder="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass(fieldErrors.phone)}
              />
              <FieldError message={fieldErrors.phone} />
            </div>

            <div className="mb-4">
              <input
                type="text" placeholder="Street Address" value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className={inputClass(fieldErrors.street)}
              />
              <FieldError message={fieldErrors.street} />
            </div>

            <div className="mb-4">
              <input
                type="text" placeholder="City" value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass(fieldErrors.city)}
              />
              <FieldError message={fieldErrors.city} />
            </div>

            <div className="mb-5">
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className={`${inputClass(fieldErrors.state)} cursor-pointer`}
              >
                <option value="">Select State</option>
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <FieldError message={fieldErrors.state} />
            </div>

            <label className="flex items-center gap-2.5 text-[14px] font-medium text-forest mb-7 cursor-pointer">
              <input
                type="checkbox" checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="accent-olive w-4 h-4"
              />
              Set as default address
            </label>

            {error && <p className="text-[13px] text-error mb-5">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-olive text-cream px-8 py-3.5 text-[13px] font-bold uppercase tracking-wide hover:bg-forest transition-colors disabled:opacity-60"
              >
                {saving ? <Loader size="sm" color="cream" /> : (editingId ? 'Save Changes' : 'Add Address')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border-[1.5px] border-border text-forest px-8 py-3.5 text-[13px] font-bold uppercase tracking-wide hover:border-olive transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this address?"
        message="This address will be permanently removed from your address book."
        confirmLabel="Delete Address"
        danger
        loading={deleting}
      />
    </div>
  )
}