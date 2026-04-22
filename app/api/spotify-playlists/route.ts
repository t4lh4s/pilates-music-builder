import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — fetch all saved playlists (metadata only, no tracks)
export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('spotify_playlists')
    .select('id, name, track_count, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — save new playlist OR merge into existing one
export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, tracks, mergeIntoId } = await request.json()
  if (!name || !tracks?.length) {
    return NextResponse.json({ error: 'Missing name or tracks' }, { status: 400 })
  }

  // If mergeIntoId provided — smart merge into existing playlist
  if (mergeIntoId) {
    const { data: existing, error: fetchError } = await supabase
      .from('spotify_playlists')
      .select('id, tracks')
      .eq('id', mergeIntoId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    // Merge: keep all existing, add only tracks not already present (deduped by title+artist)
    const existingTracks: any[] = existing.tracks ?? []
    const existingKeys = new Set(
      existingTracks.map((t: any) => `${t.title?.toLowerCase()}|||${t.artist?.toLowerCase()}`)
    )
    const newTracks = tracks.filter((t: any) => {
      const key = `${t.title?.toLowerCase()}|||${t.artist?.toLowerCase()}`
      return !existingKeys.has(key)
    })
    const merged = [...existingTracks, ...newTracks]

    const { data, error } = await supabase
      .from('spotify_playlists')
      .update({ tracks: merged, track_count: merged.length })
      .eq('id', mergeIntoId)
      .eq('user_id', user.id)
      .select('id, name, track_count, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ...data, added: newTracks.length, merged: true })
  }

  // Otherwise create new playlist
  const { data, error } = await supabase
    .from('spotify_playlists')
    .insert({ user_id: user.id, name, tracks, track_count: tracks.length })
    .select('id, name, track_count, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH — update playlist (rename or add a single song)
export async function PATCH(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, name, addTrack } = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Just renaming
  if (name !== undefined && !addTrack) {
    const { data, error } = await supabase
      .from('spotify_playlists')
      .update({ name })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, track_count, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Adding a single track
  if (addTrack) {
    const { data: existing, error: fetchError } = await supabase
      .from('spotify_playlists')
      .select('tracks')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    const currentTracks: any[] = existing.tracks ?? []
    // Check for duplicate
    const isDupe = currentTracks.some((t: any) =>
      t.title?.toLowerCase() === addTrack.title?.toLowerCase() &&
      t.artist?.toLowerCase() === addTrack.artist?.toLowerCase()
    )
    if (isDupe) return NextResponse.json({ duplicate: true, message: 'Track already in playlist' })

    const updated = [...currentTracks, addTrack]
    const { data, error } = await supabase
      .from('spotify_playlists')
      .update({ tracks: updated, track_count: updated.length })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, track_count, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ...data, added: true })
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
}

// DELETE — remove a saved playlist
export async function DELETE(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('spotify_playlists')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
