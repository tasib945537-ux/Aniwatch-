export type ConfiguredVideoSource = {
  malId: number
  episode: number
  language: string
  serverName: string
  playbackUrl?: string
  muxPlaybackId?: string
  cloudflareVideoUid?: string
  quality?: string
  subtitleUrl?: string
  introStart?: number
  introEnd?: number
}

function readSources(): ConfiguredVideoSource[] {
  const raw = process.env.AUTHORIZED_VIDEO_SOURCES_JSON
  if (!raw) return []
  try {
    const value = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter((item): item is ConfiguredVideoSource =>
      item && Number.isInteger(item.malId) && Number.isInteger(item.episode) &&
      typeof item.language === 'string' && typeof item.serverName === 'string'
    )
  } catch {
    return []
  }
}

export const DUB_LANGUAGES = [
  { id: 'hindi', label: 'Hindi' },
  { id: 'english', label: 'English' },
  { id: 'japanese', label: 'Japanese' },
  { id: 'bengali', label: 'Bengali' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'telugu', label: 'Telugu' },
  { id: 'malayalam', label: 'Malayalam' },
  { id: 'other', label: 'Other' },
] as const

export function getConfiguredLanguages() {
  const configured = new Set(readSources().map(source => source.language.trim().toLowerCase()))
  return DUB_LANGUAGES.filter(language => configured.has(language.id))
}

export function getConfiguredAnimeIds(language: string) {
  const target = language.trim().toLowerCase()
  return [...new Set(readSources().filter(source => source.language.trim().toLowerCase() === target).map(source => source.malId))]
}

export function getSources(malId: number, episode: number) {
  return readSources().filter(source => source.malId === malId && source.episode === episode).map(source => ({
    ...source,
    playbackUrl: source.playbackUrl ||
      (source.muxPlaybackId ? `https://stream.mux.com/${encodeURIComponent(source.muxPlaybackId)}.m3u8` : undefined) ||
      (source.cloudflareVideoUid && process.env.CLOUDFLARE_STREAM_CUSTOM_DOMAIN
        ? `https://${process.env.CLOUDFLARE_STREAM_CUSTOM_DOMAIN}/${encodeURIComponent(source.cloudflareVideoUid)}/manifest/video.m3u8`
        : undefined),
  })).filter(source => Boolean(source.playbackUrl))
}
