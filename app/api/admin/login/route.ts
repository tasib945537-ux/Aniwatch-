import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, isAdminTokenValid } from '../../../../lib/admin-auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const token = typeof body?.token === 'string' ? body.token : ''
  if (!isAdminTokenValid(token)) return NextResponse.json({ error: 'Invalid admin access token.' }, { status: 401 })

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, expires: new Date(0), path: '/' })
  return response
}
