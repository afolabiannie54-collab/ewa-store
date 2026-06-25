'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Loader from '@/components/Loader'

const statusStyle = {
  Pending: { background: '#FFF3CD', color: '#8A6D00' },
  Approved: { background: '#E3F2E8', color: '#4A7C59' },
  Rejected: { background: '#FBEAEA', color: '#C0392B' },
  Resolved: { background: '#EAF3EC', color: '#4A7C59' },
}

export default function AdminIssueDetailPage() {
  const params = useParams()
  const issueId = params.id

  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => { fetchIssue() }, [issueId])

  const fetchIssue = async () => {
    try {
      const res = await fetch(`/api/admin/issues/${issueId}`)
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else {
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
      if (!res.ok) setError(data.error)
      else fetchIssue()
    } catch (err) {
      setError('Something went wrong')
    }
    setUpdating(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )
  if (error && !issue) return (
    <div className="px-8 md:px-12 py-10 text-[14px] text-forest/60">{error}</div>
  )

  const isClosed = issue.status === 'Rejected' || issue.status === 'Resolved'

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <Link href="/admin/issues" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-forest/40 hover:text-olive transition-colors mb-8">
        ← Issues
      </Link>

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Support</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[48px] leading-none mb-2" style={{ letterSpacing: '-0.02em' }}>
        Issue Report
      </h1>
      <p className="text-[13px] text-forest/50 font-medium mb-10">
        Order {issue.orderId?.orderNumber} · {new Date(issue.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* LEFT */}
        <div className="flex flex-col gap-6">

          {/* Report details */}
          <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
            <h2 className="font-display font-bold text-forest text-[18px] mb-6">Report Details</h2>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-forest/40 mb-1">Customer</p>
                <p className="text-[14px] font-bold text-forest">{issue.userId?.name}</p>
                <p className="text-[12px] text-forest/50">{issue.userId?.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-forest/40 mb-1">Issue Type</p>
                <span className="inline-flex rounded-full px-3 py-1 text-[12px] font-bold bg-border text-forest">
                  {issue.reasonType}
                </span>
              </div>
            </div>

            <div className="border-t-[1.5px] border-border pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-forest/40 mb-2">Customer's Description</p>
              <p className="text-[14px] text-forest leading-relaxed">{issue.details}</p>
            </div>

            {issue.images?.length > 0 && (
              <div className="border-t-[1.5px] border-border pt-5 mt-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-forest/40 mb-3">Attached Photos</p>
                <div className="flex gap-3 flex-wrap">
                  {issue.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block w-[90px] h-[90px] rounded-[12px] overflow-hidden border-[1.5px] border-border hover:border-olive transition-colors flex-shrink-0">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order items */}
          {issue.orderId?.items?.length > 0 && (
            <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
              <h2 className="font-display font-bold text-forest text-[18px] mb-5">Original Order Items</h2>
              <div className="flex flex-col divide-y divide-border">
                {issue.orderId.items.map((item, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-[14px] font-bold text-forest">{item.name}</p>
                    <p className="text-[12px] text-forest/50 mt-0.5">{item.size} · Qty {item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT sidebar */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-6">

          <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6">
            <h2 className="font-display font-bold text-forest text-[16px] mb-4">Resolution</h2>

            <span
              className="inline-flex rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-wide mb-5"
              style={statusStyle[issue.status] || { background: '#D6CEB8', color: '#283618' }}
            >
              {issue.status}
            </span>

            {!isClosed && (
              <>
                <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2">Admin Note</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  placeholder="e.g. Replacement will be shipped within 24 hours"
                  className="w-full rounded-[12px] border-[2px] border-forest/15 bg-cream px-4 py-3 text-[13px] text-forest placeholder:text-forest/35 outline-none transition-colors focus:border-olive resize-none mb-4"
                />
              </>
            )}

            {isClosed && issue.adminNote && (
              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-forest/40 mb-2">Admin Note</p>
                <p className="text-[13px] text-forest leading-relaxed">{issue.adminNote}</p>
              </div>
            )}

            {error && <p className="text-[13px] text-error mb-4">{error}</p>}

            {issue.status === 'Pending' && (
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handleUpdate('Approved')}
                  disabled={updating}
                  className="w-full rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-wide py-3.5 hover:bg-forest transition-colors disabled:opacity-60"
                >
                  {updating ? <Loader size="sm" color="cream" /> : 'Approve Issue'}
                </button>
                <button
                  onClick={() => handleUpdate('Rejected')}
                  disabled={updating}
                  className="w-full rounded-full border-[1.5px] border-error text-error text-[13px] font-bold uppercase tracking-wide py-3.5 hover:bg-error/5 transition-colors disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            )}

            {issue.status === 'Approved' && (
              <button
                onClick={() => handleUpdate('Resolved')}
                disabled={updating}
                className="w-full rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-wide py-3.5 hover:bg-forest transition-colors disabled:opacity-60"
              >
                {updating ? <Loader size="sm" color="cream" /> : 'Mark as Resolved'}
              </button>
            )}

            {isClosed && (
              <p className="text-[13px] text-forest/50">This issue has been closed.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
