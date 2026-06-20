'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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

  if (loading) return <div style={{ padding: '40px' }}>Loading checkout...</div>

  if (items.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p style={{ color: '#7A7A5C' }}>Your cart is empty.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '32px' }}>Checkout</h1>

      <form onSubmit={handlePayment} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>

        <div>
          {!session && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#283618', marginBottom: '16px' }}>Contact Details</h2>
              <input
                type="text" placeholder="Full Name" value={form.guestName}
                onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
              />
              <input
                type="email" placeholder="Email" value={form.guestEmail}
                onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
              />
              <input
                type="tel" placeholder="Phone" value={form.guestPhone}
                onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8' }}
              />
            </div>
          )}

          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#283618', marginBottom: '16px' }}>Shipping Address</h2>

          {session && addresses.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              {addresses.map(addr => (
                <label key={addr._id} style={{ display: 'flex', gap: '8px', padding: '12px', border: '1px solid #D6CEB8', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={!useNewAddress && selectedAddressId === addr._id}
                    onChange={() => { setUseNewAddress(false); setSelectedAddressId(addr._id) }}
                  />
                  <span style={{ fontSize: '13px' }}>{addr.fullName}, {addr.street}, {addr.city}, {addr.state}</span>
                </label>
              ))}
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                <input type="radio" checked={useNewAddress} onChange={() => setUseNewAddress(true)} />
                Use a new address
              </label>
            </div>
          )}

          {useNewAddress && (
            <div>
              <input
                type="text" placeholder="Full Name" value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
              />
              <input
                type="tel" placeholder="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
              />
              <input
                type="text" placeholder="Street Address" value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
              />
              <input
                type="text" placeholder="City" value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', marginBottom: '10px' }}
              />
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8' }}
              >
                <option value="">Select State</option>
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        <div style={{
          background: '#FFFFFF', borderRadius: '20px', border: '1px solid #D6CEB8',
          padding: '24px', height: 'fit-content', position: 'sticky', top: '24px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#283618', marginBottom: '20px' }}>Order Summary</h2>

          {items.map(item => (
            <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span>{item.name} ({item.size}) × {item.quantity}</span>
              <span>₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
            <input
              type="text" placeholder="Promo code" value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6CEB8', fontSize: '13px' }}
            />
            <button type="button" onClick={handleApplyPromo} style={{ padding: '10px 16px', borderRadius: '10px', background: '#283618', color: '#FEFAE0', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
              Apply
            </button>
          </div>
          {promoError && <p style={{ color: '#C0392B', fontSize: '12px', marginBottom: '12px' }}>{promoError}</p>}
          {promoApplied && <p style={{ color: '#4A7C59', fontSize: '12px', marginBottom: '12px' }}>Code applied: -₦{discount.toLocaleString()}</p>}

          <div style={{ borderTop: '1px solid #D6CEB8', paddingTop: '16px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span>Shipping {shippingTier ? `(${shippingTier})` : ''}</span><span>₦{shippingCost.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: '#4A7C59' }}>
                <span>Discount</span><span>-₦{discount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 600, marginTop: '12px' }}>
              <span>Total</span><span>₦{total.toLocaleString()}</span>
            </div>
          </div>

          {error && <p style={{ color: '#C0392B', fontSize: '13px', marginTop: '16px' }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting || !selectedState}
            style={{
              width: '100%', padding: '14px', borderRadius: '100px', marginTop: '20px',
              background: '#606C38', color: '#FEFAE0', border: 'none',
              fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </form>
    </div>
  )
}