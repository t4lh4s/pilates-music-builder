import { NextRequest, NextResponse } from 'next/server'

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID!
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get('genre') || ''
  const minBpm = parseInt(searchParams.get('minBpm') || '60')
  const maxBpm = parseInt(searchParams.get('maxBpm') || '200')
  const search = searchParams.get('search') || ''

  try {
    const token = await getSpotifyToken()

    // Build search query
    const query = [
      search || 'workout',
      genre && genre !== 'All' ? `genre:${genre.toLowerCase()}` : '',
    ].filter(Boolean).join(' ')

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=US`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const searchData = await searchRes.json()
    const tracks = searchData.tracks?.items || []

    if (tracks.length === 0) return NextResponse.json([])

    // Get audio features for all tracks
    const ids = tracks.map((t: any) => t.id).join(',')
    const featuresRes = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${ids}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const featuresData = await featuresRes.json()
    const features = featuresData.audio_features || []

    // Combine track info with audio features
    const songs = tracks
      .map((track: any, i: number) => {
        const feat = features[i]
        if (!feat) return null
        const bpm = Math.round(feat.tempo)
        return {
          id: track.id,
          name: track.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          bpm,
          genre: genre || 'Pop',
          length: Math.round(track.duration_ms / 1000),
          spotify_uri: track.uri,
          energy: Math.round(feat.energy * 100),
          danceability: Math.round(feat.danceability * 100),
        }
      })
      .filter(Boolean)
      .filter((s: any) => s.bpm >= minBpm && s.bpm <= maxBpm)

    return NextResponse.json(songs)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}
