'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface Track {
  id: string
  title: string
  artist: string
  duration: number
  bpm?: number
}

interface SavedPlaylist {
  id: string
  name: string
  track_count: number
}

interface Props {
  activeBpmMin: number
  activeBpmMax: number
  addedIds: Set<string | number>
  onAdd: (song: any) => void
}

export default function SpotifyPlaylistPicker({ activeBpmMin, activeBpmMax, addedIds, onAdd }: Props) {
  const { isSignedIn } = useUser()
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [allTracks, setAllTracks] = useState<Track[]>([])
  const [loadingAll, setLoadingAll] = useState(false)

  useEffect(() => {
    if (!isSignedIn) { setLoading(false); return }
    fetch('/api/spotify-playlists')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPlaylists(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isSignedIn])

  async function fetchAllTracks() {
    setSelectedId('all')
    setLoadingAll(true)
    setSearch('')
    setShowAll(false)
    try {
      // Fetch tracks from all playlists in parallel
      const results = await Promise.all(
        playlists.map(pl =>
          fetch(`/api/spotify-playlists/tracks?id=${pl.id}`)
            .then(r => r.json())
            .then(d => d.tracks ?? [])
            .catch(() => [])
        )
      )
      // Flatten and dedupe by title+artist
      const seen = new Set<string>()
      const merged: Track[] = []
      for (const tracks of results) {
        for (const t of tracks) {
          const key = `${t.title?.toLowerCase()}|||${t.artist?.toLowerCase()}`
          if (!seen.has(key)) { seen.add(key); merged.push(t) }
        }
      }
      setAllTracks(merged)
    } catch {}
    setLoadingAll(false)
  }

  async function selectPlaylist(id: string) {
    if (selectedId === id) return
    setSelectedId(id)
    setLoadingTracks(true)
    setTracks([])
    setSearch('')
    setShowAll(false)
    try {
      const res = await fetch(`/api/spotify-playlists/tracks?id=${id}`)
      const data = await res.json()
      setTracks(data.tracks ?? [])
    } catch {}
    setLoadingTracks(false)
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sage-500 font-medium mb-1">Sign in to use your Spotify playlists</p>
        <p className="text-sm text-sage-400">Your imported playlists will appear here</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-2xl skeleton"/>)}
      </div>
    )
  }

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
        </div>
        <p className="text-sage-500 font-medium mb-1">No Spotify playlists imported yet</p>
        <p className="text-sm text-sage-400">Go to Song Browser → Spotify tab to import your playlists</p>
      </div>
    )
  }

  // Filter tracks by search + optionally BPM
  const activeTracks = selectedId === 'all' ? allTracks : tracks
  const filtered = activeTracks.filter(t => {
    if (search.trim() && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.artist.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const inRange = filtered.filter(t => t.bpm && t.bpm >= activeBpmMin && t.bpm <= activeBpmMax)
  const outOfRange = filtered.filter(t => !t.bpm || t.bpm < activeBpmMin || t.bpm > activeBpmMax)
  const displayed = showAll ? filtered : inRange

  return (
    <div>
      {/* Playlist selector */}
      <div className="flex gap-2 flex-wrap mb-5">
        {/* All playlists option */}
        {playlists.length > 1 && (
          <button onClick={fetchAllTracks}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
              selectedId === 'all'
                ? 'bg-sage-900 text-white border-sage-900'
                : 'bg-white text-sage-600 border-cream-300 hover:border-sage-300'
            }`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="4" height="4" rx="1"/><rect x="7" y="1" width="4" height="4" rx="1"/>
              <rect x="1" y="7" width="4" height="4" rx="1"/><rect x="7" y="7" width="4" height="4" rx="1"/>
            </svg>
            All Playlists
            <span className={`text-xs ${selectedId === 'all' ? 'text-sage-300' : 'text-sage-400'}`}>
              {playlists.reduce((a, p) => a + p.track_count, 0)}
            </span>
          </button>
        )}
        {playlists.map(pl => (
          <button key={pl.id} onClick={() => selectPlaylist(pl.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
              selectedId === pl.id
                ? 'bg-sage-900 text-white border-sage-900'
                : 'bg-white text-sage-600 border-cream-300 hover:border-sage-300'
            }`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={selectedId === pl.id ? '#1DB954' : '#9fbf9f'}>
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span className="truncate max-w-32">{pl.name}</span>
            <span className={`text-xs ${selectedId === pl.id ? 'text-sage-300' : 'text-sage-400'}`}>{pl.track_count}</span>
          </button>
        ))}
      </div>

      {/* Track browser */}
      {selectedId && (
        <>
          {(loadingTracks || (selectedId === 'all' && loadingAll)) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-2xl skeleton"/>)}
            </div>
          ) : (
            <>
              {/* Search + filter controls */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-300 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search playlist..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-cream-300 rounded-xl text-sage-800 placeholder-sage-300 focus:outline-none focus:border-sage-400"/>
                </div>
                <button onClick={() => setShowAll(!showAll)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
                    showAll
                      ? 'bg-cream-100 text-sage-500 border-cream-300'
                      : 'bg-sage-500 text-white border-sage-500'
                  }`}>
                  {showAll ? `All ${filtered.length}` : `${inRange.length} BPM match`}
                </button>
              </div>

              {/* BPM range info */}
              <p className="text-xs text-sage-400 mb-3">
                {showAll
                  ? `Showing all ${filtered.length} tracks — ${inRange.length} match ${activeBpmMin}–${activeBpmMax} BPM`
                  : `${inRange.length} of ${tracks.length} tracks match ${activeBpmMin}–${activeBpmMax} BPM · `}
                {!showAll && outOfRange.length > 0 && (
                  <button onClick={() => setShowAll(true)} className="text-sage-500 hover:text-sage-700 underline underline-offset-2">
                    show {outOfRange.length} outside range
                  </button>
                )}
              </p>

              {displayed.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sage-500">No tracks match {activeBpmMin}–{activeBpmMax} BPM</p>
                  <button onClick={() => setShowAll(true)} className="text-sm text-sage-400 underline mt-2">
                    Show all {tracks.length} tracks
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {displayed.map(track => {
                    const isAdded = addedIds.has(track.id)
                    const inBpmRange = !!(track.bpm && track.bpm >= activeBpmMin && track.bpm <= activeBpmMax)
                    const mins = Math.floor(track.duration / 60)
                    const secs = String(track.duration % 60).padStart(2, '0')

                    return (
                      <div key={track.id}
                        className={`rounded-2xl p-4 border transition-all ${
                          isAdded ? 'bg-sage-50 border-sage-200' : 'bg-white border-cream-200 hover:border-sage-200'
                        }`}>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(29,185,84,0.1)', color: '#1a7a3a' }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                            Spotify
                          </span>
                          <span className="text-xs text-sage-300 font-mono tabular-nums">{mins}:{secs}</span>
                        </div>

                        {/* Title + artist */}
                        <div className="mb-3">
                          <h3 className="font-display font-semibold text-sage-900 text-sm leading-snug mb-0.5 line-clamp-2">{track.title}</h3>
                          <p className="text-xs text-sage-500 truncate">{track.artist}</p>
                        </div>

                        {/* BPM */}
                        <div className="flex items-center gap-2 mb-3">
                          {track.bpm ? (
                            <>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                inBpmRange ? 'bg-sage-100 text-sage-700' : 'bg-cream-200 text-sage-500'
                              }`}>
                                {track.bpm} BPM
                              </span>
                              {inBpmRange && <span className="text-xs text-sage-500">✓ match</span>}
                              {!inBpmRange && <span className="text-xs text-sage-300">outside range</span>}
                            </>
                          ) : (
                            <span className="text-xs text-sage-300">No BPM data</span>
                          )}
                        </div>

                        {/* Add button */}
                        {!isAdded ? (
                          <button
                            onClick={() => onAdd({
                              id: track.id,
                              title: track.title,
                              name: track.title,
                              artist: track.artist,
                              bpm: track.bpm ?? activeBpmMin,
                              duration: track.duration,
                              genre: 'Unknown',
                              source: 'spotify',
                            })}
                            className="w-full py-2 rounded-xl text-xs font-semibold bg-sage-500 text-white hover:bg-sage-600 transition-colors">
                            + Add to Block
                          </button>
                        ) : (
                          <div className="w-full py-2 text-xs font-semibold text-sage-400 text-center">Added ✓</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
