import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ANIWACTH — Watch Anime Without Limits',
  description: 'Discover anime with real metadata powered by Jikan and MyAnimeList.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
