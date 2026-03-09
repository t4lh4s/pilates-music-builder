# 🧘 Pilates Music Builder

A Next.js web app for crafting the perfect Pilates soundtrack. Browse songs by BPM, genre, and length, build a playlist with drag-and-drop reordering, and export directly to Spotify.

---

## Features

- **Song Library** – 30 curated tracks with BPM, genre, artist, and duration
- **Filters** – Filter by genre, BPM range, and song length
- **Search** – Search by song name or artist
- **Playlist Builder** – Add songs, drag-and-drop to reorder, remove tracks
- **Stats** – Live total duration and average BPM for your playlist
- **Spotify Export** – Create a playlist in your Spotify account via the Spotify API

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Database**: JSON file (`data/songs.json`) — no database setup needed
- **Deployment**: Vercel

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Spotify Export Setup

The app uses the Spotify Web API. To export a playlist:

1. Go to [Spotify Developer Console](https://developer.spotify.com/console/post-playlists/)
2. Click **Get Token** and select scopes:
   - `playlist-modify-private`
   - `playlist-modify-public`
3. Copy the access token
4. In the app, click **Export to Spotify**, paste the token, and hit export

> **Note**: Tokens expire after 1 hour. For a production app with persistent OAuth, you would integrate Spotify OAuth via NextAuth.js.

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo in the [Vercel dashboard](https://vercel.com/new) for automatic deployments.

No environment variables are required for basic usage. For a full OAuth flow, add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to your Vercel project settings.

---

## Adding More Songs

Edit `data/songs.json`. Each entry needs:

```json
{
  "id": "unique-string",
  "name": "Song Title",
  "artist": "Artist Name",
  "bpm": 120,
  "genre": "Pop",
  "length": 200,
  "spotify_uri": "spotify:track:TRACK_ID_HERE"
}
```

Find the `spotify_uri` by right-clicking a track in Spotify → Share → Copy Spotify URI.

---

## Project Structure

```
pilates-music-builder/
├── app/
│   ├── api/
│   │   ├── songs/route.ts       # Song filtering API
│   │   └── playlist/route.ts    # Spotify export API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main app page
├── components/
│   ├── SongCard.tsx             # Individual song card
│   ├── Filters.tsx              # Genre/BPM/length filters
│   └── PlaylistPanel.tsx        # Playlist + Spotify export
├── data/
│   └── songs.json               # Song library
├── lib/
│   ├── types.ts
│   └── utils.ts
└── vercel.json
```
