'use client'
import { useState, useEffect, useCallback } from 'react'
import { useUser, UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { Song, PlaylistSong } from '@/lib/types'
import { Playlist } from '@/components/PlaylistPanel'
import SongCard from '@/components/SongCard'
import Filters from '@/components/Filters'
import RightPanel from '@/components/RightPanel'
import ClassBuilder from '@/components/ClassBuilder'
import BpmTapper from '@/components/BpmTapper'
import LandingPage from '@/components/LandingPage'

type Mode = 'browse' | 'class' | 'bpm'

export default function Home() {
  const { isSignedIn } = useUser()
  const [showLanding, setShowLanding] = useState(true)
  const [appVisible, setAppVisible] = useState(false)
  const [mode, setMode] = useState<Mode>('browse')
  const [songs, setSongs] = useState<Song[]>([])
  const [allGenres, setAllGenres] = useState<string[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: 'default', name: 'My Playlist', songs: [] }
  ])
  const [activePlaylistId, setActivePlaylistId] = useState('default')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 200])
  const [lengthRange, setLengthRange] = useState<[number, number]>([60, 600])
  const [selectedTempo, setSelectedTempo] = useState('all')
  const [search, setSearch] = useState('')
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [loading, setLoading] = useState(true)

  function handleEnterApp() {
    setShowLanding(false)
    setTimeout(() => setAppVisible(true), 50)
  }

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
    params.set('maxLength', lengthRange[1].toString())
    const res = await fetch(`/api/songs?${params}`)
    const data: Song[] = await res.json()
    let filtered = data
    if (selectedTempo !== 'all') {
      filtered = filtered.filter(s => {
        if (selectedTempo === 'slow') return s.bpm <= 80
        if (selectedTempo === 'medium') return s.bpm > 80 && s.bpm <= 100
        if (selectedTempo === 'fast') return s.bpm > 100 && s.bpm <= 120
        if (selectedTempo === 'high') return s.bpm > 120
        return true
      })
    }
    if (search.trim()) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.artist.toLowerCase().includes(search.toLowerCase())
      )
    }
    setSongs(filtered)
    setLoading(false)
  }, [selectedGenre, bpmRange, lengthRange, search, selectedTempo])

  useEffect(() => { fetchSongs() }, [fetchSongs])

  function addToPlaylist(song: Song) {
    setPlaylist(prev => {
      if (prev.some(s => String(s.id) === String(song.id))) return prev
      return [...prev, { ...song, playlistId: `${song.id}-${Date.now()}` }]
    })
  }

  function removeFromPlaylist(playlistId: string) {
    setPlaylist(prev => prev.filter(s => s.playlistId !== playlistId))
  }

  const playlistSongIds = new Set(playlist.map(s => String(s.id)))

  if (showLanding) return <LandingPage onEnter={handleEnterApp}/>

  return (
    <div className={`min-h-screen transition-opacity duration-500 ${appVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'linear-gradient(160deg, #f4f7f4 0%, #f9f6ed 60%, #f5f0e8 100%)' }}>
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '200px' }}/>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cream-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-4">
            <button onClick={() => setShowLanding(true)}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
              <div className="w-8 h-8 rounded-xl bg-sage-900 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M9 18V5l12-2v13M9 18c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zm12-2c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2z"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-semibold text-sage-900 text-sm leading-none">Pilates Music Builder</p>
                <p className="text-xs text-sage-400 mt-0.5">Craft your perfect soundtrack</p>
              </div>
            </button>

            <div className="flex-1 flex justify-center">
              <div className="inline-flex items-center bg-cream-100 rounded-xl p-1 gap-0.5 border border-cream-200">
                <button onClick={() => setMode('browse')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'browse' ? 'bg-white text-sage-900 shadow-sm font-semibold' : 'text-sage-500 hover:text-sage-700'}`}>
                  Song Browser
                </button>
                <button onClick={() => setMode('class')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'class' ? 'bg-white text-sage-900 shadow-sm font-semibold' : 'text-sage-500 hover:text-sage-700'}`}>
                  Class Builder
                </button>
                <button onClick={() => setMode('bpm')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'bpm' ? 'bg-white text-sage-900 shadow-sm font-semibold' : 'text-sage-500 hover:text-sage-700'}`}>
                  BPM Counter
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {mode === 'browse' && (
                <div className="relative hidden md:block">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-300 w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search library..."
                    className="pl-8 pr-4 py-2 text-sm bg-cream-50 border border-cream-200 rounded-xl text-sage-800 placeholder-sage-300 focus:outline-none focus:border-sage-300 focus:bg-white transition-all w-48"/>
                </div>
              )}
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-3.5 py-2 text-xs font-semibold bg-sage-900 text-white rounded-xl hover:bg-sage-800 transition-colors">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }}/>
              </SignedIn>
              {mode === 'browse' && (
                <button onClick={() => setShowPlaylist(!showPlaylist)}
                  className="lg:hidden relative flex items-center gap-1.5 px-3 py-2 bg-sage-900 text-white text-xs font-semibold rounded-xl">
                  Playlist
                  {playlist.length > 0 && (
                    <span className="w-4 h-4 bg-terracotta-400 text-white text-xs rounded-full flex items-center justify-center font-bold">{playlist.length}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {mode === 'bpm' ? (
            <BpmTapper/>
          ) : mode === 'class' ? (
            <ClassBuilder/>
          ) : (
            <div className="flex gap-6">
              {/* Filters */}
              <aside className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-20">
                  <Filters genres={allGenres} selectedGenre={selectedGenre} bpmRange={bpmRange}
                    lengthRange={lengthRange} selectedTempo={selectedTempo}
                    onGenreChange={setSelectedGenre} onBpmChange={setBpmRange}
                    onLengthChange={setLengthRange} onTempoChange={setSelectedTempo}/>
                </div>
              </aside>

              {/* Song grid */}
              <main className="flex-1 min-w-0">
                <div className="lg:hidden mb-4">
                  <details className="bg-white border border-cream-200 rounded-2xl">
                    <summary className="px-5 py-3 text-sm font-semibold text-sage-700 cursor-pointer">Filters</summary>
                    <div className="px-5 pb-4">
                      <Filters genres={allGenres} selectedGenre={selectedGenre} bpmRange={bpmRange}
                        lengthRange={lengthRange} selectedTempo={selectedTempo}
                        onGenreChange={setSelectedGenre} onBpmChange={setBpmRange}
                        onLengthChange={setLengthRange} onTempoChange={setSelectedTempo}/>
                    </div>
                  </details>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-semibold text-sage-900">{songs.length}</span>
                  <span className="text-sm text-sage-400">songs in library</span>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {[...Array(9)].map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl"/>)}
                  </div>
                ) : songs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9fbf9f" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    </div>
                    <p className="font-medium text-sage-600">No songs match your filters</p>
                    <p className="text-sm text-sage-400 mt-1">Try adjusting the BPM range or genre</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {songs.map(song => (
                      <SongCard key={song.id} song={song}
                        isInPlaylist={playlistSongIds.has(String(song.id))}
                        onAdd={addToPlaylist}/>
                    ))}
                  </div>
                )}
              </main>

              {/* Right panel — tabbed */}
              <aside className="hidden lg:flex w-72 shrink-0 flex-col sticky top-20" style={{ height: 'calc(100vh - 5.5rem)' }}>
                <RightPanel
                  playlist={playlist}
                  onReorder={setPlaylist}
                  onRemove={removeFromPlaylist}
                  onAdd={addToPlaylist}
                  addedIds={playlistSongIds}/>
              </aside>
            </div>
          )}
        </div>
      </div>

      {/* Mobile playlist drawer */}
      {showPlaylist && mode === 'browse' && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowPlaylist(false)}/>
          <div className="relative mt-auto bg-white rounded-t-3xl shadow-xl" style={{ height: '85vh' }}>
            <div className="p-4 h-full">
              <RightPanel
                playlist={playlist}
                onReorder={setPlaylist}
                onRemove={removeFromPlaylist}
                onAdd={addToPlaylist}
                addedIds={playlistSongIds}/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
