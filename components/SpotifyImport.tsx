'use client'
import { useState } from 'react'
import { Song } from '@/lib/types'

interface SpotifyTrack {
  id: string
  title: string
  artist: string
  duration: number
  spotifyUrl: string | null
  bpm?: number
}

interface SpotifyImportProps {
  onImport: (songs: Song[]) => void
  addedIds: Set<string | number>
}

export default function SpotifyImport({ onImport, addedIds }: SpotifyImportProps) {
  const [url, setUrl] = useState('')
  const [step, setStep] = useState<'idle' | 'fetching' | 'enriching' | 'done' | 'error'>('idle')
  const [playlistName, setPlaylistName] = useState('')
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function fetchPlaylist() {
    if (!url.trim()) return
    setStep('fetching')
    setError('')
    setTracks([])
    setProgress(0)

    try {
      // Step 1: Fetch tracks from Spotify
      const res = await fetch(`/api/spotify/playlist?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch playlist')

      setPlaylistName(data.playlistName)
      setStep('enriching')

      // Step 2: Look up BPM for each track via GetSongBPM
      const enriched: SpotifyTrack[] = []
      const total = data.tracks.length

      for (let i = 0; i < data.tracks.length; i++) {
        const track = data.tracks[i]
        setProgress(Math.round(((i + 1) / total) * 100))

        try {
          const bpmRes = await fetch(`/api/bpm-search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`)
          const bpmData = await bpmRes.json()
          // Find best match — same title and artist
          const match = Array.isArray(bpmData) ? bpmData.find((s: any) =>
            s.title?.toLowerCase() === track.title?.toLowerCase() &&
            s.artist?.toLowerCase().includes(track.artist?.toLowerCase().split(' ')[0])
          ) || bpmData[0] : null

          enriched.push({
            ...track,
            bpm: match?.bpm || undefined,
          })
        } catch {
          enriched.push({ ...track, bpm: undefined })
        }

        // Small delay to avoid hammering the BPM API
        if (i < data.tracks.length - 1) await new Promise(r => setTimeout(r, 150))
      }

      setTracks(enriched)
      // Auto-select all tracks that have BPM data
      setSelected(new Set(enriched.filter(t => t.bpm).map(t => t.id)))
      setStep('done')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setStep('error')
    }
  }

  function toggleTrack(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === tracks.filter(t => t.bpm).length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(tracks.filter(t => t.bpm).map(t => t.id)))
    }
  }

  function handleImport() {
    const toImport = tracks
      .filter(t => selected.has(t.id) && t.bpm)
      .map(t => ({
        id: `spotify-${t.id}`,
        title: t.title,
        name: t.title,
        artist: t.artist,
        bpm: t.bpm!,
        duration: t.duration,
        genre: 'Unknown',
        source: 'spotify',
        spotifyUrl: t.spotifyUrl,
      })) as Song[]
    onImport(toImport)
    setStep('idle')
    setUrl('')
    setTracks([])
    setSelected(new Set())
  }

  function reset() {
    setStep('idle')
    setUrl('')
    setTracks([])
    setError('')
    setProgress(0)
    setSelected(new Set())
  }

  const withBpm = tracks.filter(t => t.bpm)
  const withoutBpm = tracks.filter(t => !t.bpm)

  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cream-100"
        style={{ background: 'linear-gradient(135deg, #1a2e1a, #2d4a2d)' }}>
        <div className="flex items-center gap-2 mb-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span className="text-sm font-semibold text-white">Import from Spotify</span>
        </div>
        <p className="text-xs" style={{ color: '#7ab87a' }}>Paste a public playlist URL to import songs with BPM</p>
      </div>

      <div className="p-4">
        {step === 'idle' || step === 'error' ? (
          <>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchPlaylist()}
                placeholder="https://open.spotify.com/playlist/..."
                className="flex-1 px-3 py-2 text-sm bg-cream-50 border border-cream-200 rounded-xl text-sage-800 placeholder-sage-300 focus:outline-none focus:border-sage-300 focus:bg-white transition-all"
              />
              <button onClick={fetchPlaylist} disabled={!url.trim()}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-white transition-colors disabled:opacity-40"
                style={{ background: '#1DB954' }}>
                Import
              </button>
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 mb-3">
                <span className="text-red-400 text-sm">⚠</span>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <p className="text-xs text-sage-300 text-center">
              Playlist must be public · BPM looked up automatically
            </p>
          </>
        ) : step === 'fetching' ? (
          <div className="text-center py-6">
            <div className="w-8 h-8 border-2 border-sage-200 border-t-sage-500 rounded-full animate-spin mx-auto mb-3"/>
            <p className="text-sm font-medium text-sage-700">Fetching playlist...</p>
            <p className="text-xs text-sage-400 mt-1">Reading tracks from Spotify</p>
          </div>
        ) : step === 'enriching' ? (
          <div className="text-center py-6">
            <div className="w-full bg-cream-200 rounded-full h-2 mb-3">
              <div className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: '#1DB954' }}/>
            </div>
            <p className="text-sm font-medium text-sage-700">Looking up BPM data...</p>
            <p className="text-xs text-sage-400 mt-1">{progress}% complete</p>
          </div>
        ) : step === 'done' ? (
          <>
            {/* Playlist info */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-sage-900">{playlistName}</p>
                <p className="text-xs text-sage-400">
                  {withBpm.length} of {tracks.length} tracks have BPM data
                  {withoutBpm.length > 0 && ` · ${withoutBpm.length} skipped`}
                </p>
              </div>
              <button onClick={reset} className="text-xs text-sage-300 hover:text-sage-500 transition-colors">
                ← Back
              </button>
            </div>

            {/* Select all */}
            {withBpm.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <button onClick={toggleAll}
                  className="text-xs font-medium text-sage-500 hover:text-sage-700 transition-colors">
                  {selected.size === withBpm.length ? 'Deselect all' : 'Select all'}
                </button>
                <span className="text-xs text-sage-400">{selected.size} selected</span>
              </div>
            )}

            {/* Track list */}
            <div className="space-y-1 max-h-64 overflow-y-auto mb-3">
              {tracks.map(track => {
                const isSelected = selected.has(track.id)
                const hasBpm = !!track.bpm
                const dur = track.duration
                const mins = Math.floor(dur / 60)
                const secs = String(dur % 60).padStart(2, '0')

                return (
                  <div key={track.id}
                    onClick={() => hasBpm && toggleTrack(track.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                      !hasBpm ? 'opacity-40 cursor-not-allowed' :
                      isSelected ? 'bg-sage-50 border border-sage-200 cursor-pointer' :
                      'bg-cream-50 border border-transparent cursor-pointer hover:bg-cream-100'
                    }`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                      isSelected ? 'bg-sage-500 border-sage-500' : 'border-cream-300 bg-white'
                    }`}>
                      {isSelected && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-sage-900 truncate">{track.title}</p>
                      <p className="text-xs text-sage-400 truncate">{track.artist}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {hasBpm ? (
                        <span className="text-xs font-semibold text-sage-600 bg-sage-100 px-1.5 py-0.5 rounded-full">
                          {track.bpm} BPM
                        </span>
                      ) : (
                        <span className="text-xs text-sage-300">No BPM</span>
                      )}
                      <span className="text-xs text-sage-300 tabular-nums">{mins}:{secs}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Import button */}
            <button onClick={handleImport} disabled={selected.size === 0}
              className="w-full py-2.5 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-40"
              style={{ background: selected.size > 0 ? '#1DB954' : '#ccc' }}>
              Add {selected.size} song{selected.size !== 1 ? 's' : ''} to playlist
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
