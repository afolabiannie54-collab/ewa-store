'use client'

import { useState, useEffect } from 'react'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

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

  const handleDelete = async (id) => {
    if (!confirm('Delete this review permanently?')) return
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    fetchReviews()
  }

  const filteredReviews = filterStatus === 'approved'
    ? reviews.filter(r => r.isApproved)
    : filterStatus === 'pending'
    ? reviews.filter(r => !r.isApproved)
    : reviews

  if (loading) return <div style={{ padding: '40px' }}>Loading reviews...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '24px' }}>Reviews</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'approved', label: 'Approved' }].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            style={{
              padding: '8px 16px', borderRadius: '100px', fontSize: '12px',
              border: filterStatus === f.key ? '1px solid #606C38' : '1px solid #D6CEB8',
              background: filterStatus === f.key ? '#606C38' : 'transparent',
              color: filterStatus === f.key ? '#FEFAE0' : '#283618',
              cursor: 'pointer'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredReviews.map(review => (
        <div key={review._id} style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#283618' }}>{review.productId?.name}</p>
              <p style={{ fontSize: '12px', color: '#7A7A5C' }}>by {review.userId?.name} ({review.userId?.email})</p>
            </div>
            <span style={{
              fontSize: '11px', padding: '4px 10px', borderRadius: '100px',
              background: review.isApproved ? '#E3F2E8' : '#FFF3CD',
              color: review.isApproved ? '#4A7C59' : '#8A6D00'
            }}>
              {review.isApproved ? 'Approved' : 'Pending'}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#606C38', marginBottom: '6px' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
          <p style={{ fontSize: '13px', color: '#283618', marginBottom: '16px' }}>{review.comment}</p>

          <div style={{ display: 'flex', gap: '8px' }}>
            {!review.isApproved && (
              <button onClick={() => handleApprove(review._id)} style={{ padding: '8px 16px', borderRadius: '100px', background: '#4A7C59', color: '#FEFAE0', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
                Approve
              </button>
            )}
            {review.isApproved && (
              <button onClick={() => handleReject(review._id)} style={{ padding: '8px 16px', borderRadius: '100px', background: 'transparent', color: '#8A6D00', border: '1px solid #8A6D00', fontSize: '12px', cursor: 'pointer' }}>
                Unapprove
              </button>
            )}
            <button onClick={() => handleDelete(review._id)} style={{ padding: '8px 16px', borderRadius: '100px', background: 'transparent', color: '#C0392B', border: '1px solid #C0392B', fontSize: '12px', cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        </div>
      ))}

      {filteredReviews.length === 0 && (
        <p style={{ textAlign: 'center', color: '#7A7A5C', padding: '40px' }}>No reviews found.</p>
      )}
    </div>
  )
}