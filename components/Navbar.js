'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav style={{
      background: '#283618', padding: '16px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <Link href="/" style={{ color: '#FEFAE0', fontFamily: 'serif', fontSize: '22px', textDecoration: 'none' }}>
        EWA
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link href="/shop" style={{ color: '#FEFAE0', fontSize: '13px', textDecoration: 'none' }}>Shop</Link>
        <Link href="/cart" style={{ color: '#FEFAE0', fontSize: '13px', textDecoration: 'none' }}>Cart</Link>
        {session && (
          <Link href="/issues" style={{ color: '#FEFAE0', fontSize: '13px', textDecoration: 'none' }}>My Issues</Link>
        )}
        {session ? (
          <>
            {session.user.role === 'admin' && (
              <Link href="/admin/products" style={{ color: '#FEFAE0', fontSize: '13px', textDecoration: 'none' }}>Admin</Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{ color: '#FEFAE0', fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" style={{ color: '#FEFAE0', fontSize: '13px', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  )
}