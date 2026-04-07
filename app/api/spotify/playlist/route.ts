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
  const data = await trackRes.json()
  if (!res.ok) throw new Error('Failed to get Spotify token')
  return data.access_token
}

function extractPlaylistId(input: string): string | null {
  const urlMatch = input.match(/playlist\/([a-zA-Z0-9]+)/)
  if (urlMatch) return urlMatch[1]
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

    // Fetch playlist metadata — no fields filter, simpler request
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )

    if (!playlistRes.ok) {
      const errData = await playlistRes.json().catch(() => ({}))
      console.error('Spotify playlist fetch error:', playlistRes.status, errData)
      if (playlistRes.status === 404) {
        return NextResponse.json({ error: 'Playlist not found. Make sure it is set to Public in Spotify.' }, { status: 404 })
      }
      if (playlistRes.status === 401) {
        return NextResponse.json({ error: 'Spotify authorization failed. Please try again.' }, { status: 401 })
      }
      return NextResponse.json({ error: `Spotify error: ${playlistRes.status}` }, { status: 500 })
    }

    const playlist = await playlistRes.json()

    // Fetch all tracks (paginate if >100)
    const tracks: any[] = []
    let nextUrl: string | null =
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`

    while (nextUrl && tracks.length < 500) {
      const trackRes: Response = await fetch(nextUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!trackRes.ok) break
      const data = await trackRes.json()
      const items = data.items || []
      for (const item of items) {
        if (item?.track?.name && item.track.type === 'track') {
          tracks.push({
            id: item.track.id,
            title: item.track.name,
            artist: item.track.artists?.[0]?.name || 'Unknown',
            duration: Math.round((item.track.duration_ms || 0) / 1000),
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
