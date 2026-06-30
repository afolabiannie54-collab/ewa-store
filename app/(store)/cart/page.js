'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import Loader from '@/components/Loader'
import { getGuestCart, updateGuestCartItem, removeFromGuestCart } from '@/lib/cart-client'
import EmptyCartIllustration from '@/components/EmptyCartIllustration'

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" />
    </svg>
  )
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.role === 'admin'
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

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-12 md:py-16">

        {items.length > 0 && (
          <>
            <h1 className="font-display font-bold text-forest text-[48px] md:text-[68px] leading-none mb-3" style={{ letterSpacing: '-0.03em' }}>
              Shopping Cart
            </h1>
            <p className="text-forest/55 text-[15px] mb-12 max-w-[460px]">
              Double check everything before heading to checkout.
            </p>
          </>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-12 md:py-20">
            <EmptyCartIllustration />
            <h2 className="font-display font-bold text-forest text-[26px] md:text-[30px] mt-6 mb-3" style={{ letterSpacing: '-0.01em' }}>
              Your cart is empty
            </h2>
            <p className="text-[15px] text-forest/55 leading-relaxed max-w-[360px] mb-9">
              Looks like you haven&apos;t added anything yet. Let&apos;s find something your skin will love.
            </p>
            <Link
              href="/shop"
              className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-10 py-[17px] hover:bg-forest transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-14">

            {/* CART ITEMS */}
            <div>
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-5 py-6 border-b-[1.5px] border-border"
                >
                  <div className="relative w-[100px] h-[100px] rounded-[16px] overflow-hidden bg-surface border-[1.5px] border-border flex-shrink-0">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="100px" className="object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${item.slug}`} className="font-display font-bold text-forest text-[19px] md:text-[21px] hover:text-olive transition-colors">
                      {item.name}
                    </Link>
                    <p className="text-[13px] text-forest/50 mt-1">Size: {item.size}</p>
                    <p className="font-display font-bold text-forest text-[18px] mt-2">
                      ₦{item.price.toLocaleString()}
                    </p>

                    {item.quantity > item.availableStock && (
                      <p className="text-[12px] font-medium text-error mt-1.5">
                        Only {item.availableStock} left in stock
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button
                      onClick={() => handleRemove(item.productId, item.size)}
                      aria-label="Remove item"
                      className="text-forest/40 hover:text-error transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>

                    <div className="flex items-center rounded-full border-[1.5px] border-border">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-forest text-[16px] hover:bg-surface transition-colors rounded-l-full"
                      >
                        −
                      </button>
                      <span className="w-9 text-center text-[14px] font-bold text-forest">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.size, item.quantity + 1)}
                        disabled={item.quantity >= item.availableStock}
                        className="w-9 h-9 flex items-center justify-center text-forest text-[16px] hover:bg-surface transition-colors rounded-r-full disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8 h-fit lg:sticky lg:top-8">
              <h2 className="font-display font-bold text-forest text-[22px] mb-6">Order Summary</h2>

              <div className="flex items-center justify-between text-[15px] text-forest mb-3">
                <span>Subtotal</span>
                <span className="font-bold">₦{subtotal.toLocaleString()}</span>
              </div>

              <p className="text-[13px] text-forest/50 mb-7">
                Shipping calculated at checkout
              </p>

              {isAdmin ? (
                <div>
                  <div className="block text-center w-full rounded-full bg-border text-muted text-[14px] font-bold uppercase tracking-[0.1em] py-[18px] cursor-not-allowed">
                    Proceed to Checkout
                  </div>
                  <p className="text-[12px] text-forest/45 text-center mt-3">
                    Admin accounts cannot complete purchases.
                  </p>
                </div>
              ) : (
                <Link
                  href="/checkout"
                  className="block text-center w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-[18px] hover:bg-forest transition-colors"
                >
                  Proceed to Checkout
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}