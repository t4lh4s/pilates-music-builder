import { NextResponse } from 'next/server'

const API_KEY = process.env.GETSONGBPM_API_KEY!
const BASE_URL = 'https://api.getsong.co'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const bpm = searchParams.get('bpm')

  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    let url: string
    if (bpm) {
      url = `${BASE_URL}/tempo/?api_key=${API_KEY}&bpm=${bpm}&limit=20`
    } else if (query) {
      url = `${BASE_URL}/search/?api_key=${API_KEY}&type=song&lookup=${encodeURIComponent(query)}&limit=20`
    } else {
      return NextResponse.json({ error: 'Missing query or bpm parameter' }, { status: 400 })
    }

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`GetSongBPM API error: ${res.status}`)
    const data = await res.json()

    // Normalize into consistent song format (no duration yet)
    const songs = normalizeSongs(data, !!bpm)

    // Enrich with duration from MusicBrainz — run in parallel, max 5 at a time
    const enriched = await enrichWithDuration(songs)

    return NextResponse.json(enriched)
  } catch (err) {
    console.error('BPM search error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

function normalizeSongs(data: any, isTempo: boolean): any[] {
  let raw: any[] = []
  if (isTempo && data.tempo) {
    raw = Array.isArray(data.tempo) ? data.tempo : [data.tempo]
  } else if (data.search) {
    raw = Array.isArray(data.search) ? data.search : [data.search]
  }

  return raw
    .filter(s => s.song_title || s.title)
    .map(s => ({
      id: String(`gsbpm-${s.song_id || s.id}`),
      title: s.song_title || s.title,
      artist: s.artist?.name || 'Unknown Artist',
      bpm: parseInt(s.tempo) || 0,
      genre: s.artist?.genres?.[0] || 'Unknown',
      source: 'getsongbpm',
      uri: s.song_uri || s.uri,
      duration: 0, // will be filled by MusicBrainz
    }))
    .filter(s => s.bpm > 0)
}

// Fetch duration from MusicBrainz for a single song
// Returns duration in seconds, or 0 if not found
async function getMusicBrainzDuration(title: string, artist: string): Promise<number> {
  try {
    // Clean up artist name — strip "ft.", "feat.", "x " etc for better matching
    const cleanArtist = artist.split(/\s+(ft\.|feat\.|x\s|&)\s+/i)[0].trim()

    const query = `artist:${encodeURIComponent(cleanArtist)} AND recording:${encodeURIComponent(title)}`
    const url = `https://musicbrainz.org/ws/2/recording/?query=${query}&fmt=json&limit=5`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'PilatesMusicBuilder/1.0 (contact@pilatesmusic.app)' },
      next: { revalidate: 86400 }, // cache for 24h
    })
    if (!res.ok) return 0

    const data = await res.json()
    const recordings: any[] = data.recordings ?? []
    if (recordings.length === 0) return 0

    // Find best match: score 100, artist matches, has a length
    const best = recordings.find(r => {
      const hasLength = r.length > 0
      const artistMatch = r['artist-credit']?.some((ac: any) =>
        ac.artist?.name?.toLowerCase().includes(cleanArtist.toLowerCase()) ||
        cleanArtist.toLowerCase().includes(ac.artist?.name?.toLowerCase())
      )
      const titleMatch = r.title?.toLowerCase() === title.toLowerCase()
      return hasLength && artistMatch && titleMatch
    }) ?? recordings.find(r => r.length > 0 && r.score >= 90)
      ?? recordings.find(r => r.length > 0)

    return best?.length ? Math.round(best.length / 1000) : 0
  } catch {
    return 0
  }
}

// Enrich songs with duration in batches to respect MusicBrainz rate limit (1 req/sec)
async function enrichWithDuration(songs: any[]): Promise<any[]> {
  const results = [...songs]

  for (let i = 0; i < results.length; i++) {
    const song = results[i]
    const duration = await getMusicBrainzDuration(song.title, song.artist)
    results[i] = { ...song, duration }

    // MusicBrainz rate limit: 1 request/second
    // Only wait if there are more songs to process
    if (i < results.length - 1) {
      await new Promise(r => setTimeout(r, 1050))
    }
  }

  return results
}
