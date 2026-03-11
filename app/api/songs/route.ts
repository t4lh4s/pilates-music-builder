import { NextResponse } from 'next/server'
import songsData from '@/data/songs.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get('genre')
    const minBpm = searchParams.get('minBpm')
    const maxBpm = searchParams.get('maxBpm')

    let songs = songsData as any[]

    if (genre) {
      songs = songs.filter(s => s.genre.toLowerCase() === genre.toLowerCase())
    }
    if (minBpm) {
      songs = songs.filter(s => s.bpm >= parseInt(minBpm))
    }
    if (maxBpm) {
      songs = songs.filter(s => s.bpm <= parseInt(maxBpm))
    }

    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error loading songs:', error)
    return NextResponse.json({ error: 'Failed to load songs' }, { status: 500 })
  }
}
