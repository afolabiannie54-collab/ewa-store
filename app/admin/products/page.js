'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import ConfirmModal from '@/components/ConfirmModal'
import Pagination from '@/components/Pagination'

function StarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7L12 2.5Z" />
    </svg>
  )
}

const STATUS_FILTERS = ['', 'Active', 'Draft', 'Archived']

const STATUS_STYLES = {
  Active: 'bg-success/15 text-success border-success/30',
  Draft: 'bg-olive/15 text-olive border-olive/30',
  Archived: 'bg-border/40 text-forest/50 border-border'
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const searchTimerRef = useRef(null)

  useEffect(() => {
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(searchTimerRef.current)
  }, [search])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page })
      if (statusFilter) params.set('status', statusFilter)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else {
        setProducts(data.products || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch {
      setError('Failed to load products')
    }
    setLoading(false)
  }, [page, statusFilter, debouncedSearch])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleStatusChange = (s) => {
    setStatusFilter(s)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget._id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts(prev => prev.filter(p => p._id !== deleteTarget._id))
        setTotal(prev => prev - 1)
        setDeleteTarget(null)
      }
    } catch {
      // ignore
    }
    setDeleting(false)
  }

  const toggleFeatured = async (product) => {
    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !product.isFeatured })
      })
      if (res.ok) fetchProducts()
    } catch {
      // ignore
    }
  }

  const getPriceRange = (variants) => {
    if (!variants || variants.length === 0) return '—'
    const prices = variants.map(v => v.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? `₦${min.toLocaleString()}` : `₦${min.toLocaleString()} – ₦${max.toLocaleString()}`
  }

  const getStockInfo = (variants) => {
    if (!variants || variants.length === 0) return { total: 0, label: 'No stock' }
    const total = variants.reduce((sum, v) => sum + v.stockQuantity, 0)
    return { total, label: total > 0 ? `${total} in stock` : 'Out of stock' }
  }

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Catalog</p>
          <h1 className="font-display font-bold text-forest text-[40px] md:text-[52px] leading-none" style={{ letterSpacing: '-0.02em' }}>
            Products
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-wide px-7 py-3.5 hover:bg-forest transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Search + status filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-[360px] rounded-[12px] border-[1.5px] border-border bg-surface px-5 py-3 text-[14px] text-forest placeholder:text-forest/35 outline-none focus:border-olive transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-2.5 mb-8">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide transition-colors ${
              statusFilter === s
                ? 'bg-olive text-cream'
                : 'bg-surface border-[1.5px] border-border text-forest hover:border-olive'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {error && <p className="text-[13px] text-error mb-6">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          {total > 0 && (
            <p className="text-[13px] text-forest/45 mb-4">{total} product{total !== 1 ? 's' : ''}</p>
          )}

          <div className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden shadow-[0_10px_28px_-10px_rgba(40,54,24,0.1)]">
            {products.length === 0 ? (
              <p className="text-center text-forest/50 text-[14px] py-16">
                {debouncedSearch || statusFilter ? 'No products match your filters.' : 'No products yet. Add your first one.'}
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-forest">
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Product</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Category</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Price</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Stock</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Status</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-cream/70">Featured</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => {
                    const stock = getStockInfo(product.variants)
                    return (
                      <tr
                        key={product._id}
                        className={`group hover:bg-cream/60 transition-colors ${i < products.length - 1 ? 'border-b-[1.5px] border-border' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative w-12 h-12 rounded-[10px] overflow-hidden border-[1.5px] border-border bg-cream flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <span className="font-display font-bold text-forest text-[15px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-forest/60">{product.category}</td>
                        <td className="px-6 py-4 text-[14px] font-medium text-forest">{getPriceRange(product.variants)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stock.total > 0 ? 'bg-success' : 'bg-error'}`} />
                            <span className="text-[13px] text-forest/70">{stock.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border-[1.5px] ${STATUS_STYLES[product.status]}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleFeatured(product)}
                            aria-label={product.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-cream transition-colors"
                          >
                            <StarIcon
                              className="w-[18px] h-[18px] transition-colors"
                              style={product.isFeatured ? { fill: 'var(--color-olive)', stroke: 'var(--color-olive)' } : { stroke: 'rgba(40,54,24,0.3)' }}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/products/${product._id}/edit`} className="text-[13px] font-bold text-olive hover:underline">
                              Edit
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="text-[13px] font-bold text-error hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This product will be permanently removed from your catalog. This cannot be undone."
        confirmLabel="Delete Product"
        danger
        loading={deleting}
      />
    </div>
  )
}
