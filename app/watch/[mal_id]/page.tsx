import WatchPlayer from '../../components/watch-player'

export default async function WatchPage({ params }: { params: Promise<{ mal_id: string }> }) {
  return <WatchPlayer malId={(await params).mal_id} />
}
