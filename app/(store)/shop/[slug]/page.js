'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import Loader from '@/components/Loader'
import { addToGuestCart } from '@/lib/cart-client'
import StarRating from '@/components/StarRating'
import StarInput from '@/components/StarInput'
import ProductCard from '@/components/ProductCard'

function HeartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.8 8.6c0 4.4-8.8 10.9-8.8 10.9S3.2 13 3.2 8.6a5 5 0 0 1 9-3 5 5 0 0 1 8.6 3Z" />
    </svg>
  )
}

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
  const { data: session, status: sessionStatus } = useSession()
  const [inWishlist, setInWishlist] = useState(false)

  const [reviews, setReviews] = useState([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    fetchProduct()
  }, [slug])

  useEffect(() => {
    if (sessionStatus === 'authenticated' && product) {
      checkWishlist(product._id)
    }
  }, [sessionStatus, product])

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
        fetchRelated(data.product.category, data.product._id)
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

  const fetchRelated = async (category, currentProductId) => {
    try {
      const res = await fetch(`/api/products?category=${encodeURIComponent(category)}`)
      const data = await res.json()
      setRelatedProducts((data.products || []).filter(p => p._id !== currentProductId).slice(0, 3))
    } catch (err) {
      console.error('Failed to load related products')
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
    try {
      if (inWishlist) {
        const res = await fetch(`/api/users/me/wishlist/${product._id}`, { method: 'DELETE' })
        if (res.ok) setInWishlist(false)
      } else {
        const res = await fetch('/api/users/me/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product._id })
        })
        if (res.ok) setInWishlist(true)
      }
    } catch (err) {
      console.error('Failed to update wishlist')
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
        fetchReviews(product._id)
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

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-forest/60 text-[15px]">Product not found.</p>
      </div>
    )
  }

  const maxStock = selectedVariant?.stockQuantity || 0

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 md:py-14">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[13px] mb-10">
          <Link href="/" className="text-forest/50 hover:text-olive transition-colors">Home</Link>
          <span className="text-forest/30">/</span>
          <Link href="/shop" className="text-forest/50 hover:text-olive transition-colors">Shop</Link>
          <span className="text-forest/30">/</span>
          <span className="text-forest font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">

          {/* IMAGE GALLERY */}
          <div className="flex gap-4">
            {product.images?.length > 1 && (
              <div className="flex flex-col gap-3 w-[72px] md:w-[88px] flex-shrink-0">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square rounded-[14px] overflow-hidden transition-all ${
                      selectedImage === i ? 'border-[2.5px] border-olive' : 'border-[1.5px] border-border hover:border-olive/50'
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="88px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex-1 aspect-square rounded-[24px] overflow-hidden bg-surface border-[1.5px] border-border">
              {product.images?.[selectedImage] && (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  priority
                  className="object-cover"
                />
              )}
            </div>
          </div>
{/* PRODUCT INFO */}
          <div className="border-2 border-olive rounded-[28px] p-8">
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-olive mb-5">
              {product.category}
            </p>
            <h1 className="font-display font-bold text-forest text-[52px] md:text-[68px] leading-[0.95] mb-6" style={{ letterSpacing: '-0.03em' }}>
              {product.name}
            </h1>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2.5 mb-7">
                <StarRating rating={product.averageRating} size={17} />
                <span className="text-[14px] text-forest/55">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <p className="text-[16px] text-forest/65 leading-relaxed mb-8 max-w-[440px]">
              {product.description}
            </p>

         <p className="text-[32px] md:text-[38px] font-display font-bold text-forest/80 mb-8 pb-8 border-b-[1.5px] border-border" style={{ letterSpacing: '-0.01em' }}>
              ₦{selectedVariant?.price.toLocaleString() || 0}
            </p>

            {(product.skinType?.length > 0 || product.skinConcern?.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-7">
                {product.skinType?.map(t => (
                  <span key={t} className="rounded-full border-[1.5px] border-border px-4 py-1.5 text-[12px] font-medium text-forest/70">{t}</span>
                ))}
                {product.skinConcern?.map(c => (
                  <span key={c} className="rounded-full border-[1.5px] border-border px-4 py-1.5 text-[12px] font-medium text-forest/70">{c}</span>
                ))}
              </div>
            )}

            {/* SIZE SELECTOR */}
            {product.variants.length > 1 && (
              <div className="mb-7">
                <p className="text-[13px] font-bold uppercase tracking-wide text-forest/60 mb-3">Size</p>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map(v => (
                    <button
                      key={v.size}
                      onClick={() => { setSelectedVariant(v); setQuantity(1) }}
                      disabled={v.stockQuantity === 0}
                      className={`rounded-full px-5 py-2.5 text-[14px] font-bold transition-colors ${
                        selectedVariant?.size === v.size
                          ? 'bg-olive text-cream'
                          : v.stockQuantity === 0
                          ? 'border-[1.5px] border-border text-muted line-through cursor-not-allowed'
                          : 'border-[1.5px] border-border text-forest hover:border-olive'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="mb-8">
              <p className="text-[13px] font-bold uppercase tracking-wide text-forest/60 mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full border-[1.5px] border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center text-forest text-[18px] hover:bg-surface transition-colors rounded-l-full"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-[15px] font-bold text-forest">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock}
                    className="w-11 h-11 flex items-center justify-center text-forest text-[18px] hover:bg-surface transition-colors rounded-r-full disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                {maxStock > 0 && maxStock <= 10 && (
                  <span className="text-[13px] font-medium text-error">Only {maxStock} left</span>
                )}
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={maxStock === 0}
                className="flex-1 rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-[18px] hover:bg-forest transition-colors disabled:bg-border disabled:text-muted disabled:cursor-not-allowed"
              >
                {maxStock === 0 ? 'Sold Out' : 'Add to Cart'}
              </button>

              {session && (
                <button
                  onClick={handleToggleWishlist}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`w-[60px] flex-shrink-0 flex items-center justify-center rounded-full border-[1.5px] transition-colors ${
                    inWishlist ? 'bg-olive border-olive text-cream' : 'border-border text-forest hover:border-olive'
                  }`}
                >
                  <HeartIcon className="w-5 h-5" style={inWishlist ? { fill: 'currentColor' } : {}} />
                </button>
              )}
            </div>

            {addedMessage && (
              <p className="text-[14px] font-medium text-success text-center mb-4">{addedMessage}</p>
            )}

            <p className="text-[12px] text-muted text-center">
              For external use only. Patch test before use.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="mb-20">
          <div className="flex gap-4 md:gap-8 border-b-[1.5px] border-border mb-8 overflow-x-auto">
            {['description', 'ingredients', 'how to use'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 pb-4 text-[13px] md:text-[15px] font-bold uppercase tracking-wide capitalize transition-colors border-b-[2.5px] -mb-[1.5px] ${
                  activeTab === tab ? 'border-olive text-forest' : 'border-transparent text-forest/40 hover:text-forest/70'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <p className="text-[16px] text-forest/75 leading-relaxed max-w-[640px]">
              {product.description}
            </p>
          )}

          {activeTab === 'ingredients' && (
            <div className="max-w-[640px]">
              {product.keyActives?.length > 0 && (
                <p className="text-[16px] text-forest mb-4">
                  <span className="font-bold">Key Actives:</span> {product.keyActives.join(', ')}
                </p>
              )}
              <p className="text-[15px] text-forest/60 leading-relaxed">
                {product.ingredients || 'Full ingredient list not available.'}
              </p>
            </div>
          )}

          {activeTab === 'how to use' && (
            <div className="max-w-[640px]">
              <p className="text-[13px] font-bold uppercase tracking-wide text-olive mb-3">
                Usage: {product.usageTime}
              </p>
              <p className="text-[16px] text-forest/75 leading-relaxed">
                {product.howToUse || 'No usage instructions available.'}
              </p>
            </div>
          )}
        </div>

        {/* REVIEWS */}
        <div className="mb-20 max-w-[720px]">
          <h2 className="font-display font-bold text-forest text-[28px] md:text-[34px] mb-8">
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h2>

          {reviews.length === 0 ? (
            <p className="text-[15px] text-forest/50 mb-10">No reviews yet. Be the first to share your experience.</p>
          ) : (
            <div className="flex flex-col gap-6 mb-10">
              {reviews.map(review => (
                <div key={review._id} className="border-b-[1.5px] border-border pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[15px] font-bold text-forest">{review.userId?.name || 'Anonymous'}</p>
                    <StarRating rating={review.rating} size={15} />
                  </div>
                  <p className="text-[15px] text-forest/70 leading-relaxed mb-2">{review.comment}</p>
                  <p className="text-[12px] text-muted">
                    {new Date(review.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {session ? (
            <form onSubmit={handleSubmitReview} className="rounded-[20px] border-[1.5px] border-border bg-surface p-7">
              <p className="text-[16px] font-bold text-forest mb-4">Leave a Review</p>

              <div className="mb-5">
                <StarInput value={reviewRating} onChange={setReviewRating} size={26} />
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={3}
                className="w-full rounded-[12px] border-[1.5px] border-border px-4 py-3 text-[14px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors mb-4 resize-none"
              />

              {reviewError && <p className="text-[13px] text-error mb-4">{reviewError}</p>}
              {reviewMessage && <p className="text-[13px] text-success mb-4">{reviewMessage}</p>}

              <button
                type="submit"
                disabled={submittingReview}
                className="rounded-full bg-olive text-cream px-7 py-3 text-[13px] font-bold uppercase tracking-wide hover:bg-forest transition-colors disabled:opacity-50"
              >
                {submittingReview ? <Loader size="sm" color="cream" /> : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="text-[15px] text-forest/60">
              <Link href="/login" className="text-olive font-bold hover:underline">Log in</Link> to leave a review.
            </p>
          )}
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-forest text-[28px] md:text-[34px] mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {relatedProducts.map(related => (
                <ProductCard key={related._id} product={related} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}