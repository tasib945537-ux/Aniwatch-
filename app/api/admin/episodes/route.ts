import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '../../../../lib/admin-auth'

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.title || !body?.episode || !body?.sourceUrl || !body?.server) return NextResponse.json({ error: 'title, episode, sourceUrl and server are required' }, { status: 400 })
  try { new URL(body.sourceUrl) } catch { return NextResponse.json({ error: 'sourceUrl must be a valid URL' }, { status: 400 }) }
  return NextResponse.json({ ok: true, message: 'Source validated. Connect Supabase/Prisma persistence for production storage.', item: body }, { status: 201 })
}
