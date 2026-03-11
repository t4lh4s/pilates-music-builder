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
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-2.5 px-1 group border-b border-cream-100 last:border-0">
      <button {...attributes} {...listeners} className="text-sage-300 hover:text-sage-500 cursor-grab active:cursor-grabbing shrink-0 touch-none">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4" cy="3" r="1.2"/><circle cx="4" cy="7" r="1.2"/><circle cx="4" cy="11" r="1.2"/>
          <circle cx="9" cy="3" r="1.2"/><circle cx="9" cy="7" r="1.2"/><circle cx="9" cy="11" r="1.2"/>
        </svg>
      </button>
      <span className="text-xs text-sage-300 w-4 shrink-0">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-sage-800 truncate leading-tight">{song.title ?? song.name}</p>
        <p className="text-xs text-sage-400 truncate">{song.artist}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-mono text-sage-500">{song.bpm}</span>
        <span className="text-xs text-sage-300">·</span>
        <span className="text-xs text-sage-400">{mins}:{secs}</span>
        <button onClick={() => onRemove(song.playlistId)} className="text-sage-200 hover:text-red-400 transition-colors ml-1 opacity-0 group-hover:opacity-100">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 2l10 10M12 2L2 12"/>
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
    <div className="h-full flex flex-col bg-cream-50 rounded-3xl border border-cream-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-cream-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold text-sage-900">Your Playlist</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-sage-100 text-sage-600 rounded-full">
            {playlist.length} tracks
          </span>
        </div>
        <input
          value={playlistName}
          onChange={e => setPlaylistName(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-cream-300 rounded-xl text-sage-800 focus:outline-none focus:border-sage-400 mb-2"
          placeholder="Playlist name..."
        />
        {playlist.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-sage-500">
            <span>⏱ {totalMins}m {totalSecs}s</span>
            <span>·</span>
            <span>♩ avg {avgBpm} BPM</span>
            <button onClick={clearPlaylist} className="ml-auto text-xs text-sage-300 hover:text-red-400 transition-colors">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Song list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-3xl mb-2">🎵</div>
            <p className="text-sm font-medium text-sage-500">Your playlist is empty</p>
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

      {/* Footer actions */}
      {playlist.length > 0 && (
        <div className="px-4 pb-5 pt-3 border-t border-cream-200">
          <button
            onClick={copyPlaylist}
            className="w-full py-2.5 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            {copied ? '✓ Copied!' : '📋 Copy Playlist'}
          </button>
        </div>
      )}
    </div>
  )
}
