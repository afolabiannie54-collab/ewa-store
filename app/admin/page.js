'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats')
    }
    setLoading(false)
  }

  if (loading) return <div style={{ padding: '40px' }}>Loading dashboard...</div>

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, link: '/admin/orders' },
    { label: 'Total Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, link: '/admin/orders' },
    { label: 'Pending Orders', value: stats.pendingOrders, link: '/admin/orders', highlight: stats.pendingOrders > 0 },
    { label: 'Open Issues', value: stats.openIssues, link: '/admin/issues', highlight: stats.openIssues > 0 },
    { label: 'Active Products', value: stats.totalProducts, link: '/admin/products' },
    { label: 'Out of Stock', value: stats.outOfStockProducts, link: '/admin/products', highlight: stats.outOfStockProducts > 0 }
  ]

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: '#7A7A5C', fontSize: '14px', marginBottom: '32px' }}>Overview of your store</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {cards.map(card => (
          <Link
            key={card.label}
            href={card.link}
            style={{
              display: 'block', textDecoration: 'none',
              background: '#FFFFFF', border: card.highlight ? '1.5px solid #C0392B' : '1px solid #D6CEB8',
              borderRadius: '16px', padding: '24px'
            }}
          >
            <p style={{ fontSize: '12px', color: '#7A7A5C', marginBottom: '8px' }}>{card.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 600, color: card.highlight ? '#C0392B' : '#283618' }}>{card.value}</p>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link href="/admin/products/new" style={navButtonStyle}>+ Add Product</Link>
        <Link href="/admin/orders" style={navButtonStyle}>View Orders</Link>
        <Link href="/admin/issues" style={navButtonStyle}>View Issues</Link>
        <Link href="/admin/reviews" style={navButtonStyle}>Manage Reviews</Link>
        <Link href="/admin/promos" style={navButtonStyle}>Manage Promo Codes</Link>
        <Link href="/admin/shipping" style={navButtonStyle}>Shipping Rates</Link>
        <Link href="/admin/inquiries" style={navButtonStyle}>Customer Inquiries</Link>
      </div>
    </div>
  )
}

const navButtonStyle = {
  padding: '10px 20px',
  borderRadius: '100px',
  border: '1px solid #D6CEB8',
  color: '#283618',
  fontSize: '13px',
  textDecoration: 'none'
}