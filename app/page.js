'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeatured()
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

  const getStartingPrice = (variants) => {
    if (!variants || variants.length === 0) return 0
    return Math.min(...variants.map(v => v.price))
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
              className="relative w-[350px] md:w-[600px] h-[105%] transition-transform duration-500 ease-out group-hover:-rotate-2 group-hover:scale-105"
              style={{ transformOrigin: 'bottom center' }}
            >
              <Image
                src="/hero-product.png"
                alt="EWA Hydrating Cleanser"
                fill
                priority
                className="object-contain object-bottom"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED — placeholder for now, building next */}
      <section id="bestsellers" className="max-w-[1320px] mx-auto px-6 md:px-12 py-20">
        <p className="text-text/60">Bestsellers section — building next</p>
      </section>

    </div>
  )
}