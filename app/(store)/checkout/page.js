'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getGuestCart, clearGuestCart } from '@/lib/cart-client'
import { NIGERIAN_STATES, getShippingTier } from '@/lib/shipping'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [useNewAddress, setUseNewAddress] = useState(true)

  const [form, setForm] = useState({
    fullName: '', phone: '', street: '', city: '', state: '',
    guestEmail: '', guestName: '', guestPhone: ''
  })

  const [promoInput, setPromoInput] = useState('')
  const [promoApplied, setPromoApplied] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [shippingRates, setShippingRates] = useState([])

  useEffect(() => {
    if (status !== 'loading') {
      loadCart()
      loadShippingRates()
      if (session) loadAddresses()
    }
  }, [status])

  const loadCart = async () => {
    if (session) {
      const res = await fetch('/api/cart')
      const data = await res.json()
      setItems(data.items || [])
    } else {
      const guestItems = getGuestCart()
      if (guestItems.length > 0) {
        const res = await fetch('/api/cart/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: guestItems })
        })
        const data = await res.json()
        setItems(data.items || [])
      }
    }
    setLoading(false)
  }

  const loadShippingRates = async () => {
    const res = await fetch('/api/shipping/rates')
    const data = await res.json()
    setShippingRates(data.rates || [])
  }

  const loadAddresses = async () => {
    const res = await fetch('/api/users/me/addresses')
    if (res.ok) {
      const data = await res.json()
      setAddresses(data.addresses || [])
      const defaultAddr = data.addresses?.find(a => a.isDefault)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id)
        setUseNewAddress(false)
      }
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const selectedState = useNewAddress
    ? form.state
    : addresses.find(a => a._id === selectedAddressId)?.state || ''

  const shippingTier = selectedState ? getShippingTier(selectedState) : null
  const shippingCost = shippingTier ? (shippingRates.find(r => r.tier === shippingTier)?.rate || 0) : 0

  const discount = promoApplied?.discount || 0
  const total = subtotal + shippingCost - discount

  const handleApplyPromo = async () => {
    setPromoError('')
    if (!promoInput) return

    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, subtotal })
      })
      const data = await res.json()

      if (!res.ok) {
        setPromoError(data.error)
        setPromoApplied(null)
      } else {
        setPromoApplied(data)
      }
    } catch (err) {
      setPromoError('Could not validate promo code')
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setError('')

    if (items.length === 0) {
      setError('Your cart is empty')
      return
    }

    let shippingAddress
    if (useNewAddress) {
      if (!form.fullName || !form.phone || !form.street || !form.city || !form.state) {
        setError('Please fill in all address fields')
        return
      }
      shippingAddress = {
        fullName: form.fullName,
        phone: form.phone,
        street: form.street,
        city: form.city,
        state: form.state
      }
    } else {
      const addr = addresses.find(a => a._id === selectedAddressId)
      if (!addr) {
        setError('Please select an address')
        return
      }
      shippingAddress = addr
    }

    if (!session && (!form.guestEmail || !form.guestName || !form.guestPhone)) {
      setError('Please fill in your contact details')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
          shippingAddress,
          promoCode: promoApplied?.code || null,
          guestEmail: form.guestEmail,
          guestName: form.guestName,
          guestPhone: form.guestPhone
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setSubmitting(false)
        return
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: data.email,
        amount: data.amount,
        ref: data.reference,
        metadata: data.metadata,
        callback: function (response) {
          clearGuestCart()
          router.push(`/checkout/verify?reference=${response.reference}`)
        },
        onClose: function () {
          setSubmitting(false)
        }
      })

      handler.openIframe()

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-forest/50 text-[15px]">Loading checkout...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-forest/60 text-[16px] mb-6">Your cart is empty.</p>
          <Link href="/shop" className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-12 md:py-16">

        <h1 className="font-display font-bold text-forest text-[44px] md:text-[60px] leading-none mb-12" style={{ letterSpacing: '-0.03em' }}>
          Checkout
        </h1>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-14">

          {/* LEFT: CONTACT + ADDRESS */}
          <div>
            {!session && (
              <div className="mb-10">
                <h2 className="font-display font-bold text-forest text-[22px] mb-5">Contact Details</h2>
                <div className="flex flex-col gap-3">
                  <input
                    type="text" placeholder="Full Name" value={form.guestName}
                    onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors"
                  />
                  <input
                    type="email" placeholder="Email" value={form.guestEmail}
                    onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors"
                  />
                  <input
                    type="tel" placeholder="Phone" value={form.guestPhone}
                    onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <h2 className="font-display font-bold text-forest text-[22px] mb-5">Shipping Address</h2>

            {session && addresses.length > 0 && (
              <div className="flex flex-col gap-3 mb-5">
                {addresses.map(addr => (
                  <label
                    key={addr._id}
                    className={`flex gap-3 p-4 rounded-[14px] border-[1.5px] cursor-pointer transition-colors ${
                      !useNewAddress && selectedAddressId === addr._id ? 'border-olive bg-surface' : 'border-border hover:border-olive/50'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={!useNewAddress && selectedAddressId === addr._id}
                      onChange={() => { setUseNewAddress(false); setSelectedAddressId(addr._id) }}
                      className="mt-0.5 accent-olive"
                    />
                    <span className="text-[14px] text-forest">{addr.fullName}, {addr.street}, {addr.city}, {addr.state}</span>
                  </label>
                ))}
                <label className="flex items-center gap-3 text-[14px] font-medium text-forest cursor-pointer px-1">
                  <input type="radio" checked={useNewAddress} onChange={() => setUseNewAddress(true)} className="accent-olive" />
                  Use a new address
                </label>
              </div>
            )}

            {useNewAddress && (
              <div className="flex flex-col gap-3">
                <input
                  type="text" placeholder="Full Name" value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full rounded-[12px] border-[1.5px] border-border px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors"
                />
                <input
                  type="tel" placeholder="Phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-[12px] border-[1.5px] border-border px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors"
                />
                <input
                  type="text" placeholder="Street Address" value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full rounded-[12px] border-[1.5px] border-border px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors"
                />
                <input
                  type="text" placeholder="City" value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-[12px] border-[1.5px] border-border px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors"
                />
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full rounded-[12px] border-[1.5px] border-border px-5 py-3.5 text-[14px] text-forest focus:border-olive outline-none transition-colors cursor-pointer"
                >
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <aside className="lg:sticky lg:top-8 lg:h-fit">
            <div className="border-[1.5px] border-border rounded-[20px] p-7 bg-surface">
              <h2 className="font-display font-bold text-forest text-[18px] mb-6">Order Summary</h2>

              <div className="flex flex-col gap-4 mb-6 pb-6 border-b-[1.5px] border-border">
                {items.map(item => (
                  <div key={`${item.productId}-${item.size}`} className="flex justify-between text-[14px]">
                    <span className="text-forest/70">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-forest">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[14px]">
                  <span className="text-forest/60">Subtotal</span>
                  <span className="text-forest">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-forest/60">Shipping</span>
                  <span className="text-forest">₦{shippingCost.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-forest/60">Discount</span>
                    <span className="text-olive font-medium">-₦{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="mb-6 pb-6 border-b-[1.5px] border-border">
                <div className="flex justify-between">
                  <span className="text-[15px] font-bold text-forest">Total</span>
                  <span className="text-[18px] font-bold text-forest">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[13px] font-bold uppercase tracking-wide text-forest/60 mb-2 block">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 rounded-[10px] border-[1.5px] border-border px-4 py-2.5 text-[13px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2.5 rounded-[10px] bg-olive text-cream text-[13px] font-bold uppercase tracking-wide hover:bg-forest transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[12px] text-error mt-2">{promoError}</p>}
                {promoApplied && <p className="text-[12px] text-success mt-2">✓ {promoApplied.code} applied</p>}
              </div>

              {error && <p className="text-[13px] text-error mb-4 text-center">{error}</p>}

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-4 hover:bg-forest transition-colors disabled:bg-border disabled:text-muted disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Proceed to Payment'}
              </button>

              <p className="text-[12px] text-forest/50 text-center mt-4">
                Your payment is secure and encrypted
              </p>
            </div>
          </aside>
        </form>

      </div>
    </div>
  )
}