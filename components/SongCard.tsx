'use client'
import { Song } from '@/lib/types'
import { formatDuration, bpmColor, bpmLabel } from '@/lib/utils'

interface SongCardProps {
  song: Song
  isInPlaylist: boolean
  onAdd: (song: Song) => void
}

export default function SongCard({ song, isInPlaylist, onAdd }: SongCardProps) {
  return (
    <div className="group relative bg-cream-50 border border-cream-300 rounded-2xl p-4 hover:border-sage-300 hover:shadow-md transition-all duration-200 animate-fade-in">
      {/* Genre pill */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-semibold text-sage-900 truncate leading-tight">{song.title}</h3>
          <p className="text-xs text-sage-500 mt-0.5 truncate">{song.artist}</p>
        </div>
        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-sage-100 text-sage-600">
          {song.genre}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bpmColor(song.bpm)}`}>
          {song.bpm} BPM
        </span>
        <span className="text-xs text-sage-400">·</span>
        <span className="text-xs text-sage-500">{bpmLabel(song.bpm)}</span>
        <span className="text-xs text-sage-400 ml-auto">{formatDuration(song.duration)}</span>
      </div>

      {/* Add button */}
      <button
        onClick={() => onAdd(song)}
        disabled={isInPlaylist}
        className={`w-full py-2 rounded-xl text-xs font-semibold transition-all duration-150
          ${isInPlaylist
            ? 'bg-sage-100 text-sage-400 cursor-not-allowed'
            : 'bg-sage-500 text-white hover:bg-sage-600 active:scale-95 shadow-sm hover:shadow'
          }`}
      >
        {isInPlaylist ? '✓ Added' : '+ Add to Playlist'}
      </button>
    </div>
  )
}
