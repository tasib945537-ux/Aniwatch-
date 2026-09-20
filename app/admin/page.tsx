'use client'
import { useState } from 'react'
import { AdminPage } from '../components/anime-pages'

export default function AdminRoute() {
  const [notice, setNotice] = useState('')
  const [animeTitle, setAnimeTitle] = useState('')
  const [episode, setEpisode] = useState('1')
  const [sourceUrl, setSourceUrl] = useState('')
  const [language, setLanguage] = useState('Japanese')
  const [server, setServer] = useState('MyStream')

  async function save(event: React.FormEvent) {
    event.preventDefault(); setNotice('')
    try {
      const response = await fetch('/api/admin/episodes', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ title: animeTitle, episode: Number(episode), sourceUrl, language, server }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to save source.')
      setNotice('Source validated. This build currently validates the source; connect your database/persistence before expecting it to remain after a redeploy.')
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Unable to save source.') }
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    window.location.href = '/login'
  }

  return <div><AdminPage/><section className="mx-auto -mt-2 w-[94%] max-w-[1400px] pb-24"><div className="rounded-2xl border border-white/10 bg-[#14141d] p-5 sm:p-7"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black">Authorized episode source</h2><p className="mt-1 text-xs leading-5 text-slate-500">Only add video you own or are licensed to distribute. Jikan does not provide video streams.</p></div><button onClick={logout} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold">Logout</button></div><form onSubmit={save} className="mt-6 grid gap-3 sm:grid-cols-2"><input required value={animeTitle} onChange={e=>setAnimeTitle(e.target.value)} placeholder="Anime title" className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-violet-400/60"/><input required min="1" type="number" value={episode} onChange={e=>setEpisode(e.target.value)} placeholder="Episode" className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-violet-400/60"/><select value={language} onChange={e=>setLanguage(e.target.value)} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm"><option>Japanese</option><option>English</option><option>Hindi</option><option>Bangla</option></select><input required value={server} onChange={e=>setServer(e.target.value)} placeholder="Server name" className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-violet-400/60"/><input required type="url" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="Authorized HTTPS HLS/MP4 URL" className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-violet-400/60 sm:col-span-2"/><button className="rounded-xl bg-violet-600 p-3 text-sm font-bold hover:bg-violet-500 sm:col-span-2">Validate source</button></form>{notice&&<p className="mt-4 rounded-xl border border-violet-400/20 bg-violet-400/5 p-3 text-xs text-violet-200">{notice}</p>}</div></section></div>
}
