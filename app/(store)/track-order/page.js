'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Loader from '@/components/Loader'
import FieldError from '@/components/FieldError'
import { isValidEmail, isRequired } from '@/lib/validation'

function TrackIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    </svg>
  )
}

function TrackOrderContent() {
  const searchParams = useSearchParams()

  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const errors = {}
    if (!isRequired(orderNumber)) errors.orderNumber = 'Please enter your order number'
    if (!isRequired(email)) {
      errors.email = 'Please enter your email'
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOrder(null)

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

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
    <div className="bg-forest min-h-screen">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-16 md:py-24">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* LEFT: BIG STATEMENT */}
          <div>
            <div className="w-14 h-14 rounded-full bg-cream/10 flex items-center justify-center mb-8">
              <TrackIcon className="w-6 h-6 text-cream" />
            </div>
            <h1 className="font-display font-bold text-cream text-[52px] md:text-[76px] leading-[0.95] mb-6" style={{ letterSpacing: '-0.03em' }}>
              Where&apos;s your<br />order?
            </h1>
            <p className="text-cream/60 text-[16px] leading-relaxed max-w-[400px]">
              Pop in your order number and the email you checked out with — we&apos;ll pull up exactly where things stand.
            </p>
          </div>

          {/* RIGHT: FORM CARD */}
          <div>
            <div className="rounded-[24px] bg-cream p-8 md:p-10">
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2.5">Order Number</label>
                  <input
                    type="text"
                    placeholder="EWA-2026-12345"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className={`w-full rounded-[12px] border-[2px] bg-surface px-5 py-4 text-[15px] text-forest placeholder:text-forest/35 outline-none transition-colors ${
                      fieldErrors.orderNumber ? 'border-error' : 'border-forest/20 focus:border-olive'
                    }`}
                  />
                  <FieldError message={fieldErrors.orderNumber} />
                </div>
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wide text-forest mb-2.5">Email</label>
                  <input
                    type="text"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-[12px] border-[2px] bg-surface px-5 py-4 text-[15px] text-forest placeholder:text-forest/35 outline-none transition-colors ${
                      fieldErrors.email ? 'border-error' : 'border-forest/20 focus:border-olive'
                    }`}
                  />
                  <FieldError message={fieldErrors.email} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-[18px] mt-2 hover:bg-forest transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader size="sm" color="cream" /> : 'Track My Order'}
                </button>
              </form>

              {error && <p className="text-[13px] text-error mt-5">{error}</p>}
            </div>

            {order && (
              <div className="rounded-[24px] border-[1.5px] border-cream/20 bg-cream/[0.06] p-8 md:p-10 mt-6">
                <p className="text-[12px] font-bold uppercase tracking-wide text-cream/40 mb-1.5">Order Number</p>
                <p className="font-display font-bold text-cream text-[24px] mb-8">{order.orderNumber}</p>

                {order.status === 'Cancelled' ? (
                  <p className="text-[14px] font-medium text-error mb-8">This order was cancelled.</p>
                ) : (
                  <div className="flex justify-between mb-9">
                    {statusSteps.map((step, i) => {
                      const currentIndex = statusSteps.indexOf(order.status)
                      const isComplete = i <= currentIndex
                      return (
                        <div key={step} className="flex-1 text-center relative">
                          {i > 0 && (
                            <div className={`absolute top-3 right-1/2 left-[-50%] h-[2px] ${i <= currentIndex ? 'bg-olive' : 'bg-cream/15'}`} />
                          )}
                          <div className={`relative w-6 h-6 rounded-full mx-auto mb-2.5 ${isComplete ? 'bg-olive' : 'bg-cream/15'}`} />
                          <p className={`text-[12px] font-medium ${isComplete ? 'text-cream' : 'text-cream/35'}`}>{step}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="border-t-[1.5px] border-cream/15 pt-5 flex flex-col gap-2.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[14px] text-cream/80">
                      <span>{item.name} ({item.size}) × {item.quantity}</span>
                      <span className="font-medium whitespace-nowrap ml-3">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[19px] font-display font-bold text-cream pt-3 mt-1 border-t-[1.5px] border-cream/15">
                    <span>Total</span>
                    <span>₦{order.total.toLocaleString()}</span>
                  </div>
                </div>

                {order.invoiceUrl && (
                  <a
                    href={order.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full rounded-full border-[1.5px] border-cream/30 text-cream text-[13px] font-bold uppercase tracking-[0.1em] py-3.5 mt-7 hover:border-cream transition-colors"
                  >
                    Download Invoice
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="bg-forest min-h-screen flex items-center justify-center">
        <Loader size="lg" color="cream" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  )
}