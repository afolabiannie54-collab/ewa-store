'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/admin/issues')
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

  const filteredIssues = filterStatus ? issues.filter(i => i.status === filterStatus) : issues

  if (loading) return <div style={{ padding: '40px' }}>Loading issues...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '24px' }}>Order Issues</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['', 'Pending', 'Approved', 'Rejected', 'Resolved'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '8px 16px', borderRadius: '100px', fontSize: '12px',
              border: filterStatus === s ? '1px solid #606C38' : '1px solid #D6CEB8',
              background: filterStatus === s ? '#606C38' : 'transparent',
              color: filterStatus === s ? '#FEFAE0' : '#283618',
              cursor: 'pointer'
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #D6CEB8', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#283618' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}>Order</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map(issue => (
              <tr key={issue._id} style={{ borderBottom: '1px solid #D6CEB8' }}>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>{issue.orderId?.orderNumber || 'N/A'}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>{issue.reasonType}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#7A7A5C' }}>
                  {new Date(issue.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '100px',
                    background: statusColors[issue.status]?.bg, color: statusColors[issue.status]?.text
                  }}>
                    {issue.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/admin/issues/${issue._id}`} style={{ color: '#606C38', fontSize: '12px' }}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredIssues.length === 0 && (
        <p style={{ textAlign: 'center', color: '#7A7A5C', padding: '40px' }}>No issues reported.</p>
      )}
    </div>
  )
}