'use client'
import { useState, useRef, useEffect } from 'react'
import { Song } from '@/lib/types'

interface SongSearchProps {
  onAdd: (song: Song) => void
  addedIds: Set<string | number>
  targetBpm?: number // hint for relevance sorting
}

export default function SongSearch({ onAdd, addedIds, targetBpm }: SongSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<NodeJS.Timeout>()

  async function search(q: string) {
    if (!q.trim()) { setResults([]); setSearched(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/bpm-search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      // Sort by BPM proximity to target if provided
      const sorted = targetBpm
        ? [...data].sort((a, b) => Math.abs(a.bpm - targetBpm) - Math.abs(b.bpm - targetBpm))
        : data
      setResults(sorted)
      setSearched(true)
    } catch (e) {
      setError('Search failed — try again')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (val.length >= 2) {
      debounceRef.current = setTimeout(() => search(val), 500)
    } else {
      setResults([])
      setSearched(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      clearTimeout(debounceRef.current)
      search(query)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
      {/* Search header */}
      <div className="px-4 py-3 border-b border-cream-100">
        <div className="flex items-center gap-2 mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4d7d4d" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="text-sm font-semibold text-sage-800">Search any song</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-sage-100 text-sage-600 font-medium">via GetSongBPM</span>
        </div>
        <p className="text-xs text-sage-400">Search millions of songs and get verified BPM data</p>
      </div>

      <div className="p-4">
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-300 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "Blinding Lights" or "The Weeknd"'
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-200 rounded-xl text-sage-800 placeholder-sage-300 focus:outline-none focus:border-sage-300 focus:bg-white transition-all"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin"/>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 mb-3">{error}</p>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {targetBpm && (
              <p className="text-xs text-sage-400 mb-2">
                Sorted by proximity to your target BPM ({targetBpm})
              </p>
            )}
            {results.map(song => {
              const isAdded = addedIds.has(song.id) || addedIds.has(String(song.id))
              const bpmDiff = targetBpm ? Math.abs(song.bpm - targetBpm) : null
              const bpmMatch = bpmDiff !== null && bpmDiff <= 8

              return (
                <div key={song.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isAdded ? 'bg-sage-50 border border-sage-200' : 'bg-cream-50 hover:bg-cream-100 border border-transparent'
                  }`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-sage-900 truncate leading-tight">
                      {song.title}
                    </p>
                    <p className="text-xs text-sage-400 truncate">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      bpmMatch
                        ? 'bg-sage-100 text-sage-700'
                        : 'bg-cream-100 text-sage-500'
                    }`}>
                      {song.bpm} BPM
                    </span>
                    {bpmMatch && (
                      <span className="text-xs text-sage-500">✓ match</span>
                    )}
                    {!isAdded ? (
                      <button onClick={() => onAdd(song)}
                        className="text-xs font-semibold px-3 py-1.5 bg-sage-500 hover:bg-sage-600 text-white rounded-lg transition-colors">
                        Add
                      </button>
                    ) : (
                      <span className="text-xs text-sage-400">Added ✓</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <div className="text-center py-6">
            <p className="text-sm text-sage-500">No results found</p>
            <p className="text-xs text-sage-400 mt-1">Try a different song title or artist</p>
          </div>
        )}

        {!searched && !loading && (
          <p className="text-xs text-sage-300 text-center py-2">
            Type to search · results show verified BPM
          </p>
        )}
      </div>

      {/* GetSongBPM credit */}
      <div className="px-4 py-2 border-t border-cream-100 bg-cream-50">
        <p className="text-xs text-sage-300 text-center">
          BPM data by{' '}
          <a href="https://getsongbpm.com" target="_blank" rel="noopener"
            className="text-sage-400 hover:text-sage-600 underline underline-offset-2 transition-colors">
            GetSongBPM
          </a>
        </p>
      </div>
    </div>
  )
}
