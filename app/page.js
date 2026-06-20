'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    <div>
      {/* HERO */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '70vh',
        background: '#FEFAE0'
      }}>
        <div style={{
          padding: '80px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#606C38' }}>
            Clean skincare · Made for you
          </p>
          <h1 style={{ fontFamily: 'serif', fontSize: '48px', color: '#283618', lineHeight: 1.1 }}>
            Skin that feels<br/>like itself again
          </h1>
          <p style={{ fontSize: '15px', color: '#7A7A5C', maxWidth: '380px', lineHeight: 1.7 }}>
            Carefully formulated skincare for every skin type. No noise, no excess — just what your skin actually needs.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Link
              href="/shop"
              style={{
                background: '#606C38', color: '#FEFAE0', padding: '14px 32px',
                borderRadius: '100px', fontSize: '13px', fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none'
              }}
            >
              Shop Now
            </Link>
          </div>
        </div>
        <div style={{ background: '#283618' }} />
      </section>

      {/* FEATURED */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#606C38', marginBottom: '8px' }}>
              Bestsellers
            </p>
            <h2 style={{ fontFamily: 'serif', fontSize: '32px', color: '#283618' }}>Customer Favourites</h2>
          </div>
          <Link href="/shop" style={{ fontSize: '12px', color: '#606C38', textDecoration: 'none' }}>
            View all products →
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#7A7A5C' }}>Loading...</p>
        ) : featured.length === 0 ? (
          <p style={{ color: '#7A7A5C' }}>No featured products yet. Mark some products as featured from the admin dashboard.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {featured.map(product => (
              <Link
                key={product._id}
                href={`/shop/${product.slug}`}
                style={{
                  textDecoration: 'none', background: '#FFFFFF', borderRadius: '20px',
                  border: '1px solid #D6CEB8', overflow: 'hidden', display: 'block'
                }}
              >
                <div style={{ aspectRatio: '1', background: '#FEFAE0' }}>
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontSize: '10px', color: '#7A7A5C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    {product.category}
                  </p>
                  <p style={{ fontSize: '14px', color: '#283618', fontWeight: 500, marginBottom: '8px' }}>
                    {product.name}
                  </p>
                  <p style={{ fontSize: '15px', color: '#283618', fontWeight: 600 }}>
                    From ₦{getStartingPrice(product.variants).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}