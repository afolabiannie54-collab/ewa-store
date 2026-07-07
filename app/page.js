'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/ProductCard'
import QuickAddModal from '@/components/QuickAddModal'
import FadeInSection from '@/components/FadeInSection'
import { motion } from 'framer-motion'
import { useToast } from '@/lib/useToast'

export default function HomePage() {
  const showToast = useToast()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [wishlistIds, setWishlistIds] = useState([])
  const [quickAddSlug, setQuickAddSlug] = useState(null)
  const [featuredReviews, setFeaturedReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  useEffect(() => {
    fetchFeatured()
    fetchWishlist()
    fetchFeaturedReviews()
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

  const fetchFeaturedReviews = async () => {
    try {
      const res = await fetch('/api/reviews/featured')
      const data = await res.json()
      setFeaturedReviews(data.reviews || [])
    } catch (err) {
      console.error('Failed to load featured reviews')
    }
    setReviewsLoading(false)
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
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-[14px] font-bold uppercase tracking-[0.2em] text-olive mb-6"
            >
              Clean skincare · Made for you
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              className="font-display font-bold text-forest leading-[0.95] text-[48px] md:text-[64px] mb-7"
              style={{ letterSpacing: '-0.02em' }}
            >
              Skin that feels<br />like itself again
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: 'easeOut' }}
              className="text-[17px] text-forest/65 leading-relaxed max-w-[420px] mb-9"
            >
              Made with what your skin actually asks for — gentle, effective ingredients, nothing it doesn&apos;t need.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36, ease: 'easeOut' }}
            >
              <Link
                href="/shop"
                className="inline-block rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors w-fit"
              >
                Shop Now
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
            className="group relative -mx-6 md:mx-0 w-screen md:w-full h-[560px] md:h-auto flex items-end justify-center border-t-[2.5px] border-olive md:border-t-0"
          >
            <div
              className="absolute bottom-[6%] w-[80%] md:w-[85%] h-[140px] md:h-[180px] rounded-[50%] transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-70"
              style={{
                background: 'radial-gradient(ellipse 50% 50% at center, rgba(40,54,24,0.22) 0%, rgba(40,54,24,0.10) 40%, transparent 80%)'
              }}
            />
            <Link
              href="/shop/hydrating-cleanser"
              className="relative w-[350px] md:w-[600px] h-full md:h-[105%] block transition-transform duration-500 ease-out group-hover:-rotate-1 group-hover:scale-105"
              style={{ transformOrigin: 'bottom right' }}
              aria-label="Shop the EWA Hydrating Cleanser"
            >
              <Image
                src="/hero-product.png"
                alt="EWA Hydrating Cleanser"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-bottom"
              />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FEATURED — collapses entirely if no products are flagged */}
      {!loading && featured.length === 0 ? null : (
        <FadeInSection y={40} scale={0.97}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-[20px] bg-cream/10 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {featured.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product._id)}
                    onWishlistToggle={handleWishlistToggle}
                    onQuickAdd={() => setQuickAddSlug(product.slug)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        </FadeInSection>
      )}

      {/* OUR STORY TEASER */}
      <FadeInSection y={20}>
      <section className="relative min-h-[900px] md:min-h-[860px] overflow-hidden">
        <Image
          src="/about-teaser.jpg"
          alt="Skincare made for melanin-rich skin"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-forest/60" />

        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-16 py-16 md:py-24">
          <h2 className="font-display font-bold text-cream text-[42px] md:text-[72px] leading-[1.05] mb-7 max-w-[760px]" style={{ letterSpacing: '-0.02em' }}>
            Built for Nigerian skin, in Nigerian heat
          </h2>
          <p className="text-[16px] md:text-[20px] text-cream/85 leading-relaxed mb-9 max-w-[560px]">
            Most skincare is formulated for cooler, drier climates and quietly hopes it works here too. EWA started from the opposite direction — humidity, heat, and melanin-rich skin first, everything else built around that.
          </p>

          <Link
            href="/about"
            className="inline-block w-fit rounded-full bg-cream text-forest text-[15px] md:text-[16px] font-bold uppercase tracking-[0.1em] px-10 py-5 mb-14 hover:bg-olive hover:text-cream transition-colors"
          >
            Read Our Story
          </Link>

          <div className="flex flex-wrap md:flex-nowrap gap-3.5">
            {['Climate-Adapted', 'Cruelty-Free', 'Clean Ingredients', 'Made for Melanin-Rich Skin'].map((label) => (
              <span
                key={label}
                className="flex-shrink-0 rounded-full border-2 border-cream/40 bg-cream/10 backdrop-blur-sm px-5 py-2.5 text-[12px] md:text-[14px] font-bold uppercase tracking-wide text-cream transition-colors hover:bg-cream hover:text-forest hover:border-cream cursor-default"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>
      </FadeInSection>

      {/* SHOP BY CONCERN */}
      <FadeInSection y={24}>
      <section className="bg-cream">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-20 md:py-28">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">
              Find What Works For You
            </p>
            <h2 className="font-display font-bold text-forest text-[36px] md:text-[48px]" style={{ letterSpacing: '-0.01em' }}>
              Shop by Concern
            </h2>
          </div>

          <div className="flex flex-col items-center gap-5 md:gap-6">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {['Acne', 'Aging', 'Hydration'].map(concern => (
                <Link
                  key={concern}
                  href={`/shop?skinConcern=${encodeURIComponent(concern)}`}
                  className="group flex items-center gap-3 rounded-full bg-white px-10 md:px-14 py-5 md:py-6 text-[17px] md:text-[20px] font-bold text-forest hover:text-olive hover:-translate-y-0.5 transition-all duration-200"
                  style={{ border: '1.5px solid rgba(40,54,24,0.1)', boxShadow: '0 4px 18px -4px rgba(40,54,24,0.13), 0 1px 4px rgba(40,54,24,0.07)' }}
                >
                  {concern}
                  <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-olive">→</span>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 md:translate-x-14">
              {['Hyperpigmentation', 'Brightening'].map(concern => (
                <Link
                  key={concern}
                  href={`/shop?skinConcern=${encodeURIComponent(concern)}`}
                  className="group flex items-center gap-3 rounded-full bg-white px-10 md:px-14 py-5 md:py-6 text-[17px] md:text-[20px] font-bold text-forest hover:text-olive hover:-translate-y-0.5 transition-all duration-200"
                  style={{ border: '1.5px solid rgba(40,54,24,0.1)', boxShadow: '0 4px 18px -4px rgba(40,54,24,0.13), 0 1px 4px rgba(40,54,24,0.07)' }}
                >
                  {concern}
                  <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-olive">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center mt-10 md:mt-14">
            <Link
              href="/shop"
              className="text-[13px] font-bold uppercase tracking-[0.12em] text-forest/45 hover:text-olive transition-colors"
            >
              Browse all products →
            </Link>
          </div>
        </div>
      </section>
      </FadeInSection>

      {/* SAGE TEASER */}
      <FadeInSection y={24}>
      <section style={{ background: 'linear-gradient(140deg, #384c17 0%, #4f6425 45%, #627c30 100%)', padding: 'clamp(72px, 10vw, 100px) 0 clamp(80px, 12vw, 120px)' }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            <div>
              <p style={{ color: 'rgba(254,250,224,0.5)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Meet Sage
              </p>
              <h2
                className="font-display font-bold text-cream"
                style={{ fontSize: 'clamp(36px, 4.5vw, 58px)', letterSpacing: '-0.02em', lineHeight: '1.06', marginBottom: '24px' }}
              >
                Your personal skincare advisor, always on
              </h2>
              <p style={{ fontSize: '17px', lineHeight: '1.8', color: 'rgba(254,250,224,0.62)', marginBottom: '44px', maxWidth: '420px' }}>
                Whether it&apos;s a specific skin concern or just figuring out where to start — Sage is warm, knowledgeable, and right there in the corner of your screen.
              </p>
              <button
                onClick={() => window.dispatchEvent(new Event('sage:open'))}
                style={{ display: 'inline-flex', alignItems: 'center', background: '#FEFAE0', color: '#384c17', fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 32px', borderRadius: '999px', border: 'none', cursor: 'pointer' }}
              >
                Chat with Sage
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '16px', paddingBottom: '16px' }}>
              <div style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '24px', boxShadow: '0 48px 120px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)', overflow: 'hidden', transform: 'rotate(-1.5deg)' }}>

                <div style={{ background: 'linear-gradient(135deg, #283618 0%, #384c17 100%)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f6425 0%, #627c30 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 32 32" fill="none" style={{ width: '20px', height: '20px' }}>
                        <path d="M16 4C9 8 6 14 6 19c0 5.5 4.5 9 10 9s10-3.5 10-9c0-5-3-11-10-15Z" fill="#FEFAE0" />
                        <path d="M16 9v17" stroke="#FEFAE0" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                        <path d="M16 13c-1.5 1-3 2.5-3 4M16 18c1.5 1 3 2.5 3 4" stroke="#FEFAE0" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
                      </svg>
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', border: '2px solid #283618' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#FEFAE0', fontWeight: 700, fontSize: '16px', lineHeight: '1.2', margin: 0 }}>Sage</p>
                    <p style={{ color: 'rgba(254,250,224,0.45)', fontSize: '11px', margin: 0 }}>Your skin advisor</p>
                  </div>
                </div>

                <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f6425 0%, #627c30 100%)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 32 32" fill="none" style={{ width: '13px', height: '13px' }}>
                        <path d="M16 4C9 8 6 14 6 19c0 5.5 4.5 9 10 9s10-3.5 10-9c0-5-3-11-10-15Z" fill="#FEFAE0" />
                      </svg>
                    </div>
                    <div style={{ background: '#f4f3ee', border: '1.5px solid #D6CEB8', borderRadius: '4px 14px 14px 14px', padding: '10px 14px', fontSize: '13px', lineHeight: '1.55', color: '#283618', maxWidth: '230px' }}>
                      Hi! I&apos;m Sage. What&apos;s going on with your skin lately?
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ background: 'linear-gradient(135deg, #4f6425 0%, #283618 100%)', borderRadius: '14px 4px 14px 14px', padding: '10px 14px', fontSize: '13px', lineHeight: '1.55', color: '#FEFAE0', maxWidth: '200px' }}>
                      My skin gets so oily by noon
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f6425 0%, #627c30 100%)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 32 32" fill="none" style={{ width: '13px', height: '13px' }}>
                        <path d="M16 4C9 8 6 14 6 19c0 5.5 4.5 9 10 9s10-3.5 10-9c0-5-3-11-10-15Z" fill="#FEFAE0" />
                      </svg>
                    </div>
                    <div style={{ background: '#f4f3ee', border: '1.5px solid #D6CEB8', borderRadius: '4px 14px 14px 14px', padding: '10px 14px', fontSize: '13px', lineHeight: '1.55', color: '#283618', maxWidth: '230px' }}>
                      Lagos heat will do that. A lightweight gel moisturiser actually helps regulate oil — sounds counterintuitive, but it works.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f6425 0%, #627c30 100%)', flexShrink: 0 }} />
                    <div style={{ background: '#f4f3ee', border: '1.5px solid #D6CEB8', borderRadius: '4px 14px 14px 14px', padding: '11px 16px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(40,54,24,0.25)', display: 'inline-block' }} />
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(40,54,24,0.25)', display: 'inline-block' }} />
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(40,54,24,0.25)', display: 'inline-block' }} />
                    </div>
                  </div>
                </div>

                <div style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(40,54,24,0.07)', background: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, background: '#f5f4f0', borderRadius: '999px', padding: '9px 16px', fontSize: '13px', color: 'rgba(40,54,24,0.35)', border: '1.5px solid #D6CEB8' }}>
                    Ask Sage anything...
                  </div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f6425 0%, #283618 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FEFAE0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
      </FadeInSection>

      {/* REVIEWS */}
      {(reviewsLoading || featuredReviews.length > 0) && (
        <>
          <style>{`
            .ewa-review-card {
              transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.38s ease;
              box-shadow: 0 32px 80px -16px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.15);
            }
            .ewa-review-card:hover {
              transform: translateY(-12px);
              box-shadow: 0 52px 120px -12px rgba(0,0,0,0.78), 0 8px 24px rgba(0,0,0,0.22) !important;
            }
            .ewa-review-quote {
              transition: opacity 0.38s ease, transform 0.38s ease;
            }
            .ewa-review-card:hover .ewa-review-quote {
              opacity: 0.13;
              transform: scale(1.08) translateY(-4px);
            }
            .ewa-review-stars svg {
              transition: transform 0.2s ease;
            }
            .ewa-review-card:hover .ewa-review-stars svg {
              transform: scale(1.15);
            }
          `}</style>
          <FadeInSection y={44} delay={0.05}>
          <section style={{ background: '#141d0c', position: 'relative', overflow: 'hidden' }}>

            {/* Background decorative layer */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
              {/* Dot grid */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(254,250,224,0.055) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              {/* Radial glow — top right */}
              <div style={{ position: 'absolute', top: '-25%', right: '-8%', width: '640px', height: '640px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,100,37,0.22) 0%, transparent 65%)' }} />
              {/* Radial glow — bottom left */}
              <div style={{ position: 'absolute', bottom: '-25%', left: '-8%', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(40,54,24,0.32) 0%, transparent 65%)' }} />
              {/* Giant decorative quote — top left */}
              <div className="font-display font-bold select-none" style={{ position: 'absolute', top: '-4%', left: '-1%', fontSize: '340px', lineHeight: 1, color: 'rgba(254,250,224,0.03)', transform: 'rotate(-6deg)' }}>&ldquo;</div>
              {/* Giant decorative quote — bottom right (flipped) */}
              <div className="font-display font-bold select-none" style={{ position: 'absolute', bottom: '-8%', right: '-1%', fontSize: '340px', lineHeight: 1, color: 'rgba(254,250,224,0.03)', transform: 'rotate(174deg)' }}>&ldquo;</div>
            </div>

            <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-24 md:py-32" style={{ position: 'relative', zIndex: 1 }}>

              <div className="text-center mb-16 md:mb-20">
                <p style={{ color: 'rgba(254,250,224,0.35)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '18px' }}>
                  Real Customers, Real Results
                </p>
                <h2 className="font-display font-bold text-cream" style={{ fontSize: 'clamp(38px, 5vw, 62px)', letterSpacing: '-0.02em', lineHeight: 1.04 }}>
                  What People Are Saying
                </h2>
              </div>

              <div className={`grid gap-6 md:gap-8 ${
                reviewsLoading || featuredReviews.length >= 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : featuredReviews.length === 2
                  ? 'grid-cols-1 md:grid-cols-2 max-w-[860px] mx-auto'
                  : 'grid-cols-1 max-w-[420px] mx-auto'
              }`}>
                {reviewsLoading
                  ? [1,2,3].map(i => (
                      <div key={i} className="rounded-[24px] animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', height: '280px' }} />
                    ))
                  : featuredReviews.slice(0, 3).map(review => (
                      <div
                        key={review._id}
                        className="ewa-review-card relative bg-white rounded-[24px] p-8 md:p-10 flex flex-col overflow-hidden"
                      >
                        <span
                          className="ewa-review-quote absolute font-display font-bold select-none pointer-events-none"
                          style={{ top: '-8px', right: '20px', fontSize: '160px', lineHeight: 1, color: 'rgba(40,54,24,0.055)' }}
                          aria-hidden="true"
                        >
                          &ldquo;
                        </span>

                        <div className="ewa-review-stars flex gap-1 mb-6">
                          {[1,2,3,4,5].map(i => (
                            <svg key={i} viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="#4f6425" stroke="none">
                              <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7L12 2.5Z" />
                            </svg>
                          ))}
                        </div>

                        <p className="text-forest text-[17px] md:text-[18px] leading-[1.7] font-medium flex-1 mb-8">
                          &ldquo;{review.comment}&rdquo;
                        </p>

                        <div style={{ borderTop: '1px solid rgba(40,54,24,0.1)', paddingTop: '20px' }}>
                          <p className="text-[13px]">
                            <span className="font-bold text-forest">{review.userId?.name || 'EWA Customer'}</span>
                            <span style={{ color: 'rgba(40,54,24,0.35)' }}> on our </span>
                            <Link href={`/shop/${review.productId?.slug}`} className="font-bold text-olive hover:underline">
                              {review.productId?.name}
                            </Link>
                          </p>
                        </div>
                      </div>
                    ))
                }
              </div>

            </div>
          </section>
          </FadeInSection>
        </>
      )}

      <QuickAddModal
        slug={quickAddSlug}
        isOpen={!!quickAddSlug}
        onClose={() => setQuickAddSlug(null)}
        onAdded={() => {
          setQuickAddSlug(null)
          showToast('Added to cart!')
        }}
      />

    </div>
  )
}