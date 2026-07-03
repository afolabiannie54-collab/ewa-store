'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import Loader from '@/components/Loader'
import { addToGuestCart } from '@/lib/cart-client'
import AdminBrowsingBanner from '@/components/AdminBrowsingBanner'

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export default function QuickAddModal({ slug, product: productProp, isOpen, onClose, onAdded }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (isOpen && (slug || productProp)) {
      if (productProp) {
        setProduct(productProp)
        const firstInStock = productProp.variants.find(v => v.stockQuantity > 0)
        setSelectedVariant(firstInStock || productProp.variants[0])
        setLoading(false)
      } else {
        fetchProduct()
      }
    } else {
      // reset state when modal closes, so reopening on a different product starts clean
      setProduct(null)
      setSelectedVariant(null)
      setQuantity(1)
      setMessage('')
    }
  }, [isOpen, slug, productProp])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${slug}`)
      const data = await res.json()
      if (res.ok) {
        setProduct(data.product)
        const firstInStock = data.product.variants.find(v => v.stockQuantity > 0)
        setSelectedVariant(firstInStock || data.product.variants[0])
      }
    } catch (err) {
      console.error('Failed to load product for quick add')
    }
    setLoading(false)
  }

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stockQuantity === 0 || adding) return
    setAdding(true)
    let success = false

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
          setMessage('Added to cart!')
          success = true
        } else {
          setMessage(data.error || 'Could not add to cart')
        }
      } catch (err) {
        setMessage('Something went wrong')
      }
    } else {
      addToGuestCart(product._id, selectedVariant.size, quantity)
      setMessage('Added to cart!')
      success = true
    }

    setAdding(false)
    if (success && onAdded) {
      onAdded()
    } else {
      setTimeout(() => {
        setMessage('')
        onClose()
      }, 1200)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest/50 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] rounded-[20px] bg-surface overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 backdrop-blur-sm text-forest/60 hover:text-forest transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {loading || !product ? (
          <div className="p-10 flex items-center justify-center min-h-[300px]">
            <Loader size="sm" color="olive" />
          </div>
        ) : (
          <>
            <div className="relative aspect-[5/4] bg-cream">
              {product.images?.[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="480px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="p-6">
              {isAdmin && <AdminBrowsingBanner />}
              <h3 className="font-display font-bold text-forest text-[22px] mb-1">
                {product.name}
              </h3>
              <p className="text-[16px] font-medium text-forest/70 mb-5">
                ₦{selectedVariant?.price?.toLocaleString() || 0}
              </p>

              {product.variants.length > 1 && (
                <div className="mb-5">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-forest/60 mb-2.5">
                    Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button
                        key={v.size}
                        onClick={() => setSelectedVariant(v)}
                        disabled={v.stockQuantity === 0}
                        className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-bold transition-colors ${
                          selectedVariant?.size === v.size
                            ? 'border-olive bg-olive text-cream'
                            : v.stockQuantity === 0
                            ? 'border-border text-muted line-through cursor-not-allowed'
                            : 'border-border text-forest hover:border-olive'
                        }`}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <p className="text-[12px] font-bold uppercase tracking-wide text-forest/60">Qty</p>
                <div className="flex items-center rounded-full border-[1.5px] border-border">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-forest text-[16px] hover:bg-cream transition-colors rounded-l-full"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-[14px] font-medium text-forest">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(selectedVariant?.stockQuantity || 1, q + 1))}
                    className="w-9 h-9 flex items-center justify-center text-forest text-[16px] hover:bg-cream transition-colors rounded-r-full"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdmin || !selectedVariant || selectedVariant.stockQuantity === 0 || adding}
                className="w-full rounded-full bg-olive text-cream text-[14px] font-bold uppercase tracking-[0.1em] py-4 hover:bg-forest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {message || (selectedVariant?.stockQuantity === 0 ? 'Out of Stock' : adding ? <Loader size="sm" color="cream" /> : 'Add to Cart')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}