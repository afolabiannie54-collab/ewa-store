'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
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

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error)
      } else {
        fetchOrder()
      }
    } catch (err) {
      alert('Something went wrong')
    }
    setCancelling(false)
  }

  const statusSteps = ['Pending', 'Confirmed', 'Shipped', 'Delivered']

  if (loading) {
    return <div style={{ padding: '40px' }}>Loading...</div>
  }

  if (error || !order) {
    return <div style={{ padding: '40px' }}>{error || 'Order not found'}</div>
  }

  const currentIndex = statusSteps.indexOf(order.status)

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/orders" style={{ fontSize: '13px', color: '#7A7A5C', textDecoration: 'none' }}>
        ← Back to orders
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '20px 0 32px' }}>
        <div>
          <h1 style={{ fontFamily: 'serif', fontSize: '24px', color: '#283618' }}>{order.orderNumber}</h1>
          <p style={{ fontSize: '13px', color: '#7A7A5C', marginTop: '4px' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

       {order.invoiceUrl ? (
            <a
            href={order.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              color: '#606C38',
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid #D6CEB8',
              padding: '8px 16px',
              borderRadius: '100px'
            }}
          >
            Download Invoice
          </a>
        ) : null}
      </div>

      {order.status === 'Cancelled' ? (
        <div style={{ background: '#FBEAEA', color: '#C0392B', padding: '16px', borderRadius: '12px', marginBottom: '32px', fontSize: '14px' }}>
          This order was cancelled.
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          {statusSteps.map((step, i) => {
            const isComplete = i <= currentIndex
            const dateField = { Pending: 'createdAt', Confirmed: 'confirmedAt', Shipped: 'shippedAt', Delivered: 'deliveredAt' }[step]
            const date = order[dateField]

            return (
              <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    margin: '0 auto 8px',
                    background: isComplete ? '#606C38' : '#D6CEB8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isComplete ? <span style={{ color: '#FEFAE0', fontSize: '12px' }}>✓</span> : null}
                </div>
                <p style={{ fontSize: '12px', fontWeight: 500, color: isComplete ? '#283618' : '#7A7A5C' }}>{step}</p>
                {date ? (
                  <p style={{ fontSize: '10px', color: '#7A7A5C', marginTop: '2px' }}>
                    {new Date(date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#283618', marginBottom: '16px' }}>Items</h2>

        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: '#FEFAE0', overflow: 'hidden', flexShrink: 0 }}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : null}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', color: '#283618' }}>{item.name}</p>
              <p style={{ fontSize: '12px', color: '#7A7A5C' }}>Size: {item.size} · Qty: {item.quantity}</p>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#283618' }}>₦{(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #D6CEB8', paddingTop: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
            <span>Subtotal</span>
            <span>₦{order.subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
            <span>Shipping ({order.shippingTier})</span>
            <span>₦{order.shippingCost.toLocaleString()}</span>
          </div>
          {order.discount > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: '#4A7C59' }}>
              <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
              <span>-₦{order.discount.toLocaleString()}</span>
            </div>
          ) : null}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 600, marginTop: '8px' }}>
            <span>Total</span>
            <span>₦{order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#283618', marginBottom: '12px' }}>Shipping Address</h2>
        <p style={{ fontSize: '13px', color: '#283618', lineHeight: 1.6 }}>
          {order.shippingAddress.fullName}<br />
          {order.shippingAddress.phone}<br />
          {order.shippingAddress.street}, {order.shippingAddress.city}<br />
          {order.shippingAddress.state}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {order.status === 'Pending' ? (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              padding: '12px 24px',
              borderRadius: '100px',
              border: '1px solid #C0392B',
              background: 'transparent',
              color: '#C0392B',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        ) : null}

        {order.status === 'Delivered' ? (
          <Link
            href={`/orders/${order._id}/issue`}
            style={{
              padding: '12px 24px',
              borderRadius: '100px',
              border: '1px solid #D6CEB8',
              color: '#283618',
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            Report a Problem
          </Link>
        ) : null}
      </div>
    </div>
  )
}