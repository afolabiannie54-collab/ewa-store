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
function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: DashboardIcon },
  { href: '/admin/products', label: 'Products', icon: ProductsIcon },
  { href: '/admin/categories', label: 'Categories', icon: CategoriesIcon },
  { href: '/admin/orders', label: 'Orders', icon: OrdersIcon },
  { href: '/admin/issues', label: 'Issues', icon: IssuesIcon },
  { href: '/admin/reviews', label: 'Reviews', icon: ReviewsIcon },
  { href: '/admin/promos', label: 'Promo Codes', icon: PromosIcon },
  { href: '/admin/shipping', label: 'Shipping Rates', icon: ShippingIcon },
  { href: '/admin/inquiries', label: 'Inquiries', icon: InquiriesIcon },
]

const MIN_WIDTH = 200
const MAX_WIDTH = 360
const DEFAULT_WIDTH = 260

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ startX: 0, startWidth: DEFAULT_WIDTH })

  useEffect(() => {
    const savedWidth = localStorage.getItem('adminSidebarWidth')
    if (savedWidth) setWidth(Number(savedWidth))
  }, [])

  useEffect(() => {
    function handleMouseMove(e) {
      if (!isDragging) return
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartRef.current.startWidth + (e.clientX - dragStartRef.current.startX)))
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
    e.preventDefault()
    dragStartRef.current = { startX: e.clientX, startWidth: width }
    setIsDragging(true)
  }

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Hover trigger strip — only visible when sidebar is closed */}
      {!open && (
        <div
          className="fixed left-0 top-0 h-full z-40 hidden md:block"
          style={{ width: 6, background: '#283618', cursor: 'e-resize' }}
          onMouseEnter={() => setOpen(true)}
        />
      )}

      {/* Sidebar overlay */}
      <aside
        style={{
          width: open ? width : 0,
          transition: isDragging ? 'none' : 'width 220ms cubic-bezier(0.4,0,0.2,1)',
        }}
        className="fixed left-0 top-0 h-full z-40 bg-forest overflow-hidden hidden md:flex flex-col shadow-[4px_0_40px_-4px_rgba(0,0,0,0.3)]"
      >
        <div style={{ width, minWidth: width }} className="flex flex-col flex-1 py-8">

          <div className="flex items-center justify-between mb-1 px-5">
            <Link href="/" className="font-display font-bold text-cream text-[26px]" style={{ letterSpacing: '-0.04em' }}>
              Ewa
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
              className="w-8 h-8 flex items-center justify-center rounded-full text-cream/50 hover:bg-cream/10 hover:text-cream transition-colors"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          <p className="text-cream/40 text-[11px] font-bold uppercase tracking-wide px-5 mb-8">Admin</p>

          <nav className="flex flex-col gap-1 px-3">
            {NAV_LINKS.map(link => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-colors whitespace-nowrap ${
                    active ? 'bg-cream text-forest' : 'text-cream/65 hover:bg-cream/10 hover:text-cream'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Drag-to-resize handle */}
        <div
          onMouseDown={startDrag}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-olive/40 transition-colors"
        />
      </aside>

      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
}
