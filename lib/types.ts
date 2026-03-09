export interface Song {
  id: string
  name: string
  artist: string
  bpm: number
  genre: string
  length: number // seconds
  spotify_uri: string
}

export interface PlaylistSong extends Song {
  playlistId: string // unique id for drag-and-drop
}
