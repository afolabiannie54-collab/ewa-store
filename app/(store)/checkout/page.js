'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Loader from '@/components/Loader'
import FieldError from '@/components/FieldError'
import { getGuestCart, clearGuestCart } from '@/lib/cart-client'
import { isValidEmail, isRequired, isValidPhone } from '@/lib/validation'
import { NIGERIAN_STATES, getShippingTier } from '@/lib/shipping'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const router = useRouter()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

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
    try {
      const res = await fetch('/api/shipping/rates')
      if (!res.ok) return
      const data = await res.json()
      setShippingRates(data.rates || [])
    } catch {}
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

  const validate = () => {
    const errors = {}

    // Validate guest contact details (only if not logged in)
    if (!session) {
      if (!isRequired(form.guestName)) errors.guestName = 'Name is required'
      if (!isRequired(form.guestEmail)) {
        errors.guestEmail = 'Email is required'
      } else if (!isValidEmail(form.guestEmail)) {
        errors.guestEmail = 'Please enter a valid email'
      }
      if (!isRequired(form.guestPhone)) {
        errors.guestPhone = 'Phone number is required'
      } else if (!isValidPhone(form.guestPhone)) {
        errors.guestPhone = 'Please enter a valid Nigerian phone number (e.g. 08012345678)'
      }
    }

    // Validate shipping address
    if (useNewAddress) {
      if (!isRequired(form.fullName)) errors.fullName = 'Full name is required'
      if (!isRequired(form.phone)) {
        errors.phone = 'Phone number is required'
      } else if (!isValidPhone(form.phone)) {
        errors.phone = 'Please enter a valid Nigerian phone number (e.g. 08012345678)'
      }
      if (!isRequired(form.street)) errors.street = 'Street address is required'
      if (!isRequired(form.city)) errors.city = 'City is required'
      if (!isRequired(form.state)) errors.state = 'State is required'
    } else {
      if (!selectedAddressId) errors.selectedAddress = 'Please select an address'
    }

    return errors
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
         body: JSON.stringify({ code: promoInput, subtotal, guestEmail: form.guestEmail })
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

    // Validate form
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    if (items.length === 0) {
      setError('Your cart is empty')
      return
    }

    let shippingAddress
    if (useNewAddress) {
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

    setSubmitting(true)

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
          shippingAddress,
          promoCode: promoApplied?.code || null,
          guestEmail: form.guestEmail?.trim(),
          guestName: form.guestName?.trim(),
          guestPhone: form.guestPhone?.trim()
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setSubmitting(false)
        return
      }

      if (!window.PaystackPop) {
        setError('Payment is loading. Please wait a moment and try again.')
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
        <Loader size="lg" />
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-[400px]">
          <p className="text-forest/60 text-[16px] mb-6">Admin accounts cannot complete purchases. Log in with a customer account to shop.</p>
          <Link href="/shop" className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors">
            Browse Shop
          </Link>
        </div>
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

        <form onSubmit={handlePayment} noValidate className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-14">

          {/* LEFT: CONTACT + ADDRESS */}
          <div>
            {!session && (
              <div className="mb-10">
                <h2 className="font-display font-bold text-forest text-[22px] mb-5">Contact Details</h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <input
                      type="text" placeholder="Full Name" value={form.guestName}
                      onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                      className={`w-full rounded-[12px] border-[1.5px] px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors ${
                        fieldErrors.guestName ? 'border-error' : 'border-border'
                      }`}
                    />
                    <FieldError message={fieldErrors.guestName} />
                  </div>
                  <div>
                    <input
                      type="email" placeholder="Email" value={form.guestEmail}
                      onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                      className={`w-full rounded-[12px] border-[1.5px] px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors ${
                        fieldErrors.guestEmail ? 'border-error' : 'border-border'
                      }`}
                    />
                    <FieldError message={fieldErrors.guestEmail} />
                  </div>
                  <div>
                    <input
                      type="tel" placeholder="Phone" value={form.guestPhone}
                      onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                      className={`w-full rounded-[12px] border-[1.5px] px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors ${
                        fieldErrors.guestPhone ? 'border-error' : 'border-border'
                      }`}
                    />
                    <FieldError message={fieldErrors.guestPhone} />
                  </div>
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
                      onChange={() => { setUseNewAddress(false); setSelectedAddressId(addr._id); setFieldErrors({}) }}
                      className="mt-0.5 accent-olive"
                    />
                    <span className="text-[14px] text-forest">{addr.fullName}, {addr.street}, {addr.city}, {addr.state}</span>
                  </label>
                ))}
                <label className="flex items-center gap-3 text-[14px] font-medium text-forest cursor-pointer px-1">
                  <input type="radio" checked={useNewAddress} onChange={() => { setUseNewAddress(true); setFieldErrors({}) }} className="accent-olive" />
                  Use a new address
                </label>
              </div>
            )}

            {useNewAddress && (
              <div className="flex flex-col gap-3">
                <div>
                  <input
                    type="text" placeholder="Full Name" value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className={`w-full rounded-[12px] border-[1.5px] px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors ${
                      fieldErrors.fullName ? 'border-error' : 'border-border'
                    }`}
                  />
                  <FieldError message={fieldErrors.fullName} />
                </div>
                <div>
                  <input
                    type="tel" placeholder="Phone" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full rounded-[12px] border-[1.5px] px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors ${
                      fieldErrors.phone ? 'border-error' : 'border-border'
                    }`}
                  />
                  <FieldError message={fieldErrors.phone} />
                </div>
                <div>
                  <input
                    type="text" placeholder="Street Address" value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    className={`w-full rounded-[12px] border-[1.5px] px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors ${
                      fieldErrors.street ? 'border-error' : 'border-border'
                    }`}
                  />
                  <FieldError message={fieldErrors.street} />
                </div>
                <div>
                  <input
                    type="text" placeholder="City" value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={`w-full rounded-[12px] border-[1.5px] px-5 py-3.5 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors ${
                      fieldErrors.city ? 'border-error' : 'border-border'
                    }`}
                  />
                  <FieldError message={fieldErrors.city} />
                </div>
                <div>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className={`w-full rounded-[12px] border-[1.5px] px-5 py-3.5 text-[14px] text-forest focus:border-olive outline-none transition-colors cursor-pointer ${
                      fieldErrors.state ? 'border-error' : 'border-border'
                    }`}
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <FieldError message={fieldErrors.state} />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8 h-fit lg:sticky lg:top-[96px]">
            <h2 className="font-display font-bold text-forest text-[22px] mb-6">Order Summary</h2>

            <div className="flex flex-col gap-3 mb-6 max-h-[240px] overflow-y-auto pr-1">
              {items.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between text-[14px] text-forest">
                  <span className="text-forest/70">{item.name} ({item.size}) × {item.quantity}</span>
                  <span className="font-medium whitespace-nowrap ml-3">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text" placeholder="Promo code" value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="flex-1 rounded-[10px] border-[1.5px] border-border px-4 py-2.5 text-[13px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="rounded-[10px] bg-forest text-cream px-5 py-2.5 text-[13px] font-bold hover:bg-olive transition-colors"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-[12px] text-error mb-4">{promoError}</p>}
            {promoApplied && <p className="text-[12px] font-medium text-success mb-4">Code applied: -₦{discount.toLocaleString()}</p>}

            <div className="border-t-[1.5px] border-border pt-5 mt-2 flex flex-col gap-2.5">
              <div className="flex justify-between text-[14px] text-forest">
                <span>Subtotal</span><span className="font-medium">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[14px] text-forest">
                <span>Shipping {shippingTier ? `(${shippingTier})` : ''}</span><span className="font-medium">₦{shippingCost.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[14px] text-success">
                  <span>Discount</span><span className="font-medium">-₦{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[19px] font-display font-bold text-forest pt-2">
                <span>Total</span><span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            {error && <p className="text-[13px] text-error mt-5">{error}</p>}

            {!selectedState && (
              <p className="text-[12px] text-forest/50 mt-5">
                Select or enter a shipping address to continue.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedState}
              className="w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-[18px] mt-5 hover:bg-forest transition-colors disabled:bg-border disabled:text-muted disabled:cursor-not-allowed"
            >
              {submitting ? <Loader size="sm" color="cream" /> : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}