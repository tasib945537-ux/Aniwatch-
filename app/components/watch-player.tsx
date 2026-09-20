 'use client'

import Link from 'next/link'
import Hls from 'hls.js'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Play, Settings2, Mic, Captions, Globe2, Server } from 'lucide-react'

type WatchSource = {
  language: string
  serverName: string
  playbackUrl: string
  quality?: string
  subtitleUrl?: string
  introStart?: number
  introEnd?: number
}
type WatchPayload = {
  anime?: { mal_id: number; title: string; episodes?: number | null }
  episode?: { episode: number; title: string; duration?: number | null }
  sources?: WatchSource[]
  configured?: boolean
}

export default function WatchPlayer({ malId }: { malId: string }) {
  const playerRef = useRef<HTMLVideoElement>(null)
  const [episode, setEpisode] = useState(1)
  const [data, setData] = useState<WatchPayload | null>(null)
  const [sourceIndex, setSourceIndex] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [autoNext, setAutoNext] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ep = Number(params.get('ep') || '1')
    if (Number.isInteger(ep) && ep > 0) setEpisode(ep)
  }, [])

  useEffect(() => {
    if (!/^\d+$/.test(malId)) return
    setLoading(true); setError('')
    fetch(`/api/watch/${malId}?ep=${episode}`)
      .then(async r => { const p = await r.json(); if (!r.ok) throw new Error(p.error || 'Unable to load watch data.'); return p })
      .then(p => { setData(p); setSourceIndex(0) })
      .catch(e => { setData(null); setError(e instanceof Error ? e.message : 'Unable to load watch data.') })
      .finally(() => setLoading(false))
  }, [malId, episode])

  const sources = data?.sources || []
  const source = sources[sourceIndex]
  const count = Math.max(1, Math.min(data?.anime?.episodes || 1, 100))

  const languageGroup = (language: string) => {
    const value = language.toLowerCase()
    if (value.includes('english') || value.includes('hindi') || value.includes('dub')) return 'dub'
    if (value.includes('japanese') || value.includes('jap') || value.includes('sub')) return 'sub'
    return 'regional'
  }

  const groupedSources = {
    dub: sources.filter(item => languageGroup(item.language) === 'dub'),
    sub: sources.filter(item => languageGroup(item.language) === 'sub'),
    regional: sources.filter(item => languageGroup(item.language) === 'regional'),
  }

  const selectSource = (item: WatchSource) => {
    const index = sources.indexOf(item)
    if (index >= 0) setSourceIndex(index)
  }

  useEffect(() => {
    if (!source?.playbackUrl || !playerRef.current) return
    const video = playerRef.current
    let hls: Hls | null = null
    const isHls = /\.m3u8(?:$|[?#])/i.test(source.playbackUrl)
    if (isHls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false })
      hls.loadSource(source.playbackUrl)
      hls.attachMedia(video)
    } else {
      // Safari/iOS can play HLS natively; MP4 also works through the native element.
      video.src = source.playbackUrl
      video.load()
    }
    return () => {
      hls?.destroy()
      video.removeAttribute('src')
      video.load()
    }
  }, [source])

  const changeEpisode = (value: number) => {
    const next = Math.max(1, Math.min(count, value))
    setEpisode(next)
    window.history.replaceState(null, '', `/watch/${malId}?ep=${next}`)
  }

  const fullscreen = () => { if (playerRef.current && document.fullscreenEnabled) void playerRef.current.requestFullscreen() }

  return <main className="min-h-screen bg-[#08080d] text-white">
    <header className="border-b border-white/10 bg-[#08080d]/90 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-8"><Link href={`/anime/${malId}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft size={17}/> Back to details</Link><b className="text-sm">ANI<span className="text-violet-400">WACTH</span></b></div></header>
    <div className="mx-auto max-w-[1400px] px-3 py-5 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section>
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_60px_rgba(139,92,246,.12)]">
            {source ? <video ref={playerRef} controls playsInline className="h-full w-full bg-black" onEnded={() => autoNext && episode < count && changeEpisode(episode + 1)} onError={() => setError('Unable to play this configured source.')} /> :
              <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,.18),transparent_35%),#050508] p-6 text-center">{loading ? <div><div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-violet-400"/><p className="mt-4 text-sm text-slate-400">Loading episode…</p></div> : <div><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/5 text-slate-500"><Play size={24}/></div><h2 className="mt-4 text-lg font-bold">No playable source configured</h2><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">Jikan provides anime metadata and episode information, not licensed video streams. Add an authorized Mux, Cloudflare Stream, or owned CDN source on the server.</p></div>}</div>}
            {source && <button type="button" onClick={fullscreen} aria-label="Fullscreen" className="absolute bottom-14 right-3 rounded-lg bg-black/70 p-2 text-white"><Maximize size={16}/></button>}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-xl font-black">{data?.anime?.title || 'Loading anime…'}</h1><p className="mt-1 text-xs text-slate-500">Episode {episode}{data?.episode?.title ? ` · ${data.episode.title}` : ''}</p></div>
            <div className="flex gap-2"><button disabled={episode<=1} onClick={()=>changeEpisode(episode-1)} className="rounded-lg border border-white/10 p-2 disabled:opacity-30"><ChevronLeft size={18}/></button><button disabled={episode>=count} onClick={()=>changeEpisode(episode+1)} className="rounded-lg border border-white/10 p-2 disabled:opacity-30"><ChevronRight size={18}/></button><button onClick={()=>setSettingsOpen(true)} className="rounded-lg border border-white/10 p-2"><Settings2 size={18}/></button></div>
          </div>

          {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-200">{error}</p>}

          {sources.length > 0 && <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#101017] shadow-[0_0_40px_rgba(139,92,246,.08)]">
            <div className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-indigo-700 px-5 py-5">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/80">Now Playing</p>
              <h2 className="mt-1 text-2xl font-black">Episode {episode}</h2>
              <p className="mt-1 text-xs text-white/75">If the current source buffers, select a different configured server.</p>
            </div>
            <div className="p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {[['dub','English / Dub',Mic,groupedSources.dub],['sub','Japanese / Sub',Captions,groupedSources.sub],['regional','Regional / Multi',Globe2,groupedSources.regional]].map(([key,label,Icon,items]) => items.length ? <div key={String(key)} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-300"><Icon size={15}/>{String(label)}</div>
                  <div className="grid gap-2">{(items as WatchSource[]).map(item => { const active = item === source; return <button key={`${item.serverName}-${item.language}`} type="button" onClick={()=>selectSource(item)} className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left text-xs font-bold transition ${active?'border-violet-400/70 bg-violet-600 text-white shadow-[0_0_22px_rgba(139,92,246,.28)]':'border-white/10 bg-white/[.03] text-slate-300 hover:border-violet-400/30 hover:bg-violet-500/10'}`}><span className="flex items-center gap-2"><Server size={14}/>{item.serverName}</span><span className="text-[10px] opacity-70">{item.quality || 'HD'}</span></button> })}</div>
                </div> : null)}
              </div>
            </div>
          </div>}

          {settingsOpen && <div className="mt-4 rounded-xl border border-white/10 bg-[#101017] p-4"><label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={autoNext} onChange={e=>setAutoNext(e.target.checked)}/> Auto play next configured episode</label><p className="mt-3 text-[11px] text-slate-500">Audio, subtitle and quality choices appear only when the selected source actually provides them.</p></div>}
        </section>

        <aside className="rounded-2xl border border-white/10 bg-[#101017] p-4"><h2 className="mb-4 font-bold">Episodes</h2><div className="grid max-h-[540px] gap-2 overflow-y-auto">{Array.from({length:count},(_,i)=>i+1).map(item=><button key={item} onClick={()=>changeEpisode(item)} className={`rounded-lg border px-3 py-3 text-left text-sm ${episode===item?'border-violet-400/60 bg-violet-600/15 text-white':'border-white/10 bg-black/20 text-slate-400 hover:bg-white/5'}`}>Episode {item}</button>)}</div></aside>
      </div>
    </div>
  </main>
}
