'use client'
import { useState, useEffect, useCallback } from 'react'
import { Song, PlaylistSong } from '@/lib/types'
import SongCard from '@/components/SongCard'
import Filters from '@/components/Filters'
import PlaylistPanel from '@/components/PlaylistPanel'

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([])
  const [allGenres, setAllGenres] = useState<string[]>([])
  const [playlist, setPlaylist] = useState<PlaylistSong[]>([])
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 200])
  const [lengthRange, setLengthRange] = useState<[number, number]>([60, 600])
  const [selectedTempo, setSelectedTempo] = useState('all')
  const [search, setSearch] = useState('')
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('access_token')
    if (token) { setSpotifyToken(token); window.history.replaceState({}, '', '/') }
  }, [])

  useEffect(() => {
    fetch('/api/songs').then(r => r.json()).then(data => {
      const genres = Array.from(new Set(data.map((s: Song) => s.genre))).filter(Boolean).sort() as string[]
      setAllGenres(genres)
    })
  }, [])

  const fetchSongs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedGenre !== 'All') params.set('genre', selectedGenre)
    params.set('minBpm', bpmRange[0].toString())
    params.set('maxBpm', bpmRange[1].toString())
    params.set('minLength', lengthRange[0].toString())
    if (selectedTempo !== 'all') params.set('tempo', selectedTempo)
    params.set('maxLength', lengthRange[1].toString())
    const res = await fetch(`/api/songs?${params}`)
    const data = await res.json()
    const filtered2 = selectedTempo !== 'all' ? data.filter((s: any) => {
      if (selectedTempo === 'slow') return s.bpm <= 80
      if (selectedTempo === 'medium') return s.bpm > 80 && s.bpm <= 100
      if (selectedTempo === 'fast') return s.bpm > 100 && s.bpm <= 120
      if (selectedTempo === 'high') return s.bpm > 120
      return true
    }) : filtered2
    const filtered = search.trim()
      ? filtered2.filter((s: Song) => s.title.toLowerCase().includes(search.toLowerCase()) || s.artist.toLowerCase().includes(search.toLowerCase()))
      : filtered2
    setSongs(filtered)
    setLoading(false)
  }, [selectedGenre, bpmRange, lengthRange, search])

  useEffect(() => { fetchSongs() }, [fetchSongs])

  function addToPlaylist(song: Song) { setPlaylist(prev => [...prev, { ...song, playlistId: `${song.id}-${Date.now()}` }]) }
  function removeFromPlaylist(playlistId: string) { setPlaylist(prev => prev.filter(s => s.playlistId !== playlistId)) }
  const playlistSongIds = new Set(playlist.map(s => s.id))

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f4f7f4 0%, #f9f6ed 50%, #f4f0e8 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #9fbf9f 0%, transparent 70%)' }}/>
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #d4835a 0%, transparent 70%)' }}/>
      </div>
      <div className="relative z-10">
        <header className="border-b border-cream-300 bg-cream-50/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sage-500 flex items-center justify-center text-white text-lg shadow-sm">🧘</div>
              <div>
                <h1 className="font-display text-xl font-bold text-sage-900 leading-none">Pilates Music Builder</h1>
                <p className="text-xs text-sage-400 mt-0.5">Craft your perfect soundtrack</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-300 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search songs or artists..." className="pl-9 pr-4 py-2 text-sm bg-white border border-cream-300 rounded-xl text-sage-800 placeholder-sage-300 focus:outline-none focus:border-sage-400 w-64"/>
              </div>
              <button onClick={() => setShowPlaylist(!showPlaylist)} className="lg:hidden relative flex items-center gap-2 px-4 py-2 bg-sage-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-sage-600">
                Playlist
                {playlist.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{playlist.length}</span>}
              </button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex gap-6">
            <aside className="hidden lg:block w-60 shrink-0">
              <div className="sticky top-24">
                <Filters genres={allGenres} selectedGenre={selectedGenre} bpmRange={bpmRange} lengthRange={lengthRange} onGenreChange={setSelectedGenre} onBpmChange={setBpmRange} onLengthChange={setLengthRange} selectedTempo={selectedTempo} onTempoChange={setSelectedTempo}/>
              </div>
            </aside>
            <main className="flex-1 min-w-0">
              <div className="lg:hidden mb-4">
                <details className="bg-cream-50 border border-cream-300 rounded-2xl">
                  <summary className="px-5 py-3 text-sm font-semibold text-sage-700 cursor-pointer">⚙️ Filters</summary>
                  <div className="px-5 pb-4"><Filters genres={allGenres} selectedGenre={selectedGenre} bpmRange={bpmRange} lengthRange={lengthRange} onGenreChange={setSelectedGenre} onBpmChange={setBpmRange} onLengthChange={setLengthRange} selectedTempo={selectedTempo} onTempoChange={setSelectedTempo}/></div>
                </details>
              </div>
              <p className="text-sm text-sage-500 mb-4"><span className="font-semibold text-sage-700">{songs.length}</span> songs found</p>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl"/>)}
                </div>
              ) : songs.length === 0 ? (
                <div className="text-center py-16"><div className="text-4xl mb-3">🔍</div><p className="text-sage-500 font-medium">No songs match your filters</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {songs.map(song => <SongCard key={song.id} song={song} isInPlaylist={playlistSongIds.has(song.id)} onAdd={addToPlaylist}/>)}
                </div>
              )}
            </main>
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24" style={{ height: 'calc(100vh - 7rem)' }}>
                <PlaylistPanel playlist={playlist} onReorder={setPlaylist} onRemove={removeFromPlaylist} spotifyToken={spotifyToken}/>
              </div>
            </aside>
          </div>
        </div>
      </div>
      {showPlaylist && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPlaylist(false)}/>
          <div className="relative mt-auto bg-cream-100 rounded-t-3xl shadow-xl" style={{ maxHeight: '80vh' }}>
            <div className="px-4 pb-6 pt-6" style={{ height: 'calc(80vh - 60px)' }}>
              <PlaylistPanel playlist={playlist} onReorder={setPlaylist} onRemove={removeFromPlaylist} spotifyToken={spotifyToken}/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
