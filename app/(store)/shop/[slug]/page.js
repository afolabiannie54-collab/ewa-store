'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { addToGuestCart } from '@/lib/cart-client'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [addedMessage, setAddedMessage] = useState('')
  const { data: session } = useSession()
  const [inWishlist, setInWishlist] = useState(false)

  const [reviews, setReviews] = useState([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [slug])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${slug}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setProduct(data.product)
        const firstInStock = data.product.variants.find(v => v.stockQuantity > 0)
        setSelectedVariant(firstInStock || data.product.variants[0])
        fetchReviews(data.product._id)
        if (session) checkWishlist(data.product._id)
      }
    } catch (err) {
      setError('Failed to load product')
    }
    setLoading(false)
  }

  const fetchReviews = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`)
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch (err) {
      console.error('Failed to load reviews')
    }
  }

  const checkWishlist = async (productId) => {
    try {
      const res = await fetch('/api/users/me/wishlist')
      const data = await res.json()
      setInWishlist(data.wishlist?.some(p => p._id === productId))
    } catch (err) {
      console.error('Failed to check wishlist')
    }
  }

  const handleToggleWishlist = async () => {
    if (inWishlist) {
      await fetch(`/api/users/me/wishlist/${product._id}`, { method: 'DELETE' })
      setInWishlist(false)
    } else {
      await fetch('/api/users/me/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id })
      })
      setInWishlist(true)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewMessage('')

    if (!reviewComment.trim()) {
      setReviewError('Please write a comment')
      return
    }

    setSubmittingReview(true)

    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      })

      const data = await res.json()

      if (!res.ok) {
        setReviewError(data.error)
      } else {
        setReviewMessage(data.message)
        setReviewComment('')
      }
    } catch (err) {
      setReviewError('Something went wrong')
    }
    setSubmittingReview(false)
  }

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stockQuantity === 0) return

    if (session) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product._id,
            size: selectedVariant.size,
            quantity
          })
        })

        const data = await res.json()

        if (res.ok) {
          setAddedMessage('Added to cart!')
        } else {
          setAddedMessage(data.error || 'Could not add to cart')
        }
      } catch (err) {
        setAddedMessage('Something went wrong')
      }
    } else {
      addToGuestCart(product._id, selectedVariant.size, quantity)
      setAddedMessage('Added to cart!')
    }

    setTimeout(() => setAddedMessage(''), 2000)
  }

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>
  if (error || !product) return <div style={{ padding: '40px' }}>Product not found.</div>

  const maxStock = selectedVariant?.stockQuantity || 0

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

      <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '24px' }}>
        Home / Shop / {product.name}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>

        {/* IMAGE GALLERY */}
        <div>
          <div style={{ aspectRatio: '1', background: '#FEFAE0', borderRadius: '20px', overflow: 'hidden', marginBottom: '12px' }}>
            {product.images?.[selectedImage] && (
              <img src={product.images[selectedImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  style={{
                    width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden',
                    border: selectedImage === i ? '2px solid #606C38' : '1px solid #D6CEB8',
                    padding: 0, cursor: 'pointer'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#606C38', marginBottom: '8px' }}>
            {product.category}
          </p>
          <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: '#283618', marginBottom: '12px' }}>
            {product.name}
          </h1>

          {product.reviewCount > 0 && (
            <p style={{ fontSize: '13px', color: '#7A7A5C', marginBottom: '16px' }}>
              ★★★★★ {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
            </p>
          )}

          <p style={{ fontSize: '24px', fontWeight: 600, color: '#283618', marginBottom: '20px' }}>
            ₦{selectedVariant?.price.toLocaleString() || 0}
          </p>

          {(product.skinType?.length > 0 || product.skinConcern?.length > 0) && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {product.skinType?.map(t => (
                <span key={t} style={{ fontSize: '11px', color: '#606C38', border: '1px solid #D6CEB8', padding: '4px 12px', borderRadius: '100px' }}>{t}</span>
              ))}
              {product.skinConcern?.map(c => (
                <span key={c} style={{ fontSize: '11px', color: '#606C38', border: '1px solid #D6CEB8', padding: '4px 12px', borderRadius: '100px' }}>{c}</span>
              ))}
            </div>
          )}

          <p style={{ fontSize: '14px', color: '#283618', lineHeight: 1.6, marginBottom: '24px' }}>
            {product.description}
          </p>

          {/* SIZE SELECTOR */}
          {product.variants.length > 1 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '8px' }}>Size</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.variants.map(v => (
                  <button
                    key={v.size}
                    onClick={() => { setSelectedVariant(v); setQuantity(1) }}
                    disabled={v.stockQuantity === 0}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '100px',
                      border: selectedVariant?.size === v.size ? '1.5px solid #606C38' : '1px solid #D6CEB8',
                      background: selectedVariant?.size === v.size ? '#606C38' : 'transparent',
                      color: selectedVariant?.size === v.size ? '#FEFAE0' : v.stockQuantity === 0 ? '#D6CEB8' : '#283618',
                      fontSize: '13px',
                      cursor: v.stockQuantity === 0 ? 'not-allowed' : 'pointer',
                      textDecoration: v.stockQuantity === 0 ? 'line-through' : 'none'
                    }}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#283618', marginBottom: '8px' }}>Quantity</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #D6CEB8', background: 'transparent', cursor: 'pointer' }}
              >
                −
              </button>
              <span style={{ fontSize: '14px', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                disabled={quantity >= maxStock}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #D6CEB8', background: 'transparent', cursor: 'pointer' }}
              >
                +
              </button>
              {maxStock > 0 && maxStock <= 10 && (
                <span style={{ fontSize: '12px', color: '#C0392B' }}>Only {maxStock} left</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <button
              onClick={handleAddToCart}
              disabled={maxStock === 0}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '100px',
                background: maxStock === 0 ? '#D6CEB8' : '#283618',
                color: '#FEFAE0',
                border: 'none',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: maxStock === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {maxStock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>

            {session && (
              <button
                onClick={handleToggleWishlist}
                style={{
                  width: '52px',
                  borderRadius: '100px',
                  border: '1px solid #D6CEB8',
                  background: inWishlist ? '#606C38' : 'transparent',
                  color: inWishlist ? '#FEFAE0' : '#283618',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                {inWishlist ? '♥' : '♡'}
              </button>
            )}
          </div>

          {addedMessage && (
            <p style={{ fontSize: '13px', color: '#4A7C59', textAlign: 'center', marginBottom: '12px' }}>{addedMessage}</p>
          )}

          <p style={{ fontSize: '11px', color: '#7A7A5C', textAlign: 'center' }}>
            For external use only. Patch test before use.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ marginTop: '56px' }}>
        <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #D6CEB8', marginBottom: '24px' }}>
          {['description', 'ingredients', 'how to use'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #606C38' : '2px solid transparent',
                color: activeTab === tab ? '#283618' : '#7A7A5C',
                fontSize: '13px',
                fontWeight: 500,
                textTransform: 'capitalize',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <p style={{ fontSize: '14px', color: '#283618', lineHeight: 1.7, maxWidth: '600px' }}>{product.description}</p>
        )}
        {activeTab === 'ingredients' && (
          <div style={{ maxWidth: '600px' }}>
            {product.keyActives?.length > 0 && (
              <p style={{ fontSize: '14px', color: '#283618', marginBottom: '12px' }}>
                <strong>Key Actives:</strong> {product.keyActives.join(', ')}
              </p>
            )}
            <p style={{ fontSize: '13px', color: '#7A7A5C', lineHeight: 1.7 }}>{product.ingredients || 'Full ingredient list not available.'}</p>
          </div>
        )}
        {activeTab === 'how to use' && (
          <div style={{ maxWidth: '600px' }}>
            <p style={{ fontSize: '13px', color: '#606C38', marginBottom: '8px' }}>Usage: {product.usageTime}</p>
            <p style={{ fontSize: '14px', color: '#283618', lineHeight: 1.7 }}>{product.howToUse || 'No usage instructions available.'}</p>
          </div>
        )}
      </div>

      {/* REVIEWS */}
      <div style={{ marginTop: '56px', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '18px', fontFamily: 'serif', color: '#283618', marginBottom: '20px' }}>
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>

        {reviews.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#7A7A5C', marginBottom: '32px' }}>No reviews yet.</p>
        ) : (
          <div style={{ marginBottom: '32px' }}>
            {reviews.map(review => (
              <div key={review._id} style={{ borderBottom: '1px solid #D6CEB8', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#283618' }}>{review.userId?.name || 'Anonymous'}</p>
                  <p style={{ fontSize: '13px', color: '#606C38' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                </div>
                <p style={{ fontSize: '13px', color: '#7A7A5C', lineHeight: 1.6 }}>{review.comment}</p>
                <p style={{ fontSize: '11px', color: '#7A7A5C', marginTop: '6px' }}>
                  {new Date(review.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}

        {session ? (
          <form onSubmit={handleSubmitReview} style={{ background: '#FFFFFF', border: '1px solid #D6CEB8', borderRadius: '16px', padding: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#283618', marginBottom: '12px' }}>Leave a Review</p>

            <div style={{ marginBottom: '12px' }}>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #D6CEB8', fontSize: '13px' }}
              >
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={3}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #D6CEB8', fontSize: '13px', marginBottom: '12px' }}
            />

            {reviewError && <p style={{ color: '#C0392B', fontSize: '12px', marginBottom: '12px' }}>{reviewError}</p>}
            {reviewMessage && <p style={{ color: '#4A7C59', fontSize: '12px', marginBottom: '12px' }}>{reviewMessage}</p>}

            <button
              type="submit"
              disabled={submittingReview}
              style={{
                padding: '10px 24px', borderRadius: '100px', background: '#606C38',
                color: '#FEFAE0', border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer'
              }}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <p style={{ fontSize: '13px', color: '#7A7A5C' }}>
            <a href="/login" style={{ color: '#606C38', fontWeight: 500 }}>Log in</a> to leave a review.
          </p>
        )}
      </div>
    </div>
  )
}