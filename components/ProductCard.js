'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import AuthPromptModal from '@/components/AuthPromptModal'

function HeartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.8 8.6c0 4.4-8.8 10.9-8.8 10.9S3.2 13 3.2 8.6a5 5 0 0 1 9-3 5 5 0 0 1 8.6 3Z" />
    </svg>
  )
}

export default function ProductCard({ product, isWishlisted = false, onWishlistToggle }) {
  const { status } = useSession()
  const [imageError, setImageError] = useState(false)
  const [wishlistBusy, setWishlistBusy] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const primaryImage = product.images?.[0]
  const secondaryImage = product.images?.[1]

  const handleWishlistClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (status !== 'authenticated') {
      setShowAuthModal(true)
      return
    }

    if (wishlistBusy || !onWishlistToggle) return
    setWishlistBusy(true)
    await onWishlistToggle(product._id, isWishlisted)
    setWishlistBusy(false)
  }

  return (
    <>
      <Link
        href={`/shop/${product.slug}`}
        className="group block rounded-[20px] border-[3px] border-olive bg-surface overflow-hidden shadow-[0_12px_32px_-8px_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.45)]"
      >
        <div className="relative aspect-[4/5]">
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-500 ${
                secondaryImage ? 'group-hover:opacity-0' : ''
              }`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-cream">
              <span className="text-muted text-[13px]">No image</span>
            </div>
          )}

          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} lifestyle shot`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          <button
            onClick={handleWishlistClick}
            disabled={wishlistBusy}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 backdrop-blur-sm transition-transform hover:scale-110 disabled:opacity-50"
          >
            <HeartIcon
              className="w-[17px] h-[17px]"
              style={isWishlisted ? { fill: 'var(--color-olive)', stroke: 'var(--color-olive)' } : { stroke: 'rgba(40,54,24,0.5)' }}
            />
          </button>

          {!product.inStock && (
            <div className="absolute top-3 left-3 z-10 rounded-full bg-forest/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cream">
              Sold Out
            </div>
          )}
        </div>

        <div className="px-5 py-4">
          <h3 className="font-display font-bold text-forest text-[20px] md:text-[22px] leading-snug">
            {product.name}
          </h3>
          <p className="mt-1.5 text-[16px] font-medium text-forest/70">
            From ₦{product.startingPrice?.toLocaleString() || 0}
          </p>
        </div>
      </Link>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Save items you love"
      />
    </>
  )
}