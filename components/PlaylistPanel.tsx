'use client'
import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlaylistSong } from '@/lib/types'

function SortableItem({ song, index, onRemove }: { song: PlaylistSong; index: number; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song.playlistId })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const dur = song.duration ?? song.length ?? 0
  const mins = Math.floor(dur / 60)
  const secs = String(dur % 60).padStart(2, '0')

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-2.5 py-2.5 group border-b border-cream-100 last:border-0">
      <button {...attributes} {...listeners}
        className="text-cream-300 hover:text-sage-400 cursor-grab active:cursor-grabbing shrink-0 touch-none transition-colors">
        <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
          <circle cx="3" cy="4" r="1.5"/><circle cx="3" cy="8" r="1.5"/><circle cx="3" cy="12" r="1.5"/>
          <circle cx="9" cy="4" r="1.5"/><circle cx="9" cy="8" r="1.5"/><circle cx="9" cy="12" r="1.5"/>
        </svg>
      </button>
      <span className="text-xs text-cream-400 w-4 shrink-0 text-right tabular-nums">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-sage-900 truncate leading-tight">{song.title ?? song.name}</p>
        <p className="text-xs text-sage-400 truncate mt-0.5">{song.artist}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-sage-600 tabular-nums">{song.bpm}</span>
        <span className="text-xs text-sage-300 tabular-nums">{mins}:{secs}</span>
        <button onClick={() => onRemove(song.playlistId)}
          className="w-5 h-5 flex items-center justify-center rounded-full text-cream-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 ml-0.5">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l8 8M9 1L1 9"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function PlaylistPanel({ playlist, onReorder, onRemove }: {
  playlist: PlaylistSong[]
  onReorder: (songs: PlaylistSong[]) => void
  onRemove: (id: string) => void
}) {
  const [playlistName, setPlaylistName] = useState('My Pilates Playlist')
  const [copied, setCopied] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = playlist.findIndex(s => s.playlistId === active.id)
      const newIndex = playlist.findIndex(s => s.playlistId === over.id)
      onReorder(arrayMove(playlist, oldIndex, newIndex))
    }
  }

  const totalSeconds = playlist.reduce((acc, s) => acc + (s.duration ?? s.length ?? 0), 0)
  const totalMins = Math.floor(totalSeconds / 60)
  const totalSecs = String(totalSeconds % 60).padStart(2, '0')
  const avgBpm = playlist.length ? Math.round(playlist.reduce((acc, s) => acc + s.bpm, 0) / playlist.length) : 0

  function copyPlaylist() {
    const text = `${playlistName}\n\n` + playlist.map((s, i) => {
      const dur = s.duration ?? s.length ?? 0
      const m = Math.floor(dur / 60)
      const sec = String(dur % 60).padStart(2, '0')
      return `${i + 1}. ${s.title ?? s.name} — ${s.artist} (${s.bpm} BPM, ${m}:${sec})`
    }).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function clearPlaylist() {
    playlist.forEach(s => onRemove(s.playlistId))
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-cream-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold text-sage-900">Playlist</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sage-100 text-sage-600">
            {playlist.length} tracks
          </span>
        </div>
        <input
          value={playlistName}
          onChange={e => setPlaylistName(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-cream-50 border border-cream-200 rounded-xl text-sage-800 focus:outline-none focus:border-sage-300 focus:bg-white transition-colors"
          placeholder="Playlist name..."
        />
        {playlist.length > 0 && (
          <div className="flex items-center gap-3 mt-2.5 text-xs text-sage-400">
            <span className="font-medium text-sage-600">{totalMins}:{totalSecs}</span>
            <span>·</span>
            <span>avg {avgBpm} BPM</span>
            <button onClick={clearPlaylist}
              className="ml-auto text-cream-400 hover:text-red-400 transition-colors text-xs">
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Song list */}
      <div className="flex-1 overflow-y-auto px-5 py-2">
        {playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9fbf9f" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13M9 18c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-sage-500">No songs yet</p>
            <p className="text-xs text-sage-300 mt-1">Add songs from the library</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={playlist.map(s => s.playlistId)} strategy={verticalListSortingStrategy}>
              {playlist.map((song, i) => (
                <SortableItem key={song.playlistId} song={song} index={i} onRemove={onRemove}/>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer */}
      {playlist.length > 0 && (
        <div className="px-5 pb-5 pt-3 border-t border-cream-100">
          <button onClick={copyPlaylist}
            className="w-full py-2.5 bg-sage-900 hover:bg-sage-800 text-white font-medium text-sm rounded-xl transition-colors">
            {copied ? '✓ Copied!' : 'Copy Playlist'}
          </button>
        </div>
      )}
    </div>
  )
}
