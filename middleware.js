import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // /login and /register: redirect away if already authenticated
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      const raw = request.nextUrl.searchParams.get('callbackUrl') || '/'
      const safe = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
      return NextResponse.redirect(new URL(safe, request.url))
    }
    return NextResponse.next()
  }

  // /admin/*: require an authenticated admin
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/register', '/admin/:path*'],
}
