'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Loader from '@/components/Loader'
import ConfirmModal from '@/components/ConfirmModal'

const statusStyle = {
  Pending: { background: '#FFF3CD', color: '#8A6D00' },
  Confirmed: { background: '#E3F2E8', color: '#4A7C59' },
  Shipped: { background: '#E3EAF2', color: '#3A5A8A' },
  Delivered: { background: '#EAF3EC', color: '#4A7C59' },
  Cancelled: { background: '#FBEAEA', color: '#C0392B' },
}

const nextStatusMap = {
  Pending: 'Confirmed',
  Confirmed: 'Shipped',
  Shipped: 'Delivered',
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.id

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [confirmStatus, setConfirmStatus] = useState(null)

  useEffect(() => { fetchOrder() }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`)
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else setOrder(data.order)
    } catch (err) {
      setError('Failed to load order')
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else {
        setConfirmStatus(null)
        fetchOrder()
      }
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
  if (error && !order) return (
    <div className="px-8 md:px-12 py-10 text-[14px] text-forest/60">{error}</div>
  )

  const nextStatus = nextStatusMap[order.status]

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-forest/40 hover:text-olive transition-colors mb-8">
        ← Orders
      </Link>

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Fulfillment</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[48px] leading-none mb-2" style={{ letterSpacing: '-0.02em' }}>
        {order.orderNumber}
      </h1>
      <p className="text-[13px] text-forest/50 font-medium mb-10">
        Placed {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* LEFT */}
        <div className="flex flex-col gap-6">

          {/* Customer */}
          <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
            <h2 className="font-display font-bold text-forest text-[18px] mb-5">Customer</h2>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-olive/15 flex items-center justify-center flex-shrink-0 text-olive font-bold text-[15px]">
                {(order.guestName || order.userId?.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-[15px] font-bold text-forest leading-tight">
                  {order.guestName || order.userId?.name}
                  {order.guestEmail && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-border text-forest/50 rounded-full px-2 py-0.5">Guest</span>
                  )}
                </p>
                <p className="text-[13px] text-forest/50 mt-0.5">{order.guestEmail || order.userId?.email}</p>
                <p className="text-[13px] text-forest/50">{order.guestPhone || order.shippingAddress?.phone}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
            <h2 className="font-display font-bold text-forest text-[18px] mb-5">Order Items</h2>
            <div className="flex flex-col divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-[14px] font-bold text-forest">{item.name}</p>
                    <p className="text-[12px] text-forest/50 mt-0.5">{item.size} · Qty {item.quantity}</p>
                  </div>
                  <p className="text-[14px] font-bold text-forest">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t-[1.5px] border-border mt-4 pt-4 flex justify-between items-baseline">
              <p className="text-[12px] font-bold uppercase tracking-wide text-forest/50">Order Total</p>
              <p className="font-display font-bold text-forest text-[24px]">₦{order.total.toLocaleString()}</p>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8">
            <h2 className="font-display font-bold text-forest text-[18px] mb-5">Shipping Address</h2>
            <p className="text-[14px] font-bold text-forest mb-1">{order.shippingAddress.fullName}</p>
            <p className="text-[13px] text-forest/60 leading-relaxed">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
          </div>

        </div>

        {/* RIGHT sidebar */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-6">

          <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6">
            <h2 className="font-display font-bold text-forest text-[16px] mb-4">Order Status</h2>

            <span
              className="inline-flex rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-wide"
              style={statusStyle[order.status] || { background: '#D6CEB8', color: '#283618' }}
            >
              {order.status}
            </span>

            {error && <p className="text-[13px] text-error mt-4">{error}</p>}

            {nextStatus && (
              <button
                onClick={() => setConfirmStatus(nextStatus)}
                disabled={updating}
                className="w-full mt-5 rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-wide py-4 hover:bg-forest transition-colors disabled:opacity-60"
              >
                {`Mark as ${nextStatus}`}
              </button>
            )}

            {!nextStatus && order.status !== 'Cancelled' && (
              <p className="text-[13px] text-forest/50 mt-4">Order lifecycle complete.</p>
            )}
            {order.status === 'Cancelled' && (
              <p className="text-[13px] text-error mt-4">Cancelled.</p>
            )}
          </div>

        </div>

      </div>

      <ConfirmModal
        isOpen={!!confirmStatus}
        onClose={() => setConfirmStatus(null)}
        onConfirm={() => handleStatusUpdate(confirmStatus)}
        title={`Mark as ${confirmStatus}?`}
        message={`Update this order's status to ${confirmStatus}.`}
        confirmLabel={`Mark as ${confirmStatus}`}
        loading={updating}
      />
    </div>
  )
}
