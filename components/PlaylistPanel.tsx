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

function SortableItem({
  song, index, onRemove, copyTargets, onCopy, isSpotify,
}: {
  song: PlaylistSong
  index: number
  onRemove: (id: string) => void
  copyTargets: Playlist[]
  onCopy: (song: PlaylistSong, targetId: string) => void
  isSpotify: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song.playlistId })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const dur = song.duration ?? 0
  const m = Math.floor(dur / 60)
  const s = String(dur % 60).padStart(2, '0')
  const [showCopyMenu, setShowCopyMenu] = useState(false)

  return (
    <div ref={setNodeRef} style={style} className="relative flex items-center gap-2 group py-2 px-2 rounded-xl hover:bg-cream-50 transition-colors">
      {!isSpotify && (
        <button {...attributes} {...listeners} className="text-cream-300 hover:text-sage-400 cursor-grab active:cursor-grabbing shrink-0 touch-none">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="4" cy="3" r="1.5"/><circle cx="8" cy="3" r="1.5"/>
            <circle cx="4" cy="6" r="1.5"/><circle cx="8" cy="6" r="1.5"/>
            <circle cx="4" cy="9" r="1.5"/><circle cx="8" cy="9" r="1.5"/>
          </svg>
        </button>
      )}
      {isSpotify && <div className="w-4 shrink-0"/>}
      <span className="text-xs text-cream-400 w-4 shrink-0 text-right tabular-nums">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-sage-900 truncate leading-tight">{song.title ?? song.name}</p>
        <p className="text-xs text-sage-400 truncate">{song.artist}</p>
      </div>
      <span className="text-xs font-mono text-sage-500 shrink-0">{song.bpm || '—'}</span>
      <span className="text-xs text-sage-300 shrink-0 w-7 text-right">{m}:{s}</span>

      {/* Copy to playlist button — shown for Spotify playlists */}
      {isSpotify && copyTargets.length > 0 && (
        <div className="relative shrink-0">
          <button
            onClick={() => setShowCopyMenu(v => !v)}
            className="opacity-0 group-hover:opacity-100 text-sage-300 hover:text-sage-600 transition-all p-0.5"
            title="Add to playlist"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 2v10M2 7h10"/>
            </svg>
          </button>
          {showCopyMenu && (
            <div className="absolute right-0 top-6 z-50 bg-white border border-cream-200 rounded-xl shadow-lg py-1 min-w-36">
              <p className="text-xs text-sage-400 px-3 py-1 font-semibold uppercase tracking-wide">Add to...</p>
              {copyTargets.map(t => (
                <button
                  key={t.id}
                  onClick={() => { onCopy(song, t.id); setShowCopyMenu(false) }}
                  className="w-full text-left text-xs text-sage-700 hover:bg-cream-50 px-3 py-1.5 truncate"
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Remove button — shown for manual playlists */}
      {!isSpotify && (
        <button onClick={() => onRemove(song.playlistId)} className="shrink-0 opacity-0 group-hover:opacity-100 text-sage-200 hover:text-red-400 transition-all ml-1">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 2l10 10M12 2L2 12"/>
          </svg>
        </button>
      )}
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
  onCopyToPlaylist,
}: {
  playlists: Playlist[]
  activeId: string
  onSetActive: (id: string) => void
  onCreatePlaylist: (name: string) => void
  onRenamePlaylist: (id: string, name: string) => void
  onDeletePlaylist: (id: string) => void
  onReorder: (id: string, songs: PlaylistSong[]) => void
  onRemove: (playlistId: string, songId: string) => void
  onCopyToPlaylist: (song: PlaylistSong, targetPlaylistId: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const active = playlists.find(p => p.id === activeId) ?? playlists[0]
  const isSpotify = active?.source === 'spotify'

  // Manual playlists the user can copy songs into
  const manualPlaylists = playlists.filter(p => p.source !== 'spotify')

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
      active.name,
      active.songs.length + ' tracks',
      '',
      ...active.songs.map((s, i) => {
        const dur = s.duration ?? 0
        const m = Math.floor(dur / 60)
        const sec = String(dur % 60).padStart(2, '0')
        return (i + 1) + '. ' + (s.title ?? s.name) + ' — ' + s.artist + ' (' + (s.bpm || '?') + ' BPM, ' + m + ':' + sec + ')'
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
    if (editingId && editName.trim()) onRenamePlaylist(editingId, editName.trim())
    setEditingId(null)
  }

  function commitCreate() {
    const name = newName.trim() || ('Playlist ' + (playlists.length + 1))
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
          <button onClick={() => setCreating(true)} className="flex items-center gap-1 text-xs font-semibold text-sage-500 hover:text-sage-700 px-2 py-1 rounded-lg hover:bg-sage-50 transition-all">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 2v10M2 7h10"/></svg>
            New
          </button>
        </div>

        {creating && (
          <div className="flex items-center gap-2 mb-2">
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitCreate(); if (e.key === 'Escape') setCreating(false) }}
              placeholder="Playlist name..."
              className="flex-1 text-xs px-2 py-1.5 border border-sage-300 rounded-lg focus:outline-none focus:border-sage-500 bg-white text-sage-800"/>
            <button onClick={commitCreate} className="text-xs font-semibold text-white bg-sage-500 hover:bg-sage-600 px-2.5 py-1.5 rounded-lg transition-colors">Add</button>
            <button onClick={() => setCreating(false)} className="text-xs text-sage-400 hover:text-sage-600 px-1">✕</button>
          </div>
        )}

        {/* Playlist pills */}
        <div className="flex flex-wrap gap-1.5">
          {playlists.map(p => (
            <div key={p.id} className="flex items-center gap-0.5 group">
              {editingId === p.id ? (
                <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null) }}
                  className="text-xs px-2 py-1 border border-sage-400 rounded-full focus:outline-none bg-white w-28"/>
              ) : (
                <button
                  onClick={() => onSetActive(p.id)}
                  onDoubleClick={() => p.source !== 'spotify' ? startRename(p) : null}
                  title={p.source !== 'spotify' ? 'Double-click to rename' : p.name}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${p.id === activeId ? 'bg-sage-500 text-white' : 'bg-cream-100 text-sage-600 hover:bg-cream-200'}`}
                >
                  {p.name}
                  {p.songs.length > 0 && (
                    <span className={`ml-1 text-xs ${p.id === activeId ? 'text-sage-200' : 'text-sage-400'}`}>{p.songs.length}</span>
                  )}
                </button>
              )}
              {/* Rename + delete — only for manual playlists when active */}
              {p.source !== 'spotify' && playlists.filter(x => x.source !== 'spotify').length > 1 && p.id === activeId && (
                <div className="flex items-center gap-0.5">
                  <button onClick={() => startRename(p)} className="opacity-0 group-hover:opacity-100 text-sage-300 hover:text-sage-600 transition-all p-0.5" title="Rename">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2l2 2-7 7H3v-2l7-7z"/></svg>
                  </button>
                  <button onClick={() => onDeletePlaylist(p.id)} className="opacity-0 group-hover:opacity-100 text-sage-300 hover:text-red-400 transition-all p-0.5" title="Delete">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l10 10M12 2L2 12"/></svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active playlist sub-header */}
      {active && (
        <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-cream-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-sage-700">{active.name}</span>
            <span className="text-xs text-sage-400">{active.songs.length} tracks</span>
            {active.songs.length > 0 && <span className="text-xs text-sage-400">· {totalMins}:{totalSecs}</span>}
            {isSpotify && (
              <span className="text-xs text-sage-300 italic">Imported · hover songs to copy</span>
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
            <p className="text-xs text-sage-300 mt-1">
              {isSpotify ? 'This playlist has no tracks' : 'Add songs from the library'}
            </p>
          </div>
        ) : isSpotify ? (
          // Spotify playlists: simple list with copy-to button, no drag
          <div>
            {active.songs.map((song, index) => (
              <SortableItem
                key={song.playlistId}
                song={song}
                index={index}
                onRemove={() => {}}
                copyTargets={manualPlaylists}
                onCopy={onCopyToPlaylist}
                isSpotify={true}
              />
            ))}
          </div>
        ) : (
          // Manual playlists: drag to reorder, remove button
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={active.songs.map(s => s.playlistId)} strategy={verticalListSortingStrategy}>
              {active.songs.map((song, index) => (
                <SortableItem
                  key={song.playlistId}
                  song={song}
                  index={index}
                  onRemove={(songId) => onRemove(active.id, songId)}
                  copyTargets={[]}
                  onCopy={() => {}}
                  isSpotify={false}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
