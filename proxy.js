import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function proxy(req) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const isAdminRoute = pathname.startsWith('/admin')
  const isAccountRoute = pathname.startsWith('/account') || pathname.startsWith('/wishlist')
  const isAuthPage = pathname === '/login' || pathname === '/register'

  // /login and /register: redirect away if already authenticated
  if (isAuthPage && token) {
    if (token.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    const raw = req.nextUrl.searchParams.get('callbackUrl') || '/'
    const safe = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
    return NextResponse.redirect(new URL(safe, req.url))
  }

  // /admin/*: require an authenticated admin
  if (isAdminRoute) {
    if (!token) {
      const url = new URL('/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // /account and /wishlist: require login
  if (isAccountRoute && !token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Admins visiting account/wishlist pages → send to admin panel
  if (token?.role === 'admin' && isAccountRoute) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/admin',
    '/admin/:path*',
    '/account',
    '/account/:path*',
    '/wishlist',
    '/wishlist/:path*',
  ],
}
