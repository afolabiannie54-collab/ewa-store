'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setProducts(data.products)
      }
    } catch (err) {
      setError('Failed to load products')
    }
    setLoading(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id))
      } else {
        alert('Failed to delete product')
      }
    } catch (err) {
      alert('Something went wrong')
    }
  }

  const toggleFeatured = async (product) => {
    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, isFeatured: !product.isFeatured, images: product.images })
      })
      if (res.ok) {
        fetchProducts()
      }
    } catch (err) {
      alert('Failed to update')
    }
  }

  const getPriceRange = (variants) => {
    if (!variants || variants.length === 0) return 'No variants'
    const prices = variants.map(v => v.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? `₦${min.toLocaleString()}` : `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`
  }

  const getStockStatus = (variants) => {
    if (!variants || variants.length === 0) return 'No stock'
    const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0)
    return totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'
  }

  if (loading) return <div style={{ padding: '40px' }}>Loading products...</div>

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618' }}>Products</h1>
        <Link
          href="/admin/products/new"
          style={{
            background: '#606C38',
            color: '#FEFAE0',
            padding: '12px 24px',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none'
          }}
        >
          + Add Product
        </Link>
      </div>

      {error && <div style={{ color: '#C0392B', marginBottom: '16px' }}>{error}</div>}

      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #D6CEB8', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#283618' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px', fontWeight: 500 }}>Image</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px', fontWeight: 500 }}>Category</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px', fontWeight: 500 }}>Price</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px', fontWeight: 500 }}>Stock</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px', fontWeight: 500 }}>Featured</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} style={{ borderBottom: '1px solid #D6CEB8' }}>
                <td style={{ padding: '12px 16px' }}>
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', background: '#FEFAE0', borderRadius: '8px' }} />
                  )}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#283618' }}>{product.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#7A7A5C' }}>{product.category}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#283618' }}>{getPriceRange(product.variants)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#7A7A5C' }}>{getStockStatus(product.variants)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '100px',
                    background: product.status === 'Active' ? '#EAF3EC' : product.status === 'Draft' ? '#FFF3CD' : '#F0F0F0',
                    color: product.status === 'Active' ? '#4A7C59' : product.status === 'Draft' ? '#8A6D00' : '#7A7A5C'
                  }}>
                    {product.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <input
                    type="checkbox"
                    checked={product.isFeatured}
                    onChange={() => toggleFeatured(product)}
                  />
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <Link href={`/admin/products/${product._id}/edit`} style={{ color: '#606C38', fontSize: '12px', marginRight: '12px' }}>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id, product.name)}
                    style={{ color: '#C0392B', fontSize: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <p style={{ textAlign: 'center', color: '#7A7A5C', padding: '40px' }}>No products yet. Add your first one.</p>
      )}
    </div>
  )
}