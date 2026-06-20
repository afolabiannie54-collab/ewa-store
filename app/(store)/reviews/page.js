'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function MyReviewsPage() {
  const { status } = useSession()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')

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
    await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: editRating, comment: editComment })
    })
    setEditingId(null)
    fetchReviews()
  }

  const handleDelete = async (productId, reviewId) => {
    if (!confirm('Delete this review?')) return
    await fetch(`/api/products/${productId}/reviews/${reviewId}`, { method: 'DELETE' })
    fetchReviews()
  }

  if (status === 'loading' || loading) return <div style={{ padding: '40px' }}>Loading...</div>

  if (status === 'unauthenticated') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: '#7A7A5C', marginBottom: '16px' }}>Please log in to view your reviews.</p>
        <Link href="/login" style={{ color: '#606C38', fontWeight: 500 }}>Log in →</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '32px' }}>My Reviews</h1>

      {reviews.length === 0 ? (
        <p style={{ color: '#7A7A5C', textAlign: 'center', padding: '60px 0' }}>You haven't written any reviews yet.</p>
      ) : (
        reviews.map(review => (
          <div key={review._id} style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Link href={`/shop/${review.productId?.slug}`} style={{ fontSize: '14px', fontWeight: 600, color: '#283618', textDecoration: 'none' }}>
                {review.productId?.name}
              </Link>
              <span style={{
                fontSize: '11px', padding: '4px 10px', borderRadius: '100px',
                background: review.isApproved ? '#E3F2E8' : '#FFF3CD',
                color: review.isApproved ? '#4A7C59' : '#8A6D00'
              }}>
                {review.isApproved ? 'Approved' : 'Pending Review'}
              </span>
            </div>

            {editingId === review._id ? (
              <div>
                <select
                  value={editRating}
                  onChange={(e) => setEditRating(Number(e.target.value))}
                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #D6CEB8', fontSize: '13px', marginBottom: '10px' }}
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                </select>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #D6CEB8', fontSize: '13px', marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => saveEdit(review.productId._id, review._id)} style={{ padding: '8px 16px', borderRadius: '100px', background: '#606C38', color: '#FEFAE0', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
                    Save
                  </button>
                  <button onClick={cancelEdit} style={{ padding: '8px 16px', borderRadius: '100px', background: 'transparent', color: '#7A7A5C', border: '1px solid #D6CEB8', fontSize: '12px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#606C38', marginBottom: '6px' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                <p style={{ fontSize: '13px', color: '#283618', marginBottom: '12px' }}>{review.comment}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEdit(review)} style={{ padding: '8px 16px', borderRadius: '100px', background: 'transparent', color: '#606C38', border: '1px solid #D6CEB8', fontSize: '12px', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(review.productId._id, review._id)} style={{ padding: '8px 16px', borderRadius: '100px', background: 'transparent', color: '#C0392B', border: '1px solid #C0392B', fontSize: '12px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  )
}