import { NextResponse } from 'next/server'

export const revalidate = 900

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'Invalid anime id.' }, { status: 400 })

  try {
    const base = process.env.JIKAN_API_URL || 'https://api.jikan.moe/v4'
    const response = await fetch(`${base}/anime/${id}/full?sfw=true`, { next: { revalidate: 900 } })
    if (response.status === 404) return NextResponse.json({ error: 'Anime not found.' }, { status: 404 })
    if (response.status === 429) return NextResponse.json({ error: 'Jikan rate limit reached.' }, { status: 429 })
    if (!response.ok) return NextResponse.json({ error: 'Jikan request failed.' }, { status: 502 })
    const payload = await response.json() as { data?: unknown }
    return NextResponse.json(payload.data ?? null)
  } catch {
    return NextResponse.json({ error: 'Jikan is temporarily unavailable.' }, { status: 503 })
  }
}
