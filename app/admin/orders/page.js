'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import AdminEmptyState from '@/components/AdminEmptyState'

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
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Failed to load orders')
    }
    setLoading(false)
  }

  const filteredOrders = filterStatus ? orders.filter(o => o.status === filterStatus) : orders

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Fulfillment</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[48px] leading-none mb-10" style={{ letterSpacing: '-0.02em' }}>
        Orders
      </h1>

      <div className="flex flex-wrap gap-2.5 mb-8">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide transition-colors ${
              filterStatus === s
                ? 'bg-olive text-cream'
                : 'bg-surface border-[1.5px] border-border text-forest hover:border-olive'
            }`}
          >
            {s || 'All'}
            {s && (
              <span className={`ml-1.5 ${filterStatus === s ? 'text-cream/70' : 'text-forest/40'}`}>
                ({orders.filter(o => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden">
        {filteredOrders.length === 0 ? (
          <AdminEmptyState
            icon={<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>}
            title="No orders yet"
            description="Orders will appear here once customers start purchasing."
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
              {filteredOrders.map((order, i) => (
                <tr
                  key={order._id}
                  className={`hover:bg-cream/60 transition-colors ${i < filteredOrders.length - 1 ? 'border-b-[1.5px] border-border' : ''}`}
                >
                  <td className="px-6 py-4 font-bold text-forest text-[14px]">{order.orderNumber}</td>
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

    </div>
  )
}
