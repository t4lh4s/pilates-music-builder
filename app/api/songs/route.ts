import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get('genre')
  const minBpm = searchParams.get('minBpm')
  const maxBpm = searchParams.get('maxBpm')
  const minLength = searchParams.get('minLength')
  const maxLength = searchParams.get('maxLength')

  const res = await fetch(
    `https://api.airtable.com/v0/appZzxf9aJMQxwu3y/Tracks`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
  )
  const data = await res.json()

  let songs = data.records.map((r: any) => ({
    id: r.id,
    name: r.fields['Track Name'] || '',
    artist: r.fields['Artist'] || '',
    bpm: Number(r.fields['BPM'] || 0),
    genre: r.fields['Genre Tag'] || '',
    length: Number(r.fields['Length (sec)'] || 0),
    spotify_uri: r.fields['Spotify URI'] || '',
  }))

  if (genre && genre !== 'All') songs = songs.filter((s: any) => s.genre === genre)
  if (minBpm) songs = songs.filter((s: any) => s.bpm >= parseInt(minBpm))
  if (maxBpm) songs = songs.filter((s: any) => s.bpm <= parseInt(maxBpm))
  if (minLength) songs = songs.filter((s: any) => s.length >= parseInt(minLength))
  if (maxLength) songs = songs.filter((s: any) => s.length <= parseInt(maxLength))

  return NextResponse.json(songs)
}
