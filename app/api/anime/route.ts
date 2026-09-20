import { NextResponse } from 'next/server'

export const revalidate = 900
const API = process.env.JIKAN_API_URL || 'https://api.jikan.moe/v4'

const sections = {
  trending: '/top/anime?filter=bypopularity&limit=12&sfw=true',
  airing: '/top/anime?filter=airing&limit=12&sfw=true',
  rated: '/top/anime?limit=12&sfw=true',
  season: '/seasons/now?limit=12&sfw=true',
  upcoming: '/top/anime?filter=upcoming&limit=12&sfw=true',
  movies: '/top/anime?type=movie&limit=12&sfw=true',
  tv: '/top/anime?type=tv&limit=24&sfw=true',
  ova: '/top/anime?type=ova&limit=24&sfw=true',
  action: '/anime?genres=1&order_by=score&sort=desc&limit=12&sfw=true',
  romance: '/anime?genres=22&order_by=score&sort=desc&limit=12&sfw=true',
  comedy: '/anime?genres=4&order_by=score&sort=desc&limit=12&sfw=true',
  fantasy: '/anime?genres=10&order_by=score&sort=desc&limit=12&sfw=true',
  schedule: '/schedules?limit=24&sfw=true',
} as const

type Payload = { data?: unknown[] }

async function fetchJikan(path: string) {
  const response = await fetch(`${API}${path}`, { next: { revalidate: 900 } })
  if (response.status === 429) throw new Error('RATE_LIMIT')
  if (!response.ok) throw new Error('JIKAN_ERROR')
  const payload = await response.json() as Payload
  return Array.isArray(payload.data) ? payload.data : []
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const query = params.get('q')?.trim()
  const category = params.get('category') as keyof typeof sections | null
  const page = Math.max(1, Number(params.get('page') || '1') || 1)
  const genre = params.get('genre')?.trim()

  const genreIds: Record<string, number> = {
    Action: 1, Adventure: 2, Comedy: 4, Drama: 8, Fantasy: 10,
    Horror: 14, Romance: 22, 'Sci-Fi': 24,
  }

  try {
    if (query) {
      return NextResponse.json({ data: await fetchJikan(`/anime?q=${encodeURIComponent(query)}&page=${page}&limit=24&sfw=true`) })
    }
    if (genre) {
      const id = genreIds[genre]
      if (!id) return NextResponse.json({ data: [] })
      return NextResponse.json({ data: await fetchJikan(`/anime?genres=${id}&order_by=score&sort=desc&page=${page}&limit=24&sfw=true`) })
    }
    if (category && category in sections) {
      return NextResponse.json({ data: await fetchJikan(`${sections[category]}${sections[category].includes('?') ? '&' : '?'}page=${page}`) })
    }

    const entries = await Promise.allSettled(
      Object.entries(sections).slice(0, 8).map(async ([key, path]) => [key, await fetchJikan(path)] as const)
    )
    const data: Record<string, unknown[]> = {}
    for (const result of entries) {
      if (result.status === 'fulfilled') data[result.value[0]] = result.value[1]
    }
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMIT') {
      return NextResponse.json({ error: 'Jikan rate limit reached. Please try again shortly.' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Jikan is temporarily unavailable.' }, { status: 503 })
  }
}
