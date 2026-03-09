'use client'
import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlaylistSong } from '@/lib/types'
import { formatDuration, totalPlaylistDuration } from '@/lib/utils'

interface PlaylistPanelProps {
  playlist: PlaylistSong[]
  onReorder: (newList: PlaylistSong[]) => void
  onRemove: (playlistId: string) => void
  spotifyToken: string | null
}

function SortableRow({ song, onRemove }: { song: PlaylistSong; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song.playlistId })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${isDragging ? 'dragging-row border-sage-300 z-50' : 'border-transparent hover:bg-cream-100'}`}>
      <button {...attributes} {...listeners} className="text-sage-300 hover:text-sage-500 cursor-grab active:cursor-grabbing p-1 -ml-1 touch-none">
        <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor"><circle cx="3" cy="3" r="1.5"/><circle cx="9" cy="3" r="1.5"/><circle cx="3" cy="8" r="1.5"/><circle cx="9" cy="8" r="1.5"/><circle cx="3" cy="13" r="1.5"/><circle cx="9" cy="13" r="1.5"/></svg>
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-sage-900 truncate leading-tight">{song.name}</p>
        <p className="text-xs text-sage-400 truncate">{song.artist}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-sage-500 font-mono">{song.bpm}</span>
        <span className="text-xs text-sage-400">{formatDuration(song.length)}</span>
        <button onClick={() => onRemove(song.playlistId)} className="text-sage-300 hover:text-red-400 transition-colors ml-1 p-0.5 rounded">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function PlaylistPanel({ playlist, onReorder, onRemove, spotifyToken }: PlaylistPanelProps) {
  const [playlistName, setPlaylistName] = useState('My Pilates Playlist')
  const [exportStatus, setExportStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [exportMessage, setExportMessage] = useState('')
  const [exportUrl, setExportUrl] = useState('')
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = playlist.findIndex(s => s.playlistId === active.id)
      const newIndex = playlist.findIndex(s => s.playlistId === over.id)
      onReorder(arrayMove(playlist, oldIndex, newIndex))
    }
  }

  async function handleExport() {
    if (!spotifyToken) { window.location.href = '/api/auth/callback'; return }
    setExportStatus('loading')
    try {
      const res = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: spotifyToken, playlist_name: playlistName, track_uris: playlist.map(s => s.spotify_uri) }),
      })
      const data = await res.json()
      if (data.success) { setExportStatus('success'); setExportMessage('Playlist created!'); setExportUrl(data.playlist_url) }
      else { setExportStatus('error'); setExportMessage(data.error || 'Export failed') }
    } catch { setExportStatus('error'); setExportMessage('Network error.') }
  }

  const totalDuration = totalPlaylistDuration(playlist.map(s => s.length))
  const avgBpm = playlist.length ? Math.round(playlist.reduce((a, s) => a + s.bpm, 0) / playlist.length) : 0

  return (
    <div className="bg-cream-50 border border-cream-300 rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-cream-300">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg font-semibold text-sage-800">Your Playlist</h2>
          <span className="text-xs bg-sage-100 text-sage-600 px-2 py-0.5 rounded-full font-medium">{playlist.length} tracks</span>
        </div>
        {playlist.length > 0 && <div className="flex gap-3 text-xs text-sage-400 mt-1"><span>⏱ {totalDuration}</span><span>·</span><span>♩ avg {avgBpm} BPM</span></div>}
        <div className="mt-2">
          {spotifyToken ? <span className="text-xs text-green-600 font-medium">✓ Connected to Spotify</span> : <button onClick={() => window.location.href='/api/auth/callback'} className="text-xs text-sage-400 hover:text-sage-600 underline">Connect Spotify to export</button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="text-3xl mb-2">🎵</div>
            <p className="text-sm text-sage-400">Add songs from the library</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={playlist.map(s => s.playlistId)} strategy={verticalListSortingStrategy}>
              {playlist.map(song => <SortableRow key={song.playlistId} song={song} onRemove={onRemove} />)}
            </SortableContext>
          </DndContext>
        )}
      </div>
      {playlist.length > 0 && (
        <div className="p-4 border-t border-cream-300 space-y-3">
          <input type="text" value={playlistName} onChange={e => setPlaylistName(e.target.value)} className="w-full text-sm px-3 py-2 bg-white border border-cream-300 rounded-xl text-sage-800 focus:outline-none focus:border-sage-400" />
          <button onClick={handleExport} disabled={exportStatus==='loading'} className="w-full py-2.5 bg-[#1DB954] hover:bg-[#1aa34a] disabled:opacity-60 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
            {exportStatus==='loading' ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"/>Exporting...</> : <>{spotifyToken ? 'Export to Spotify' : 'Login with Spotify'}</>}
          </button>
          {exportStatus==='success' && <div className="text-xs text-sage-600 bg-sage-50 border border-sage-200 rounded-xl p-2.5 text-center">✓ {exportMessage}{exportUrl && <a href={exportUrl} target="_blank" rel="noopener noreferrer" className="block mt-1 underline">Open in Spotify →</a>}</div>}
          {exportStatus==='error' && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5 text-center">✗ {exportMessage}</div>}
        </div>
      )}
    </div>
  )
}
