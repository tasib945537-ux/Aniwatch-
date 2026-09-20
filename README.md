# ANIWACTH — Primary Build

A responsive anime discovery website built with Next.js 15, React 19, TypeScript and Tailwind CSS.

## Included

- Jikan-powered anime discovery, search, details, seasons, genres and episode metadata.
- Responsive dark black/navy + violet UI.
- Anime detail pages and watch pages.
- Episode selector, previous/next episode controls and auto-next.
- Multi-server player UI for **authorized** sources.
- HLS `.m3u8` playback through hls.js plus native HLS/MP4 fallback.
- Mux Playback ID support.
- Cloudflare Stream UID support with a custom playback domain.
- Server-side source configuration so playback URLs are not exposed through the catalog API.

## Video source setup

Jikan provides metadata, not anime video streams. To make a specific anime episode playable, configure a video source that you own or are authorized to distribute.

Copy `.env.example` to `.env.local` and set `AUTHORIZED_VIDEO_SOURCES_JSON`. Example:

```json
[{
  "malId": 12345,
  "episode": 1,
  "language": "Japanese",
  "serverName": "My CDN",
  "playbackUrl": "https://your-authorized-cdn.example/episode-1/master.m3u8",
  "quality": "Auto"
}]
```

Mux example:

```json
[{
  "malId": 12345,
  "episode": 1,
  "language": "Japanese",
  "serverName": "Mux",
  "muxPlaybackId": "YOUR_PLAYBACK_ID",
  "quality": "Auto"
}]
```

Cloudflare Stream example:

```json
[{
  "malId": 12345,
  "episode": 1,
  "language": "Japanese",
  "serverName": "Cloudflare",
  "cloudflareVideoUid": "YOUR_VIDEO_UID",
  "quality": "Auto"
}]
```

## Run

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Deploy

Deploy to Vercel or another Node-compatible host and add the environment variables from `.env.example`. Do not put private provider tokens in browser/client code.

## Important

The included player is fully wired, but an anime episode will only play after an authorized video URL, Mux Playback ID, or Cloudflare Stream UID is configured for that MAL ID and episode.
