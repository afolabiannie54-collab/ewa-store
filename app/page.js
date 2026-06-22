'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/ProductCard'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [wishlistIds, setWishlistIds] = useState([])

  useEffect(() => {
    fetchFeatured()
    fetchWishlist()
  }, [])

  const fetchFeatured = async () => {
    try {
      const res = await fetch('/api/products/featured')
      const data = await res.json()
      setFeatured(data.products || [])
    } catch (err) {
      console.error('Failed to load featured products')
    }
    setLoading(false)
  }

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/users/me/wishlist')
      if (!res.ok) return
      const data = await res.json()
      setWishlistIds((data.wishlist || []).map(p => p._id))
    } catch (err) {
      // not logged in or no wishlist yet — fine to ignore
    }
  }

  const handleWishlistToggle = async (productId, currentlyWishlisted) => {
    try {
      if (currentlyWishlisted) {
        await fetch(`/api/users/me/wishlist/${productId}`, { method: 'DELETE' })
        setWishlistIds(prev => prev.filter(id => id !== productId))
      } else {
        await fetch('/api/users/me/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        })
        setWishlistIds(prev => [...prev, productId])
      }
    } catch (err) {
      console.error('Wishlist toggle failed')
    }
  }

  return (
    <div className="bg-cream">

{/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1320px] px-6 md:px-0 grid grid-cols-1 md:grid-cols-2 items-stretch md:min-h-[calc(100vh-80px)]">

          <div className="relative z-10 py-16 md:py-0 md:pl-12 flex flex-col justify-center">
            <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-olive mb-6">
              Clean skincare · Made for you
            </p>
            <h1 className="font-display font-bold text-forest leading-[0.95] text-[48px] md:text-[64px] mb-7" style={{ letterSpacing: '-0.02em' }}>
              Skin that feels<br />like itself again
            </h1>
            <p className="text-[17px] text-forest/65 leading-relaxed max-w-[420px] mb-9">
              Made with what your skin actually asks for — gentle, effective ingredients, nothing it doesn&apos;t need.
            </p>
            <Link
              href="/shop"
              className="inline-block rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors w-fit"
            >
              Shop Now
            </Link>
          </div>

          <div className="group relative h-[560px] md:h-auto flex items-end justify-center">
            <div
              className="absolute bottom-[6%] w-[80%] md:w-[85%] h-[140px] md:h-[180px] rounded-[50%] transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-70"
              style={{
                background: 'radial-gradient(ellipse 50% 50% at center, rgba(40,54,24,0.22) 0%, rgba(40,54,24,0.10) 40%, transparent 80%)'
              }}
            />
            <div
              className="relative w-[350px] md:w-[600px] h-[105%] transition-transform duration-500 ease-out group-hover:-rotate-1 group-hover:scale-105"
              style={{ transformOrigin: 'bottom right' }}
            >
              <Image
                src="/hero-product.png"
                alt="EWA Hydrating Cleanser"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-bottom"
              />
            </div>
          </div>
        </div>
      </section>

     {/* FEATURED — collapses entirely if no products are flagged */}
      {!loading && featured.length === 0 ? null : (
        <section id="featured" className="bg-forest">
          <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-20">
            <div className="text-center mb-12">
              <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-cream/60 mb-3">
                Curated by us
              </p>
              <h2 className="font-display font-bold text-cream text-[48px] md:text-[60px]">
                Your Skin&apos;s New Best Friends
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-[20px] bg-cream/10 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {featured.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product._id)}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}