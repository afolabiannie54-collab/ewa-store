'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}
function ProductsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 7.5 12 3 3 7.5l9 4.5 9-4.5Z" /><path d="M3 7.5v9L12 21l9-4.5v-9" /><path d="M12 12v9" />
    </svg>
  )
}
function OrdersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  )
}
function IssuesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
    </svg>
  )
}
function ReviewsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7L12 2.5Z" />
    </svg>
  )
}
function PromosIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 12 12 20 4 12V4h8l8 8Z" /><circle cx="9" cy="9" r="1.2" fill="currentColor" />
    </svg>
  )
}
function CategoriesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.59 13.41L13.42 20.59a2 2 0 0 1-2.83 0L2 12V4h8l10.59 10.59a2 2 0 0 1 0 2.82Z" /><circle cx="7" cy="9" r="1.2" fill="currentColor" />
    </svg>
  )
}
function ShippingIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="6" width="13" height="11" rx="1.5" /><path d="M15 9h4l3 3v5h-7V9Z" /><circle cx="6.5" cy="19" r="1.7" /><circle cx="17" cy="19" r="1.7" />
    </svg>
  )
}
function InquiriesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.5 8.5 0 1 1-3.8-7.1" /><path d="M21 4 12 13l-3-3" />
    </svg>
  )
}
function CollapseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: DashboardIcon },
  { href: '/admin/products', label: 'Products', icon: ProductsIcon, badgeKey: 'outOfStockProducts' },
  { href: '/admin/categories', label: 'Categories', icon: CategoriesIcon },
  { href: '/admin/orders', label: 'Orders', icon: OrdersIcon, badgeKey: 'pendingOrders' },
  { href: '/admin/issues', label: 'Issues', icon: IssuesIcon, badgeKey: 'pendingIssues' },
  { href: '/admin/reviews', label: 'Reviews', icon: ReviewsIcon, badgeKey: 'pendingReviews' },
  { href: '/admin/promos', label: 'Promo Codes', icon: PromosIcon },
  { href: '/admin/shipping', label: 'Shipping Rates', icon: ShippingIcon },
  { href: '/admin/inquiries', label: 'Inquiries', icon: InquiriesIcon, badgeKey: 'unreadInquiries' },
]

const MIN_WIDTH = 200
const MAX_WIDTH = 360
const DEFAULT_WIDTH = 260
const COLLAPSED_WIDTH = 76

function Badge({ count, collapsed }) {
  if (!count) return null
  const label = count > 99 ? '99+' : String(count)
  if (collapsed) {
    return (
      <span
        aria-label={`${count} pending`}
        className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none flex items-center justify-center"
      >
        {label}
      </span>
    )
  }
  return (
    <span
      aria-label={`${count} pending`}
      className="ml-auto min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center flex-shrink-0"
    >
      {label}
    </span>
  )
}

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [isDragging, setIsDragging] = useState(false)
  const [notifications, setNotifications] = useState({})
  const dragStartRef = useRef({ startX: 0, startWidth: DEFAULT_WIDTH })
  const pollRef = useRef(null)

  useEffect(() => {
    const savedWidth = localStorage.getItem('adminSidebarWidth')
    const savedCollapsed = localStorage.getItem('adminSidebarCollapsed')
    if (savedWidth) setWidth(Number(savedWidth))
    if (savedCollapsed === 'true') setCollapsed(true)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch {
      // non-critical — leave previous counts visible
    }
  }

  // Fetch on mount and whenever the route changes (admin navigates between sections)
  useEffect(() => {
    fetchNotifications()
  }, [pathname])

  // Poll every 60s to catch new orders/reviews coming in while admin is idle
  useEffect(() => {
    pollRef.current = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(pollRef.current)
  }, [])

  useEffect(() => {
    function handleMouseMove(e) {
      if (!isDragging) return
      const delta = e.clientX - dragStartRef.current.startX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartRef.current.startWidth + delta))
      setWidth(newWidth)
    }

    function handleMouseUp() {
      if (isDragging) {
        setIsDragging(false)
        localStorage.setItem('adminSidebarWidth', String(width))
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, width])

  const startDrag = (e) => {
    dragStartRef.current = { startX: e.clientX, startWidth: width }
    setIsDragging(true)
  }

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('adminSidebarCollapsed', String(next))
  }

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : width

  return (
    <div className="flex min-h-screen bg-cream">
      <aside
        style={{ width: sidebarWidth }}
        className={`relative flex-shrink-0 bg-forest min-h-screen sticky top-0 self-start py-8 hidden md:flex flex-col ${
          isDragging ? '' : 'transition-[width] duration-200'
        }`}
      >
        <div className={`flex items-center justify-between mb-1 ${collapsed ? 'px-4' : 'px-5'}`}>
          {!collapsed && (
            <Link href="/" className="font-display font-bold text-cream text-[26px]" style={{ letterSpacing: '-0.04em' }}>
              Ewa
            </Link>
          )}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-cream/60 hover:bg-cream/10 hover:text-cream transition-colors"
          >
            <CollapseIcon className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {!collapsed && <p className="text-cream/40 text-[11px] font-bold uppercase tracking-wide px-5 mb-8">Admin</p>}
        {collapsed && <div className="mb-8" />}

        <nav className="flex flex-col gap-1 px-3">
          {NAV_LINKS.map(link => {
            const Icon = link.icon
            const active = isActive(link.href)
            const badgeCount = link.badgeKey ? (notifications[link.badgeKey] || 0) : 0

            return (
              <Link
                key={link.href}
                href={link.href}
                title={collapsed ? link.label : undefined}
                className={`relative flex items-center gap-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-colors ${
                  collapsed ? 'justify-center px-0' : 'px-3'
                } ${active ? 'bg-cream text-forest' : 'text-cream/65 hover:bg-cream/10 hover:text-cream'}`}
              >
                <span className="relative flex-shrink-0">
                  <Icon className="w-[18px] h-[18px]" />
                  {collapsed && <Badge count={badgeCount} collapsed />}
                </span>
                {!collapsed && link.label}
                {!collapsed && <Badge count={badgeCount} collapsed={false} />}
              </Link>
            )
          })}
        </nav>

        {!collapsed && (
          <div
            onMouseDown={startDrag}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-olive/40 transition-colors"
          />
        )}
      </aside>

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
