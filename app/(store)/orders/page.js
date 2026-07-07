'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import EmptyOrdersIllustration from '@/components/EmptyOrdersIllustration'
import Pagination from '@/components/Pagination'

const STATUS_FILTERS = ['', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

const STATUS_STYLES = {
  Pending: 'bg-cream text-forest border-border',
  Confirmed: 'bg-olive/15 text-olive border-olive/30',
  Shipped: 'bg-forest/10 text-forest border-forest/20',
  Delivered: 'bg-success/15 text-success border-success/30',
  Cancelled: 'bg-error/10 text-error border-error/30'
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchOrders = useCallback(async (statusVal, pageVal) => {
    setLoading(true)
    setFetchError(false)
    try {
      const params = new URLSearchParams({ page: pageVal })
      if (statusVal) params.set('status', statusVal)
      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) {
        setFetchError(true)
      } else {
        const data = await res.json()
        setOrders(data.orders || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch {
      setFetchError(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders(statusFilter, page)
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, statusFilter, page, fetchOrders])

  const handleStatusChange = (s) => {
    setStatusFilter(s)
    setPage(1)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-forest/60 text-[16px] mb-6">Please log in to view your orders.</p>
          <Link href="/login" className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors">
            Log In
          </Link>
        </div>
      </div>
    )
  }

  const hasOrders = !fetchError && (orders.length > 0 || statusFilter !== '')

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 py-12 md:py-16">

        <h1 className="font-display font-bold text-forest text-[44px] md:text-[56px] leading-none mb-10" style={{ letterSpacing: '-0.02em' }}>
          Your Orders
        </h1>

        {fetchError ? (
          <div className="flex flex-col items-center text-center py-12 md:py-20">
            <p className="text-[16px] text-forest/60 mb-6">Failed to load your orders. Please try again.</p>
            <button
              onClick={() => fetchOrders(statusFilter, page)}
              className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-10 py-[17px] hover:bg-forest transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Status filter tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
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

            {orders.length === 0 && statusFilter === '' ? (
              <div className="flex flex-col items-center text-center py-12 md:py-20">
                <EmptyOrdersIllustration />
                <h2 className="font-display font-bold text-forest text-[26px] md:text-[30px] mt-6 mb-3" style={{ letterSpacing: '-0.01em' }}>
                  No orders yet
                </h2>
                <p className="text-[15px] text-forest/55 leading-relaxed max-w-[360px] mb-9">
                  Looks like you haven&apos;t placed any orders yet. Let&apos;s find something your skin will love.
                </p>
                <Link
                  href="/shop"
                  className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-10 py-[17px] hover:bg-forest transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-forest/50 text-[15px] py-16">No {statusFilter.toLowerCase()} orders.</p>
            ) : (
              <>
                {total > 0 && (
                  <p className="text-[13px] text-forest/45 mb-5">
                    {total} order{total !== 1 ? 's' : ''}{statusFilter ? ` · ${statusFilter}` : ''}
                  </p>
                )}
                <div className="flex flex-col gap-4">
                  {orders.map(order => (
                    <Link
                      key={order._id}
                      href={`/orders/${order._id}`}
                      className="block rounded-[18px] border-[1.5px] border-border bg-surface p-6 hover:border-olive transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3 gap-4">
                        <div>
                          <p className="font-display font-bold text-forest text-[18px]">{order.orderNumber}</p>
                          <p className="text-[13px] text-forest/50 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 text-[11px] font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-full border-[1.5px] ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[14px] text-forest/70">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} · <span className="font-bold text-forest">₦{order.total.toLocaleString()}</span>
                      </p>
                    </Link>
                  ))}
                </div>

                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
