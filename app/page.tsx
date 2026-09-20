 'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bookmark, ChevronRight, Play, Search, Star } from 'lucide-react'
import type { Anime } from './components/anime-pages'
import { getPoster, Shell } from './components/anime-pages'

const rows = [
  ['trending', 'TRENDING NOW', 'Trending Anime'],
  ['airing', 'NEW EPISODES', 'Top Airing'],
  ['rated', 'TOP RATED', 'Top Rated'],
  ['season', 'THIS SEASON', 'Current Season'],
  ['action', 'EXPLOSIVE STORIES', 'Action Anime'],
  ['romance', 'HEARTFELT STORIES', 'Romance Anime'],
  ['comedy', 'LIGHT & FUN', 'Comedy Anime'],
  ['fantasy', 'WORLDS BEYOND', 'Fantasy Anime'],
  ['movies', 'FEATURED', 'Anime Movies'],
] as const

function Card({ anime }: { anime: Anime }) {
  const poster = getPoster(anime)
  return <Link href={`/anime/${anime.mal_id}`} className="group block min-w-[150px] sm:min-w-[190px]">
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#14141d]">
      {poster ? <Image src={poster} alt={anime.title} width={380} height={570} sizes="190px" className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="aspect-[2/3] bg-[#171720]"/>}
      {anime.score != null && <span className="absolute right-2 top-2 rounded bg-black/75 px-2 py-1 text-[10px] text-amber-300">★ {anime.score.toFixed(1)}</span>}
      <span className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-1 text-[9px]">{anime.type || 'Anime'}</span>
      <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition group-hover:opacity-100"><span className="grid h-12 w-12 place-items-center rounded-full bg-violet-600 shadow-xl"><Play size={19} fill="white"/></span></span>
    </div>
    <h3 className="mt-2 truncate text-sm font-bold group-hover:text-violet-300">{anime.title}</h3>
    <p className="mt-1 text-[11px] text-slate-500">{anime.year || '—'} · {anime.episodes ?? '?'} eps</p>
  </Link>
}

export default function Home() {
  const [data, setData] = useState<Record<string, Anime[]>>({})
  const [heroIndex, setHeroIndex] = useState(0)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/anime').then(async r => { if (!r.ok) throw new Error(); return r.json() })
      .then(payload => setData(payload)).catch(() => setError('Unable to load Jikan data right now. Please try again shortly.')).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!data.trending?.length) return
    const timer = window.setInterval(() => setHeroIndex(v => (v + 1) % data.trending.length), 6500)
    return () => window.clearInterval(timer)
  }, [data.trending])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!query.trim()) { setSearchResults([]); return }
      fetch(`/api/anime?q=${encodeURIComponent(query)}`).then(r => r.ok ? r.json() : null)
        .then(p => setSearchResults(Array.isArray(p?.data) ? p.data : [])).catch(() => setSearchResults([]))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [query])

  const hero = data.trending?.[heroIndex]
  const heroPoster = hero ? getPoster(hero) : ''

  return <Shell title="ANIWACTH">
    <section className="-mx-[3.2%] relative -mt-10 min-h-[650px] overflow-hidden sm:-mt-10">
      {heroPoster && <Image src={heroPoster} alt="" fill priority sizes="100vw" className="object-cover opacity-35"/>}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#08080d_0%,rgba(8,8,13,.92)_30%,rgba(8,8,13,.55)_65%,rgba(8,8,13,.15)),linear-gradient(0deg,#08080d_0%,transparent_45%,rgba(8,8,13,.35))]"/>
      <div className="relative mx-auto flex min-h-[650px] w-[94%] max-w-[1400px] items-end pb-16 sm:pb-20">
        {hero ? <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-[10px] font-extrabold tracking-[.15em] text-amber-300"><i className="h-1.5 w-1.5 rounded-full bg-amber-300"/>FEATURED ANIME</span>
          <h1 className="mt-5 text-5xl font-black leading-[.95] tracking-[-.04em] sm:text-7xl">{hero.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-300"><span className="text-amber-300"><Star size={13} fill="currentColor" className="mr-1 inline"/> {hero.score?.toFixed(1) || 'N/A'}</span><span>{hero.year || '—'}</span><span>{hero.type || 'Anime'}</span><span>{hero.episodes ?? '?'} Episodes</span></div>
          <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-6 text-slate-300">{hero.synopsis || 'Discover anime details, ratings and release information from Jikan.'}</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href={`/watch/${hero.mal_id}?ep=1`} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-bold hover:bg-violet-500"><Play size={16} fill="white"/>Watch Now</Link><Link href={`/anime/${hero.mal_id}`} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold hover:bg-white/15"><Bookmark size={16}/>View Details</Link></div>
        </div> : <div className="skeleton h-60 w-full max-w-2xl rounded-2xl"/>}
      </div>
    </section>

    <div className="relative z-10 -mt-5">
      <div className="glass flex items-center gap-3 rounded-2xl p-3 shadow-2xl">
        <Search size={19} className="text-slate-500"/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search anime..." className="w-full bg-transparent py-2 text-sm outline-none"/>
      </div>
      {query && <div className="mt-4 rounded-2xl border border-white/10 bg-[#101017] p-4"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Search results</h2><Link href={`/search?q=${encodeURIComponent(query)}`} className="text-xs text-violet-300">View all →</Link></div>{searchResults.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">{searchResults.slice(0,12).map(a=><Card key={a.mal_id} anime={a}/>)}</div> : <p className="py-6 text-sm text-slate-500">{loading ? 'Searching…' : 'No results found.'}</p>}</div>}
    </div>

    {error && <div className="mt-8 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">{error}</div>}

    {!query && rows.map(([key,label,title]) => <section key={key} className="mt-14">
      <div className="mb-5 flex items-end justify-between"><div><p className="mb-1 text-[10px] font-extrabold tracking-[.18em] text-violet-300">{label}</p><h2 className="text-2xl font-black">{title}</h2></div><Link href={`/search?category=${key}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-300">View All <ChevronRight size={15}/></Link></div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-3">{loading ? Array.from({length:6},(_,i)=><div key={i} className="min-w-[150px] sm:min-w-[190px]"><div className="skeleton aspect-[2/3] rounded-xl"/><div className="skeleton mt-2 h-4 rounded"/></div>) : (data[key] || []).map(a=><Card key={a.mal_id} anime={a}/>)}</div>
    </section>)}

    <section className="mt-16 pb-8">
      <div className="mb-5"><p className="mb-1 text-[10px] font-extrabold tracking-[.18em] text-violet-300">EXPLORE</p><h2 className="text-2xl font-black">Browse Categories</h2></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{['Action','Romance','Comedy','Sci-Fi','Horror','Fantasy','Adventure','Drama'].map(g=><Link key={g} href={`/search?genre=${encodeURIComponent(g)}`} className="rounded-xl border border-white/10 bg-[#14141d] p-5 text-center text-sm font-bold text-slate-300 transition hover:-translate-y-1 hover:border-violet-400/40 hover:text-white">{g}</Link>)}</div>
    </section>
  </Shell>
}
