'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'

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

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Failed to load orders')
    }
    setLoading(false)
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

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 py-12 md:py-16">

        <h1 className="font-display font-bold text-forest text-[44px] md:text-[56px] leading-none mb-12" style={{ letterSpacing: '-0.02em' }}>
          Your Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-forest/60 text-[16px] mb-6">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}