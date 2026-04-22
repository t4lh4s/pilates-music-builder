'use client'
import { useState, useRef } from 'react'

interface ParsedTrack {
  id: string
  title: string
  artist: string
  duration: number // seconds
  bpm?: number
}

interface Props {
  onImport: (songs: any[]) => void
  addedIds: Set<string | number>
}

// Parse Exportify CSV — handles quoted fields with commas inside
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  function splitCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = splitCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim())
  return lines.slice(1).map(line => {
    const values = splitCSVLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').replace(/^"|"$/g, '').trim() })
    return row
  }).filter(row => Object.values(row).some(v => v))
}

// Find header value case-insensitively (Exportify column names vary slightly)
function findCol(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const found = Object.keys(row).find(k => k.toLowerCase().includes(key.toLowerCase()))
    if (found && row[found]) return row[found]
  }
  return ''
}

export default function SpotifyImport({ onImport, addedIds }: Props) {
  const [step, setStep] = useState<'idle' | 'enriching' | 'done' | 'error'>('idle')
  const [tracks, setTracks] = useState<ParsedTrack[]>([])
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [playlistName, setPlaylistName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file from Exportify')
      setStep('error')
      return
    }

    setError('')
    setStep('enriching')
    setProgress(0)
    setProgressLabel('Reading file...')

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      if (rows.length === 0) {
        throw new Error('No tracks found in CSV. Make sure you exported from Exportify.')
      }

      // Use filename (minus .csv) as playlist name
      setPlaylistName(file.name.replace('.csv', '').replace(/_/g, ' '))

      // Build track list from CSV
      const parsed: ParsedTrack[] = rows.map((row, i) => {
        const title = findCol(row, 'Track Name', 'track name', 'name', 'title')
        const artist = findCol(row, 'Artist Name', 'artist name', 'artist', 'artists')
        const durationMs = parseInt(findCol(row, 'Duration (ms)', 'duration_ms', 'duration') || '0')
        const tempoFromFile = parseFloat(findCol(row, 'Tempo', 'tempo', 'bpm') || '0')
        return {
          id: `csv-${i}-${title}-${artist}`.replace(/\s/g, '-'),
          title,
          artist,
          duration: Math.round(durationMs / 1000),
          bpm: tempoFromFile > 0 ? Math.round(tempoFromFile) : undefined,
        }
      }).filter(t => t.title && t.artist)

      if (parsed.length === 0) {
        throw new Error('Could not read tracks. Make sure the file is a valid Exportify CSV.')
      }

      // For tracks that already have Tempo from Exportify (some exports include it), use it
      // For ones without, look up via GetSongBPM
      const tracksNeedingBpm = parsed.filter(t => !t.bpm)
      const tracksWithBpm = parsed.filter(t => !!t.bpm)

      const enriched = [...parsed]

      for (let i = 0; i < tracksNeedingBpm.length; i++) {
        const track = tracksNeedingBpm[i]
        const pct = Math.round(((i + 1) / tracksNeedingBpm.length) * 100)
        setProgress(pct)
        setProgressLabel(`Looking up BPM ${i + 1} of ${tracksNeedingBpm.length}...`)

        try {
          const res = await fetch(`/api/bpm-search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`)
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const match = data.find((s: any) =>
              s.title?.toLowerCase() === track.title.toLowerCase() &&
              s.artist?.toLowerCase().includes(track.artist.toLowerCase().split(' ')[0])
            ) || data[0]
            if (match?.bpm) {
              const idx = enriched.findIndex(t => t.id === track.id)
              if (idx !== -1) enriched[idx] = { ...enriched[idx], bpm: match.bpm }
            }
          }
        } catch { /* skip, leave bpm undefined */ }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 120))
      }

      setTracks(enriched)
      setSelected(new Set(enriched.filter(t => t.bpm).map(t => t.id)))
      setStep('done')
    } catch (err: any) {
      setError(err.message || 'Failed to process file')
      setStep('error')
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function toggleTrack(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  function toggleAll() {
    const withBpm = tracks.filter(t => t.bpm)
    setSelected(selected.size === withBpm.length ? new Set() : new Set(withBpm.map(t => t.id)))
  }

  function handleImport() {
    const toImport = tracks
      .filter(t => selected.has(t.id) && t.bpm)
      .map(t => ({
        id: t.id,
        title: t.title,
        name: t.title,
        artist: t.artist,
        bpm: t.bpm!,
        duration: t.duration,
        genre: 'Unknown',
        source: 'spotify',
      }))
    onImport(toImport)
    setStep('idle')
    setTracks([])
    setSelected(new Set())
    if (fileRef.current) fileRef.current.value = ''
  }

  function reset() {
    setStep('idle')
    setTracks([])
    setError('')
    setProgress(0)
    setSelected(new Set())
    if (fileRef.current) fileRef.current.value = ''
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
          <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-auto"
            style={{ background: 'rgba(29,185,84,0.2)', color: '#1DB954' }}>
            via Exportify
          </span>
        </div>
        <p className="text-xs" style={{ color: '#7ab87a' }}>Export your Spotify playlist, then upload the CSV</p>
      </div>

      <div className="p-4">
        {/* Step 1 — instructions + upload */}
        {(step === 'idle' || step === 'error') && (
          <>
            {/* Step 1: Export */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-sage-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-sage-800 mb-1">Export your Spotify playlist</p>
                <a href="https://exportify.net" target="_blank" rel="noopener"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: '#1DB954', color: 'white' }}>
                  Open Exportify ↗
                </a>
                <p className="text-xs text-sage-400 mt-1.5">Log in with Spotify → click Export next to your playlist → save the CSV file</p>
              </div>
            </div>

            {/* Step 2: Upload */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sage-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-sage-800 mb-2">Upload the CSV file</p>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-sage-400 bg-sage-50' : 'border-cream-300 hover:border-sage-300 hover:bg-cream-50'
                  }`}>
                  <svg className="w-6 h-6 mx-auto mb-2 text-sage-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  <p className="text-xs font-semibold text-sage-600">Drop CSV here or click to browse</p>
                  <p className="text-xs text-sage-400 mt-0.5">Exportify .csv files only</p>
                </div>
                <input ref={fileRef} type="file" accept=".csv" onChange={onFileInput} className="hidden"/>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 mt-3">
                <span className="text-red-400 text-sm shrink-0">⚠</span>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
          </>
        )}

        {/* Enriching — progress */}
        {step === 'enriching' && (
          <div className="py-4">
            <div className="w-full bg-cream-200 rounded-full h-2 mb-3 overflow-hidden">
              <div className="h-2 rounded-full transition-all duration-300 bg-sage-500"
                style={{ width: `${progress}%` }}/>
            </div>
            <p className="text-sm font-medium text-sage-700 text-center">{progressLabel}</p>
            <p className="text-xs text-sage-400 text-center mt-1">{progress}% complete</p>
          </div>
        )}

        {/* Done — track checklist */}
        {step === 'done' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-sage-900 truncate">{playlistName}</p>
                <p className="text-xs text-sage-400">
                  {withBpm.length} of {tracks.length} tracks matched
                  {withoutBpm.length > 0 && ` · ${withoutBpm.length} no BPM found`}
                </p>
              </div>
              <button onClick={reset} className="text-xs text-sage-300 hover:text-sage-500 transition-colors shrink-0 ml-2">← Back</button>
            </div>

            {withBpm.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <button onClick={toggleAll} className="text-xs font-medium text-sage-500 hover:text-sage-700 transition-colors">
                  {selected.size === withBpm.length ? 'Deselect all' : 'Select all'}
                </button>
                <span className="text-xs text-sage-400">{selected.size} selected</span>
              </div>
            )}

            <div className="space-y-1 max-h-60 overflow-y-auto mb-3">
              {tracks.map(track => {
                const isSelected = selected.has(track.id)
                const hasBpm = !!track.bpm
                const mins = Math.floor(track.duration / 60)
                const secs = String(track.duration % 60).padStart(2, '0')
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
                      {hasBpm
                        ? <span className="text-xs font-semibold text-sage-600 bg-sage-100 px-1.5 py-0.5 rounded-full">{track.bpm} BPM</span>
                        : <span className="text-xs text-sage-300">No BPM</span>
                      }
                      {track.duration > 0 && (
                        <span className="text-xs text-sage-300 tabular-nums">{mins}:{secs}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <button onClick={handleImport} disabled={selected.size === 0}
              className="w-full py-2.5 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-40 bg-sage-500 hover:bg-sage-600">
              Add {selected.size} song{selected.size !== 1 ? 's' : ''} to playlist
            </button>
          </>
        )}
      </div>
    </div>
  )
}
