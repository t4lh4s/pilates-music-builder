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
