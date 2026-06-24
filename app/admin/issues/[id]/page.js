'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Loader from '@/components/Loader'

export default function AdminIssueDetailPage() {
  const params = useParams()
  const issueId = params.id

  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    fetchIssue()
  }, [issueId])

  const fetchIssue = async () => {
    try {
      const res = await fetch(`/api/admin/issues/${issueId}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setIssue(data.issue)
        setAdminNote(data.issue.adminNote || '')
      }
    } catch (err) {
      setError('Failed to load issue')
    }
    setLoading(false)
  }

  const handleUpdate = async (newStatus) => {
    if (!adminNote.trim() && newStatus !== 'Resolved') {
      setError('Please add a note before updating the status')
      return
    }

    setUpdating(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/issues/${issueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        fetchIssue()
      }
    } catch (err) {
      setError('Something went wrong')
    }
    setUpdating(false)
  }

  if (loading) return (
    <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FEFAE0' }}>
      <Loader size="lg" />
    </div>
  )
  if (error && !issue) return <div style={{ padding: '40px' }}>{error}</div>

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/admin/issues" style={{ fontSize: '13px', color: '#7A7A5C', textDecoration: 'none' }}>← Back to issues</Link>

      <h1 style={{ fontFamily: 'serif', fontSize: '24px', color: '#283618', margin: '20px 0 24px' }}>
        Issue Report
      </h1>

      <div style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '4px' }}>Order</p>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#283618', marginBottom: '16px' }}>
          {issue.orderId?.orderNumber}
        </p>

        <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '4px' }}>Customer</p>
        <p style={{ fontSize: '14px', color: '#283618', marginBottom: '16px' }}>
          {issue.userId?.name} ({issue.userId?.email})
        </p>

        <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '4px' }}>Issue Type</p>
        <p style={{ fontSize: '14px', color: '#283618', marginBottom: '16px' }}>{issue.reasonType}</p>

        <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '4px' }}>Customer's Description</p>
        <p style={{ fontSize: '14px', color: '#283618', marginBottom: '16px', lineHeight: 1.6 }}>{issue.details}</p>

        {issue.images?.length > 0 && (
          <>
            <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '8px' }}>Photos</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {issue.images.map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                  <img src={img} alt="" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px' }} />
                </a>
              ))}
            </div>
          </>
        )}

        <div style={{ borderTop: '1px solid #D6CEB8', paddingTop: '16px', marginTop: '8px' }}>
          <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '8px' }}>Original Order Items</p>
          {issue.orderId?.items?.map((item, i) => (
            <p key={i} style={{ fontSize: '13px', color: '#283618', marginBottom: '4px' }}>
              • {item.name} ({item.size}) × {item.quantity}
            </p>
          ))}
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#283618', marginBottom: '12px' }}>
          Current Status: <span style={{ color: '#606C38' }}>{issue.status}</span>
        </h2>

        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '8px' }}>
          Admin Note
        </label>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          rows={3}
          placeholder="e.g. Replacement will be shipped within 24 hours"
          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '14px', marginBottom: '16px' }}
        />

        {error && <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px' }}>
          {issue.status === 'Pending' && (
            <>
              <button
                onClick={() => handleUpdate('Approved')}
                disabled={updating}
                style={{ padding: '12px 24px', borderRadius: '100px', background: '#4A7C59', color: '#FEFAE0', border: 'none', fontSize: '13px', cursor: 'pointer' }}
              >
                Approve
              </button>
              <button
                onClick={() => handleUpdate('Rejected')}
                disabled={updating}
                style={{ padding: '12px 24px', borderRadius: '100px', background: 'transparent', color: '#C0392B', border: '1px solid #C0392B', fontSize: '13px', cursor: 'pointer' }}
              >
                Reject
              </button>
            </>
          )}

          {issue.status === 'Approved' && (
            <button
              onClick={() => handleUpdate('Resolved')}
              disabled={updating}
              style={{ padding: '12px 24px', borderRadius: '100px', background: '#606C38', color: '#FEFAE0', border: 'none', fontSize: '13px', cursor: 'pointer' }}
            >
              Mark as Resolved
            </button>
          )}

          {(issue.status === 'Rejected' || issue.status === 'Resolved') && (
            <p style={{ fontSize: '13px', color: '#7A7A5C' }}>This issue has been closed.</p>
          )}
        </div>
      </div>
    </div>
  )
}