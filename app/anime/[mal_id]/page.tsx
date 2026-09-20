import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Play, Star } from 'lucide-react'
import { Shell, type Anime, getPoster, PosterGrid } from '../../components/anime-pages'

type Detail = Anime & {
  background?: string | null
  rank?: number | null
  popularity?: number | null
  duration?: string | null
  season?: string | null
  source?: string | null
  trailer?: { embed_url?: string | null; youtube_id?: string | null }
  studios?: { name: string }[]
  producers?: { name: string }[]
  genres?: { name: string }[]
  themes?: { name: string }[]
  demographics?: { name: string }[]
  characters?: { character: { name: string; images?: { jpg?: { image_url?: string } } } }[]
  recommendations?: { entry: Anime }[]
}

async function getAnime(id: string): Promise<Detail | null> {
  if (!/^\d+$/.test(id)) return null
  try {
    const base = process.env.JIKAN_API_URL || 'https://api.jikan.moe/v4'
    const response = await fetch(`${base}/anime/${id}/full?sfw=true`, { next: { revalidate: 900 } })
    if (!response.ok) return null
    const payload = await response.json() as { data?: Detail }
    return payload.data || null
  } catch { return null }
}

export default async function AnimeDetailsPage({ params }: { params: Promise<{ mal_id: string }> }) {
  const { mal_id } = await params
  const anime = await getAnime(mal_id)

  if (!anime) return <Shell title="Anime Details"><div className="rounded-2xl border border-white/10 bg-white/[.03] p-10 text-center"><Link href="/" className="text-sm text-violet-300">← Back home</Link><p className="mt-5 text-slate-500">Anime metadata is unavailable right now.</p></div></Shell>

  const trailer = anime.trailer?.embed_url || (anime.trailer?.youtube_id ? `https://www.youtube.com/embed/${encodeURIComponent(anime.trailer.youtube_id)}` : '')
  const recommendations = anime.recommendations?.map(r => r.entry).filter(a => a?.mal_id).slice(0, 12) || []
  const poster = getPoster(anime)

  return <Shell title={anime.title}>
    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back home</Link>

    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#101017]">
      {anime.background && <Image src={anime.background} alt="" fill sizes="100vw" className="object-cover opacity-15"/>}
      <div className="absolute inset-0 bg-gradient-to-r from-[#101017] via-[#101017]/95 to-[#101017]/70"/>
      <div className="relative grid gap-7 p-5 sm:p-8 md:grid-cols-[230px_1fr]">
        <div className="relative mx-auto aspect-[2/3] w-52 md:mx-0 md:w-full">
          {poster ? <Image src={poster} alt={anime.title} fill sizes="(max-width:768px) 208px,230px" className="rounded-xl object-cover shadow-2xl"/> : <div className="h-full rounded-xl bg-[#171720]"/>}
        </div>
        <div className="self-end">
          <div className="flex flex-wrap gap-2 text-[10px] font-bold"><span className="rounded bg-violet-600 px-2 py-1">{anime.type || 'Anime'}</span><span className="rounded bg-white/10 px-2 py-1">{anime.year || '—'}</span><span className="rounded bg-white/10 px-2 py-1">{anime.status || 'Unknown'}</span></div>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{anime.title_english || anime.title}</h1>
          {anime.title_japanese && <p className="mt-2 text-sm text-slate-500">{anime.title_japanese}</p>}
          <div className="mt-4 flex flex-wrap gap-4 text-xs"><span className="text-amber-300"><Star size={14} fill="currentColor" className="mr-1 inline"/> {anime.score?.toFixed(1) || 'N/A'} MAL</span><span className="text-slate-400">Rank {anime.rank ? `#${anime.rank}` : '—'}</span><span className="text-slate-400">Popularity {anime.popularity ? `#${anime.popularity}` : '—'}</span></div>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">{anime.synopsis || 'No synopsis is available.'}</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href={`/watch/${anime.mal_id}?ep=1`} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-xs font-bold hover:bg-violet-500"><Play size={15} fill="white"/> Watch Now</Link><Link href={`/search?genre=${encodeURIComponent(anime.genres?.[0]?.name || 'Action')}`} className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold hover:bg-white/10">More like this</Link></div>
        </div>
      </div>
      <div className="relative grid gap-4 border-t border-white/10 p-5 text-xs text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
        <span>Episodes: {anime.episodes ?? 'Unknown'}</span><span>Duration: {anime.duration || 'Unknown'}</span><span>Season: {anime.season || 'Unknown'}</span><span>Source: {anime.source || 'Unknown'}</span>
        <span>Studios: {anime.studios?.map(s=>s.name).join(', ') || 'Unknown'}</span><span>Producers: {anime.producers?.map(s=>s.name).join(', ') || 'Unknown'}</span><span>Genres: {anime.genres?.map(s=>s.name).join(', ') || 'Unknown'}</span><span>Themes: {anime.themes?.map(s=>s.name).join(', ') || 'Unknown'}</span>
      </div>
    </section>

    {trailer && <section className="mt-10"><h2 className="mb-4 text-2xl font-black">Trailer</h2><div className="aspect-video overflow-hidden rounded-2xl border border-white/10"><iframe title={`${anime.title} trailer`} src={trailer} className="h-full w-full" loading="lazy" allowFullScreen/></div></section>}

    <section className="mt-10"><h2 className="mb-4 text-2xl font-black">Characters</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{anime.characters?.slice(0,12).map(item=><div key={item.character.name} className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm text-slate-300">{item.character.name}</div>)}</div></section>

    <section className="mt-10 pb-6"><h2 className="mb-5 text-2xl font-black">Recommendations</h2>{recommendations.length ? <PosterGrid items={recommendations}/> : <p className="text-sm text-slate-500">No recommendations available.</p>}</section>
  </Shell>
}
