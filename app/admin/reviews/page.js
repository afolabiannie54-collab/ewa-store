'use client'

import { useState, useEffect } from 'react'
import Loader from '@/components/Loader'
import ConfirmModal from '@/components/ConfirmModal'
import AdminEmptyState from '@/components/AdminEmptyState'
import StarRating from '@/components/StarRating'

const FILTER_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
]

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchReviews() }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews')
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch (err) {
      console.error('Failed to load reviews')
    }
    setLoading(false)
  }

  const handleApprove = async (id) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: true })
    })
    fetchReviews()
  }

  const handleReject = async (id) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: false })
    })
    fetchReviews()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/reviews/${deleteTarget._id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    setDeleting(false)
    fetchReviews()
  }

  const filteredReviews = filterStatus === 'approved'
    ? reviews.filter(r => r.isApproved)
    : filterStatus === 'pending'
    ? reviews.filter(r => !r.isApproved)
    : reviews

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Community</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[48px] leading-none mb-10" style={{ letterSpacing: '-0.02em' }}>
        Reviews
      </h1>

      <div className="flex flex-wrap gap-2.5 mb-8">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide transition-colors ${
              filterStatus === f.key
                ? 'bg-olive text-cream'
                : 'bg-surface border-[1.5px] border-border text-forest hover:border-olive'
            }`}
          >
            {f.label}
            {f.key === '' && <span className={`ml-1.5 ${filterStatus === '' ? 'text-cream/70' : 'text-forest/40'}`}>({reviews.length})</span>}
            {f.key === 'pending' && <span className={`ml-1.5 ${filterStatus === 'pending' ? 'text-cream/70' : 'text-forest/40'}`}>({reviews.filter(r => !r.isApproved).length})</span>}
            {f.key === 'approved' && <span className={`ml-1.5 ${filterStatus === 'approved' ? 'text-cream/70' : 'text-forest/40'}`}>({reviews.filter(r => r.isApproved).length})</span>}
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <AdminEmptyState
          icon={<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
          title="No reviews yet"
          description="Customer reviews will show up here once they start rolling in."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredReviews.map(review => (
            <div key={review._id} className="rounded-[20px] border-[1.5px] border-border bg-surface p-6 md:p-7">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-forest mb-0.5">{review.productId?.name}</p>
                  <p className="text-[12px] text-forest/50">by {review.userId?.name} · {review.userId?.email}</p>
                </div>
                <span
                  className={`flex-shrink-0 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide border-[1.5px] ${
                    review.isApproved
                      ? 'bg-success/15 text-success border-success/30'
                      : 'bg-cream text-forest border-border'
                  }`}
                >
                  {review.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>

              <StarRating rating={review.rating} size={16} />
              <p className="text-[14px] text-forest leading-relaxed mt-3 mb-5">{review.comment}</p>

              <div className="flex gap-2.5 pt-4 border-t-[1.5px] border-border">
                {!review.isApproved && (
                  <button
                    onClick={() => handleApprove(review._id)}
                    className="rounded-full bg-olive text-cream text-[12px] font-bold uppercase tracking-wide px-5 py-2 hover:bg-forest transition-colors"
                  >
                    Approve
                  </button>
                )}
                {review.isApproved && (
                  <button
                    onClick={() => handleReject(review._id)}
                    className="rounded-full border-[1.5px] border-border text-forest text-[12px] font-bold uppercase tracking-wide px-5 py-2 hover:border-olive transition-colors"
                  >
                    Unapprove
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(review)}
                  className="rounded-full border-[1.5px] border-error/30 text-error text-[12px] font-bold uppercase tracking-wide px-5 py-2 hover:bg-error/5 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete review?"
        message={`Remove ${deleteTarget?.userId?.name}'s review of "${deleteTarget?.productId?.name}" permanently.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />

    </div>
  )
}