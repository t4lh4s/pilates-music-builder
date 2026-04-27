'use client'
import { useState } from 'react'
import { Song } from '@/lib/types'
import { Playlist } from '@/components/PlaylistPanel'

interface Props {
  song: Song
  isInPlaylist: boolean
  onAdd: (song: Song, targetPlaylistId?: string) => void
  playlists?: Playlist[]
  activePlaylistId?: string
  addLabel?: string
}

export default function SongCard({ song, isInPlaylist, onAdd, playlists, activePlaylistId, addLabel }: Props) {
  const [showPicker, setShowPicker] = useState(false)

  const dur = song.duration ?? 0
  const mins = Math.floor(dur / 60)
  const secs = String(dur % 60).padStart(2, '0')

  const manualPlaylists = playlists?.filter(p => p.source !== 'spotify') ?? []
  const hasMultiplePlaylists = manualPlaylists.length > 1

  function handleBookmarkClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (hasMultiplePlaylists) {
      setShowPicker(v => !v)
    } else {
      onAdd(song)
      setShowPicker(false)
    }
  }

  function handlePickPlaylist(playlistId: string) {
    onAdd(song, playlistId)
    setShowPicker(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-200 p-4 hover:border-cream-300 hover:shadow-sm transition-all group relative">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <span className="inline-block text-xs font-semibold text-sage-500 bg-sage-50 px-2 py-0.5 rounded-full mb-1.5">{song.genre}</span>
          <p className="font-semibold text-sage-900 text-sm leading-tight truncate">{song.title}</p>
          <p className="text-xs text-sage-500 truncate">{song.artist}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-sage-400 tabular-nums">{mins}:{secs}</span>
          <div className="relative">
            {addLabel ? (
              <button onClick={() => onAdd(song)}
                className="text-xs font-semibold text-white bg-sage-500 hover:bg-sage-600 px-2.5 py-1 rounded-lg transition-colors">
                {addLabel}
              </button>
            ) : (
              <button
                onClick={handleBookmarkClick}
                title={hasMultiplePlaylists ? 'Add to playlist' : (isInPlaylist ? 'In playlist' : 'Add to playlist')}
                className={`p-1.5 rounded-lg transition-all ${isInPlaylist ? 'text-sage-500 bg-sage-50' : 'text-sage-300 hover:text-sage-500 hover:bg-sage-50'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={isInPlaylist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            )}
            {showPicker && hasMultiplePlaylists && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)}/>
                <div className="absolute right-0 top-8 z-50 bg-white border border-cream-200 rounded-xl shadow-lg py-1 min-w-44">
                  <p className="text-xs text-sage-400 px-3 py-1.5 font-semibold uppercase tracking-wide border-b border-cream-100">Add to playlist</p>
                  {manualPlaylists.map(p => (
                    <button key={p.id} onClick={() => handlePickPlaylist(p.id)}
                      className={`w-full text-left text-xs px-3 py-2 hover:bg-cream-50 transition-colors flex items-center justify-between gap-2 ${p.id === activePlaylistId ? 'text-sage-900 font-semibold' : 'text-sage-700'}`}>
                      <span className="truncate">{p.name}</span>
                      {p.id === activePlaylistId && <span className="text-sage-400 text-xs shrink-0">active</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-sage-700 bg-sage-100 px-2 py-0.5 rounded-full tabular-nums">{song.bpm} BPM</span>

      </div>

      <div className="flex items-center gap-3 text-xs text-sage-400">
        <a href={`https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`}
          target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          className="flex items-center gap-1 hover:text-green-600 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
          Spotify
        </a>
        <a href={`https://music.apple.com/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}`}
          target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          className="flex items-center gap-1 hover:text-pink-600 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208a4.98 4.98 0 00-.312 1.37c-.05.5-.059 1-.06 1.501v12.07c0 .507.012 1.01.062 1.516.097.981.368 1.9.915 2.714a4.765 4.765 0 002.263 1.78c.717.261 1.465.37 2.224.404.408.02.816.022 1.224.022H17.78c.408 0 .817-.003 1.225-.023.76-.034 1.508-.144 2.225-.405a4.763 4.763 0 002.262-1.78c.547-.814.818-1.733.916-2.714.05-.506.061-1.01.061-1.516V7.501c0-.459-.007-.918-.032-1.377zm-6.99 3.98l-5.409 8.563c-.17.27-.454.434-.762.437-.307.003-.594-.156-.77-.42L7.96 15.77l-1.948 1.867a.866.866 0 01-1.46-.639V7.9c0-.48.39-.87.87-.87h12.16c.48 0 .87.39.87.87v1.35c0 .302-.157.582-.408.724l-1.09.63z"/></svg>
          Apple Music
        </a>
      </div>
    </div>
  )
}
