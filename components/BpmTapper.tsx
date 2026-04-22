'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Tap {
  time: number
}

const MIN_TAPS = 2
const MAX_TAPS = 32
const RESET_AFTER_MS = 3000 // reset if no tap for 3 seconds

function getBpmColor(bpm: number): string {
  if (bpm <= 80) return '#4a90d9'      // blue — slow
  if (bpm <= 100) return '#4d7d4d'     // sage — medium
  if (bpm <= 120) return '#d4a84d'     // amber — fast
  return '#d4534d'                      // red — high energy
}

function getBpmLabel(bpm: number): string {
  if (bpm <= 80) return 'Slow'
  if (bpm <= 100) return 'Medium'
  if (bpm <= 120) return 'Fast'
  return 'High Energy'
}

function getBpmZone(bpm: number): string {
  if (bpm <= 80) return 'Warm Up / Cool Down'
  if (bpm <= 100) return 'Floor Work / Standing'
  if (bpm <= 120) return 'Peak Work'
  return 'Jump Board / Cardio'
}

export default function BpmTapper() {
  const [taps, setTaps] = useState<Tap[]>([])
  const [bpm, setBpm] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const resetTimerRef = useRef<NodeJS.Timeout>()

  const calculateBpm = useCallback((tapList: Tap[]) => {
    if (tapList.length < MIN_TAPS) return null
    const recent = tapList.slice(-MAX_TAPS)
    const intervals: number[] = []
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i].time - recent[i - 1].time)
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
    return Math.round(60000 / avg)
  }, [])

  const handleTap = useCallback(() => {
    const now = Date.now()
    setIsActive(true)
    setPulseKey(k => k + 1)

    setTaps(prev => {
      // If last tap was too long ago, start fresh
      const lastTap = prev[prev.length - 1]
      const newTaps = lastTap && (now - lastTap.time) > RESET_AFTER_MS
        ? [{ time: now }]
        : [...prev, { time: now }]

      const newBpm = calculateBpm(newTaps)
      setBpm(newBpm)
      return newTaps
    })

    // Reset timer
    clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      setIsActive(false)
    }, RESET_AFTER_MS)
  }, [calculateBpm])

  function reset() {
    setTaps([])
    setBpm(null)
    setIsActive(false)
    clearTimeout(resetTimerRef.current)
  }

  // Spacebar / Enter tap support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleTap()
      }
      if (e.code === 'Escape') reset()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleTap])

  useEffect(() => {
    return () => clearTimeout(resetTimerRef.current)
  }, [])

  const tapCount = taps.length
  const color = bpm ? getBpmColor(bpm) : '#9fbf9f'

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl font-bold text-sage-900 mb-2">BPM Counter</h2>
        <p className="text-sage-500 text-sm">Tap to the beat of any song to find its BPM</p>
      </div>

      {/* Main tap button */}
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={handleTap}
          className="relative w-56 h-56 rounded-full select-none outline-none focus:outline-none transition-transform active:scale-95"
          style={{
            background: `radial-gradient(circle at 40% 35%, ${color}dd, ${color}99)`,
            boxShadow: `0 0 0 8px ${color}22, 0 0 0 16px ${color}11, 0 20px 60px ${color}44`,
          }}>
          {/* Pulse ring on tap */}
          <span key={pulseKey} className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: color, animationDuration: '0.6s', animationIterationCount: 1 }}/>

          {/* BPM display */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            {bpm ? (
              <>
                <span className="text-7xl font-bold text-white leading-none tabular-nums">{bpm}</span>
                <span className="text-white/80 text-sm font-semibold mt-1 uppercase tracking-widest">BPM</span>
              </>
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-2 opacity-80">
                  <path d="M8 24h6l4-12 8 24 4-16 4 8 6 0" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-white/90 text-lg font-semibold">Tap the beat</span>
              </>
            )}
          </div>
        </button>

        {/* Keyboard shortcut hint */}
        <p className="text-xs text-sage-400 mt-4">
          Click, tap <kbd className="px-1.5 py-0.5 rounded bg-cream-200 text-sage-600 font-mono text-xs">Space</kbd>, or press <kbd className="px-1.5 py-0.5 rounded bg-cream-200 text-sage-600 font-mono text-xs">Enter</kbd>
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-cream-200 p-4 text-center">
          <p className="text-2xl font-bold text-sage-900 tabular-nums">{tapCount}</p>
          <p className="text-xs text-sage-400 mt-0.5">taps</p>
        </div>
        <div className="bg-white rounded-2xl border border-cream-200 p-4 text-center">
          <p className="text-2xl font-bold tabular-nums" style={{ color: bpm ? color : '#c8d5c8' }}>
            {bpm ?? '–'}
          </p>
          <p className="text-xs text-sage-400 mt-0.5">BPM</p>
        </div>
        <div className="bg-white rounded-2xl border border-cream-200 p-4 text-center">
          <p className="text-sm font-semibold text-sage-700 leading-tight">
            {bpm ? getBpmLabel(bpm) : '–'}
          </p>
          <p className="text-xs text-sage-400 mt-0.5">tempo</p>
        </div>
      </div>

      {/* Pilates zone suggestion */}
      {bpm && (
        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}22` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-700">Best for: {getBpmZone(bpm)}</p>
            <p className="text-xs text-sage-400 mt-0.5">
              {bpm <= 80 && 'Great for flowing, breath-based movements'}
              {bpm > 80 && bpm <= 100 && 'Perfect for controlled strength work'}
              {bpm > 100 && bpm <= 120 && 'Ideal for dynamic, energetic sequences'}
              {bpm > 120 && 'High intensity — jumps, cardio, peak effort'}
            </p>
          </div>
        </div>
      )}

      {/* BPM bar visualization */}
      {bpm && (
        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-6">
          <div className="flex items-center justify-between text-xs text-sage-400 mb-2">
            <span>60</span>
            <span className="font-semibold text-sage-600" style={{ color }}>
              {bpm} BPM
            </span>
            <span>200</span>
          </div>
          <div className="h-3 bg-cream-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, ((bpm - 60) / 140) * 100))}%`,
                background: `linear-gradient(to right, #4a90d9, #4d7d4d, #d4a84d, #d4534d)`,
              }}/>
          </div>
          <div className="flex justify-between text-xs text-sage-300 mt-1">
            <span>Slow</span>
            <span>Medium</span>
            <span>Fast</span>
            <span>High</span>
          </div>
        </div>
      )}

      {/* Reset */}
      {tapCount > 0 && (
        <button onClick={reset}
          className="w-full py-3 rounded-2xl text-sm font-semibold text-sage-400 hover:text-sage-600 border border-cream-200 hover:border-sage-300 bg-white transition-all">
          Reset
        </button>
      )}
    </div>
  )
}
