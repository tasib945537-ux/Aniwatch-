import { createClient } from '@supabase/supabase-js'

export type UploadProvider = 'custom' | 'cloudflare' | 'mux' | 'supabase'

export type UploadResult = {
  playbackUrl?: string
  muxPlaybackId?: string
  cloudflareVideoUid?: string
  quality?: string
  subtitleUrl?: string
  introStart?: number
  introEnd?: number
  provider: UploadProvider
}

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value || !value.trim()) throw new Error(`${name} is not configured.`)
  return value
}

export async function uploadAnimeSource(input: {
  title: string
  episode: number
  language: string
  serverName: string
  sourceUrl?: string
  file?: File | null
  provider?: string
  quality?: string
  malId?: number | string
}): Promise<UploadResult> {
  const provider = ((input.provider || (input.file ? 'supabase' : 'custom')).toLowerCase()) as UploadProvider

  if (provider === 'custom' || provider === 'cloudflare' || provider === 'supabase' || provider === 'mux') {
    if (provider === 'custom') {
      if (!input.sourceUrl) throw new Error('sourceUrl is required for the custom provider.')
      const url = new URL(input.sourceUrl)
      return {
        playbackUrl: url.toString(),
        quality: input.quality || 'Auto',
        provider,
      }
    }

    if (provider === 'supabase') {
      const file = input.file
      if (!file) throw new Error('A file is required for the Supabase upload provider.')
      const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
      const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'anime-videos'
      const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
      const safeTitle = (input.title || 'anime').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'anime'
      const fileName = `${safeTitle}-${input.episode}-${Date.now()}.${(file.name.split('.').pop() || 'mp4').toLowerCase()}`
      const { data, error } = await client.storage.from(bucket).upload(fileName, file, { upsert: true, contentType: file.type || 'video/mp4' })
      if (error) throw new Error(error.message)
      if (!data?.path) throw new Error('Supabase upload succeeded but no path was returned.')
      const playbackUrl = `${url}/storage/v1/object/public/${bucket}/${encodeURIComponent(data.path)}`
      return { playbackUrl, quality: input.quality || 'Auto', provider }
    }

    if (provider === 'cloudflare') {
      const file = input.file
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
      const token = process.env.CLOUDFLARE_API_TOKEN
      if (!accountId || !token) {
        if (input.sourceUrl) {
          return { playbackUrl: input.sourceUrl, quality: input.quality || 'Auto', provider }
        }
        throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required for Cloudflare uploads.')
      }
      const formData = new FormData()
      if (file) formData.append('file', file)
      if (!file && input.sourceUrl) {
        return { playbackUrl: input.sourceUrl, quality: input.quality || 'Auto', provider }
      }
      if (!file) throw new Error('A file is required for the Cloudflare upload provider.')
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const message = payload?.errors?.[0]?.message || 'Cloudflare upload failed.'
        throw new Error(message)
      }
      const uid = payload?.result?.uid || payload?.result?.id
      if (!uid) throw new Error('Cloudflare upload succeeded but no video UID was returned.')
      const playbackUrl = process.env.CLOUDFLARE_STREAM_CUSTOM_DOMAIN
        ? `https://${process.env.CLOUDFLARE_STREAM_CUSTOM_DOMAIN}/${encodeURIComponent(uid)}/manifest/video.m3u8`
        : `https://customer-${accountId}.cloudflarestream.com/${encodeURIComponent(uid)}/manifest/video.m3u8`
      return {
        cloudflareVideoUid: uid,
        playbackUrl,
        quality: input.quality || 'Auto',
        provider,
      }
    }

    if (provider === 'mux') {
      const file = input.file
      if (!file) {
        if (input.sourceUrl) return { playbackUrl: input.sourceUrl, quality: input.quality || 'Auto', provider }
        throw new Error('A file is required for the Mux upload provider.')
      }
      const tokenId = process.env.MUX_TOKEN_ID
      const secret = process.env.MUX_TOKEN_SECRET
      if (!tokenId || !secret) throw new Error('MUX_TOKEN_ID and MUX_TOKEN_SECRET are required for Mux uploads.')
      const auth = Buffer.from(`${tokenId}:${secret}`).toString('base64')
      const createUpload = await fetch('https://api.mux.com/video/v1/uploads', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: { playback_policy: ['public'], new_asset_settings: { playback_policy: ['public'] } } }),
      })
      const createPayload = await createUpload.json().catch(() => ({}))
      if (!createUpload.ok) {
        const message = createPayload?.errors?.[0]?.message || 'Mux upload initialization failed.'
        throw new Error(message)
      }
      const uploadUrl = createPayload?.data?.url
      const uploadId = createPayload?.data?.id
      if (!uploadUrl) throw new Error('Mux did not return an upload URL.')
      const directUpload = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      })
      if (!directUpload.ok) {
        const body = await directUpload.text().catch(() => '')
        throw new Error(body || 'Mux file upload failed.')
      }
      const playbackId = createPayload?.data?.playback_ids?.[0]?.id || uploadId
      return {
        muxPlaybackId: playbackId,
        playbackUrl: playbackId ? `https://stream.mux.com/${encodeURIComponent(playbackId)}.m3u8` : undefined,
        quality: input.quality || 'Auto',
        provider,
      }
    }
  }

  throw new Error(`Unsupported upload provider "${provider}".`)
}
