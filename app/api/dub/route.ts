import { NextResponse } from 'next/server'
import { getAniListAnimeByMalIds } from '../../../lib/anilist'
import { DUB_LANGUAGES, getConfiguredAnimeIds, getConfiguredLanguages } from '../../../lib/video-sources'

export const revalidate = 300

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const requested = (params.get('lang') || 'hindi').trim().toLowerCase()
  const language = DUB_LANGUAGES.find(item => item.id === requested)?.id || requested
  const ids = getConfiguredAnimeIds(language)
  const configuredLanguages = getConfiguredLanguages()

  if (!ids.length) {
    return NextResponse.json({
      language,
      languages: configuredLanguages,
      data: [],
      message: 'No authorized video sources are configured for this language yet.'
    })
  }

  try {
    const data = await getAniListAnimeByMalIds(ids)
    return NextResponse.json({ language, languages: configuredLanguages, data })
  } catch {
    return NextResponse.json({ language, languages: configuredLanguages, data: [], message: 'Anime metadata is temporarily unavailable.' }, { status: 503 })
  }
}
