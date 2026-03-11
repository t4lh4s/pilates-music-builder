'use client'
import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlaylistSong } from '@/lib/types'

function SortableItem({ song, onRemove }: { song: PlaylistSong; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song.playlistId })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const dur = song.duration ?? song.length ?? 0
  const mins = Math.floor(dur / 60)
  const secs = String(dur % 60).padStart(2, '0')
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 py-2.5 px-1 group">
      <button {...attributes} {...listeners} className="text-sage-300 hover:text-sage-500 cursor-grab active:cursor-grabbing shrink-0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="4" cy="3" r="1.2"/><circle cx="4" cy="7" r="1.2"/><circle cx="4" cy="11" r="1.2"/><circle cx="9" cy="3" r="1.2"/><circle cx="9" cy="7" r="1.2"/><circle cx="9" cy="11" r="1.2"/></svg>
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-sage-800 truncate">{song.title ?? song.name}</p>
        <p className="text-xs text-sage-400 truncate">{song.artist}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-sage-400 font-mono">{song.bpm}</span>
        <span className="text-xs text-sage-300">{mins}:{secs}</span>
        <button onClick={() => onRemove(song.playlistId)} className="text-sage-300 hover:text-red-400 transition-colors ml-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l10 10M12 2L2 12"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function PlaylistPanel({ playlist, onReorder, onRemove, spotifyToken }: {
  playlist: PlaylistSong[]; onReorder: (songs: PlaylistSong[]) => void; onRemove: (id: string) => void; spotifyToken: string | null
}) {
  const [playlistName, setPlaylistName] = useState('My Pilates Playlist')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = playlist.findIndex(s => s.playlistId === active.id)
      const newIndex = playlist.findIndex(s => s.playlistId === over.id)
      onReorder(arrayMove(playlist, oldIndex, newIndex))
    }
  }

  async function exportToSpotify() {
    if (!spotifyToken) {
      window.location.href = '/api/auth/callback'
      return
    }
    if (playlist.length === 0) { setMessage('Add some songs first!'); setStatus('error'); return }
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: spotifyToken, playlist_name: playlistName, track_uris: playlist.map(s => s.spotify_uri).filter(Boolean) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setStatus('success')
      setMessage('Playlist created!')
      if (data.playlist_url) window.open(data.playlist_url, '_blank')
    } catch {
      setStatus('success')
      setMessage('Opening songs in Spotify...')
      playlist.forEach((song, i) => {
        setTimeout(() => {
          const query = encodeURIComponent(`${song.title ?? song.name} ${song.artist}`)
          window.open(`https://open.spotify.com/search/${query}`, '_blank')
        }, i * 500)
      })
    }
  }

  const totalSeconds = playlist.reduce((acc, s) => acc + (s.duration ?? s.length ?? 0), 0)
  const mins = Math.floor(totalSeconds / 60)
  const secs = String(totalSeconds % 60).padStart(2, '0')
  const avgBpm = playlist.length ? Math.round(playlist.reduce((acc, s) => acc + s.bpm, 0) / playlist.length) : 0

  return (
    <div className="h-full flex flex-col bg-cream-50 rounded-3xl border border-cream-200 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-cream-200">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg font-bold text-sage-900">Your Playlist</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-sage-100 text-sage-600 rounded-full">{playlist.length} tracks</span>
        </div>
        {playlist.length > 0 && (
          <p className="text-xs text-sage-400 flex items-center gap-3">
            <span>⏱ {mins}m {secs}s</span>
            <span>·</span>
            <span>♩ avg {avgBpm} BPM</span>
          </p>
        )}
        {spotifyToken && <p className="text-xs text-green-600 font-medium mt-1.5">✓ Connected to Spotify</p>}
        {!spotifyToken && (
          <button onClick={() => window.location.href = '/api/auth/callback'} className="text-xs text-sage-400 underline mt-1.5 hover:text-sage-600">
            Connect Spotify to export
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-cream-100">
        {playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-3xl mb-2">🎵</div>
            <p className="text-sm text-sage-400">Add songs from the library</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={playlist.map(s => s.playlistId)} strategy={verticalListSortingStrategy}>
              {playlist.map(song => <SortableItem key={song.playlistId} song={song} onRemove={onRemove}/>)}
            </SortableContext>
          </DndContext>
        )}
      </div>
      {playlist.length > 0 && (
        <div className="px-4 pb-5 pt-3 border-t border-cream-200 space-y-2">
          <input value={playlistName} onChange={e => setPlaylistName(e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white border border-cream-300 rounded-xl text-sage-800 focus:outline-none focus:border-sage-400"/>
          <button onClick={exportToSpotify} disabled={status === 'loading'} className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">
            {status === 'loading' ? 'Exporting...' : '⬆ Export to Spotify'}
          </button>
          <button onClick={() => {
            const searchLinks = playlist.map(s => `https://open.spotify.com/search/${encodeURIComponent((s.title ?? s.name ?? '') + ' ' + s.artist)}`).join('\n')
            navigator.clipboard.writeText(searchLinks).then(() => { setMessage('Search links copied!'); setStatus('success') })
          }} className="w-full py-2.5 bg-white hover:bg-sage-50 border border-sage-200 text-sage-700 font-semibold text-sm rounded-xl transition-colors">
            📋 Copy Spotify Search Links
          </button>
          {status === 'success' && <p className="text-xs text-green-600 text-center font-medium">✓ {message}</p>}
          {status === 'error' && <p className="text-xs text-red-500 text-center">✗ {message}</p>}
        </div>
      )}
    </div>
  )
}
