import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { access_token, playlist_name, track_uris } = await request.json()

  if (!access_token || !track_uris?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const createRes = await fetch('https://api.spotify.com/v1/me/playlists', {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playlist_name || 'My Pilates Playlist', description: 'Created with Pilates Music Builder 🧘', public: false }),
    })
    const created = await createRes.json()
    if (!createRes.ok) return NextResponse.json({ error: `Create error: ${JSON.stringify(created)}` }, { status: createRes.status })

    const addRes = await fetch(`https://api.spotify.com/v1/playlists/${created.id}/tracks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: track_uris }),
    })
    const added = await addRes.json()
    if (!addRes.ok) {
      // Return playlist URL even if adding tracks failed — user can add manually
      return NextResponse.json({ 
        partial: true,
        playlist_url: created.external_urls?.spotify,
        playlist_id: created.id,
        error: `Created playlist but could not add tracks automatically. Open the playlist and add songs manually.`
      }, { status: 200 })
    }

    return NextResponse.json({ success: true, playlist_id: created.id, playlist_url: created.external_urls?.spotify })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
