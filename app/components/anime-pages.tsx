 'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronDown, Globe2, Menu, Search, Sparkles, Star, UserRound, X } from 'lucide-react'

export type Anime = {
  mal_id: number
  title: string
  title_english?: string | null
  title_japanese?: string | null
  synopsis?: string | null
  images?: {
    webp?: { large_image_url?: string; image_url?: string }
    jpg?: { large_image_url?: string; image_url?: string }
  }
  score?: number | null
  episodes?: number | null
  type?: string | null
  status?: string | null
  year?: number | null
  aired?: { from?: string | null }
  genres?: { mal_id?: number; name: string }[]
}

export function getPoster(anime: Anime) {
  return anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.webp?.image_url ||
    anime.images?.jpg?.image_url || ''
}

function Poster({ anime }: { anime: Anime }) {
  const primary = getPoster(anime)
  const [src, setSrc] = useState(primary)
  useEffect(() => setSrc(primary), [primary])
  const year = anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null)

  return (
    <Link href={`/anime/${anime.mal_id}`} className="group block min-w-0">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#14141d] shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:border-violet-400/60 group-hover:shadow-violet-950/30">
        {src ? (
          <Image
            src={src}
            alt={anime.title || 'Anime poster'}
            width={360}
            height={540}
            loading="lazy"
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 180px"
            onError={() => setSrc('')}
            className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : <div className="aspect-[2/3] bg-[#171720]" />}
        {anime.type && (
          <span className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[9px] font-bold text-white backdrop-blur">
            {anime.type}
          </span>
        )}
        {anime.score != null && (
          <span className="absolute right-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[10px] text-amber-300 backdrop-blur">
            ★ {anime.score.toFixed(1)}
          </span>
        )}
      </div>
      <h3 className="mt-2 truncate text-sm font-bold group-hover:text-violet-300">{anime.title}</h3>
      <p className="mt-1 truncate text-[11px] text-slate-500">
        {year || '—'} · {anime.episodes ?? '?'} eps · {anime.status || 'Unknown'}
      </p>
    </Link>
  )
}

export function PosterGrid({ items }: { items: Anime[] }) {
  return <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">{items.map((anime) => <Poster key={anime.mal_id} anime={anime} />)}</div>
}

