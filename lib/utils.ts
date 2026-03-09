export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function bpmLabel(bpm: number): string {
  if (bpm < 80) return 'Slow'
  if (bpm < 110) return 'Medium'
  if (bpm < 140) return 'Upbeat'
  return 'Fast'
}

export function bpmColor(bpm: number): string {
  if (bpm < 80) return 'bg-blue-100 text-blue-700'
  if (bpm < 110) return 'bg-sage-100 text-sage-700'
  if (bpm < 140) return 'bg-amber-100 text-amber-700'
  return 'bg-terracotta-400/20 text-terracotta-600'
}

export function totalPlaylistDuration(lengths: number[]): string {
  const total = lengths.reduce((acc, l) => acc + l, 0)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}m ${s}s`
}
