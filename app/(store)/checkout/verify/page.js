'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get('reference')

  const [status, setStatus] = useState('checking') // checking | found | failed
  const [order, setOrder] = useState(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!reference) {
      setStatus('failed')
      return
    }

    checkOrder()
  }, [reference])

  const checkOrder = async () => {
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      })

      const data = await res.json()

      if (res.ok && data.order) {
        setOrder(data.order)
        setStatus('found')
      } else if (attempts < 8) {
        // Webhook might not have fired yet — retry a few times with delay
        setAttempts(prev => prev + 1)
        setTimeout(checkOrder, 2000)
      } else {
        setStatus('failed')
      }
    } catch (err) {
      setStatus('failed')
    }
  }

  if (status === 'checking') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h1 style={{ fontFamily: 'serif', fontSize: '24px', color: '#283618', marginBottom: '12px' }}>
          Confirming your payment...
        </h1>
        <p style={{ color: '#7A7A5C', fontSize: '14px' }}>This usually takes a few seconds. Please don't close this page.</p>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h1 style={{ fontFamily: 'serif', fontSize: '24px', color: '#C0392B', marginBottom: '12px' }}>
          We couldn't confirm your order
        </h1>
        <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '20px' }}>
          If you were charged, please contact us with this reference: <strong>{reference}</strong>
        </p>
        <Link href="/" style={{ color: '#606C38', fontWeight: 500 }}>Return home</Link>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '12px' }}>
        Order Confirmed!
      </h1>
      <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '8px' }}>
        Your order number is
      </p>
      <p style={{ fontSize: '22px', fontWeight: 600, color: '#606C38', marginBottom: '32px' }}>
        {order.orderNumber}
      </p>
      <p style={{ color: '#7A7A5C', fontSize: '13px', marginBottom: '24px' }}>
        A confirmation email has been sent to you. You can track your order anytime.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link
          href={`/track-order?orderNumber=${order.orderNumber}`}
          style={{
            padding: '12px 28px', borderRadius: '100px', background: '#606C38',
            color: '#FEFAE0', fontSize: '13px', fontWeight: 500, textDecoration: 'none'
          }}
        >
          Track Order
        </Link>
        <Link
          href="/shop"
          style={{
            padding: '12px 28px', borderRadius: '100px', border: '1px solid #D6CEB8',
            color: '#283618', fontSize: '13px', fontWeight: 500, textDecoration: 'none'
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px' }}>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}