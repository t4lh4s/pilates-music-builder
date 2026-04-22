'use client'
import { Song } from '@/lib/types'
import SaveToPlaylistButton from '@/components/SaveToPlaylistButton'

interface SongCardProps {
  song: Song
  isInPlaylist: boolean
  onAdd: (song: Song) => void
}

function bpmColor(bpm: number) {
  if (bpm <= 80) return 'bg-blue-50 text-blue-600'
  if (bpm <= 100) return 'bg-sage-100 text-sage-700'
  if (bpm <= 120) return 'bg-amber-50 text-amber-600'
  return 'bg-red-50 text-red-600'
}

function bpmLabel(bpm: number) {
  if (bpm <= 80) return 'Slow'
  if (bpm <= 100) return 'Medium'
  if (bpm <= 120) return 'Fast'
  return 'High Energy'
}

export default function SongCard({ song, isInPlaylist, onAdd }: SongCardProps) {
  const dur = (song as any).duration ?? (song as any).length ?? 0
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

      {/* Genre pill + duration + save button */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-cream-200 text-sage-600">
          {(song as any).genre ?? 'Unknown'}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-sage-300 font-mono tabular-nums">{mins}:{secs}</span>
          {!isInPlaylist && (
            <SaveToPlaylistButton song={{
              title: (song as any).title ?? (song as any).name ?? '',
              artist: song.artist,
              bpm: song.bpm,
              duration: dur,
              genre: (song as any).genre,
            }}/>
          )}
        </div>
      </div>

      {/* Title + Artist */}
      <div className="mb-3">
        <h3 className="font-display font-semibold text-sage-900 leading-snug text-sm mb-0.5 line-clamp-2">
          {(song as any).title ?? (song as any).name}
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

      {/* Source links */}
      <div className="flex items-center gap-2 mb-3">
        <a
          href={`https://open.spotify.com/search/${encodeURIComponent(`${(song as any).title ?? (song as any).name} ${song.artist}`)}`}
          target="_blank" rel="noopener"
          onClick={e => e.stopPropagation()}
          title="Find on Spotify"
          className="flex items-center gap-1 text-xs text-sage-400 hover:text-[#1DB954] transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Spotify
        </a>
        <span className="text-cream-300">·</span>
        <a
          href={`https://music.apple.com/search?term=${encodeURIComponent(`${(song as any).title ?? (song as any).name} ${song.artist}`)}`}
          target="_blank" rel="noopener"
          onClick={e => e.stopPropagation()}
          title="Find on Apple Music"
          className="flex items-center gap-1 text-xs text-sage-400 hover:text-[#fc3c44] transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.064-2.31-2.24-2.99a6.21 6.21 0 00-2.19-.77c-.6-.12-1.2-.17-1.81-.17H6.49c-.61 0-1.21.05-1.81.17a6.09 6.09 0 00-2.19.77C1.31 1.624.564 2.624.247 3.934a9.23 9.23 0 00-.24 2.19C0 6.604 0 7.054 0 7.514v9c0 .46 0 .91.007 1.38.024.73.077 1.46.24 2.19.317 1.31 1.064 2.31 2.24 2.99a6.09 6.09 0 002.19.77c.6.12 1.2.17 1.81.17h11.014c.61 0 1.21-.05 1.81-.17a6.21 6.21 0 002.19-.77c1.176-.68 1.923-1.68 2.24-2.99.163-.73.216-1.46.24-2.19.007-.47.007-.92.007-1.38v-9c0-.46 0-.91-.007-1.39zm-6.52 3.83l-6.83 3.95a.49.49 0 01-.73-.43V7.034c0-.35.37-.57.68-.42l6.83 3.52a.49.49 0 01.05.82z"/>
          </svg>
          Apple Music
        </a>
      </div>

      {/* Add button */}
      {!isInPlaylist ? (
        <button
          onClick={() => onAdd(song)}
          className="song-add-btn w-full py-2 rounded-xl text-xs font-semibold bg-sage-500 text-white hover:bg-sage-600 transition-colors">
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
