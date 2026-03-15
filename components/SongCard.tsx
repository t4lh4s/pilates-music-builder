'use client'
import { Song } from '@/lib/types'
import { formatDuration, bpmColor, bpmLabel } from '@/lib/utils'

interface SongCardProps {
  song: Song
  isInPlaylist: boolean
  onAdd: (song: Song) => void
}

export default function SongCard({ song, isInPlaylist, onAdd }: SongCardProps) {
  const dur = song.duration ?? song.length ?? 0
  const mins = Math.floor(dur / 60)
  const secs = String(dur % 60).padStart(2, '0')

  return (
    <div
      className={`song-card group relative rounded-2xl p-4 transition-all duration-200 cursor-default ${
        isInPlaylist
          ? 'bg-sage-50 border-2 border-sage-200'
          : 'bg-white border border-cream-300 hover:border-sage-200'
      }`}
    >
      {/* Added indicator */}
      {isInPlaylist && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Genre pill */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-cream-200 text-sage-600">
          {song.genre}
        </span>
        <span className="text-xs text-sage-300 font-mono tabular-nums">{mins}:{secs}</span>
      </div>

      {/* Title + Artist */}
      <div className="mb-3">
        <h3 className="font-display font-semibold text-sage-900 leading-snug text-sm mb-0.5 line-clamp-2">
          {song.title ?? song.name}
        </h3>
        <p className="text-xs text-sage-500 truncate">{song.artist}</p>
      </div>

      {/* BPM + tempo */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bpmColor(song.bpm)}`}>
          {song.bpm} BPM
        </span>
        <span className="text-xs text-sage-400">{bpmLabel(song.bpm)}</span>
      </div>

      {/* Add button — subtle, hover reveal */}
      {!isInPlaylist ? (
        <button
          onClick={() => onAdd(song)}
          className="song-add-btn w-full py-2 rounded-xl text-xs font-semibold bg-sage-500 text-white hover:bg-sage-600 transition-colors"
        >
          + Add to Class
        </button>
      ) : (
        <div className="w-full py-2 rounded-xl text-xs font-semibold text-sage-400 text-center">
          Added ✓
        </div>
      )}
    </div>
  )
}
