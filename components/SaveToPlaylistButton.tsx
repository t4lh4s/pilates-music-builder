'use client'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'

interface Props {
  song: {
    title: string
    artist: string
    bpm: number
    duration: number
    genre?: string
  }
}

interface Playlist {
  id: string
  name: string
  track_count: number
}

export default function SaveToPlaylistButton({ song }: Props) {
  const { isSignedIn } = useUser()
  const [open, setOpen] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function fetchPlaylists() {
    setLoading(true)
    try {
      const res = await fetch('/api/spotify-playlists')
      const data = await res.json()
      if (Array.isArray(data)) setPlaylists(data)
    } catch {}
    setLoading(false)
  }

  async function addToPlaylist(playlistId: string) {
    setSaving(playlistId)
    const track = {
      id: `manual-${song.title}-${song.artist}`.replace(/\s/g, '-').toLowerCase(),
      title: song.title,
      artist: song.artist,
      bpm: song.bpm,
      duration: song.duration,
      genre: song.genre ?? 'Unknown',
    }
    try {
      const res = await fetch('/api/spotify-playlists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playlistId, addTrack: track })
      })
      const data = await res.json()
      if (data.duplicate) {
        setSaved('duplicate')
      } else {
        setSaved(playlistId)
        setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, track_count: data.track_count } : p))
      }
      setTimeout(() => { setSaved(null); setOpen(false) }, 1500)
    } catch {}
    setSaving(null)
  }

  if (!isSignedIn) return null

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchPlaylists() }}
        title="Save to Spotify playlist"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-sage-300 hover:text-sage-600 hover:bg-sage-50 transition-all">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 2h9v9l-4.5-2.5L2 11V2z"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 bg-white rounded-xl border border-cream-200 shadow-lg w-52 overflow-hidden">
          <div className="px-3 py-2 border-b border-cream-100">
            <p className="text-xs font-semibold text-sage-700">Save to playlist</p>
          </div>
          {loading ? (
            <div className="p-3 space-y-1.5">
              {[...Array(2)].map((_, i) => <div key={i} className="h-8 rounded-lg skeleton"/>)}
            </div>
          ) : playlists.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-sage-400">No playlists yet</p>
              <p className="text-xs text-sage-300 mt-0.5">Import one from Spotify first</p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {playlists.map(pl => {
                const isSaving = saving === pl.id
                const isSaved = saved === pl.id
                const isDuplicate = saved === 'duplicate'
                return (
                  <button key={pl.id} onClick={() => !isSaving && !isSaved && addToPlaylist(pl.id)}
                    disabled={isSaving}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-cream-50 transition-colors text-left">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#1DB954" className="shrink-0">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <span className="flex-1 text-xs font-medium text-sage-800 truncate">{pl.name}</span>
                    <span className="text-xs text-sage-300 shrink-0">
                      {isSaving ? '...' : isSaved ? '✓' : isDuplicate ? 'exists' : pl.track_count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
