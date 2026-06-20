'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function TrackOrderContent() {
  const searchParams = useSearchParams()

  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOrder(null)
    setLoading(true)

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setOrder(data.order)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const statusSteps = ['Pending', 'Confirmed', 'Shipped', 'Delivered']

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '8px' }}>Track Your Order</h1>
      <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '32px' }}>
        Enter your order number and email to see your order status.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
        <input
          type="text"
          placeholder="Order Number (e.g. EWA-2026-12345)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '12px' }}
        />
        <input
          type="email"
          placeholder="Email used at checkout"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '16px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: '100px',
            background: '#606C38', color: '#FEFAE0', border: 'none',
            fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Searching...' : 'Track Order'}
        </button>
      </form>

      {error && <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '24px' }}>{error}</p>}

      {order && (
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #D6CEB8', padding: '24px' }}>
          <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '4px' }}>Order Number</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#283618', marginBottom: '20px' }}>{order.orderNumber}</p>

          {order.status === 'Cancelled' ? (
            <p style={{ color: '#C0392B', fontSize: '14px', marginBottom: '20px' }}>This order was cancelled.</p>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              {statusSteps.map((step, i) => {
                const currentIndex = statusSteps.indexOf(order.status)
                const isComplete = i <= currentIndex
                return (
                  <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', margin: '0 auto 8px',
                      background: isComplete ? '#606C38' : '#D6CEB8'
                    }} />
                    <p style={{ fontSize: '11px', color: isComplete ? '#283618' : '#7A7A5C' }}>{step}</p>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ borderTop: '1px solid #D6CEB8', paddingTop: '16px' }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span>{item.name} ({item.size}) × {item.quantity}</span>
                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 600, marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #D6CEB8' }}>
              <span>Total</span>
              <span>₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px' }}>Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  )
}