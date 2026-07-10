'use client'

import { useState, useEffect, useCallback } from 'react'
import Loader from '@/components/Loader'
import AdminEmptyState from '@/components/AdminEmptyState'
import Pagination from '@/components/Pagination'

const STATUS_FILTERS = ['', 'Unread', 'In Progress', 'Resolved']

const statusStyle = {
  Unread: { background: '#FFF3CD', color: '#8A6D00' },
  'In Progress': { background: '#E3EAF2', color: '#3A5A8A' },
  Resolved: { background: '#EAF3EC', color: '#4A7C59' },
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page })
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/admin/inquiries?${params}`)
      const data = await res.json()
      setInquiries(data.inquiries || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Failed to load inquiries')
    }
    setLoading(false)
  }, [page, filterStatus])

  useEffect(() => { fetchInquiries() }, [fetchInquiries])

  const handleFilterChange = (s) => {
    setFilterStatus(s)
    setPage(1)
  }

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (res.ok) fetchInquiries()
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
        setReplyMessage('success')
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Support</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[48px] leading-none mb-10" style={{ letterSpacing: '-0.02em' }}>
        Inquiries
      </h1>

      <div className="flex flex-wrap gap-2.5 mb-8">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide transition-colors ${
              filterStatus === s
                ? 'bg-olive text-cream'
                : 'bg-surface border-[1.5px] border-border text-forest hover:border-olive'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {total > 0 && (
        <p className="text-[13px] text-forest/45 mb-4">{total} inquiry{total !== 1 ? 's' : ''}</p>
      )}

      {inquiries.length === 0 ? (
        <AdminEmptyState
          icon={<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
          title="No inquiries yet"
          description="Customer messages from the contact form will appear here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {inquiries.map(inquiry => (
            <div key={inquiry._id} className="rounded-[20px] border-[1.5px] border-border bg-surface p-6 md:p-7">

              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[15px] font-bold text-forest mb-0.5">{inquiry.name}</p>
                  <p className="text-[12px] text-forest/50">{inquiry.email} · {new Date(inquiry.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span
                  className="flex-shrink-0 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                  style={statusStyle[inquiry.status] || { background: '#D6CEB8', color: '#283618' }}
                >
                  {inquiry.status}
                </span>
              </div>

              <p className="text-[14px] text-forest leading-relaxed mb-5">{inquiry.message}</p>

              <div className="flex flex-wrap gap-2.5 pt-4 border-t-[1.5px] border-border">
                {inquiry.status !== 'In Progress' && (
                  <button
                    onClick={() => updateStatus(inquiry._id, 'In Progress')}
                    className="rounded-full border-[1.5px] border-[#2C5282]/40 text-[#2C5282] text-[12px] font-bold uppercase tracking-wide px-5 py-2 hover:bg-cream hover:border-[#2C5282]/70 transition-colors"
                  >
                    Mark In Progress
                  </button>
                )}
                {inquiry.status !== 'Resolved' && (
                  <button
                    onClick={() => updateStatus(inquiry._id, 'Resolved')}
                    className="rounded-full bg-olive text-cream text-[12px] font-bold uppercase tracking-wide px-5 py-2 hover:bg-forest transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => replyingId === inquiry._id ? setReplyingId(null) : startReply(inquiry._id)}
                  className="rounded-full border-[1.5px] border-border text-forest text-[12px] font-bold uppercase tracking-wide px-5 py-2 hover:border-olive transition-colors"
                >
                  {replyingId === inquiry._id ? 'Cancel' : 'Reply'}
                </button>
              </div>

              {replyingId === inquiry._id && (
                <div className="mt-5 pt-5 border-t-[1.5px] border-border">
                  <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Your Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full rounded-[12px] border-[2px] border-forest/15 bg-cream px-4 py-3 text-[13px] text-forest placeholder:text-forest/35 outline-none transition-colors focus:border-olive resize-none mb-3"
                  />
                  {replyMessage && (
                    <p className={`text-[12px] font-bold mb-3 ${replyMessage === 'success' ? 'text-[#2D6A4F]' : 'text-error'}`}>
                      {replyMessage === 'success' ? 'Reply sent successfully.' : replyMessage}
                    </p>
                  )}
                  <button
                    onClick={() => sendReply(inquiry._id)}
                    disabled={sending}
                    className="rounded-full bg-forest text-cream text-[12px] font-bold uppercase tracking-wide px-7 py-2.5 hover:bg-olive transition-colors disabled:opacity-60"
                  >
                    {sending ? <Loader size="sm" color="cream" /> : 'Send Reply'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

    </div>
  )
}
