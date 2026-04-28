'use client'
import { useState, useRef, useEffect } from 'react'
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
  created_at: string
}

interface Props {
  onAdd: (song: any) => void
  addedIds: Set<string | number>
  playlists?: Array<{id: string; name: string; source?: string}>
  onCopyToPlaylist?: (song: any, targetId: string) => void}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  function splitLine(line: string): string[] {
    const result: string[] = []; let cur = ''; let inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++ } else inQ = !inQ }
      else if (c === ',' && !inQ) { result.push(cur.trim()); cur = '' }
      else cur += c
    }
    result.push(cur.trim()); return result
  }
  const headers = splitLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim())
  return lines.slice(1).map(line => {
    const vals = splitLine(line); const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (vals[i] ?? '').replace(/^"|"$/g, '').trim() })
    return row
  }).filter(r => Object.values(r).some(v => v))
}

function findCol(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const found = Object.keys(row).find(k => k.toLowerCase().includes(key.toLowerCase()))
    if (found && row[found]) return row[found]
  }
  return ''
}

export default function SpotifyImport({ onAdd, addedIds, playlists, onCopyToPlaylist }: Props) {
  const { isSignedIn } = useUser()
  const [view, setView] = useState<'list' | 'import'>('list')
  const [pickerTrackId, setPickerTrackId] = useState<string | null>(null)
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([])
  const [loadingPlaylists, setLoadingPlaylists] = useState(true)
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null)
  const [openTracks, setOpenTracks] = useState<Track[]>([])
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [editingNameValue, setEditingNameValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Import state
  const [importStep, setImportStep] = useState<'idle' | 'enriching' | 'review' | 'saving' | 'error'>('idle')
  const [importTracks, setImportTracks] = useState<Track[]>([])
  const [importName, setImportName] = useState('')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)

  // Merge detection
  const [existingMatch, setExistingMatch] = useState<SavedPlaylist | null>(null)
  const [mergeChoice, setMergeChoice] = useState<'merge' | 'new' | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSignedIn) fetchPlaylists()
    else setLoadingPlaylists(false)
  }, [isSignedIn])

  async function fetchPlaylists() {
    setLoadingPlaylists(true)
    try {
      const res = await fetch('/api/spotify-playlists')
      const data = await res.json()
      if (Array.isArray(data)) setSavedPlaylists(data)
    } catch {}
    setLoadingPlaylists(false)
  }

  async function openPlaylist(id: string) {
    if (openPlaylistId === id) { setOpenPlaylistId(null); setSearchQuery(''); return }
    setOpenPlaylistId(id)
    setLoadingTracks(true)
    setSearchQuery('')
    try {
      const res = await fetch(`/api/spotify-playlists/tracks?id=${id}`)
      const data = await res.json()
      setOpenTracks(data.tracks ?? [])
    } catch {}
    setLoadingTracks(false)
  }

  async function deletePlaylist(id: string) {
    setDeletingId(id)
    await fetch(`/api/spotify-playlists?id=${id}`, { method: 'DELETE' })
    setSavedPlaylists(prev => prev.filter(p => p.id !== id))
    if (openPlaylistId === id) setOpenPlaylistId(null)
    setDeletingId(null)
  }

  async function saveRename(id: string, name: string) {
    setEditingNameId(null)
    if (!name.trim()) return
    setSavedPlaylists(prev => prev.map(p => p.id === id ? { ...p, name } : p))
    await fetch('/api/spotify-playlists', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name })
    })
  }

  async function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) { setError('Please upload a CSV file from Exportify'); return }
    setError('')
    setMergeChoice(null)
    setExistingMatch(null)
    setImportStep('enriching')
    setProgress(0)
    setProgressLabel('Reading file...')

    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length === 0) throw new Error('No tracks found. Make sure this is an Exportify CSV.')

      const rawName = file.name.replace('.csv', '').replace(/_/g, ' ')
      setImportName(rawName)

      // Check for existing playlist with same name
      const match = savedPlaylists.find(p =>
        p.name.toLowerCase().trim() === rawName.toLowerCase().trim()
      )
      if (match) setExistingMatch(match)

      const parsed: Track[] = rows.map((row, i) => {
        const title = findCol(row, 'Track Name', 'track name', 'name', 'title')
        const artist = findCol(row, 'Artist Name', 'artist name', 'artist', 'artists')
        const durationMs = parseInt(findCol(row, 'Duration (ms)', 'duration_ms', 'duration') || '0')
        const tempo = parseFloat(findCol(row, 'Tempo', 'tempo', 'bpm') || '0')
        return { id: `csv-${i}-${title}`.replace(/\s/g, '-'), title, artist, duration: Math.round(durationMs / 1000), bpm: tempo > 0 ? Math.round(tempo) : undefined }
      }).filter(t => t.title && t.artist)

      if (parsed.length === 0) throw new Error('Could not read tracks. Make sure this is a valid Exportify CSV.')

      const needBpm = parsed.filter(t => !t.bpm)
      const enriched = [...parsed]

      for (let i = 0; i < needBpm.length; i++) {
        const track = needBpm[i]
        setProgress(Math.round(((i + 1) / needBpm.length) * 100))
        setProgressLabel(`Looking up BPM ${i + 1} of ${needBpm.length}...`)
        try {
          const res = await fetch(`/api/bpm-search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`)
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const match = data.find((s: any) => s.title?.toLowerCase() === track.title.toLowerCase()) || data[0]
            if (match?.bpm) {
              const idx = enriched.findIndex(t => t.id === track.id)
              if (idx !== -1) enriched[idx] = { ...enriched[idx], bpm: match.bpm }
            }
          }
        } catch {}
        await new Promise(r => setTimeout(r, 120))
      }

      setImportTracks(enriched)
      setSelected(new Set(enriched.filter(t => t.bpm).map(t => t.id)))
      setImportStep('review')
    } catch (err: any) {
      setError(err.message || 'Failed to process file')
      setImportStep('error')
    }
  }

  async function savePlaylist() {
    if (!isSignedIn) { alert('Sign in to save playlists'); return }
    setImportStep('saving')
    const tracksToSave = importTracks.filter(t => selected.has(t.id))
    try {
      const body: any = { name: importName, tracks: tracksToSave }
      if (mergeChoice === 'merge' && existingMatch) body.mergeIntoId = existingMatch.id

      const res = await fetch('/api/spotify-playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (mergeChoice === 'merge' && existingMatch) {
        // Update existing playlist in state
        setSavedPlaylists(prev => prev.map(p => p.id === existingMatch.id ? { ...p, track_count: data.track_count } : p))
      } else {
        setSavedPlaylists(prev => [data, ...prev])
      }

      setView('list')
      setImportStep('idle')
      setImportTracks([])
      setSelected(new Set())
      setExistingMatch(null)
      setMergeChoice(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: any) {
      setError(err.message || 'Failed to save')
      setImportStep('review')
    }
  }

  const filteredTracks = searchQuery.trim()
    ? openTracks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : openTracks

  return (
    <div className="h-full flex flex-col">

      {/* ── Library view ── */}
      {view === 'list' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-cream-100 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-sage-900">My Spotify Playlists</h3>
                <p className="text-xs text-sage-400 mt-0.5">Imported via Exportify</p>
              </div>
              <button onClick={() => { setView('import'); setImportStep('idle'); setError(''); setExistingMatch(null); setMergeChoice(null) }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sage-900 text-white hover:bg-sage-800 transition-colors">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 1v8M1 5h8"/></svg>
                Import
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!isSignedIn ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                <p className="text-sm font-medium text-sage-600 mb-1">Sign in to save playlists</p>
                <p className="text-xs text-sage-400">Your imported playlists are saved to your account</p>
              </div>
            ) : loadingPlaylists ? (
              <div className="space-y-2 p-4">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl skeleton"/>)}</div>
            ) : savedPlaylists.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                </div>
                <p className="text-sm font-medium text-sage-600 mb-1">No playlists yet</p>
                <p className="text-xs text-sage-400 mb-4">Import your Spotify playlists to use them in classes</p>
                <button onClick={() => { setView('import'); setImportStep('idle') }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: '#1DB954' }}>
                  Import your first playlist
                </button>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {savedPlaylists.map(pl => (
                  <div key={pl.id} className="rounded-xl border border-cream-200 overflow-hidden bg-white">
                    {/* Playlist row */}
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(29,185,84,0.1)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingNameId === pl.id ? (
                          <input autoFocus value={editingNameValue}
                            onChange={e => setEditingNameValue(e.target.value)}
                            onBlur={() => saveRename(pl.id, editingNameValue)}
                            onKeyDown={e => { if (e.key === 'Enter') saveRename(pl.id, editingNameValue); if (e.key === 'Escape') setEditingNameId(null) }}
                            className="w-full text-sm font-semibold text-sage-900 bg-cream-50 border border-sage-300 rounded-lg px-2 py-0.5 focus:outline-none"/>
                        ) : (
                          <button onClick={() => openPlaylist(pl.id)} className="text-left w-full">
                            <p className="text-sm font-semibold text-sage-900 truncate">{pl.name}</p>
                            <p className="text-xs text-sage-400">{pl.track_count} tracks · {new Date(pl.created_at).toLocaleDateString()}</p>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {/* Rename */}
                        <button onClick={() => { setEditingNameId(pl.id); setEditingNameValue(pl.name) }}
                          className="w-6 h-6 flex items-center justify-center text-sage-200 hover:text-sage-500 transition-colors">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1.5l1.5 1.5L3 8.5H1.5V7L7 1.5z"/></svg>
                        </button>
                        {/* Expand/collapse */}
                        <button onClick={() => openPlaylist(pl.id)}
                          className="w-6 h-6 flex items-center justify-center text-sage-300 hover:text-sage-600 transition-colors">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                            {openPlaylistId === pl.id ? <path d="M2 7l3-4 3 4"/> : <path d="M2 3l3 4 3-4"/>}
                          </svg>
                        </button>
                        {/* Delete */}
                        <button onClick={() => deletePlaylist(pl.id)} disabled={deletingId === pl.id}
                          className="w-6 h-6 flex items-center justify-center text-sage-200 hover:text-red-400 transition-colors">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l8 8M9 1L1 9"/></svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded tracks */}
                    {openPlaylistId === pl.id && (
                      <div className="border-t border-cream-100">
                        <div className="px-3 py-2 border-b border-cream-50">
                          <div className="relative">
                            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sage-300 w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                              placeholder="Filter tracks..."
                              className="w-full pl-7 pr-3 py-1.5 text-xs bg-cream-50 border border-cream-200 rounded-lg text-sage-700 placeholder-sage-300 focus:outline-none focus:border-sage-300"/>
                          </div>
                        </div>
                        {loadingTracks ? (
                          <div className="p-3 space-y-1.5">{[...Array(4)].map((_, i) => <div key={i} className="h-8 rounded-lg skeleton"/>)}</div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto">
                            {filteredTracks.length === 0 ? (
                              <p className="text-xs text-sage-400 text-center py-4">No tracks found</p>
                            ) : filteredTracks.map(track => {
                              const isAdded = addedIds.has(track.id)
                              const mins = Math.floor(track.duration / 60)
                              const secs = String(track.duration % 60).padStart(2, '0')
                              return (
                                <div key={track.id} className="flex items-center gap-2 px-3 py-2 border-b border-cream-50 last:border-0 hover:bg-cream-50 transition-colors group">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-sage-900 truncate">{track.title}</p>
                                    <p className="text-xs text-sage-400 truncate">{track.artist}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {track.bpm
                                      ? <span className="text-xs font-semibold text-sage-600 bg-sage-100 px-1.5 py-0.5 rounded-full">{track.bpm}</span>
                                      : <span className="text-xs text-sage-300">—</span>
                                    }
                                    {track.duration > 0 && <span className="text-xs text-sage-300 tabular-nums w-7">{mins}:{secs}</span>}
                                    {isAdded
                                      ? <span className="text-xs text-sage-400 w-10 text-center">✓</span>
                                      : <div className="relative">
                                          <button onClick={() => setPickerTrackId(pickerTrackId === track.id ? null : track.id)}
                                            className="text-xs font-semibold px-2 py-1 bg-sage-500 hover:bg-sage-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 w-10 text-center">
                                            Add
                                          </button>
                                          {pickerTrackId === track.id && playlists && onCopyToPlaylist && (
                                            <>
                                              <div className="fixed inset-0 z-40" onClick={() => setPickerTrackId(null)}/>
                                              <div className="absolute right-0 bottom-8 z-50 bg-white border border-cream-200 rounded-xl shadow-lg py-1 min-w-44">
                                                <p className="text-xs text-sage-400 px-3 py-1.5 font-semibold uppercase tracking-wide border-b border-cream-100">Add to playlist</p>
                                                {playlists.filter(p => p.source !== 'spotify').map(p => (
                                                  <button key={p.id} onClick={() => { onCopyToPlaylist({ ...track, name: track.title, genre: 'Unknown', source: 'spotify', playlistId: `${track.id}-${Date.now()}` }, p.id); setPickerTrackId(null); }}
                                                    className="w-full text-left text-xs px-3 py-2 hover:bg-cream-50 transition-colors text-sage-700 truncate">
                                                    {p.name}
                                                  </button>
                                                ))}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                    }
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Import view ── */}
      {view === 'import' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-cream-100 flex items-center gap-2 shrink-0">
            <button onClick={() => { setView('list'); setImportStep('idle'); setError(''); setExistingMatch(null); setMergeChoice(null) }}
              className="text-sage-400 hover:text-sage-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 3L5 8l5 5"/></svg>
            </button>
            <h3 className="text-sm font-semibold text-sage-900">Import Spotify Playlist</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {(importStep === 'idle' || importStep === 'error') && (
              <>
                <div className="flex gap-3 mb-5">
                  <div className="w-6 h-6 rounded-full bg-sage-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-xs font-semibold text-sage-800 mb-1.5">Export from Spotify</p>
                    <a href="https://exportify.net" target="_blank" rel="noopener"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: '#1DB954' }}>
                      Open Exportify ↗
                    </a>
                    <p className="text-xs text-sage-400 mt-2">Log in with Spotify → click Export → save the CSV</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-sage-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-sage-800 mb-2">Upload the CSV</p>
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${isDragging ? 'border-sage-400 bg-sage-50' : 'border-cream-300 hover:border-sage-300 hover:bg-cream-50'}`}>
                      <svg className="w-6 h-6 mx-auto mb-2 text-sage-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                      </svg>
                      <p className="text-xs font-semibold text-sage-600">Drop CSV here or click to browse</p>
                    </div>
                    <input ref={fileRef} type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden"/>
                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                  </div>
                </div>
              </>
            )}

            {importStep === 'enriching' && (
              <div className="py-8 text-center">
                <div className="w-full bg-cream-200 rounded-full h-2 mb-3 overflow-hidden">
                  <div className="h-2 rounded-full bg-sage-500 transition-all duration-300" style={{ width: `${progress}%` }}/>
                </div>
                <p className="text-sm font-medium text-sage-700">{progressLabel}</p>
                <p className="text-xs text-sage-400 mt-1">{progress}% complete</p>
              </div>
            )}

            {importStep === 'review' && (
              <>
                {/* Merge detection banner */}
                {existingMatch && mergeChoice === null && (
                  <div className="mb-4 p-3 rounded-xl border border-amber-200 bg-amber-50">
                    <p className="text-xs font-semibold text-amber-800 mb-2">
                      "{existingMatch.name}" already exists ({existingMatch.track_count} tracks)
                    </p>
                    <p className="text-xs text-amber-700 mb-3">What would you like to do?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setMergeChoice('merge')}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold bg-sage-500 text-white hover:bg-sage-600 transition-colors">
                        Update existing
                        <span className="block text-xs font-normal opacity-75">Add new tracks only</span>
                      </button>
                      <button onClick={() => setMergeChoice('new')}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold bg-white border border-cream-300 text-sage-600 hover:border-sage-400 transition-colors">
                        Save as new
                        <span className="block text-xs font-normal opacity-75">Keep both versions</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Merge choice confirmed */}
                {existingMatch && mergeChoice !== null && (
                  <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-sage-50 border border-sage-200">
                    <span className="text-xs">
                      {mergeChoice === 'merge' ? '↑ Updating existing playlist' : '+ Saving as new playlist'}
                    </span>
                    <button onClick={() => setMergeChoice(null)} className="text-xs text-sage-400 hover:text-sage-600 ml-auto">Change</button>
                  </div>
                )}

                {/* Playlist name */}
                {(!existingMatch || mergeChoice === 'new') && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-sage-600 mb-1">Playlist Name</label>
                    <input value={importName} onChange={e => setImportName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-cream-50 border border-cream-200 rounded-xl text-sage-800 focus:outline-none focus:border-sage-300"/>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-sage-500">
                    <span className="font-semibold text-sage-700">{selected.size}</span> of {importTracks.length} tracks selected
                  </p>
                  <button onClick={() => {
                    const withBpm = importTracks.filter(t => t.bpm)
                    setSelected(selected.size === withBpm.length ? new Set() : new Set(withBpm.map(t => t.id)))
                  }} className="text-xs text-sage-400 hover:text-sage-600">
                    {selected.size === importTracks.filter(t => t.bpm).length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
                  {importTracks.map(t => {
                    const isSelected = selected.has(t.id)
                    const hasBpm = !!t.bpm
                    const mins = Math.floor(t.duration / 60)
                    const secs = String(t.duration % 60).padStart(2, '0')
                    return (
                      <div key={t.id}
                        onClick={() => hasBpm && setSelected(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${!hasBpm ? 'opacity-40 cursor-not-allowed' : isSelected ? 'bg-sage-50 border border-sage-200 cursor-pointer' : 'bg-cream-50 border border-transparent cursor-pointer hover:bg-cream-100'}`}>
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-sage-500 border-sage-500' : 'border-cream-300 bg-white'}`}>
                          {isSelected && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-sage-900 truncate">{t.title}</p>
                          <p className="text-xs text-sage-400 truncate">{t.artist}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {hasBpm ? <span className="text-xs font-semibold text-sage-600 bg-sage-100 px-1.5 py-0.5 rounded-full">{t.bpm}</span> : <span className="text-xs text-sage-300">No BPM</span>}
                          {t.duration > 0 && <span className="text-xs text-sage-300 tabular-nums">{mins}:{secs}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Show save button only after merge choice made (or no conflict) */}
                {(!existingMatch || mergeChoice !== null) && (
                  <button onClick={savePlaylist} disabled={selected.size === 0}
                    className="w-full py-2.5 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-40 bg-sage-500 hover:bg-sage-600">
                    {mergeChoice === 'merge' ? `Update playlist (${selected.size} tracks)` : `Save playlist (${selected.size} tracks)`}
                  </button>
                )}
              </>
            )}

            {importStep === 'saving' && (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-sage-200 border-t-sage-500 rounded-full animate-spin mx-auto mb-3"/>
                <p className="text-sm text-sage-600">Saving playlist...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
