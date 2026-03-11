import { NextResponse } from 'next/server'
import songsData from '@/data/songs.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get('genre')
    const minBpm = searchParams.get('minBpm')
    const maxBpm = searchParams.get('maxBpm')
    const minLength = searchParams.get('minLength')
    const maxLength = searchParams.get('maxLength')
    const tempo = searchParams.get('tempo')

    let songs = songsData as any[]

    if (genre) songs = songs.filter(s => s.genre.toLowerCase() === genre.toLowerCase())
    if (minBpm) songs = songs.filter(s => s.bpm >= parseInt(minBpm))
    if (maxBpm) songs = songs.filter(s => s.bpm <= parseInt(maxBpm))
    if (minLength) songs = songs.filter(s => (s.duration ?? 0) >= parseInt(minLength))
    if (maxLength) songs = songs.filter(s => (s.duration ?? 0) <= parseInt(maxLength))
    if (tempo === 'slow') songs = songs.filter(s => s.bpm <= 80)
    else if (tempo === 'medium') songs = songs.filter(s => s.bpm > 80 && s.bpm <= 100)
    else if (tempo === 'fast') songs = songs.filter(s => s.bpm > 100 && s.bpm <= 120)
    else if (tempo === 'high') songs = songs.filter(s => s.bpm > 120)

    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error loading songs:', error)
    return NextResponse.json({ error: 'Failed to load songs' }, { status: 500 })
  }
}
