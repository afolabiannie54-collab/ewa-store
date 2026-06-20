import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function proxy(req) {
  const { pathname } = req.nextUrl

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const isAdminRoute = pathname.startsWith('/admin')
  const isAccountRoute = pathname.startsWith('/account') || pathname.startsWith('/wishlist')

  if (token?.role === 'admin' && !isAdminRoute && pathname !== '/login') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAdminRoute && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isAccountRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/wishlist/:path*']
}