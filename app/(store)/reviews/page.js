'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import StarRating from '@/components/StarRating'
import StarInput from '@/components/StarInput'
import ConfirmModal from '@/components/ConfirmModal'
import AccountNav from '@/components/AccountNav'
import { useToast } from '@/lib/useToast'

export default function MyReviewsPage() {
  const { status } = useSession()
  const showToast = useToast()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReviews()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch (err) {
      console.error('Failed to load reviews')
    }
    setLoading(false)
  }

  const startEdit = (review) => {
    setEditingId(review._id)
    setEditRating(review.rating)
    setEditComment(review.comment)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (productId, reviewId) => {
    setSaving(true)
    const res = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: editRating, comment: editComment })
    })
    setSaving(false)
    if (res.ok) {
      setEditingId(null)
      fetchReviews()
    } else {
      showToast('Failed to save changes', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/products/${deleteTarget.productId}/reviews/${deleteTarget.reviewId}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    if (res.ok) {
      fetchReviews()
    } else {
      showToast('Failed to delete review', 'error')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-forest/60 text-[16px] mb-6">Please log in to view your reviews.</p>
          <Link href="/login" className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors">
            Log In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[760px] mx-auto px-6 py-12 md:py-16">

        <h1 className="font-display font-bold text-forest text-[44px] md:text-[60px] leading-none mb-2" style={{ letterSpacing: '-0.02em' }}>
          My Reviews
        </h1>
        <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-10">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </p>

        <AccountNav />

        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-forest/60 text-[16px]">You haven&apos;t written any reviews yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {reviews.map(review => (
              <div key={review._id} className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <Link
                    href={`/shop/${review.productId?.slug}`}
                    className="font-display font-bold text-forest text-[19px] md:text-[21px] hover:text-olive transition-colors"
                  >
                    {review.productId?.name}
                  </Link>
                  <span className={`flex-shrink-0 text-[11px] font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-full border-[1.5px] ${
                    review.isApproved ? 'bg-success/15 text-success border-success/30' : 'bg-cream text-forest border-border'
                  }`}>
                    {review.isApproved ? 'Approved' : 'Pending Review'}
                  </span>
                </div>

                {editingId === review._id ? (
                  <div>
                    <div className="mb-4">
                      <StarInput value={editRating} onChange={setEditRating} size={24} />
                    </div>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                      className="w-full rounded-[12px] border-[1.5px] border-border px-4 py-3 text-[14px] text-forest focus:border-olive outline-none transition-colors mb-4 resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveEdit(review.productId._id, review._id)}
                        disabled={saving}
                        className="rounded-full bg-olive text-cream px-6 py-2.5 text-[13px] font-bold uppercase tracking-wide hover:bg-forest transition-colors disabled:opacity-60"
                      >
                        {saving ? <Loader size="sm" color="cream" /> : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-full border-[1.5px] border-border text-forest px-6 py-2.5 text-[13px] font-bold uppercase tracking-wide hover:border-olive transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <StarRating rating={review.rating} size={16} />
                    </div>
                    <p className="text-[14px] text-forest/75 leading-relaxed mb-5">{review.comment}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEdit(review)}
                        className="rounded-full border-[1.5px] border-border text-forest px-6 py-2.5 text-[13px] font-bold uppercase tracking-wide hover:border-olive transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ productId: review.productId._id, reviewId: review._id })}
                        className="rounded-full border-[1.5px] border-error text-error px-6 py-2.5 text-[13px] font-bold uppercase tracking-wide hover:bg-error hover:text-cream transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this review?"
        message="This can't be undone. Your review will be permanently removed from this product."
        confirmLabel="Delete Review"
        danger
        loading={deleting}
      />
    </div>
  )
}