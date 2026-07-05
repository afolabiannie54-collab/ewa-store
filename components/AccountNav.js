'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AccountNav() {
  const pathname = usePathname()

  const links = [
    { href: '/account', label: 'Profile' },
    { href: '/account/addresses', label: 'Addresses' },
    { href: '/orders', label: 'Orders' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/issues', label: 'Issues' },
    { href: '/reviews', label: 'Reviews' },
  ]

  return (
    <div className="flex flex-wrap gap-2.5 mb-12">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide transition-colors ${
            pathname === link.href ? 'bg-olive text-cream' : 'bg-surface border-[1.5px] border-border text-forest hover:border-olive'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}