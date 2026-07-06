'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import { getRandomGreeting } from '@/lib/adminGreetings'

function RevenueIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 17l5-5 4 4 8-9" /><path d="M15 7h5v5" />
    </svg>
  )
}
function OrdersStatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  )
}
function ProductsStatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 7.5 12 3 3 7.5l9 4.5 9-4.5Z" /><path d="M3 7.5v9L12 21l9-4.5v-9" />
    </svg>
  )
}
function AlertIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
    </svg>
  )
}
function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    setGreeting(getRandomGreeting())
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

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  const attentionItems = [
    { label: 'Pending Orders', value: stats.pendingOrders, href: '/admin/orders', icon: OrdersStatIcon },
    { label: 'Open Issues', value: stats.openIssues, href: '/admin/issues', icon: AlertIcon },
    { label: 'Out of Stock', value: stats.outOfStockProducts, href: '/admin/products', icon: ProductsStatIcon },
  ].filter(item => item.value > 0)

  const quickActions = [
    { label: 'Add Product', href: '/admin/products/new' },
    { label: 'View Orders', href: '/admin/orders' },
    { label: 'View Issues', href: '/admin/issues' },
    { label: 'Manage Reviews', href: '/admin/reviews' },
    { label: 'Promo Codes', href: '/admin/promos' },
    { label: 'Shipping Rates', href: '/admin/shipping' },
    { label: 'Inquiries', href: '/admin/inquiries' },
  ]

  return (
    <div className="px-8 md:px-12 py-10 md:py-14 max-w-[1320px]">

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">Welcome back</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[52px] leading-[1.05] mb-3" style={{ letterSpacing: '-0.02em' }}>
        {greeting}
      </h1>
      <p className="text-forest/55 text-[15px] mb-12">Here&apos;s how the store is doing today.</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 mb-10">

        {/* HERO REVENUE CARD */}
        <div className="rounded-[24px] bg-[#3D4A26] p-8 md:p-10 flex flex-col justify-between min-h-[220px] shadow-[0_16px_40px_-12px_rgba(40,54,24,0.4)]">
          <div className="flex items-center justify-between">
            <p className="text-cream/50 text-[13px] font-bold uppercase tracking-wide">Total Revenue</p>
            <div className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center">
              <RevenueIcon className="w-5 h-5 text-cream" />
            </div>
          </div>
          <div>
            <p className="font-display font-bold text-cream text-[48px] md:text-[56px] leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
              ₦{stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-cream/50 text-[13px]">From {stats.totalOrders} order{stats.totalOrders !== 1 ? 's' : ''} total</p>
          </div>
        </div>

        {/* NEEDS ATTENTION */}
        <div className={`rounded-[24px] border-[1.5px] p-7 md:p-8 shadow-[0_10px_28px_-10px_rgba(40,54,24,0.12)] ${
          attentionItems.length > 0
            ? 'border-error/25 bg-error/[0.04]'
            : 'border-border bg-surface'
        }`}>
          <p className="text-forest text-[15px] font-bold mb-5">Needs Attention</p>

          {attentionItems.length === 0 ? (
            <div className="flex items-center justify-center h-[120px]">
              <p className="text-forest/45 text-[14px]">All caught up — nothing urgent.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {attentionItems.map(item => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3.5 rounded-[14px] hover:bg-cream transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-error/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-error" />
                      </div>
                      <span className="text-[14px] font-medium text-forest">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-error text-[18px]">{item.value}</span>
                      <ArrowIcon className="w-4 h-4 text-forest/30 group-hover:text-olive group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECONDARY STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6 shadow-[0_10px_28px_-10px_rgba(40,54,24,0.12)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-forest/50 text-[12px] font-bold uppercase tracking-wide">Total Orders</p>
            <OrdersStatIcon className="w-4 h-4 text-forest/30" />
          </div>
          <p className="font-display font-bold text-forest text-[30px]">{stats.totalOrders}</p>
        </div>

        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6 shadow-[0_10px_28px_-10px_rgba(40,54,24,0.12)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-forest/50 text-[12px] font-bold uppercase tracking-wide">Active Products</p>
            <ProductsStatIcon className="w-4 h-4 text-forest/30" />
          </div>
          <p className="font-display font-bold text-forest text-[30px]">{stats.totalProducts}</p>
        </div>

        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6 shadow-[0_10px_28px_-10px_rgba(40,54,24,0.12)]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-forest/50 text-[12px] font-bold uppercase tracking-wide">Stock Health</p>
            <ProductsStatIcon className="w-4 h-4 text-forest/30" />
          </div>
          <p className="text-forest/40 text-[11px] mb-3">Active products with stock available</p>
          <p className="font-display font-bold text-forest text-[30px] mb-2">
            {stats.totalProducts > 0 ? Math.round(((stats.totalProducts - stats.outOfStockProducts) / stats.totalProducts) * 100) : 100}%
          </p>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-olive rounded-full transition-all"
              style={{ width: `${stats.totalProducts > 0 ? ((stats.totalProducts - stats.outOfStockProducts) / stats.totalProducts) * 100 : 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <p className="text-forest text-[15px] font-bold mb-4">Quick Actions</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {quickActions.map(action => (
          <Link
            key={action.label}
            href={action.href}
            className="rounded-[16px] border-[1.5px] border-border bg-surface px-5 py-4 text-[14px] font-medium text-forest hover:border-olive hover:bg-cream transition-colors text-center"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}