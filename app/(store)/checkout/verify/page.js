'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Loader from '@/components/Loader'

function OrderConfirmedIllustration() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
      <circle cx="110" cy="110" r="85" fill="none" stroke="#606C38" strokeWidth="2.5" opacity="0.5" />
      <circle cx="110" cy="110" r="65" fill="#606C38" opacity="0.08" />
      <path
        d="M75 112 L98 138 L148 82"
        fill="none"
        stroke="#283618"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35" cy="50" r="9" fill="#606C38" opacity="0.2" />
      <circle cx="190" cy="60" r="13" fill="#283618" opacity="0.1" />
      <circle cx="185" cy="175" r="7" fill="#606C38" opacity="0.25" />
      <circle cx="30" cy="170" r="11" fill="#283618" opacity="0.15" />
    </svg>
  )
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')

  const [status, setStatus] = useState('checking') // checking | found | failed
  const [order, setOrder] = useState(null)
  const attemptsRef = useRef(0)
  const timerRef = useRef(null)

  const checkOrder = useCallback(async () => {
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
        window.dispatchEvent(new Event('cart:updated'))
      } else if (attemptsRef.current < 8) {
        attemptsRef.current++
        timerRef.current = setTimeout(checkOrder, 2000)
      } else {
        setStatus('failed')
      }
    } catch (err) {
      setStatus('failed')
    }
  }, [reference])

  useEffect(() => {
    if (!reference) {
      setStatus('failed')
      return
    }
    checkOrder()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [checkOrder])

  if (status === 'checking') {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <Loader size="lg" className="mb-7" />
          <h1 className="font-display font-bold text-forest text-[26px] md:text-[30px] mb-3" style={{ letterSpacing: '-0.01em' }}>
            Confirming your payment...
          </h1>
          <p className="text-forest/55 text-[14px]">This usually takes a few seconds. Please don&apos;t close this page.</p>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-[440px]">
          <h1 className="font-display font-bold text-error text-[26px] md:text-[30px] mb-3" style={{ letterSpacing: '-0.01em' }}>
            We couldn&apos;t confirm your order
          </h1>
          <p className="text-forest/55 text-[14px] leading-relaxed mb-7">
            {reference
            ? <>If you were charged, please contact us with this reference: <strong className="text-forest">{reference}</strong></>
            : 'If you were charged, please contact us with your payment reference.'
          }
          </p>
          <Link href="/" className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[600px] mx-auto px-6 py-16 md:py-20 text-center">

        <div className="flex justify-center mb-2">
          <OrderConfirmedIllustration />
        </div>

        <h1 className="font-display font-bold text-forest text-[36px] md:text-[44px] leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
          Order Confirmed!
        </h1>
        <p className="text-forest/55 text-[15px] mb-1">Your order number is</p>
        <p className="font-display font-bold text-olive text-[24px] mb-8">
          {order.orderNumber}
        </p>

        {/* RECEIPT */}
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8 text-left mb-9">
          <div className="flex flex-col gap-3 mb-5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-[14px] text-forest">
                <span className="text-forest/70">{item.name} ({item.size}) × {item.quantity}</span>
                <span className="font-medium whitespace-nowrap ml-3">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t-[1.5px] border-border pt-4 flex flex-col gap-2.5">
            <div className="flex justify-between text-[14px] text-forest">
              <span>Subtotal</span><span className="font-medium">₦{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[14px] text-forest">
              <span>Shipping</span><span className="font-medium">₦{order.shippingCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[18px] font-display font-bold text-forest pt-2">
              <span>Total</span><span>₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <p className="text-forest/55 text-[13px] mb-8">
          A confirmation email has been sent to you. You can track your order anytime.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/track-order?orderNumber=${order.orderNumber}`}
            className="rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/shop"
            className="rounded-full border-[1.5px] border-border text-forest text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:border-olive transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}