import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '../../../../lib/admin-auth'
import { uploadAnimeSource } from '../../../../lib/video-upload'

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 })

  const contentType = request.headers.get('content-type') || ''

  let payload: {
    title?: string
    episode?: number | string
    language?: string
    serverName?: string
    sourceUrl?: string
    provider?: string
    malId?: number | string
    quality?: string
    file?: File | null
  }

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    const file = form.get('file')
    payload = {
      title: String(form.get('title') || ''),
      episode: Number(form.get('episode') || '1'),
      language: String(form.get('language') || 'Japanese'),
      serverName: String(form.get('serverName') || 'My CDN'),
      sourceUrl: String(form.get('sourceUrl') || ''),
      provider: String(form.get('provider') || 'custom'),
      malId: Number(form.get('malId') || '0') || undefined,
      quality: String(form.get('quality') || 'Auto'),
      file: file instanceof File ? file : null,
    }
  } else {
    const body = await request.json().catch(() => null)
    payload = body || {}
  }

  const title = payload.title?.trim()
  const episode = Number(payload.episode || 1)
  const language = payload.language?.trim() || 'Japanese'
  const serverName = payload.serverName?.trim() || 'My CDN'
  const provider = payload.provider?.trim() || 'custom'
  const sourceUrl = payload.sourceUrl?.trim() || ''
  const file = payload.file || null

  if (!title || !Number.isInteger(episode) || episode < 1) {
    return NextResponse.json({ error: 'title and valid episode are required' }, { status: 400 })
  }

  if (!file && !sourceUrl) {
    return NextResponse.json({ error: 'Either a file or sourceUrl is required.' }, { status: 400 })
  }

  try {
    const upload = await uploadAnimeSource({
      title,
      episode,
      language,
      serverName,
      sourceUrl,
      file,
      provider,
      quality: payload.quality || 'Auto',
      malId: payload.malId,
    })

    return NextResponse.json({
      ok: true,
      message: 'Source uploaded and validated successfully.',
      source: {
        title,
        episode,
        language,
        serverName,
        provider,
        playbackUrl: upload.playbackUrl,
        quality: upload.quality,
        muxPlaybackId: upload.muxPlaybackId,
        cloudflareVideoUid: upload.cloudflareVideoUid,
      },
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to upload source.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
