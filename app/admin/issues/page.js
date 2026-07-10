'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import AdminEmptyState from '@/components/AdminEmptyState'
import Pagination from '@/components/Pagination'

const STATUS_FILTERS = ['', 'Pending', 'Approved', 'Rejected', 'Resolved']

const statusStyle = {
  Pending: { background: '#FFF3CD', color: '#8A6D00' },
  Approved: { background: '#E3F2E8', color: '#4A7C59' },
  Rejected: { background: '#FBEAEA', color: '#C0392B' },
  Resolved: { background: '#EAF3EC', color: '#4A7C59' },
}

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page })
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/admin/issues?${params}`)
      const data = await res.json()
      setIssues(data.issues || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Failed to load issues')
    }
    setLoading(false)
  }, [page, filterStatus])

  useEffect(() => { fetchIssues() }, [fetchIssues])

  const handleFilterChange = (s) => {
    setFilterStatus(s)
    setPage(1)
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
        Order Issues
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
        <p className="text-[13px] text-forest/45 mb-4">{total} issue{total !== 1 ? 's' : ''}</p>
      )}

      <div className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden">
        {issues.length === 0 ? (
          <AdminEmptyState
            icon={<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg>}
            title="No issues reported"
            description="Order issues raised by customers will appear here."
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-forest">
                <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Order</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Issue Type</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Customer</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Date</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, i) => (
                <tr
                  key={issue._id}
                  className={`hover:bg-cream/60 transition-colors ${i < issues.length - 1 ? 'border-b-[1.5px] border-border' : ''}`}
                >
                  <td className="px-6 py-4 font-bold text-forest text-[14px]">{issue.orderId?.orderNumber || 'N/A'}</td>
                  <td className="px-6 py-4 text-[13px] text-forest">{issue.reasonType}</td>
                  <td className="px-6 py-4 text-[13px] text-forest/60">{issue.userId?.name || '—'}</td>
                  <td className="px-6 py-4 text-[13px] text-forest/50">
                    {new Date(issue.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                      style={statusStyle[issue.status] || { background: '#D6CEB8', color: '#283618' }}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/issues/${issue._id}`} className="text-[13px] font-bold text-olive hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

    </div>
  )
}
