'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import QuickAddModal from '@/components/QuickAddModal'

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal']
const SKIN_CONCERNS = ['Acne', 'Aging', 'Hyperpigmentation', 'Hydration', 'Brightening']

const SORT_OPTIONS = [
  { value: '', label: 'Sort by' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]

function ChevronDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [wishlistIds, setWishlistIds] = useState([])
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [quickAddSlug, setQuickAddSlug] = useState(null)

  const sortRef = useRef(null)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    skinType: '',
    skinConcern: '',
    search: searchParams.get('search') || '',
    sort: ''
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 300)
    return () => clearTimeout(timer)
  }, [filters])

  useEffect(() => {
    fetchWishlist()
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories((data.categories || []).map(c => c.name)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.skinType) params.set('skinType', filters.skinType)
    if (filters.skinConcern) params.set('skinConcern', filters.skinConcern)
    if (filters.search) params.set('search', filters.search)
    if (filters.sort) params.set('sort', filters.sort)

    try {
      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Failed to fetch products', err)
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
      // not logged in — fine to ignore
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

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }))
  }

  const activeMoreFiltersCount = (filters.skinType ? 1 : 0) + (filters.skinConcern ? 1 : 0)
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === filters.sort)?.label || 'Sort by'

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-12 md:py-16">

        <h1 className="font-display font-bold text-forest text-[44px] md:text-[56px] leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
          Shop
        </h1>
        <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-10">
          {loading ? 'Loading products' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
        </p>

{/* CATEGORY PILLS */}
        <div className="flex flex-wrap gap-2.5 md:gap-3.5 mb-7">
          <button
            onClick={() => updateFilter('category', '')}
            className={`rounded-full px-5 md:px-7 py-2.5 md:py-3.5 text-[13px] md:text-[15px] font-bold uppercase tracking-wide transition-colors ${
              !filters.category ? 'bg-olive text-cream' : 'bg-surface border-[1.5px] border-border text-forest hover:border-olive'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => updateFilter('category', cat)}
              className={`rounded-full px-5 md:px-7 py-2.5 md:py-3.5 text-[13px] md:text-[15px] font-bold uppercase tracking-wide transition-colors ${
                filters.category === cat ? 'bg-olive text-cream' : 'bg-surface border-[1.5px] border-border text-forest hover:border-olive'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
    

{/* SEARCH + SORT ROW */}
        <div className="flex flex-col sm:flex-row gap-3 mb-7">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 rounded-[12px] border-[1.5px] border-border bg-surface px-5 py-3.5 md:px-6 md:py-4 text-[14px] md:text-[16px] text-forest placeholder:text-muted focus:border-olive outline-none transition-colors"
          />

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className={`flex items-center justify-between gap-3 w-full sm:w-[220px] rounded-[12px] border-[1.5px] px-5 py-3.5 md:px-6 md:py-4 text-[14px] md:text-[16px] font-medium transition-colors ${
                sortOpen ? 'border-olive bg-surface text-forest' : 'border-border bg-surface text-forest hover:border-olive'
              }`}
            >
              {currentSortLabel}
              <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-forest/50 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
            </button>

            {sortOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:w-[220px] rounded-[12px] border-[1.5px] border-border bg-surface shadow-[0_12px_32px_-8px_rgba(0,0,0,0.2)] overflow-hidden z-20">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilters({ ...filters, sort: option.value })
                      setSortOpen(false)
                    }}
                    className={`block w-full text-left px-5 md:px-6 py-3 md:py-3.5 text-[14px] md:text-[15px] transition-colors ${
                      filters.sort === option.value
                        ? 'bg-olive text-cream font-medium'
                        : 'text-forest hover:bg-cream'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
            className={`flex items-center justify-center gap-2 rounded-[12px] border-[1.5px] px-5 py-3.5 md:px-7 md:py-4 text-[14px] md:text-[16px] font-medium transition-colors whitespace-nowrap ${
              moreFiltersOpen || activeMoreFiltersCount > 0
                ? 'border-olive bg-olive text-cream'
                : 'border-border bg-surface text-forest hover:border-olive'
            }`}
          >
            More Filters{activeMoreFiltersCount > 0 ? ` (${activeMoreFiltersCount})` : ''}
          </button>
        </div>

{/* COLLAPSIBLE MORE FILTERS PANEL */}
        {moreFiltersOpen && (
          <div className="rounded-[16px] border-[1.5px] border-border bg-surface p-7 md:p-9 mb-9">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-9 md:gap-12">
              <div>
                <h3 className="text-[12px] md:text-[14px] font-bold uppercase tracking-wide text-forest/60 mb-3.5 md:mb-4">
                  Skin Type
                </h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {SKIN_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => updateFilter('skinType', type)}
                      className={`rounded-full px-4 md:px-5 py-2 md:py-2.5 text-[13px] md:text-[15px] font-medium transition-colors ${
                        filters.skinType === type
                          ? 'bg-olive text-cream'
                          : 'border-[1.5px] border-border text-forest hover:border-olive'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[12px] md:text-[14px] font-bold uppercase tracking-wide text-forest/60 mb-3.5 md:mb-4">
                  Skin Concern
                </h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {SKIN_CONCERNS.map(concern => (
                    <button
                      key={concern}
                      onClick={() => updateFilter('skinConcern', concern)}
                      className={`rounded-full px-4 md:px-5 py-2 md:py-2.5 text-[13px] md:text-[15px] font-medium transition-colors ${
                        filters.skinConcern === concern
                          ? 'bg-olive text-cream'
                          : 'border-[1.5px] border-border text-forest hover:border-olive'
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeMoreFiltersCount > 0 && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, skinType: '', skinConcern: '' }))}
                className="mt-6 text-[13px] md:text-[14px] font-bold text-error hover:underline"
              >
                Clear these filters
              </button>
            )}
          </div>
        )}

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-[20px] bg-border/30 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-forest/60 py-24 text-[16px]">No products match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {products.map(product => (
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

      <QuickAddModal
        slug={quickAddSlug}
        isOpen={!!quickAddSlug}
        onClose={() => setQuickAddSlug(null)}
      />
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="bg-cream min-h-screen" />}>
      <ShopContent />
    </Suspense>
  )
}