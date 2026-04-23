'use client'
import { useState } from 'react'
import { Song, PlaylistSong } from '@/lib/types'
import PlaylistPanel, { Playlist } from '@/components/PlaylistPanel'
import SpotifyImport from '@/components/SpotifyImport'
import SongSearch from '@/components/SongSearch'

interface Props {
  playlists: Playlist[]
  activePlaylistId: string
  onSetActive: (id: string) => void
  onCreatePlaylist: (name: string) => void
  onRenamePlaylist: (id: string, name: string) => void
  onDeletePlaylist: (id: string) => void
  onReorder: (id: string, songs: PlaylistSong[]) => void
  onRemove: (playlistId: string, songId: string) => void
  onAdd: (song: Song) => void
  addedIds: Set<string | number>
}

type Tab = 'playlist' | 'import' | 'search'

export default function RightPanel({
  playlists,
  activePlaylistId,
  onSetActive,
  onCreatePlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  onReorder,
  onRemove,
  onAdd,
  addedIds,
}: Props) {
  const [tab, setTab] = useState<Tab>('playlist')

  const activePlaylist = playlists.find(p => p.id === activePlaylistId)
  const totalTracks = playlists.reduce((a, p) => a + p.songs.length, 0)

  const tabs = [
    { id: 'playlist' as Tab, label: 'Playlist', badge: totalTracks > 0 ? totalTracks : null },
    { id: 'import' as Tab, label: 'Spotify', badge: null },
    { id: 'search' as Tab, label: 'Search', badge: null },
  ]

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-cream-200 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-cream-100 shrink-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all relative ${
              tab === t.id
                ? 'text-sage-900 border-b-2 border-sage-500 -mb-px'
                : 'text-sage-400 hover:text-sage-600'
            }`}>
            {t.label}
            {t.badge ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-sage-100 text-sage-600 text-xs font-bold">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'playlist' && (
          <PlaylistPanel
            playlists={playlists}
            activeId={activePlaylistId}
            onSetActive={onSetActive}
            onCreatePlaylist={onCreatePlaylist}
            onRenamePlaylist={onRenamePlaylist}
            onDeletePlaylist={onDeletePlaylist}
            onReorder={onReorder}
            onRemove={onRemove}
          />
        )}
        {tab === 'import' && (
          <div className="h-full overflow-y-auto">
            <SpotifyImport onAdd={onAdd} addedIds={addedIds} />
          </div>
        )}
        {tab === 'search' && (
          <div className="h-full overflow-y-auto">
            <SongSearch onAdd={onAdd} addedIds={addedIds} />
          </div>
        )}
      </div>
    </div>
  )
}
