'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import AdminEmptyState from '@/components/AdminEmptyState'
import Pagination from '@/components/Pagination'

const STATUS_FILTERS = ['', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

const statusStyle = {
  Pending: { background: '#FFF3CD', color: '#8A6D00' },
  Confirmed: { background: '#E3F2E8', color: '#4A7C59' },
  Shipped: { background: '#E3EAF2', color: '#3A5A8A' },
  Delivered: { background: '#EAF3EC', color: '#4A7C59' },
  Cancelled: { background: '#FBEAEA', color: '#C0392B' },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimerRef = useRef(null)

  // Debounce search input; also reset page when user types
  useEffect(() => {
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(searchTimerRef.current)
  }, [search])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    try {
      const params = new URLSearchParams({ page })
      if (statusFilter) params.set('status', statusFilter)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      if (!res.ok) {
        setFetchError(true)
      } else {
        setOrders(data.orders || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch {
      setFetchError(true)
    }
    setLoading(false)
  }, [page, statusFilter, debouncedSearch])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusChange = (s) => {
    setStatusFilter(s)
    setPage(1)
  }

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Fulfillment</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[48px] leading-none mb-10" style={{ letterSpacing: '-0.02em' }}>
        Orders
      </h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by order number, email, or customer name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-[480px] rounded-[12px] border-[1.5px] border-border bg-surface px-5 py-3 text-[14px] text-forest placeholder:text-forest/35 outline-none focus:border-olive transition-colors"
        />
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide transition-colors ${
              statusFilter === s
                ? 'bg-olive text-cream'
                : 'bg-surface border-[1.5px] border-border text-forest hover:border-olive'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader size="lg" />
        </div>
      ) : fetchError ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <p className="text-forest/60 text-[14px] mb-4">Failed to load orders.</p>
            <button
              onClick={fetchOrders}
              className="rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-7 py-3 hover:bg-forest transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {total > 0 && (
            <p className="text-[13px] text-forest/45 mb-4">{total} order{total !== 1 ? 's' : ''}</p>
          )}

          <div className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden">
            {orders.length === 0 ? (
              <AdminEmptyState
                icon={<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>}
                title={debouncedSearch || statusFilter ? 'No matching orders' : 'No orders yet'}
                description={debouncedSearch || statusFilter ? 'Try adjusting your search or filter.' : 'Orders will appear here once customers start purchasing.'}
              />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-forest">
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Order #</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Customer</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Date</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Total</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Status</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr
                      key={order._id}
                      className={`hover:bg-cream/60 transition-colors ${i < orders.length - 1 ? 'border-b-[1.5px] border-border' : ''}`}
                    >
                      <td className="px-6 py-4 font-bold text-forest text-[14px]">
                        {order.orderNumber}
                        {order.oversell && (
                          <span className="ml-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-error/15 text-error">Stock issue</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-forest">{order.guestName || order.userId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-[13px] text-forest/50">
                        {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-[14px] font-bold text-forest">₦{order.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                          style={statusStyle[order.status] || { background: '#D6CEB8', color: '#283618' }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/orders/${order._id}`} className="text-[13px] font-bold text-olive hover:underline">
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
        </>
      )}
    </div>
  )
}
