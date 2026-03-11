'use client'

interface FiltersProps {
  genres: string[]
  selectedGenre: string
  bpmRange: [number, number]
  lengthRange: [number, number]
  selectedTempo: string
  onGenreChange: (g: string) => void
  onBpmChange: (range: [number, number]) => void
  onLengthChange: (range: [number, number]) => void
  onTempoChange: (t: string) => void
}

const BPM_MIN = 60
const BPM_MAX = 200
const LEN_MIN = 60
const LEN_MAX = 600

function formatLen(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const TEMPOS = [
  { label: 'All', value: 'all' },
  { label: '🧘 Slow', value: 'slow', sub: '60–80' },
  { label: '💪 Medium', value: 'medium', sub: '80–100' },
  { label: '🔥 Fast', value: 'fast', sub: '100–120' },
  { label: '⚡ High Energy', value: 'high', sub: '120+' },
]

export default function Filters({
  genres, selectedGenre, bpmRange, lengthRange, selectedTempo,
  onGenreChange, onBpmChange, onLengthChange, onTempoChange,
}: FiltersProps) {
  return (
    <div className="bg-cream-50 border border-cream-300 rounded-2xl p-5 space-y-5">
      <h2 className="font-display text-lg font-semibold text-sage-800">Filter Songs</h2>

      {/* Tempo */}
      <div>
        <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-2">Tempo</label>
        <div className="flex flex-wrap gap-1.5">
          {TEMPOS.map(t => (
            <button key={t.value} onClick={() => onTempoChange(t.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150
                ${selectedTempo === t.value ? 'bg-sage-500 text-white shadow-sm' : 'bg-cream-200 text-sage-600 hover:bg-sage-100'}`}>
              {t.label}{t.sub ? ` (${t.sub})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Genre */}
      <div>
        <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-2">Genre</label>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...genres].map(g => (
            <button key={g} onClick={() => onGenreChange(g)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150
                ${selectedGenre === g ? 'bg-sage-500 text-white shadow-sm' : 'bg-cream-200 text-sage-600 hover:bg-sage-100'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* BPM */}
      <div>
        <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-2">
          BPM Range <span className="font-normal text-sage-400 normal-case">({bpmRange[0]} – {bpmRange[1]})</span>
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-sage-400 w-6">{BPM_MIN}</span>
            <input type="range" min={BPM_MIN} max={BPM_MAX} value={bpmRange[0]}
              onChange={e => onBpmChange([Math.min(parseInt(e.target.value), bpmRange[1] - 5), bpmRange[1]])}
              className="flex-1 accent-sage-500"/>
            <span className="text-xs text-sage-400 w-6 text-right">{BPM_MAX}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-sage-400 w-6">{BPM_MIN}</span>
            <input type="range" min={BPM_MIN} max={BPM_MAX} value={bpmRange[1]}
              onChange={e => onBpmChange([bpmRange[0], Math.max(parseInt(e.target.value), bpmRange[0] + 5)])}
              className="flex-1 accent-sage-500"/>
            <span className="text-xs text-sage-400 w-6 text-right">{BPM_MAX}</span>
          </div>
        </div>
      </div>

      {/* Length */}
      <div>
        <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-2">
          Song Length <span className="font-normal text-sage-400 normal-case">({formatLen(lengthRange[0])} – {formatLen(lengthRange[1])})</span>
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-sage-400 w-6">1m</span>
            <input type="range" min={LEN_MIN} max={LEN_MAX} value={lengthRange[0]}
              onChange={e => onLengthChange([Math.min(parseInt(e.target.value), lengthRange[1] - 10), lengthRange[1]])}
              className="flex-1 accent-sage-500"/>
            <span className="text-xs text-sage-400 w-6 text-right">10m</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-sage-400 w-6">1m</span>
            <input type="range" min={LEN_MIN} max={LEN_MAX} value={lengthRange[1]}
              onChange={e => onLengthChange([lengthRange[0], Math.max(parseInt(e.target.value), lengthRange[0] + 10)])}
              className="flex-1 accent-sage-500"/>
            <span className="text-xs text-sage-400 w-6 text-right">10m</span>
          </div>
        </div>
      </div>

      {/* Reset */}
      <button onClick={() => { onGenreChange('All'); onBpmChange([BPM_MIN, BPM_MAX]); onLengthChange([LEN_MIN, LEN_MAX]); onTempoChange('all') }}
        className="w-full text-xs text-sage-500 hover:text-sage-700 underline underline-offset-2 transition-colors">
        Reset filters
      </button>
    </div>
  )
}
