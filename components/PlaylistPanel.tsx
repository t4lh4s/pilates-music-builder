'use client'
import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlaylistSong } from '@/lib/types'

export interface Playlist {
  source?: string
  id: string
  name: string
  songs: PlaylistSong[]
}

function SortableItem({ song, index, onRemove }: { song: PlaylistSong; index: number; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song.playlistId })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const dur = song.duration ?? 0
  const m = Math.floor(dur / 60)
  const s = String(dur % 60).padStart(2, '0')
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 group py-2 px-2 rounded-xl hover:bg-cream-50 transition-colors">
      <button {...attributes} {...listeners} className="text-cream-300 hover:text-sage-400 cursor-grab active:cursor-grabbing shrink-0 touch-none">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="4" cy="3" r="1.5"/><circle cx="8" cy="3" r="1.5"/>
          <circle cx="4" cy="6" r="1.5"/><circle cx="8" cy="6" r="1.5"/>
          <circle cx="4" cy="9" r="1.5"/><circle cx="8" cy="9" r="1.5"/>
        </svg>
      </button>
      <span className="text-xs text-cream-400 w-4 shrink-0 text-right tabular-nums">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-sage-900 truncate leading-tight">{song.title ?? song.name}</p>
        <p className="text-xs text-sage-400 truncate">{song.artist}</p>
      </div>
      <span className="text-xs font-mono text-sage-500 shrink-0">{song.bpm}</span>
      <span className="text-xs text-sage-300 shrink-0 w-7 text-right">{m}:{s}</span>
      <button onClick={() => onRemove(song.playlistId)} className="shrink-0 opacity-0 group-hover:opacity-100 text-sage-200 hover:text-red-400 transition-all ml-1">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 2l10 10M12 2L2 12"/>
        </svg>
      </button>
    </div>
  )
}

export default function PlaylistPanel({
  playlists,
  activeId,
  onSetActive,
  onCreatePlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  onReorder,
  onRemove,
}: {
  playlists: Playlist[]
  activeId: string
  onSetActive: (id: string) => void
  onCreatePlaylist: (name: string) => void
  onRenamePlaylist: (id: string, name: string) => void
  onDeletePlaylist: (id: string) => void
  onReorder: (id: string, songs: PlaylistSong[]) => void
  onRemove: (playlistId: string, songId: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const active = playlists.find(p => p.id === activeId) ?? playlists[0]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active: a, over } = event
    if (over && a.id !== over.id && active) {
      const oldIndex = active.songs.findIndex(s => s.playlistId === a.id)
      const newIndex = active.songs.findIndex(s => s.playlistId === over.id)
      onReorder(active.id, arrayMove(active.songs, oldIndex, newIndex))
    }
  }

  function copyPlaylist() {
    if (!active) return
    const lines = [
      `${active.name}`,
      `${active.songs.length} tracks`,
      '',
      ...active.songs.map((s, i) => {
        const dur = s.duration ?? 0
        const m = Math.floor(dur / 60)
        const sec = String(dur % 60).padStart(2, '0')
        return `${i + 1}. ${s.title ?? s.name} — ${s.artist} (${s.bpm} BPM, ${m}:${sec})`
      })
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function startRename(p: Playlist) {
    setEditingId(p.id)
    setEditName(p.name)
  }

  function commitRename() {
    if (editingId && editName.trim()) {
      onRenamePlaylist(editingId, editName.trim())
    }
    setEditingId(null)
  }

  function commitCreate() {
    const name = newName.trim() || `Playlist ${playlists.length + 1}`
    onCreatePlaylist(name)
    setCreating(false)
    setNewName('')
  }

  const totalDur = active?.songs.reduce((a, s) => a + (s.duration ?? 0), 0) ?? 0
  const totalMins = Math.floor(totalDur / 60)
  const totalSecs = String(totalDur % 60).padStart(2, '0')

  return (
    <div className="flex flex-col h-full">

      {/* Playlist selector header */}
      <div className="shrink-0 px-3 pt-3 pb-2 border-b border-cream-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Playlists</span>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1 text-xs font-semibold text-sage-500 hover:text-sage-700 px-2 py-1 rounded-lg hover:bg-sage-50 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 2v10M2 7h10"/>
            </svg>
            New
          </button>
        </div>

        {/* New playlist input */}
        {creating && (
          <div className="flex items-center gap-2 mb-2">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitCreate(); if (e.key === 'Escape') setCreating(false) }}
              placeholder="Playlist name..."
              className="flex-1 text-xs px-2 py-1.5 border border-sage-300 rounded-lg focus:outline-none focus:border-sage-500 bg-white text-sage-800"
            />
            <button onClick={commitCreate} className="text-xs font-semibold text-white bg-sage-500 hover:bg-sage-600 px-2.5 py-1.5 rounded-lg transition-colors">Add</button>
            <button onClick={() => setCreating(false)} className="text-xs text-sage-400 hover:text-sage-600 px-1.5 py-1.5">✕</button>
          </div>
        )}

        {/* Playlist pills */}
        <div className="flex flex-wrap gap-1.5">
          {playlists.map(p => (
            <div key={p.id} className="flex items-center gap-0.5 group">
              {editingId === p.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null) }}
                  className="text-xs px-2 py-1 border border-sage-400 rounded-full focus:outline-none bg-white w-28"
                />
              ) : (
                <button
                  onClick={() => onSetActive(p.id)}
                  onDoubleClick={() => startRename(p)}
                  title="Double-click to rename"
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    p.id === activeId
                      ? 'bg-sage-500 text-white'
                      : 'bg-cream-100 text-sage-600 hover:bg-cream-200'
                  }`}
                >
                  {p.name}
                  {p.songs.length > 0 && (
                    <span className={`ml-1 text-xs ${p.id === activeId ? 'text-sage-200' : 'text-sage-400'}`}>
                      {p.songs.length}
                    </span>
                  )}
                </button>
              )}
              {/* Rename + delete icons — visible on hover */}
              {playlists.length > 1 && p.id === activeId && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => startRename(p)}
                    className="opacity-0 group-hover:opacity-100 text-sage-300 hover:text-sage-600 transition-all p-0.5"
                    title="Rename"
                  >
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 2l2 2-7 7H3v-2l7-7z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeletePlaylist(p.id)}
                    className="opacity-0 group-hover:opacity-100 text-sage-300 hover:text-red-400 transition-all p-0.5"
                    title="Delete playlist"
                  >
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 2l10 10M12 2L2 12"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active playlist header */}
      {active && (
        <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-cream-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-sage-700">{active.name}</span>
            <span className="text-xs text-sage-400">{active.songs.length} tracks</span>
            {active.songs.length > 0 && (
              <span className="text-xs text-sage-400">· {totalMins}:{totalSecs}</span>
            )}
          </div>
          {active.songs.length > 0 && (
            <button onClick={copyPlaylist} className="text-xs text-sage-400 hover:text-sage-700 transition-colors">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}

      {/* Song list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {!active || active.songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9caf9c" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-sage-500">No songs yet</p>
            <p className="text-xs text-sage-300 mt-1">Add songs from the library</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={active.songs.map(s => s.playlistId)} strategy={verticalListSortingStrategy}>
              {active.songs.map((song, index) => (
                <SortableItem
                  key={song.playlistId}
                  song={song}
                  index={index}
                  onRemove={(songId) => onRemove(active.id, songId)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
