'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronDown, Globe2, Play } from 'lucide-react'
import { Shell } from '../components/anime-pages'

type Item = {
  id: number
  idMal?: number | null
  title: { romaji?: string | null; english?: string | null; native?: string | null }
  coverImage?: { large?: string | null; extraLarge?: string | null }
  episodes?: number | null
  seasonYear?: number | null
  status?: string | null
}

const languages = [
  ['hindi','Hindi'], ['english','English'], ['japanese','Japanese'], ['bengali','Bengali'],
  ['tamil','Tamil'], ['telugu','Telugu'], ['malayalam','Malayalam'], ['other','Other'],
] as const

function titleOf(item: Item) { return item.title.english || item.title.romaji || item.title.native || 'Unknown Anime' }

export default function DubPage() {
  const [lang, setLang] = useState('hindi')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get('lang')?.toLowerCase() || 'hindi'
    setLang(languages.some(([id]) => id === current) ? current : 'hindi')
  }, [])

  useEffect(() => {
    setLoading(true); setMessage('')
    fetch(`/api/dub?lang=${encodeURIComponent(lang)}`)
      .then(async r => { const p = await r.json(); if (!r.ok) throw new Error(p.message || 'Failed'); return p })
      .then(p => { setItems(Array.isArray(p.data) ? p.data : []); setMessage(p.message || '') })
      .catch(e => { setItems([]); setMessage(e.message || 'Unable to load dubbed anime.') })
      .finally(() => setLoading(false))
  }, [lang])

  function changeLanguage(id: string) {
    setLang(id)
    window.history.replaceState(null, '', `/dub?lang=${encodeURIComponent(id)}`)
  }

  return <Shell title="Dub Anime">
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-violet-300">DUB & AUDIO</p><h2 className="text-3xl font-black sm:text-4xl">{languages.find(([id]) => id === lang)?.[1]} Dubbed Anime</h2><p className="mt-2 text-sm text-slate-500">Only anime with configured authorized video sources for this language are listed.</p></div>
      <div className="relative">
        <select value={lang} onChange={e => changeLanguage(e.target.value)} className="appearance-none rounded-xl border border-white/10 bg-[#14141d] py-3 pl-10 pr-10 text-sm font-bold outline-none focus:border-violet-400/60">
          {languages.map(([id,label]) => <option key={id} value={id}>{label} Dub</option>)}
        </select>
        <Globe2 size={16} className="pointer-events-none absolute left-3 top-3.5 text-violet-300" />
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-slate-400" />
      </div>
    </div>

    {loading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{Array.from({length:12},(_,i)=><div key={i}><div className="skeleton aspect-[2/3] rounded-xl"/><div className="skeleton mt-2 h-4 rounded"/></div>)}</div>
    : items.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">{items.map(item => {
      const malId = item.idMal
      const poster = item.coverImage?.extraLarge || item.coverImage?.large || ''
      return <Link key={item.id} href={malId ? `/anime/${malId}` : `/search?q=${encodeURIComponent(titleOf(item))}`} className="group block min-w-0">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#14141d]">
          {poster ? <Image src={poster} alt={titleOf(item)} width={360} height={540} className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="aspect-[2/3] bg-[#171720]"/>}
          <span className="absolute left-2 top-2 rounded-md bg-violet-600/90 px-2 py-1 text-[9px] font-black uppercase">{lang} DUB</span>
          <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition group-hover:opacity-100"><span className="grid h-12 w-12 place-items-center rounded-full bg-violet-600"><Play size={18} fill="white"/></span></span>
        </div>
        <h3 className="mt-2 truncate text-sm font-bold group-hover:text-violet-300">{titleOf(item)}</h3>
        <p className="mt-1 text-[11px] text-slate-500">{item.seasonYear || '—'} · {item.episodes ?? '?'} eps · {item.status || 'Unknown'}</p>
      </Link>
    })}</div>
    : <div className="rounded-2xl border border-white/10 bg-white/[.03] p-10 text-center"><h3 className="text-xl font-black">No {languages.find(([id]) => id === lang)?.[1]} dubbed anime configured</h3><p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">Add your own or licensed episode sources with this language in <code className="text-violet-300">AUTHORIZED_VIDEO_SOURCES_JSON</code>, then the anime will automatically appear here.</p>{message && <p className="mt-4 text-xs text-slate-600">{message}</p>}</div>}
  </Shell>
}
