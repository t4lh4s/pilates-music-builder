import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseWithAuth } from '@/lib/supabase'

// GET — load all playlists for current user
export async function GET() {
  const { getToken, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getToken({ template: 'supabase' })
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 })

  const client = supabaseWithAuth(token)
  const { data, error } = await client
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — save a new playlist
export async function POST(request: Request) {
  const { getToken, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getToken({ template: 'supabase' })
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 })

  const body = await request.json()
  const { name, format, duration, level, data } = body

  const client = supabaseWithAuth(token)
  const { data: playlist, error } = await client
    .from('playlists')
    .insert({ user_id: userId, name, format, duration, level, data })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(playlist)
}

// PATCH — update existing playlist
export async function PATCH(request: Request) {
  const { getToken, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getToken({ template: 'supabase' })
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 })

  const body = await request.json()
  const { id, name, data } = body

  const client = supabaseWithAuth(token)
  const { data: playlist, error } = await client
    .from('playlists')
    .update({ name, data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(playlist)
}

// DELETE — delete a playlist
export async function DELETE(request: Request) {
  const { getToken, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getToken({ template: 'supabase' })
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const client = supabaseWithAuth(token)
  const { error } = await client
    .from('playlists')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
