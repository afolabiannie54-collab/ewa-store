'use client'

import { useState, useRef, useEffect } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Loader from '@/components/Loader'

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

function HeartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.8 8.6c0 4.4-8.8 10.9-8.8 10.9S3.2 13 3.2 8.6a5 5 0 0 1 9-3 5 5 0 0 1 8.6 3Z" />
    </svg>
  )
}

function BagIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  )
}

function ChevronDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
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

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const accountRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`)
        const data = await res.json()
        setSearchResults((data.products || []).slice(0, 6))
      } catch (err) {
        console.error('Search failed')
      }
      setSearchLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleLogout = () => {
    setAccountOpen(false)
    setMobileOpen(false)
    signOut({ callbackUrl: '/' })
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href.split('#')[0]) && href !== '/'
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-forest border-b-[2px] border-olive shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3)]">
        <div className="mx-auto flex h-[80px] max-w-[1320px] items-center justify-between px-6 md:px-12">

          <Link
            href="/"
            className="shrink-0 font-display font-bold text-[32px] text-cream leading-none"
            style={{ letterSpacing: '-0.06em' }}
          >
            Ewa
          </Link>

          <div className="hidden md:flex items-center gap-11 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[16px] font-semibold transition-colors duration-200 ${
                  isActive(link.href) ? 'text-olive' : 'text-cream hover:text-olive'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden sm:inline-flex text-cream hover:text-olive transition-colors duration-200"
            >
              <SearchIcon className="w-6 h-6" />
            </button>

            {session && session.user.role !== 'admin' && (
              <Link href="/wishlist" aria-label="Wishlist" className="hidden sm:inline-flex text-cream hover:text-olive transition-colors duration-200">
                <HeartIcon className="w-6 h-6" />
              </Link>
            )}

            {session?.user?.role !== 'admin' && (
              <Link href="/cart" aria-label="Cart" className="inline-flex text-cream hover:text-olive transition-colors duration-200">
                <BagIcon className="w-6 h-6" />
              </Link>
            )}

            <div className="relative hidden md:block" ref={accountRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="text-[16px] font-semibold text-cream hover:text-olive transition-colors duration-200 flex items-center gap-1.5"
              >
                {session ? 'Account' : 'Login'}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+14px)] w-64 rounded-2xl bg-surface border border-border shadow-xl overflow-hidden py-2">
                  {session ? (
                    session.user.role === 'admin' ? (
                      <>
                        <Link href="/admin" onClick={() => setAccountOpen(false)} className="block px-6 py-4 text-[16px] font-bold text-olive hover:bg-cream transition-colors">Admin Dashboard</Link>
                        <button onClick={handleLogout} className="w-full text-left px-6 py-4 text-[16px] font-medium text-error hover:bg-cream transition-colors border-t border-border">Logout</button>
                      </>
                    ) : (
                      <>
                        <Link href="/account" onClick={() => setAccountOpen(false)} className="block px-6 py-3.5 text-[16px] font-medium text-text hover:bg-cream transition-colors">My Account</Link>
                        <Link href="/orders" onClick={() => setAccountOpen(false)} className="block px-6 py-3.5 text-[16px] font-medium text-text hover:bg-cream transition-colors">My Orders</Link>
                        <Link href="/issues" onClick={() => setAccountOpen(false)} className="block px-6 py-3.5 text-[16px] font-medium text-text hover:bg-cream transition-colors">My Issues</Link>
                        <Link href="/reviews" onClick={() => setAccountOpen(false)} className="block px-6 py-3.5 text-[16px] font-medium text-text hover:bg-cream transition-colors">My Reviews</Link>
                        <Link href="/wishlist" onClick={() => setAccountOpen(false)} className="block px-6 py-3.5 text-[16px] font-medium text-text hover:bg-cream transition-colors">Wishlist</Link>
                        <button onClick={handleLogout} className="w-full text-left px-6 py-3.5 text-[16px] font-medium text-error hover:bg-cream transition-colors border-t border-border mt-1">Logout</button>
                      </>
                    )
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setAccountOpen(false)} className="block px-6 py-3.5 text-[16px] font-medium text-text hover:bg-cream transition-colors">Login</Link>
                      <Link href="/register" onClick={() => setAccountOpen(false)} className="block px-6 py-3.5 text-[16px] font-medium text-text hover:bg-cream transition-colors">Create Account</Link>
                      <Link href="/track-order" onClick={() => setAccountOpen(false)} className="block px-6 py-3.5 text-[16px] font-medium text-text hover:bg-cream transition-colors border-t border-border mt-1">Track Order</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="md:hidden text-cream"
            >
              <MenuIcon className="w-7 h-7" />
            </button>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-forest/97 flex items-start justify-center pt-32 px-6 overflow-y-auto" onClick={() => setSearchOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
            <form onSubmit={handleSearch}>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent border-b-2 border-cream/40 focus:border-cream text-cream text-3xl font-display placeholder:text-cream/40 outline-none pb-4 transition-colors"
              />
            </form>

            {searchQuery.trim() && (
              <div className="mt-6">
                {searchLoading ? (
                  <div className="flex justify-center">
                    <Loader size="sm" color="cream" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-cream/50 text-[14px]">No products found.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {searchResults.map(product => (
                      <Link
                        key={product._id}
                        href={`/shop/${product.slug}`}
                        onClick={() => {
                          setSearchOpen(false)
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                        className="flex items-center gap-4 py-3 px-2 rounded-[12px] hover:bg-cream/10 transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-[8px] overflow-hidden bg-cream/10 flex-shrink-0">
                          {product.images?.[0] && (
                            <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-cream text-[15px] font-medium truncate">{product.name}</p>
                          <p className="text-cream/50 text-[13px]">From ₦{product.startingPrice?.toLocaleString() || 0}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSearch}
                  className="mt-4 text-cream text-[14px] font-bold uppercase tracking-wide hover:text-olive transition-colors"
                >
                  See all results →
                </button>
              </div>
            )}

            <button type="button" onClick={() => setSearchOpen(false)} className="mt-6 text-cream/70 text-[15px] font-medium hover:text-cream transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-dark/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-cream shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-7 py-6 border-b border-border">
              <span
                className="font-display font-bold text-[26px] text-forest leading-none"
                style={{ letterSpacing: '-0.06em' }}
              >
                Ewa
              </span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-forest">
                <CloseIcon className="w-7 h-7" />
              </button>
            </div>

            <div className="flex flex-col px-7 py-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-4 text-[18px] font-semibold border-b border-border ${
                    isActive(link.href) ? 'text-olive' : 'text-text'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="py-4 text-[18px] font-semibold text-text border-b border-border">Cart</Link>
              <Link href="/track-order" onClick={() => setMobileOpen(false)} className="py-4 text-[18px] font-semibold text-text border-b border-border">Track Order</Link>
            </div>

            <div className="px-7 py-5">
              <p className="text-[13px] font-bold uppercase tracking-wider text-muted mb-4">Account</p>
              {session ? (
                <div className="flex flex-col">
                  {session.user.role === 'admin' ? (
                    <>
                      <Link href="/admin" onClick={() => setMobileOpen(false)} className="py-4 text-[18px] font-bold text-olive border-b border-border">Admin Dashboard</Link>
                      <button onClick={handleLogout} className="text-left py-4 text-[18px] font-semibold text-error">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link href="/account" onClick={() => setMobileOpen(false)} className="py-4 text-[18px] font-semibold text-text border-b border-border">My Account</Link>
                      <Link href="/orders" onClick={() => setMobileOpen(false)} className="py-4 text-[18px] font-semibold text-text border-b border-border">My Orders</Link>
                      <Link href="/issues" onClick={() => setMobileOpen(false)} className="py-4 text-[18px] font-semibold text-text border-b border-border">My Issues</Link>
                      <Link href="/reviews" onClick={() => setMobileOpen(false)} className="py-4 text-[18px] font-semibold text-text border-b border-border">My Reviews</Link>
                      <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="py-4 text-[18px] font-semibold text-text border-b border-border">Wishlist</Link>
                      <button onClick={handleLogout} className="text-left py-4 text-[18px] font-semibold text-error">Logout</button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-1">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-full bg-olive text-cream text-center py-4 text-[15px] font-bold uppercase tracking-wider">Login</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-full border border-border text-text text-center py-4 text-[15px] font-bold uppercase tracking-wider">Create Account</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}