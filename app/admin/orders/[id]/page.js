'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setOrder(data.order)
      }
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

      if (!res.ok) {
        setError(data.error)
      } else {
        fetchOrder()
      }
    } catch (err) {
      setError('Something went wrong')
    }
    setUpdating(false)
  }

  const nextStatusMap = {
    Pending: 'Confirmed',
    Confirmed: 'Shipped',
    Shipped: 'Delivered'
  }

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>
  if (error && !order) return <div style={{ padding: '40px' }}>{error}</div>

  const nextStatus = nextStatusMap[order.status]

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/admin/orders" style={{ fontSize: '13px', color: '#7A7A5C', textDecoration: 'none' }}>← Back to orders</Link>

      <h1 style={{ fontFamily: 'serif', fontSize: '24px', color: '#283618', margin: '20px 0 8px' }}>{order.orderNumber}</h1>
      <p style={{ fontSize: '13px', color: '#7A7A5C', marginBottom: '32px' }}>
        Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#283618', marginBottom: '12px' }}>Customer</h2>
        <p style={{ fontSize: '13px', color: '#283618' }}>
          {order.guestName || order.userId?.name} {order.guestEmail && '(Guest)'}
        </p>
        <p style={{ fontSize: '13px', color: '#7A7A5C' }}>{order.guestEmail || order.userId?.email}</p>
        <p style={{ fontSize: '13px', color: '#7A7A5C' }}>{order.guestPhone || order.shippingAddress.phone}</p>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#283618', marginBottom: '16px' }}>Items</h2>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
            <span>{item.name} ({item.size}) × {item.quantity}</span>
            <span>₦{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #D6CEB8', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
          <span>Total</span><span>₦{order.total.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#283618', marginBottom: '12px' }}>Shipping Address</h2>
        <p style={{ fontSize: '13px', color: '#283618', lineHeight: 1.6 }}>
          {order.shippingAddress.fullName}<br/>
          {order.shippingAddress.street}, {order.shippingAddress.city}<br/>
          {order.shippingAddress.state}
        </p>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#283618', marginBottom: '16px' }}>Status</h2>
        <p style={{ fontSize: '13px', color: '#7A7A5C', marginBottom: '16px' }}>
          Current status: <strong style={{ color: '#283618' }}>{order.status}</strong>
        </p>

        {error && <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        {nextStatus && (
          <button
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={updating}
            style={{
              padding: '12px 24px', borderRadius: '100px', background: '#606C38',
              color: '#FEFAE0', border: 'none', fontSize: '13px', cursor: 'pointer'
            }}
          >
            {updating ? 'Updating...' : `Mark as ${nextStatus}`}
          </button>
        )}

        {!nextStatus && order.status !== 'Cancelled' && (
          <p style={{ fontSize: '13px', color: '#4A7C59' }}>This order has completed its lifecycle.</p>
        )}

        {order.status === 'Cancelled' && (
          <p style={{ fontSize: '13px', color: '#C0392B' }}>This order was cancelled by the customer.</p>
        )}
      </div>
    </div>
  )
}