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
import HelpPage from '@/components/HelpPage'
import FeedbackModal from '@/components/FeedbackModal'

type Mode = 'browse' | 'class' | 'bpm' | 'help'

export default function Home() {
  const { isSignedIn } = useUser()
  const [showLanding, setShowLanding] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [appVisible, setAppVisible] = useState(false)
  const [mode, setMode] = useState<Mode>('browse')
  const [songs, setSongs] = useState<Song[]>([])
  const [allGenres, setAllGenres] = useState<string[]>([])
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 200])
  const [lengthRange, setLengthRange] = useState<[number, number]>([60, 600])
  const [selectedTempo, setSelectedTempo] = useState('all')
  const [search, setSearch] = useState('')
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: 'default', name: 'My Playlist', songs: [] }
  ])
  const [activePlaylistId, setActivePlaylistId] = useState('default')

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

  useEffect(() => {
    if (!isSignedIn) return
    async function loadSpotifyPlaylists() {
      try {
        const res = await fetch('/api/spotify-playlists')
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) return
        const spotifyPlaylists: Playlist[] = await Promise.all(
          data.map(async (sp: { id: string; name: string }) => {
            try {
              const tr = await fetch(`/api/spotify-playlists/tracks?id=${sp.id}`)
              const td = await tr.json()
              const songs: PlaylistSong[] = (td.tracks ?? []).map((t: any, i: number) => ({
                ...t,
                id: t.id ?? `sp-${sp.id}-${i}`,
                title: t.title ?? t.name,
                name: t.title ?? t.name,
                playlistId: `sp-${sp.id}-${t.id ?? i}`,
                bpm: t.bpm ?? 0,
                duration: t.duration ?? 0,
              }))
              return { id: `spotify-${sp.id}`, name: `${sp.name} ♫`, songs, source: 'spotify' } as Playlist
            } catch {
              return { id: `spotify-${sp.id}`, name: `${sp.name} ♫`, songs: [], source: 'spotify' } as Playlist
            }
          })
        )
        setPlaylists(prev => {
          const manual = prev.filter((p: any) => p.source !== 'spotify')
          return [...manual, ...spotifyPlaylists]
        })
      } catch {}
    }
    loadSpotifyPlaylists()
  }, [isSignedIn])

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
        if (selectedTempo === 'slow') return s.bpm >= 60 && s.bpm <= 80
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

  const activePlaylist = playlists.find(p => p.id === activePlaylistId) ?? playlists[0]
  const playlistSongIds = new Set(activePlaylist?.songs.map(s => String(s.id)) ?? [])

  // Accepts optional targetPlaylistId — if provided, adds to that playlist; otherwise active
  function addToPlaylist(song: Song, targetPlaylistId?: string) {
    const destId = targetPlaylistId ?? activePlaylistId
    setPlaylists(prev => prev.map(p =>
      p.id === destId
        ? p.songs.some(s => String(s.id) === String(song.id))
          ? p
          : { ...p, songs: [...p.songs, { ...song, playlistId: `${song.id}-${Date.now()}` }] }
        : p
    ))
  }

  function removeFromPlaylist(playlistId: string, songId: string) {
    setPlaylists(prev => prev.map(p =>
      p.id === playlistId ? { ...p, songs: p.songs.filter(s => s.playlistId !== songId) } : p
    ))
  }

  function createPlaylist(name: string) {
    const id = `pl-${Date.now()}`
    setPlaylists(prev => [...prev, { id, name, songs: [] }])
    setActivePlaylistId(id)
  }

  function renamePlaylist(id: string, name: string) {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, name } : p))
  }

  function deletePlaylist(id: string) {
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== id)
      if (next.length === 0) return [{ id: 'default', name: 'My Playlist', songs: [] }]
      return next
    })
    setActivePlaylistId(prev => prev === id ? (playlists.find(p => p.id !== id)?.id ?? 'default') : prev)
  }

  function reorderPlaylist(id: string, songs: PlaylistSong[]) {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, songs } : p))
  }

  function copyToPlaylist(song: PlaylistSong, targetId: string) {
    setPlaylists(prev => prev.map(p =>
      p.id === targetId
        ? p.songs.some(s => String(s.id) === String(song.id))
          ? p
          : { ...p, songs: [...p.songs, { ...song, playlistId: `${song.id}-${Date.now()}` }] }
        : p
    ))
  }

  if (showLanding) return <LandingPage onEnter={handleEnterApp}/>

  return (
    <div className={`min-h-screen transition-opacity duration-500 ${appVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'linear-gradient(160deg, #f4f7f4 0%, #f9f6ed 60%, #f5f0e8 100%)' }}>
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '200px' }}/>

      <div className="relative z-10">
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
                <button onClick={() => setMode('help')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'help' ? 'bg-white text-sage-900 shadow-sm font-semibold' : 'text-sage-500 hover:text-sage-700'}`}>
                  Help
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto shrink-0">
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
              <button onClick={() => setShowFeedback(true)}
                title="Send feedback"
                className="text-xs font-medium text-sage-500 hover:text-sage-900 px-2.5 py-1.5 rounded-lg hover:bg-cream-100 transition-all flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span className="hidden sm:inline">Feedback</span>
              </button>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-sage-600 hover:text-sage-900 px-3 py-1.5 rounded-lg hover:bg-cream-100 transition-all">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/"/>
              </SignedIn>
            </div>
          </div>
        </header>

        {mode === 'class' ? (
          <ClassBuilder/>
        ) : mode === 'bpm' ? (
          <BpmTapper/>
        ) : mode === 'help' ? (
          <HelpPage onOpenFeedback={() => setShowFeedback(true)}/>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
            <aside className="hidden lg:block w-56 shrink-0">
              <Filters
                genres={allGenres}
                selectedGenre={selectedGenre}
                onGenreChange={setSelectedGenre}
                bpmRange={bpmRange}
                onBpmChange={setBpmRange}
                lengthRange={lengthRange}
                onLengthChange={setLengthRange}
                selectedTempo={selectedTempo}
                onTempoChange={setSelectedTempo}
              />
            </aside>

            <main className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <p className="text-sm text-sage-500">
                  <span className="font-bold text-sage-800 text-base">{songs.length}</span> songs in library
                </p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-sage-200 border-t-sage-500 rounded-full animate-spin mb-3"/>
                  <p className="text-sm text-sage-400">Loading songs…</p>
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
                      onAdd={addToPlaylist}
                      playlists={playlists}
                      activePlaylistId={activePlaylistId}/>
                  ))}
                </div>
              )}
            </main>

            <aside className="hidden lg:flex w-72 shrink-0 flex-col sticky top-20" style={{ height: 'calc(100vh - 5.5rem)' }}>
              <RightPanel
                playlists={playlists}
                activePlaylistId={activePlaylistId}
                onSetActive={setActivePlaylistId}
                onCreatePlaylist={createPlaylist}
                onRenamePlaylist={renamePlaylist}
                onDeletePlaylist={deletePlaylist}
                onReorder={reorderPlaylist}
                onRemove={removeFromPlaylist}
                onCopyToPlaylist={copyToPlaylist}
                onAdd={addToPlaylist}
                addedIds={playlistSongIds}/>
            </aside>
          </div>
        )}
      </div>

      <FeedbackModal open={showFeedback} onClose={() => setShowFeedback(false)} page={mode}/>

      {showPlaylist && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowPlaylist(false)}/>
          <div className="relative mt-auto bg-white rounded-t-3xl shadow-xl" style={{ height: '85vh' }}>
            <div className="p-4 h-full">
              <RightPanel
                playlists={playlists}
                activePlaylistId={activePlaylistId}
                onSetActive={setActivePlaylistId}
                onCreatePlaylist={createPlaylist}
                onRenamePlaylist={renamePlaylist}
                onDeletePlaylist={deletePlaylist}
                onReorder={reorderPlaylist}
                onRemove={removeFromPlaylist}
                onCopyToPlaylist={copyToPlaylist}
                onAdd={addToPlaylist}
                addedIds={playlistSongIds}/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
