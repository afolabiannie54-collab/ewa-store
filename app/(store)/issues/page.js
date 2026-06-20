'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function MyIssuesPage() {
  const { status } = useSession()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchIssues()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues')
      const data = await res.json()
      setIssues(data.issues || [])
    } catch (err) {
      console.error('Failed to load issues')
    }
    setLoading(false)
  }

  const statusColors = {
    Pending: { bg: '#FFF3CD', text: '#8A6D00' },
    Approved: { bg: '#E3F2E8', text: '#4A7C59' },
    Rejected: { bg: '#FBEAEA', text: '#C0392B' },
    Resolved: { bg: '#EAF3EC', text: '#4A7C59' }
  }

  if (status === 'loading' || loading) return <div style={{ padding: '40px' }}>Loading...</div>

  if (status === 'unauthenticated') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: '#7A7A5C', marginBottom: '16px' }}>Please log in to view your reported issues.</p>
        <Link href="/login" style={{ color: '#606C38', fontWeight: 500 }}>Log in →</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '32px' }}>My Reported Issues</h1>

      {issues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#7A7A5C' }}>You haven't reported any issues.</p>
        </div>
      ) : (
        <div>
          {issues.map(issue => (
            <div
              key={issue._id}
              style={{
                background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px',
                padding: '20px 24px', marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: '13px', color: '#7A7A5C', marginBottom: '4px' }}>
                    Order {issue.orderId?.orderNumber}
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#283618' }}>{issue.reasonType}</p>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 500, padding: '4px 12px', borderRadius: '100px',
                  background: statusColors[issue.status]?.bg, color: statusColors[issue.status]?.text
                }}>
                  {issue.status}
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#283618', marginBottom: '8px' }}>{issue.details}</p>

              {issue.images?.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {issue.images.map((img, i) => (
                    <img key={i} src={img} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                  ))}
                </div>
              )}

              {issue.adminNote && (
                <div style={{ background: '#FEFAE0', padding: '12px', borderRadius: '10px', marginTop: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#606C38', marginBottom: '4px' }}>Response from EWA</p>
                  <p style={{ fontSize: '13px', color: '#283618' }}>{issue.adminNote}</p>
                </div>
              )}

              <p style={{ fontSize: '11px', color: '#7A7A5C', marginTop: '12px' }}>
                Reported on {new Date(issue.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}