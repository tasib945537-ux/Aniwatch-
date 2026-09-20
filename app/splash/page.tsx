import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function SplashPage() {
  return <main className="grid min-h-screen place-items-center bg-[#08080d] text-center text-white"><div><span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-400 shadow-2xl shadow-violet-700/30"><Sparkles size={38}/></span><h1 className="mt-5 text-4xl font-black">ANI<span className="text-violet-400">WACTH</span></h1><p className="mt-2 text-sm text-slate-500">WATCH ANIME WITHOUT LIMITS</p><Link href="/" className="mt-8 inline-block rounded-full bg-violet-600 px-8 py-3 text-sm font-bold hover:bg-violet-500">Enter ANIWACTH</Link></div></main>
}
