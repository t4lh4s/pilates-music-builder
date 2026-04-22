'use client'
import { useState } from 'react'
import { Song, PlaylistSong } from '@/lib/types'
import PlaylistPanel from '@/components/PlaylistPanel'
import SpotifyImport from '@/components/SpotifyImport'
import SongSearch from '@/components/SongSearch'

interface Props {
  playlist: PlaylistSong[]
  onReorder: (songs: PlaylistSong[]) => void
  onRemove: (id: string) => void
  onAdd: (song: Song) => void
  addedIds: Set<string | number>
}

type Tab = 'playlist' | 'import' | 'search'

export default function RightPanel({ playlist, onReorder, onRemove, onAdd, addedIds }: Props) {
  const [tab, setTab] = useState<Tab>('playlist')

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'playlist', label: 'Playlist', badge: playlist.length || undefined },
    { id: 'import', label: 'Spotify' },
    { id: 'search', label: 'Search' },
  ]

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
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

      {/* Tab content — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        {tab === 'playlist' && (
          <div className="h-full overflow-y-auto">
            <PlaylistPanel playlist={playlist} onReorder={onReorder} onRemove={onRemove}/>
          </div>
        )}
        {tab === 'import' && (
          <div className="h-full overflow-y-auto">
            <SpotifyImport onAdd={onAdd} addedIds={addedIds}/>
          </div>
        )}
        {tab === 'search' && (
          <div className="h-full overflow-y-auto">
            <SongSearch onAdd={onAdd} addedIds={addedIds}/>
          </div>
        )}
      </div>
    </div>
  )
}
