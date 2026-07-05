'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import EmptyWishlistIllustration from '@/components/EmptyWishlistIllustration'
import AdminBrowsingBanner from '@/components/AdminBrowsingBanner'
import ProductCard from '@/components/ProductCard'
import QuickAddModal from '@/components/QuickAddModal'
import AccountNav from '@/components/AccountNav'
import { useToast } from '@/lib/useToast'

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [quickAddProduct, setQuickAddProduct] = useState(null)
  const showToast = useToast()

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
    const res = await fetch(`/api/users/me/wishlist/${productId}`, { method: 'DELETE' })
    if (res.ok) setWishlist(wishlist.filter(p => p._id !== productId))
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

        <AccountNav />

        {isAdmin && <AdminBrowsingBanner />}

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
              <ProductCard
                key={product._id}
                product={product}
                isWishlisted={true}
                onWishlistToggle={() => handleRemove(product._id)}
                onQuickAdd={() => setQuickAddProduct(product)}
              />
            ))}
          </div>
        )}
        {quickAddProduct && (
          <QuickAddModal
            product={quickAddProduct}
            isOpen={!!quickAddProduct}
            onClose={() => setQuickAddProduct(null)}
            onAdded={() => {
              setQuickAddProduct(null)
              showToast('Added to cart!')
            }}
          />
        )}
      </div>
    </div>
  )
}
