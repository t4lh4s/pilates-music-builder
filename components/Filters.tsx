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
  { label: 'Slow', value: 'slow', sub: '60–80' },
  { label: 'Medium', value: 'medium', sub: '80–100' },
  { label: 'Fast', value: 'fast', sub: '100–120' },
  { label: 'High Energy', value: 'high', sub: '120+' },
]

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-sage-400 uppercase tracking-widest mb-2.5">{label}</p>
      {children}
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 ${
        active
          ? 'bg-sage-900 text-white shadow-sm'
          : 'bg-cream-100 text-sage-500 hover:bg-cream-200 border border-cream-300'
      }`}>
      {children}
    </button>
  )
}

export default function Filters({
  genres, selectedGenre, bpmRange, lengthRange, selectedTempo,
  onGenreChange, onBpmChange, onLengthChange, onTempoChange,
}: FiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-sage-900">Filters</h2>
        <button
          onClick={() => { onGenreChange('All'); onBpmChange([BPM_MIN, BPM_MAX]); onLengthChange([LEN_MIN, LEN_MAX]); onTempoChange('all') }}
          className="text-xs text-sage-400 hover:text-sage-600 transition-colors">
          Reset
        </button>
      </div>

      <FilterSection label="Tempo">
        <div className="flex flex-wrap gap-1.5">
          {TEMPOS.map(t => (
            <Pill key={t.value} active={selectedTempo === t.value} onClick={() => onTempoChange(t.value)}>
              {t.label}{t.sub && <span className={`ml-1 ${selectedTempo === t.value ? 'text-sage-300' : 'text-sage-400'}`}>{t.sub}</span>}
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Genre">
        <div className="flex flex-wrap gap-1.5">
          {['All', ...genres].map(g => (
            <Pill key={g} active={selectedGenre === g} onClick={() => onGenreChange(g)}>
              {g}
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label={`BPM  ${bpmRange[0]} – ${bpmRange[1]}`}>
        <div className="space-y-2.5 px-1">
          <input type="range" min={BPM_MIN} max={BPM_MAX} value={bpmRange[0]}
            onChange={e => onBpmChange([Math.min(parseInt(e.target.value), bpmRange[1] - 5), bpmRange[1]])}
            className="w-full accent-sage-500"/>
          <input type="range" min={BPM_MIN} max={BPM_MAX} value={bpmRange[1]}
            onChange={e => onBpmChange([bpmRange[0], Math.max(parseInt(e.target.value), bpmRange[0] + 5)])}
            className="w-full accent-sage-500"/>
        </div>
      </FilterSection>

      <FilterSection label={`Length  ${formatLen(lengthRange[0])} – ${formatLen(lengthRange[1])}`}>
        <div className="space-y-2.5 px-1">
          <input type="range" min={LEN_MIN} max={LEN_MAX} value={lengthRange[0]}
            onChange={e => onLengthChange([Math.min(parseInt(e.target.value), lengthRange[1] - 10), lengthRange[1]])}
            className="w-full accent-sage-500"/>
          <input type="range" min={LEN_MIN} max={LEN_MAX} value={lengthRange[1]}
            onChange={e => onLengthChange([lengthRange[0], Math.max(parseInt(e.target.value), lengthRange[0] + 10)])}
            className="w-full accent-sage-500"/>
        </div>
      </FilterSection>
    </div>
  )
}
