'use client'
import { useState, useEffect } from 'react'
import { Song, PlaylistSong, ClassBlock } from '@/lib/types'
import { generateTemplate, BLOCK_COLORS } from '@/lib/classTemplates'
import { Movement, getMovementsForBlock, bpmRangeFromMovements, calcTargetBpm } from '@/lib/movements'
import SongCard from '@/components/SongCard'

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart }: {
  onStart: (f: 'mat' | 'reformer', d: number, l: 'beginner' | 'intermediate' | 'advanced') => void
}) {
  const [format, setFormat] = useState<'mat' | 'reformer'>('mat')
  const [duration, setDuration] = useState(55)
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl font-bold text-sage-900 mb-2">Build Your Class</h2>
        <p className="text-sage-500">Tell us about your class and we'll structure it for you</p>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-sage-700 mb-3">Class Format</label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'mat', label: 'Mat Pilates', emoji: '🧘', desc: 'Floor-based, flowing movement' },
            { value: 'reformer', label: 'Reformer Pilates', emoji: '⚙️', desc: 'Machine-based, resistance work' },
          ] as const).map(f => (
            <button key={f.value} onClick={() => setFormat(f.value)}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${format === f.value ? 'border-sage-500 bg-sage-50' : 'border-cream-300 bg-white hover:border-sage-300'}`}>
              <div className="text-2xl mb-2">{f.emoji}</div>
              <div className="font-semibold text-sage-900 text-sm">{f.label}</div>
              <div className="text-xs text-sage-400 mt-0.5">{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-sage-700 mb-3">Class Duration</label>
        <div className="grid grid-cols-4 gap-2">
          {[45, 50, 55, 60].map(d => (
            <button key={d} onClick={() => setDuration(d)}
              className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${duration === d ? 'border-sage-500 bg-sage-50 text-sage-900' : 'border-cream-300 bg-white text-sage-500 hover:border-sage-300'}`}>
              {d} min
            </button>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <label className="block text-sm font-semibold text-sage-700 mb-3">Level</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'beginner', label: 'Beginner', emoji: '🌱' },
            { value: 'intermediate', label: 'Intermediate', emoji: '⭐' },
            { value: 'advanced', label: 'Advanced', emoji: '🏆' },
          ] as const).map(l => (
            <button key={l.value} onClick={() => setLevel(l.value)}
              className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${level === l.value ? 'border-sage-500 bg-sage-50 text-sage-900' : 'border-cream-300 bg-white text-sage-500 hover:border-sage-300'}`}>
              {l.emoji} {l.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => onStart(format, duration, level)}
        className="w-full py-4 bg-sage-500 hover:bg-sage-600 text-white font-bold text-base rounded-2xl transition-colors shadow-sm">
        Build Class Structure →
      </button>
    </div>
  )
}

// ─── Movement Picker ──────────────────────────────────────────────────────────
function MovementPicker({ block, format, level, selectedMovements, onToggle }: {
  block: ClassBlock
  format: 'mat' | 'reformer'
  level: 'beginner' | 'intermediate' | 'advanced'
  selectedMovements: Movement[]
  onToggle: (m: Movement) => void
}) {
  const available = getMovementsForBlock(format, block.id, level)
  const selectedIds = new Set(selectedMovements.map(m => m.id))
  const targetBpm = selectedMovements.length > 0 ? calcTargetBpm(selectedMovements) : null

  if (available.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-sage-700">Select Movements</h4>
          <p className="text-xs text-sage-400">Songs will be filtered to match your selection</p>
        </div>
        {targetBpm && (
          <div className="text-right">
            <div className="text-xs text-sage-400">Target BPM</div>
            <div className="text-lg font-bold text-sage-700">{targetBpm}</div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {available.map(m => {
          const selected = selectedIds.has(m.id)
          return (
            <button key={m.id} onClick={() => onToggle(m)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                selected
                  ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                  : 'bg-white text-sage-600 border-cream-300 hover:border-sage-300 hover:bg-sage-50'
              }`}>
              {selected && <span>✓</span>}
              {m.name}
              <span className={`font-mono text-xs ${selected ? 'text-sage-200' : 'text-sage-400'}`}>{m.bpm}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Block Card ───────────────────────────────────────────────────────────────
function BlockCard({ block, index, isActive, onActivate, onRemoveSong, selectedMovements }: {
  block: ClassBlock
  index: number
  isActive: boolean
  onActivate: () => void
  onRemoveSong: (playlistId: string) => void
  selectedMovements: Movement[]
}) {
  const colors = BLOCK_COLORS[block.color] ?? BLOCK_COLORS.sage
  const blockSeconds = block.songs.reduce((acc, s) => acc + (s.duration ?? 0), 0)
  const fillPct = Math.min(100, Math.round((blockSeconds / block.targetDuration) * 100))
  const blockMins = Math.floor(blockSeconds / 60)
  const blockSecs = String(blockSeconds % 60).padStart(2, '0')
  const targetMins = Math.floor(block.targetDuration / 60)
  const isOver = blockSeconds > block.targetDuration
  const isFull = fillPct >= 95
  const targetBpm = selectedMovements.length > 0 ? calcTargetBpm(selectedMovements) : null

  return (
    <div className={`rounded-2xl border-2 transition-all ${isActive ? colors.border + ' shadow-md' : 'border-cream-200 hover:border-cream-300'} ${colors.bg}`}>
      <button onClick={onActivate} className="w-full text-left p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{block.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-sage-400 uppercase tracking-wider">Block {index + 1}</span>
                {isFull && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">✓ Full</span>}
                {isOver && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Over target</span>}
              </div>
              <h3 className="font-display font-bold text-sage-900 leading-tight">{block.name}</h3>
              <p className="text-xs text-sage-400 mt-0.5">{block.description}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-sm font-bold ${isOver ? 'text-red-500' : 'text-sage-700'}`}>{blockMins}:{blockSecs}</div>
            <div className="text-xs text-sage-400">/ {targetMins}m</div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
            {targetBpm ? `~${targetBpm} BPM` : `${block.bpmMin}–${block.bpmMax} BPM`}
          </span>
          <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${isOver ? 'bg-red-400' : colors.bar}`} style={{ width: `${fillPct}%` }}/>
          </div>
          <span className="text-xs text-sage-400">{fillPct}%</span>
        </div>

        {selectedMovements.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedMovements.slice(0, 3).map(m => (
              <span key={m.id} className="text-xs bg-white/70 text-sage-600 px-2 py-0.5 rounded-full">{m.name}</span>
            ))}
            {selectedMovements.length > 3 && (
              <span className="text-xs text-sage-400">+{selectedMovements.length - 3} more</span>
            )}
          </div>
        )}
      </button>

      {block.songs.length > 0 && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-white/60 pt-3">
          {block.songs.map((song, i) => {
            const dur = song.duration ?? 0
            const m = Math.floor(dur / 60)
            const s = String(dur % 60).padStart(2, '0')
            return (
              <div key={song.playlistId} className="flex items-center gap-2 group bg-white/70 rounded-xl px-3 py-2">
                <span className="text-xs text-sage-300 w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-sage-800 truncate">{song.title ?? song.name}</p>
                  <p className="text-xs text-sage-400 truncate">{song.artist}</p>
                </div>
                <span className="text-xs font-mono text-sage-500 shrink-0">{song.bpm}</span>
                <span className="text-xs text-sage-300 shrink-0">{m}:{s}</span>
                <button onClick={(e) => { e.stopPropagation(); onRemoveSong(song.playlistId) }}
                  className="text-sage-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l10 10M12 2L2 12"/></svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Summary Panel ────────────────────────────────────────────────────────────
function SummaryPanel({ blocks, targetDuration, onCopy, onReset }: {
  blocks: ClassBlock[]
  targetDuration: number
  onCopy: () => void
  onReset: () => void
}) {
  const totalSeconds = blocks.reduce((acc, b) => acc + b.songs.reduce((a, s) => a + (s.duration ?? 0), 0), 0)
  const targetSeconds = targetDuration * 60
  const totalMins = Math.floor(totalSeconds / 60)
  const totalSecs = String(totalSeconds % 60).padStart(2, '0')
  const pct = Math.min(100, Math.round((totalSeconds / targetSeconds) * 100))
  const allSongs = blocks.flatMap(b => b.songs)
  const avgBpm = allSongs.length ? Math.round(allSongs.reduce((a, s) => a + s.bpm, 0) / allSongs.length) : 0
  const isOver = totalSeconds > targetSeconds

  return (
    <div className="bg-cream-50 rounded-2xl border border-cream-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-sage-900">Class Summary</h3>
        <button onClick={onReset} className="text-xs text-sage-300 hover:text-red-400 transition-colors">Reset</button>
      </div>
      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <span className={`text-2xl font-bold ${isOver ? 'text-red-500' : 'text-sage-900'}`}>{totalMins}:{totalSecs}</span>
          <span className="text-sm text-sage-400">/ {targetDuration}m target</span>
        </div>
        <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isOver ? 'bg-red-400' : 'bg-sage-400'}`} style={{ width: `${pct}%` }}/>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-sage-400">{pct}% filled</span>
          {avgBpm > 0 && <span className="text-xs text-sage-400">avg {avgBpm} BPM</span>}
        </div>
      </div>
      <div className="space-y-1.5">
        {blocks.map(b => {
          const bSecs = b.songs.reduce((a, s) => a + (s.duration ?? 0), 0)
          const bMins = Math.floor(bSecs / 60)
          const bSec = String(bSecs % 60).padStart(2, '0')
          const colors = BLOCK_COLORS[b.color] ?? BLOCK_COLORS.sage
          return (
            <div key={b.id} className="flex items-center gap-2 text-xs">
              <span>{b.emoji}</span>
              <span className="flex-1 text-sage-600 truncate">{b.name}</span>
              <span className={`font-mono font-semibold px-1.5 py-0.5 rounded ${colors.badge}`}>{bMins}:{bSec}</span>
            </div>
          )
        })}
      </div>
      {allSongs.length > 0 && (
        <button onClick={onCopy} className="w-full py-2.5 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-sm rounded-xl transition-colors">
          📋 Copy Full Class
        </button>
      )}
    </div>
  )
}

// ─── Main ClassBuilder ────────────────────────────────────────────────────────
export default function ClassBuilder() {
  const [setup, setSetup] = useState<{ format: 'mat' | 'reformer'; duration: number; level: 'beginner' | 'intermediate' | 'advanced' } | null>(null)
  const [blocks, setBlocks] = useState<ClassBlock[]>([])
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  // Map of blockId -> selected movements
  const [blockMovements, setBlockMovements] = useState<Record<string, Movement[]>>({})
  const [songs, setSongs] = useState<Song[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const activeBlock = blocks.find(b => b.id === activeBlockId) ?? null
  const activeMovements = activeBlockId ? (blockMovements[activeBlockId] ?? []) : []

  // Recalculate BPM range when movements change, then fetch songs
  useEffect(() => {
    if (!activeBlock || !setup) return
    setLoading(true)

    const movements = blockMovements[activeBlock.id] ?? []
    const [minBpm, maxBpm] = bpmRangeFromMovements(movements, activeBlock.bpmMin, activeBlock.bpmMax)

    const params = new URLSearchParams()
    params.set('minBpm', minBpm.toString())
    params.set('maxBpm', maxBpm.toString())
    fetch(`/api/songs?${params}`)
      .then(r => r.json())
      .then(data => { setSongs(data); setLoading(false) })
  }, [activeBlockId, blockMovements])

  function handleStart(format: 'mat' | 'reformer', duration: number, level: 'beginner' | 'intermediate' | 'advanced') {
    const template = generateTemplate(format, duration, level)
    const newBlocks: ClassBlock[] = template.map(t => ({ ...t, songs: [] }))
    setBlocks(newBlocks)
    setSetup({ format, duration, level })
    setActiveBlockId(newBlocks[0].id)
    setBlockMovements({})
  }

  function toggleMovement(blockId: string, movement: Movement) {
    setBlockMovements(prev => {
      const current = prev[blockId] ?? []
      const exists = current.find(m => m.id === movement.id)
      return {
        ...prev,
        [blockId]: exists ? current.filter(m => m.id !== movement.id) : [...current, movement],
      }
    })
  }

  function addSongToBlock(song: Song) {
    if (!activeBlockId) return
    setBlocks(prev => prev.map(b =>
      b.id === activeBlockId ? { ...b, songs: [...b.songs, { ...song, playlistId: `${song.id}-${Date.now()}` }] } : b
    ))
  }

  function removeSongFromBlock(blockId: string, playlistId: string) {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, songs: b.songs.filter(s => s.playlistId !== playlistId) } : b
    ))
  }

  function copyFullClass() {
    if (!setup) return
    const lines = [
      `${setup.format === 'mat' ? '🧘 Mat' : '⚙️ Reformer'} Pilates — ${setup.duration} min — ${setup.level.charAt(0).toUpperCase() + setup.level.slice(1)}`,
      '',
      ...blocks.flatMap(b => {
        const movements = blockMovements[b.id] ?? []
        const bSecs = b.songs.reduce((a, s) => a + (s.duration ?? 0), 0)
        const bMins = Math.floor(bSecs / 60)
        const bSec = String(bSecs % 60).padStart(2, '0')
        return [
          `${b.emoji} ${b.name} (${bMins}:${bSec})`,
          ...(movements.length > 0 ? [`   Movements: ${movements.map(m => m.name).join(', ')}`] : []),
          ...b.songs.map((s, i) => {
            const dur = s.duration ?? 0
            const m = Math.floor(dur / 60)
            const sec = String(dur % 60).padStart(2, '0')
            return `   ${i + 1}. ${s.title ?? s.name} — ${s.artist} (${s.bpm} BPM, ${m}:${sec})`
          }),
          '',
        ]
      }),
    ]
    navigator.clipboard.writeText(lines.join('\n'))
  }

  const filteredSongs = search.trim()
    ? songs.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.artist.toLowerCase().includes(search.toLowerCase()))
    : songs

  const addedIds = new Set(blocks.flatMap(b => b.songs.map(s => s.id)))

  // Active BPM range display
  const activeBpmRange = activeBlock
    ? bpmRangeFromMovements(activeMovements, activeBlock.bpmMin, activeBlock.bpmMax)
    : [85, 100]

  if (!setup) return <SetupScreen onStart={handleStart} />

  return (
    <div className="flex gap-6">
      {/* Left: blocks + summary */}
      <div className="w-80 shrink-0 space-y-3 sticky top-24 self-start" style={{ maxHeight: 'calc(100vh - 7rem)', overflowY: 'auto' }}>
        <SummaryPanel
          blocks={blocks}
          targetDuration={setup.duration}
          onCopy={copyFullClass}
          onReset={() => { setSetup(null); setBlocks([]); setActiveBlockId(null); setBlockMovements({}) }}
        />
        {blocks.map((block, i) => (
          <BlockCard
            key={block.id}
            block={block}
            index={i}
            isActive={activeBlockId === block.id}
            onActivate={() => { setActiveBlockId(block.id); setSearch('') }}
            onRemoveSong={(pid) => removeSongFromBlock(block.id, pid)}
            selectedMovements={blockMovements[block.id] ?? []}
          />
        ))}
      </div>

      {/* Right: movement picker + song browser */}
      <div className="flex-1 min-w-0">
        {activeBlock && setup ? (
          <>
            {/* Movement picker */}
            <div className="bg-cream-50 border border-cream-200 rounded-2xl p-5 mb-5">
              <MovementPicker
                block={activeBlock}
                format={setup.format}
                level={setup.level}
                selectedMovements={activeMovements}
                onToggle={(m) => toggleMovement(activeBlock.id, m)}
              />
              {activeMovements.length === 0 && (
                <p className="text-xs text-sage-400 italic">
                  No movements selected — showing all songs in the {activeBlock.bpmMin}–{activeBlock.bpmMax} BPM range.
                  Select movements above to refine suggestions.
                </p>
              )}
            </div>

            {/* Song browser */}
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="font-display font-bold text-sage-900 text-lg">
                  {activeBlock.emoji} {activeBlock.name}
                </h3>
                <p className="text-sm text-sage-400">
                  Songs filtered to {activeBpmRange[0]}–{activeBpmRange[1]} BPM
                  {activeMovements.length > 0 ? ` · based on ${activeMovements.length} movement${activeMovements.length > 1 ? 's' : ''}` : ''}
                </p>
              </div>
              <div className="relative ml-auto">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-300 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search songs..."
                  className="pl-9 pr-4 py-2 text-sm bg-white border border-cream-300 rounded-xl text-sage-800 placeholder-sage-300 focus:outline-none focus:border-sage-400 w-56"/>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-cream-100 animate-pulse"/>)}
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sage-500">No songs found in {activeBpmRange[0]}–{activeBpmRange[1]} BPM range</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-sage-500 mb-3"><span className="font-semibold text-sage-700">{filteredSongs.length}</span> songs found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredSongs.map(song => (
                    <SongCard key={song.id} song={song} isInPlaylist={addedIds.has(song.id)} onAdd={addSongToBlock}/>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">👈</div>
            <p className="text-sage-500 font-medium">Select a block to start adding songs</p>
          </div>
        )}
      </div>
    </div>
  )
}
