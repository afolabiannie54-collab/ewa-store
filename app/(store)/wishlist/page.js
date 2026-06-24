'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'

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

  if (status === 'loading' || loading) return (
    <div className="bg-cream min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )

  if (status === 'unauthenticated') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: '#7A7A5C', marginBottom: '16px' }}>Please log in to view your wishlist.</p>
        <Link href="/login" style={{ color: '#606C38', fontWeight: 500 }}>Log in →</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '8px' }}>My Wishlist</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', marginTop: '20px' }}>
        <Link href="/account" style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #D6CEB8', color: '#283618', fontSize: '12px', textDecoration: 'none' }}>Profile</Link>
        <Link href="/account/addresses" style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #D6CEB8', color: '#283618', fontSize: '12px', textDecoration: 'none' }}>Addresses</Link>
        <Link href="/wishlist" style={{ padding: '8px 16px', borderRadius: '100px', background: '#606C38', color: '#FEFAE0', fontSize: '12px', textDecoration: 'none' }}>Wishlist</Link>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#7A7A5C', marginBottom: '16px' }}>Your wishlist is empty.</p>
          <Link href="/shop" style={{ color: '#606C38', fontWeight: 500 }}>Browse products →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {wishlist.map(product => (
            <div key={product._id} style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '20px', overflow: 'hidden' }}>
              <Link href={`/shop/${product.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ aspectRatio: '1', background: '#FEFAE0' }}>
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              </Link>
              <div style={{ padding: '16px' }}>
                <Link href={`/shop/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <p style={{ fontSize: '14px', color: '#283618', fontWeight: 500, marginBottom: '8px' }}>{product.name}</p>
                </Link>
                <p style={{ fontSize: '15px', color: '#283618', fontWeight: 600, marginBottom: '12px' }}>
                  From ₦{getStartingPrice(product.variants).toLocaleString()}
                </p>
                <button
                  onClick={() => handleRemove(product._id)}
                  style={{ width: '100%', padding: '8px', borderRadius: '100px', background: 'transparent', color: '#C0392B', border: '1px solid #C0392B', fontSize: '12px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}