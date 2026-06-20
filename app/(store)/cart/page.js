'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { getGuestCart, updateGuestCartItem, removeFromGuestCart } from '@/lib/cart-client'

export default function CartPage() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'loading') {
      fetchCart()
    }
  }, [status])

  const fetchCart = async () => {
    setLoading(true)

    if (session) {
      try {
        const res = await fetch('/api/cart')
        const data = await res.json()
        setItems(data.items || [])
      } catch (err) {
        console.error('Failed to load cart')
      }
    } else {
      const guestItems = getGuestCart()
      if (guestItems.length === 0) {
        setItems([])
      } else {
        try {
          const res = await fetch('/api/cart/guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: guestItems })
          })
          const data = await res.json()
          setItems(data.items || [])
        } catch (err) {
          console.error('Failed to load guest cart')
        }
      }
    }

    setLoading(false)
  }

  const handleUpdateQuantity = async (productId, size, newQuantity) => {
    if (newQuantity < 1) return

    if (session) {
      await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size, quantity: newQuantity })
      })
    } else {
      updateGuestCartItem(productId, size, newQuantity)
    }

    fetchCart()
  }

  const handleRemove = async (productId, size) => {
    if (session) {
      await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size })
      })
    } else {
      removeFromGuestCart(productId, size)
    }

    fetchCart()
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (loading) return <div style={{ padding: '40px' }}>Loading cart...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: '#283618', marginBottom: '32px' }}>Your Cart</h1>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#7A7A5C', marginBottom: '20px' }}>Your cart is empty.</p>
          <Link href="/shop" style={{ color: '#606C38', fontWeight: 500 }}>Continue shopping →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px' }}>

          {/* CART ITEMS */}
          <div>
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                style={{
                  display: 'flex', gap: '16px', padding: '20px 0',
                  borderBottom: '1px solid #D6CEB8'
                }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: '#FEFAE0', flexShrink: 0 }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>

                <div style={{ flex: 1 }}>
                  <Link href={`/shop/${item.slug}`} style={{ fontSize: '14px', color: '#283618', fontWeight: 500, textDecoration: 'none' }}>
                    {item.name}
                  </Link>
                  <p style={{ fontSize: '12px', color: '#7A7A5C', marginTop: '4px' }}>Size: {item.size}</p>
                  <p style={{ fontSize: '14px', color: '#283618', fontWeight: 600, marginTop: '8px' }}>
                    ₦{item.price.toLocaleString()}
                  </p>

                  {item.quantity > item.availableStock && (
                    <p style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>
                      Only {item.availableStock} left in stock
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.size, item.quantity - 1)}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #D6CEB8', background: 'transparent', cursor: 'pointer' }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: '13px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.size, item.quantity + 1)}
                      disabled={item.quantity >= item.availableStock}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #D6CEB8', background: 'transparent', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.productId, item.size)}
                    style={{ fontSize: '12px', color: '#C0392B', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', border: '1px solid #D6CEB8',
            padding: '24px', height: 'fit-content', position: 'sticky', top: '24px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#283618', marginBottom: '20px' }}>Order Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#283618', marginBottom: '12px' }}>
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>

            <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '20px' }}>
              Shipping calculated at checkout
            </p>

            <Link
              href="/checkout"
              style={{
                display: 'block', textAlign: 'center', width: '100%', padding: '14px',
                borderRadius: '100px', background: '#606C38', color: '#FEFAE0',
                fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em',
                textTransform: 'uppercase', textDecoration: 'none'
              }}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}