export function Shell({ children, title = 'ANIWACTH' }: { children: React.ReactNode; title?: string }) {
  const [open, setOpen] = useState(false)
  const [dubOpen, setDubOpen] = useState(false)
  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08080d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] w-[94%] max-w-[1400px] items-center gap-5">
          <Link href="/" className="flex shrink-0 items-center text-lg font-black tracking-tight">
            <span className="text-white">ANI</span><span className="text-violet-400">WACTH</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-400 lg:flex">
            <Link className="transition hover:text-white" href="/">Home</Link>
            <Link className="transition hover:text-white" href="/anime">Anime</Link>
            <Link className="transition hover:text-white" href="/movies">Movies</Link>
            <Link className="transition hover:text-white" href="/tv-series">TV Series</Link>
            <Link className="transition hover:text-white" href="/schedule">Schedule</Link>
            <div className="relative">
              <button type="button" onClick={() => setDubOpen(v => !v)} className="inline-flex items-center gap-1 transition hover:text-white">Dub <ChevronDown size={14} className={dubOpen ? 'rotate-180 transition' : 'transition'} /></button>
              {dubOpen && <div className="absolute left-0 top-8 z-50 w-44 rounded-xl border border-white/10 bg-[#101017] p-2 shadow-2xl">
                {[['hindi','Hindi'],['english','English'],['japanese','Japanese'],['bengali','Bengali'],['tamil','Tamil'],['telugu','Telugu'],['malayalam','Malayalam'],['other','Other']].map(([id,label]) => <Link key={id} onClick={() => setDubOpen(false)} href={`/dub?lang=${id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-violet-600/15 hover:text-white"><Globe2 size={13} className="text-violet-300" />{label} Dub</Link>)}
              </div>}
            </div>
            <Link className="transition hover:text-white" href="/genres">Genres</Link>
            <Link className="transition hover:text-white" href="/watchlist">Favorites</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link aria-label="Search anime" href="/search" className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"><Search size={18} /></Link>
            <Link href="/profile" className="hidden h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-xs font-bold transition hover:bg-violet-500 sm:flex"><UserRound size={15} /> Profile</Link>
            <button type="button" aria-label="Open navigation" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 lg:hidden"><Menu size={19} /></button>
          </div>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/70 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="ml-auto h-full w-[82%] max-w-sm border-l border-white/10 bg-[#0d0d15] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><b className="text-lg">ANI<span className="text-violet-400">WACTH</span></b><button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10"><X size={20}/></button></div>
            <nav className="mt-8 grid gap-2">
              {['Home','Anime','Movies','TV Series','Schedule','Dub','Genres','Favorites','Watch History','Profile'].map((label) => {
                const href = label === 'Home' ? '/' : label === 'Anime' ? '/anime' : label === 'TV Series' ? '/tv-series' : label === 'Dub' ? '/dub?lang=hindi' : label === 'Favorites' ? '/watchlist' : label === 'Watch History' ? '/history' : `/${label.toLowerCase().replaceAll(' ','-')}`
                return <Link key={label} onClick={() => setOpen(false)} href={href} className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white">{label}</Link>
              })}
            </nav>
          </aside>
        </div>
      )}
      <main className="mx-auto w-[94%] max-w-[1400px] py-8 sm:py-10">
        <h1 className="sr-only">{title}</h1>
        {children}
      </main>
      <footer className="border-t border-white/10 bg-[#050508] py-10">
        <div className="mx-auto flex w-[94%] max-w-[1400px] flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div><b className="text-white">ANI<span className="text-violet-400">WACTH</span></b><p className="mt-2">WATCH ANIME WITHOUT LIMITS</p></div>
          <div className="flex gap-5"><Link href="/genres">Genres</Link><Link href="/schedule">Schedule</Link><Link href="/history">History</Link><Link href="/profile">Profile</Link></div>
          <p>© 2026 ANIWACTH</p>
        </div>
      </footer>
    </div>
  )
}

const categoryMap: Record<string, string> = {
  Movies: 'movies',
  'TV Series': 'tv',
  'OVA / ONA': 'ova',
  'Anime Schedule': 'schedule',
  Genres: 'trending',
  Watchlist: 'trending',
  'Watch History': 'trending',
  Anime: 'trending',
}

export function CatalogPage({ title }: { title: string }) {
  const [items, setItems] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')?.trim() || ''
    const category = params.get('category')?.trim() || ''
    const genre = params.get('genre')?.trim() || ''
    setQuery(q)
    setLoading(true); setError('')
    const endpoint = q
      ? `/api/anime?q=${encodeURIComponent(q)}&page=${page}`
      : genre
        ? `/api/anime?genre=${encodeURIComponent(genre)}&page=${page}`
        : `/api/anime?category=${encodeURIComponent(category || categoryMap[title] || 'trending')}&page=${page}`
    fetch(endpoint).then(async (r) => {
      if (!r.ok) throw new Error('request failed')
      return r.json()
    }).then((payload) => setItems(Array.isArray(payload.data) ? payload.data : []))
      .catch(() => { setItems([]); setError('Unable to load anime right now. Please try again.') })
      .finally(() => setLoading(false))
  }, [title, page])

  return (
    <Shell title={title}>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-violet-300">EXPLORE</p><h2 className="text-3xl font-black sm:text-4xl">{query ? `Search: ${query}` : title}</h2></div>
        <Link href="/search" className="text-xs text-slate-400 hover:text-violet-300">Search anime →</Link>
      </div>
      {loading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{Array.from({length:12},(_,i)=><div key={i}><div className="skeleton aspect-[2/3] rounded-xl"/><div className="skeleton mt-2 h-4 rounded"/></div>)}</div>
      : error ? <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center text-sm text-red-200">{error}</div>
      : items.length ? <PosterGrid items={items} /> : <div className="rounded-2xl border border-white/10 bg-white/[.03] p-10 text-center text-sm text-slate-500">No anime found.</div>}
      {items.length > 0 && (
        <div className="mt-8 flex justify-center gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-lg border border-white/10 px-4 py-2 text-xs disabled:opacity-30">Previous</button>
          <span className="grid min-w-10 place-items-center rounded-lg bg-violet-600/15 px-3 text-xs text-violet-200">{page}</span>
          <button onClick={()=>setPage(p=>p+1)} className="rounded-lg border border-white/10 px-4 py-2 text-xs hover:bg-white/5">Next</button>
        </div>
      )}
    </Shell>
  )
}

export function AuthPage({ register = false }: { register?: boolean }) {
  return <main className="grid min-h-screen place-items-center bg-[#08080d] px-4 text-white">
    <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14141d] p-7 shadow-2xl">
      <Link href="/" className="font-black">ANI<span className="text-violet-400">WACTH</span></Link>
      <h1 className="mt-8 text-2xl font-black">{register ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-2 text-sm text-slate-500">{register ? 'Create an account for your personal library.' : 'Sign in to manage your anime library.'}</p>
      <div className="mt-6 grid gap-3">{(register ? ['Username','Email','Password','Confirm Password'] : ['Email or Username','Password']).map(label=><input key={label} type={label.toLowerCase().includes('password')?'password':'text'} placeholder={label} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400/60"/>)}</div>
      <button className="mt-5 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold hover:bg-violet-500">{register?'Register':'Login'}</button>
      <Link href="/" className="mt-5 block text-center text-xs text-slate-500 hover:text-white">Back to home</Link>
    </section>
  </main>
}

export function WatchlistPage({ history = false }: { history?: boolean }) {
  return <Shell title={history ? 'Watch History' : 'Watchlist'}><div className="rounded-2xl border border-white/10 bg-white/[.03] p-10 text-center"><h2 className="text-2xl font-black">{history ? 'Watch History' : 'Your Watchlist'}</h2><p className="mt-2 text-sm text-slate-500">Connect your existing authentication/database to persist {history ? 'watch progress' : 'favorites'}.</p></div></Shell>
}
export function ProfilePage() { return <Shell title="Profile"><div className="rounded-2xl border border-white/10 bg-white/[.03] p-8"><h2 className="text-3xl font-black">Profile</h2><p className="mt-2 text-sm text-slate-500">Authentication is not connected in the current project.</p></div></Shell> }
export function AdminPage() { return <Shell title="Admin Panel"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-violet-300">CONTROL CENTER</p><h2 className="mt-1 text-3xl font-black">Admin Panel</h2><p className="mt-2 text-sm text-slate-500">Configure only media sources you own or are authorized to distribute.</p></div></Shell> }
