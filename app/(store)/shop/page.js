'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const CATEGORIES = ['Cleanser', 'Moisturizer', 'Serum', 'Sunscreen', 'Treatment']
const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal']
const SKIN_CONCERNS = ['Acne', 'Aging', 'Hyperpigmentation', 'Hydration', 'Brightening']

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    category: '',
    skinType: '',
    skinConcern: '',
    search: '',
    sort: ''
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 300) // debounce so search doesn't fire on every keystroke

    return () => clearTimeout(timer)
  }, [filters])

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

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }))
  }

  const getStartingPrice = (variants) => {
    if (!variants || variants.length === 0) return 0
    return Math.min(...variants.map(v => v.price))
  }

  const isInStock = (variants) => {
    if (!variants || variants.length === 0) return false
    return variants.some(v => v.stockQuantity > 0)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: '#283618', marginBottom: '8px' }}>Shop</h1>
      <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '32px' }}>{products.length} products</p>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '40px' }}>

        {/* FILTER SIDEBAR */}
        <div>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '13px', marginBottom: '24px' }}
          />

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#283618', marginBottom: '12px' }}>Category</h3>
            {CATEGORIES.map(cat => (
              <div key={cat} style={{ marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#283618', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.category === cat}
                    onChange={() => updateFilter('category', cat)}
                  />
                  {cat}
                </label>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#283618', marginBottom: '12px' }}>Skin Type</h3>
            {SKIN_TYPES.map(type => (
              <div key={type} style={{ marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#283618', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.skinType === type}
                    onChange={() => updateFilter('skinType', type)}
                  />
                  {type}
                </label>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#283618', marginBottom: '12px' }}>Skin Concern</h3>
            {SKIN_CONCERNS.map(concern => (
              <div key={concern} style={{ marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#283618', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.skinConcern === concern}
                    onChange={() => updateFilter('skinConcern', concern)}
                  />
                  {concern}
                </label>
              </div>
            ))}
          </div>

          {(filters.category || filters.skinType || filters.skinConcern || filters.search) && (
            <button
              onClick={() => setFilters({ category: '', skinType: '', skinConcern: '', search: '', sort: filters.sort })}
              style={{ fontSize: '12px', color: '#C0392B', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* PRODUCT GRID */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #D6CEB8', fontSize: '13px' }}
            >
              <option value="">Sort by</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {loading ? (
            <p style={{ color: '#7A7A5C' }}>Loading products...</p>
          ) : products.length === 0 ? (
            <p style={{ color: '#7A7A5C', textAlign: 'center', padding: '60px 0' }}>No products match your filters.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {products.map(product => {
                const inStock = isInStock(product.variants)
                return (
                  <Link
                    key={product._id}
                    href={`/shop/${product.slug}`}
                    style={{
                      textDecoration: 'none',
                      background: '#FFFFFF',
                      borderRadius: '20px',
                      border: '1px solid #D6CEB8',
                      overflow: 'hidden',
                      display: 'block'
                    }}
                  >
                    <div style={{ aspectRatio: '1', background: '#FEFAE0', position: 'relative' }}>
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      {!inStock && (
                        <span style={{
                          position: 'absolute', top: '12px', left: '12px',
                          background: '#7A7A5C', color: '#FEFAE0',
                          fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em',
                          textTransform: 'uppercase', padding: '4px 12px', borderRadius: '100px'
                        }}>
                          Sold Out
                        </span>
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
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}