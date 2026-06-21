'use client'

import { useState, useEffect } from 'react'

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/admin/inquiries')
      const data = await res.json()
      setInquiries(data.inquiries || [])
    } catch (err) {
      console.error('Failed to load inquiries')
    }
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    fetchInquiries()
  }

  const startReply = (id) => {
    setReplyingId(id)
    setReplyText('')
    setReplyMessage('')
  }

  const sendReply = async (id) => {
    if (!replyText.trim()) return

    setSending(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText })
      })

      const data = await res.json()

      if (res.ok) {
        setReplyMessage('Reply sent successfully')
        setReplyText('')
        fetchInquiries()
        setTimeout(() => setReplyingId(null), 1500)
      } else {
        setReplyMessage(data.error || 'Failed to send reply')
      }
    } catch (err) {
      setReplyMessage('Something went wrong')
    }
    setSending(false)
  }

  const statusColors = {
    Unread: { bg: '#FFF3CD', text: '#8A6D00' },
    'In Progress': { bg: '#E3EAF2', text: '#3A5A8A' },
    Resolved: { bg: '#EAF3EC', text: '#4A7C59' }
  }

  const filteredInquiries = filterStatus ? inquiries.filter(i => i.status === filterStatus) : inquiries

  if (loading) return <div style={{ padding: '40px' }}>Loading inquiries...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '24px' }}>Customer Inquiries</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['', 'Unread', 'In Progress', 'Resolved'].map(s => (
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

      {filteredInquiries.map(inquiry => (
        <div key={inquiry._id} style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#283618' }}>{inquiry.name}</p>
              <p style={{ fontSize: '12px', color: '#7A7A5C' }}>{inquiry.email}</p>
            </div>
            <span style={{
              fontSize: '11px', padding: '4px 10px', borderRadius: '100px',
              background: statusColors[inquiry.status]?.bg, color: statusColors[inquiry.status]?.text
            }}>
              {inquiry.status}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#283618', marginBottom: '12px', lineHeight: 1.6 }}>{inquiry.message}</p>

          <p style={{ fontSize: '11px', color: '#7A7A5C', marginBottom: '12px' }}>
            {new Date(inquiry.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: replyingId === inquiry._id ? '12px' : 0 }}>
            {inquiry.status !== 'In Progress' && (
              <button onClick={() => updateStatus(inquiry._id, 'In Progress')} style={{ padding: '8px 16px', borderRadius: '100px', background: 'transparent', color: '#3A5A8A', border: '1px solid #3A5A8A', fontSize: '12px', cursor: 'pointer' }}>
                Mark In Progress
              </button>
            )}
            {inquiry.status !== 'Resolved' && (
              <button onClick={() => updateStatus(inquiry._id, 'Resolved')} style={{ padding: '8px 16px', borderRadius: '100px', background: '#4A7C59', color: '#FEFAE0', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
                Mark Resolved
              </button>
            )}
            <button
              onClick={() => replyingId === inquiry._id ? setReplyingId(null) : startReply(inquiry._id)}
              style={{ padding: '8px 16px', borderRadius: '100px', background: 'transparent', color: '#606C38', border: '1px solid #D6CEB8', fontSize: '12px', cursor: 'pointer' }}
            >
              {replyingId === inquiry._id ? 'Cancel' : 'Reply'}
            </button>
          </div>

          {replyingId === inquiry._id && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #D6CEB8' }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                rows={3}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #D6CEB8', fontSize: '13px', marginBottom: '10px' }}
              />
              {replyMessage && (
                <p style={{ fontSize: '12px', color: replyMessage.includes('success') ? '#4A7C59' : '#C0392B', marginBottom: '10px' }}>
                  {replyMessage}
                </p>
              )}
              <button
                onClick={() => sendReply(inquiry._id)}
                disabled={sending}
                style={{ padding: '8px 20px', borderRadius: '100px', background: '#283618', color: '#FEFAE0', border: 'none', fontSize: '12px', cursor: 'pointer' }}
              >
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          )}
        </div>
      ))}

      {filteredInquiries.length === 0 && (
        <p style={{ textAlign: 'center', color: '#7A7A5C', padding: '40px' }}>No inquiries found.</p>
      )}
    </div>
  )
}