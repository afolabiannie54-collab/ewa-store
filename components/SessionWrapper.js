'use client'

import { useEffect, useRef } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { getGuestCart, clearGuestCart } from '@/lib/cart-client'

function CartMerger() {
  const { status } = useSession()
  const hasMerged = useRef(false)

  useEffect(() => {
    if (status === 'authenticated' && !hasMerged.current) {
      hasMerged.current = true
      mergeGuestCart()
    }
  }, [status])

  const mergeGuestCart = async () => {
    const guestItems = getGuestCart()
    if (guestItems.length === 0) return

    try {
      await fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: guestItems })
      })
      clearGuestCart()
    } catch (err) {
      console.error('Failed to merge cart', err)
    }
  }

  return null
}

export default function SessionWrapper({ children }) {
  return (
    <SessionProvider>
      <CartMerger />
      {children}
    </SessionProvider>
  )
}