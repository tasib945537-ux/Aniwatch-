import WatchPlayer from '../../../components/watch-player'

const SOLO_LEVELING_MAL_ID = '16498'

// Solo Leveling (MAL ID 16498) uses the existing watch player for episode playback.
export default function AnimeEpisodesPage() {
  return <WatchPlayer malId={SOLO_LEVELING_MAL_ID} />
}
