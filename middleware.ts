import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = process.env.ADMIN_ACCESS_TOKEN
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'ADMIN_ACCESS_TOKEN is not configured.' }, { status: 503 })
    }
    return NextResponse.redirect(new URL('/login?admin=not-configured', request.url))
  }

  const authenticated = request.cookies.get('aniwacth_admin')?.value === token
  if (authenticated) return NextResponse.next()

  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 })
  }
  return NextResponse.redirect(new URL('/login?admin=required', request.url))
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
