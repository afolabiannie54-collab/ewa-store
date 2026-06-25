'use client'

import { useState, useEffect } from 'react'
import Loader from '@/components/Loader'
import ConfirmModal from '@/components/ConfirmModal'
import FieldError from '@/components/FieldError'
import { isRequired } from '@/lib/validation'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Failed to load categories')
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const errors = {}
    if (!isRequired(form.name)) errors.name = 'Category name is required'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim() })
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error)
        setSubmitting(false)
        return
      }
      setForm({ name: '' })
      setFieldErrors({})
      fetchCategories()
    } catch (err) {
      setSubmitError('Something went wrong')
    }
    setSubmitting(false)
  }

  const toggleActive = async (cat) => {
    await fetch(`/api/admin/categories/${cat._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !cat.active })
    })
    fetchCategories()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget._id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error)
        setDeleting(false)
        return
      }
      setDeleteTarget(null)
      fetchCategories()
    } catch (err) {
      setDeleteError('Something went wrong')
    }
    setDeleting(false)
  }

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 py-12">

        <h1 className="font-display font-bold text-forest text-[32px] mb-10">Categories</h1>

        {/* Add form */}
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 mb-8">
          <h2 className="font-display font-bold text-forest text-[18px] mb-5">Add Category</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="e.g. Toner"
                  value={form.name}
                  onChange={(e) => { setForm({ name: e.target.value }); setFieldErrors({}) }}
                  className={`w-full rounded-[12px] border-[1.5px] px-4 py-3 text-[14px] text-forest bg-cream placeholder:text-muted outline-none transition-colors ${
                    fieldErrors.name ? 'border-error' : 'border-border focus:border-olive'
                  }`}
                />
                <FieldError message={fieldErrors.name} />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex-shrink-0 rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-wide px-7 py-3 hover:bg-forest transition-colors disabled:opacity-60"
              >
                {submitting ? <Loader size="sm" color="cream" /> : 'Add'}
              </button>
            </div>
            {submitError && <p className="text-[13px] text-error mt-3">{submitError}</p>}
          </form>
        </div>

        {/* Category list */}
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden">
          {categories.length === 0 ? (
            <p className="text-center text-forest/50 text-[14px] py-12">No categories yet. Add one above.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-forest">
                  <th className="text-left px-6 py-3.5 text-[12px] font-bold uppercase tracking-wide text-cream/80">Name</th>
                  <th className="text-left px-6 py-3.5 text-[12px] font-bold uppercase tracking-wide text-cream/80">Active</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat._id} className={i < categories.length - 1 ? 'border-b border-border' : ''}>
                    <td className="px-6 py-4 text-[14px] font-medium text-forest">{cat.name}</td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={cat.active}
                        onChange={() => toggleActive(cat)}
                        className="accent-olive w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setDeleteError(''); setDeleteTarget(cat) }}
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
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError('') }}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        message={deleteError || 'This category will be permanently removed. Products using it must be reassigned first.'}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  )
}
