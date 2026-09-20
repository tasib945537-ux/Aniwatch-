import { NextResponse } from 'next/server'
import { getSources } from '../../../../lib/video-sources'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, context: { params: Promise<{ mal_id: string }> }) {
  const { mal_id } = await context.params
  const episode = Math.max(1, Number(new URL(request.url).searchParams.get('ep') || '1'))
  if (!/^\d+$/.test(mal_id) || !Number.isInteger(episode)) return NextResponse.json({ error: 'Invalid anime or episode.' }, { status: 400 })

  try {
    const base = process.env.JIKAN_API_URL || 'https://api.jikan.moe/v4'
    const [animeResponse, episodesResponse] = await Promise.all([
      fetch(`${base}/anime/${mal_id}`, { next: { revalidate: 900 } }),
      fetch(`${base}/anime/${mal_id}/episodes?page=${Math.ceil(episode / 100)}`, { next: { revalidate: 900 } }),
    ])

    if (!animeResponse.ok) return NextResponse.json({ error: 'Anime metadata unavailable.' }, { status: animeResponse.status === 404 ? 404 : 502 })

    const animePayload = await animeResponse.json() as { data?: { mal_id: number; title: string; episodes?: number | null } }
    const episodePayload = episodesResponse.ok ? await episodesResponse.json() as { data?: { mal_id: number; title: string; episode: number; duration?: number | null }[] } : { data: [] }

    return NextResponse.json({
      anime: animePayload.data || null,
      episode: episodePayload.data?.find(item => item.episode === episode) || { episode, title: `Episode ${episode}` },
      sources: getSources(Number(mal_id), episode),
      configured: getSources(Number(mal_id), episode).length > 0,
    })
  } catch {
    return NextResponse.json({ error: 'Watch data is temporarily unavailable.' }, { status: 503 })
  }
}
