'use client'
import { useState } from 'react'
import { AdminPage } from '../components/anime-pages'

export default function AdminRoute() {
  const [notice, setNotice] = useState('')
  const [animeTitle, setAnimeTitle] = useState('')
  const [animeId, setAnimeId] = useState('')
  const [episode, setEpisode] = useState('1')
  const [sourceUrl, setSourceUrl] = useState('')
  const [language, setLanguage] = useState('Japanese')
  const [provider, setProvider] = useState('custom')
  const [server, setServer] = useState('My CDN')
  const [file, setFile] = useState<File | null>(null)

  async function save(event: React.FormEvent) {
    event.preventDefault(); setNotice('')

    try {
      const formData = new FormData()
      formData.append('title', animeTitle)
      formData.append('episode', String(Number(episode) || 1))
      formData.append('language', language)
      formData.append('serverName', server)
      formData.append('provider', provider)
      formData.append('malId', animeId || '')
      formData.append('sourceUrl', sourceUrl)
      if (file) formData.append('file', file)

      const response = await fetch('/api/admin/episodes', {
        method: 'POST',
        body: formData,
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to save source.')
      setNotice('Source uploaded successfully and is ready to use. Add your storage credentials in .env.local before publishing live.')
      setSourceUrl('')
      setFile(null)
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Unable to save source.')
    }
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    window.location.href = '/login'
  }

  return <div><AdminPage/><section className="mx-auto -mt-2 w-[94%] max-w-[1400px] pb-24"><div className="rounded-2xl border border-white/10 bg-[#14141d] p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-violet-300">AUTO UPLOAD</p><h2 className="mt-1 text-2xl font-black">Anime source uploader</h2></div><button type="button" onClick={logout} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold hover:bg-white/5">Logout</button></div><form onSubmit={save} className="mt-6 grid gap-4 md:grid-cols-2"><div className="grid gap-2"><label className="text-xs uppercase tracking-[.14em] text-slate-500">Anime title</label><input value={animeTitle} onChange={e => setAnimeTitle(e.target.value)} placeholder="Solo Leveling" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400/60" /></div><div className="grid gap-2"><label className="text-xs uppercase tracking-[.14em] text-slate-500">MAL ID</label><input value={animeId} onChange={e => setAnimeId(e.target.value)} placeholder="16498" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400/60" /></div><div className="grid gap-2"><label className="text-xs uppercase tracking-[.14em] text-slate-500">Episode</label><input value={episode} onChange={e => setEpisode(e.target.value)} placeholder="1" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400/60" /></div><div className="grid gap-2"><label className="text-xs uppercase tracking-[.14em] text-slate-500">Language</label><select value={language} onChange={e => setLanguage(e.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400/60"><option>Japanese</option><option>English</option><option>Hindi</option><option>Bengali</option><option>Tamil</option><option>Telugu</option><option>Malayalam</option></select></div><div className="grid gap-2"><label className="text-xs uppercase tracking-[.14em] text-slate-500">Provider</label><select value={provider} onChange={e => setProvider(e.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400/60"><option value="custom">Custom URL</option><option value="supabase">Supabase Storage</option><option value="cloudflare">Cloudflare Stream</option><option value="mux">Mux</option></select></div><div className="grid gap-2"><label className="text-xs uppercase tracking-[.14em] text-slate-500">Server name</label><input value={server} onChange={e => setServer(e.target.value)} placeholder="My CDN" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400/60" /></div><div className="md:col-span-2 grid gap-2"><label className="text-xs uppercase tracking-[.14em] text-slate-500">Source URL (optional if uploading a file)</label><input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://cdn.example.com/episode-1/master.m3u8" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400/60" /></div><div className="md:col-span-2 grid gap-2"><label className="text-xs uppercase tracking-[.14em] text-slate-500">Video file (optional)</label><input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} className="rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" /></div><div className="md:col-span-2 flex justify-end"><button type="submit" className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold hover:bg-violet-500">Save source</button></div></form>{notice && <p className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm text-violet-200">{notice}</p>}</div></section></div>
}
