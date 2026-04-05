import { NextResponse } from 'next/server'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!

async function getToken(): Promise<string> {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  if (!res.ok) throw new Error('Failed to get Spotify token')
  return data.access_token
}

function extractPlaylistId(input: string): string | null {
  // Handle full URLs: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  const urlMatch = input.match(/playlist\/([a-zA-Z0-9]+)/)
  if (urlMatch) return urlMatch[1]
  // Handle bare IDs
  if (/^[a-zA-Z0-9]{22}$/.test(input.trim())) return input.trim()
  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })

  const playlistId = extractPlaylistId(url)
  if (!playlistId) return NextResponse.json({ error: 'Invalid Spotify playlist URL' }, { status: 400 })

  try {
    const token = await getToken()

    // Fetch playlist metadata
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,tracks(total)`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    if (!playlistRes.ok) {
      if (playlistRes.status === 404) return NextResponse.json({ error: 'Playlist not found. Make sure it is public.' }, { status: 404 })
      throw new Error('Failed to fetch playlist')
    }
    const playlist = await playlistRes.json()

    // Fetch all tracks (paginate if >100)
    const tracks: any[] = []
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=next,items(track(id,name,duration_ms,artists,external_urls,preview_url))&limit=100`

    while (nextUrl && tracks.length < 500) {
      const res = await fetch(nextUrl, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      const items = data.items || []
      for (const item of items) {
        if (item.track && item.track.name) {
          tracks.push({
            id: item.track.id,
            title: item.track.name,
            artist: item.track.artists?.[0]?.name || 'Unknown',
            duration: Math.round((item.track.duration_ms || 0) / 1000), // convert to seconds
            spotifyUrl: item.track.external_urls?.spotify || null,
          })
        }
      }
      nextUrl = data.next || null
    }

    return NextResponse.json({
      playlistName: playlist.name,
      totalTracks: playlist.tracks?.total || tracks.length,
      tracks,
    })
  } catch (err: any) {
    console.error('Spotify playlist error:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch playlist' }, { status: 500 })
  }
}
