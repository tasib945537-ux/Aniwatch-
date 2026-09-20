'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthPage } from '../components/anime-pages'

function AdminLogin() {
  const params = useSearchParams()
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isAdmin = params.get('admin') === 'required' || params.get('admin') === 'not-configured'
  if (!isAdmin) return <AuthPage />

  async function login() {
    setLoading(true); setError('')
    const res = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({token}) })
    const data = await res.json().catch(()=>({}))
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Admin login failed.'); return }
    window.location.href = '/admin'
  }

  return <main className="grid min-h-screen place-items-center bg-[#08080d] px-4 text-white"><section className="w-full max-w-md rounded-2xl border border-violet-400/20 bg-[#14141d] p-7 shadow-2xl"><a href="/" className="font-black">ANI<span className="text-violet-400">WACTH</span></a><h1 className="mt-8 text-2xl font-black">Admin Access</h1><p className="mt-2 text-sm text-slate-500">Enter the ADMIN_ACCESS_TOKEN configured in Vercel Environment Variables.</p><input autoFocus value={token} onChange={e=>setToken(e.target.value)} type="password" placeholder="Admin access token" className="mt-6 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400/60"/><button disabled={loading||!token} onClick={login} className="mt-4 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold disabled:opacity-50">{loading?'Checking…':'Enter Admin Panel'}</button>{error&&<p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-200">{error}</p>}<a href="/" className="mt-5 block text-center text-xs text-slate-500 hover:text-white">Back to home</a></section></main>
}

export default function LoginPage() { return <Suspense fallback={null}><AdminLogin /></Suspense> }
