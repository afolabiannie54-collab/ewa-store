'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

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

  const statusColors = {
    Pending: { bg: '#FFF3CD', text: '#8A6D00' },
    Confirmed: { bg: '#E3F2E8', text: '#4A7C59' },
    Shipped: { bg: '#E3EAF2', text: '#3A5A8A' },
    Delivered: { bg: '#EAF3EC', text: '#4A7C59' },
    Cancelled: { bg: '#FBEAEA', text: '#C0392B' }
  }

  if (status === 'loading' || loading) return <div style={{ padding: '40px' }}>Loading...</div>

  if (status === 'unauthenticated') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: '#7A7A5C', marginBottom: '16px' }}>Please log in to view your orders.</p>
        <Link href="/login" style={{ color: '#606C38', fontWeight: 500 }}>Log in →</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '32px' }}>Your Orders</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#7A7A5C', marginBottom: '16px' }}>You haven't placed any orders yet.</p>
          <Link href="/shop" style={{ color: '#606C38', fontWeight: 500 }}>Start shopping →</Link>
        </div>
      ) : (
        <div>
          {orders.map(order => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              style={{
                display: 'block', background: '#FFFFFF', border: '1px solid #D6CEB8',
                borderRadius: '16px', padding: '20px 24px', marginBottom: '16px', textDecoration: 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#283618' }}>{order.orderNumber}</p>
                  <p style={{ fontSize: '12px', color: '#7A7A5C', marginTop: '4px' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 500, padding: '4px 12px', borderRadius: '100px',
                  background: statusColors[order.status]?.bg, color: statusColors[order.status]?.text
                }}>
                  {order.status}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#7A7A5C' }}>
                {order.items.length} item{order.items.length > 1 ? 's' : ''} · ₦{order.total.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}