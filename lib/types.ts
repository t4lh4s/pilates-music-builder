export interface Song {
  id: number
  title: string
  name?: string
  artist: string
  bpm: number
  genre: string
  duration: number
  length?: number
  bpmVerified?: boolean
  spotify_uri?: string
}

export interface PlaylistSong extends Song {
  playlistId: string
}

export interface ClassBlock {
  id: string
  name: string
  description: string
  targetDuration: number // seconds
  bpmMin: number
  bpmMax: number
  emoji: string
  color: string
  songs: PlaylistSong[]
}

export interface ClassTemplate {
  format: 'mat' | 'reformer'
  duration: number // minutes
  level: 'beginner' | 'intermediate' | 'advanced'
  blocks: Omit<ClassBlock, 'songs'>[]
}
