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
      // Search by BPM
      url = `${BASE_URL}/tempo/?api_key=${API_KEY}&bpm=${bpm}&limit=20`
    } else if (query) {
      // Search by song/artist
      url = `${BASE_URL}/search/?api_key=${API_KEY}&type=song&lookup=${encodeURIComponent(query)}&limit=20`
    } else {
      return NextResponse.json({ error: 'Missing query or bpm parameter' }, { status: 400 })
    }

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`GetSongBPM API error: ${res.status}`)

    const data = await res.json()

    // Normalize response into consistent song format
    const songs = normalizeSongs(data, !!bpm)

    return NextResponse.json(songs)
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
    }))
    .filter(s => s.bpm > 0)
}
