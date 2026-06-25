'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import EmptyWishlistIllustration from '@/components/EmptyWishlistIllustration'

export default function WishlistPage() {
  const { status } = useSession()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWishlist()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/users/me/wishlist')
      const data = await res.json()
      setWishlist(data.wishlist || [])
    } catch (err) {
      console.error('Failed to load wishlist')
    }
    setLoading(false)
  }

  const handleRemove = async (productId) => {
    await fetch(`/api/users/me/wishlist/${productId}`, { method: 'DELETE' })
    setWishlist(wishlist.filter(p => p._id !== productId))
  }

  const getStartingPrice = (variants) => {
    if (!variants || variants.length === 0) return 0
    return Math.min(...variants.map(v => v.price))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-forest/60 text-[16px] mb-6">Please log in to view your wishlist.</p>
          <Link href="/login" className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors">
            Log In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[900px] mx-auto px-6 py-12 md:py-16">

        <h1 className="font-display font-bold text-forest text-[44px] md:text-[56px] leading-none mb-8" style={{ letterSpacing: '-0.02em' }}>
          My Wishlist
        </h1>

        <div className="flex gap-2 mb-10">
          <Link href="/account" className="px-4 py-2 rounded-full border-[1.5px] border-border text-forest text-[12px] font-medium hover:border-olive transition-colors">Profile</Link>
          <Link href="/account/addresses" className="px-4 py-2 rounded-full border-[1.5px] border-border text-forest text-[12px] font-medium hover:border-olive transition-colors">Addresses</Link>
          <span className="px-4 py-2 rounded-full bg-olive text-cream text-[12px] font-medium">Wishlist</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center text-center py-12 md:py-20">
            <EmptyWishlistIllustration />
            <h2 className="font-display font-bold text-forest text-[26px] md:text-[30px] mt-6 mb-3" style={{ letterSpacing: '-0.01em' }}>
              Make a wish
            </h2>
            <p className="text-[15px] text-forest/55 leading-relaxed max-w-[360px] mb-9">
              Save the products you love and find them here whenever you&apos;re ready to treat yourself.
            </p>
            <Link
              href="/shop"
              className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-10 py-[17px] hover:bg-forest transition-colors"
            >
              Explore the Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {wishlist.map(product => (
              <div key={product._id} className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden">
                <Link href={`/shop/${product.slug}`}>
                  <div className="aspect-square bg-cream">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/shop/${product.slug}`}>
                    <p className="text-[14px] font-medium text-forest mb-1.5 hover:text-olive transition-colors">{product.name}</p>
                  </Link>
                  <p className="text-[15px] font-bold text-forest mb-4">
                    From ₦{getStartingPrice(product.variants).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="w-full rounded-full border-[1.5px] border-error text-error text-[12px] font-bold uppercase tracking-wide py-2 hover:bg-error hover:text-cream transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
