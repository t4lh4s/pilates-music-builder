import { ClassBlock, ClassTemplate } from './types'

// Mat Pilates templates
const matBlocks = (duration: number, level: string): Omit<ClassBlock, 'songs'>[] => {
  const isLong = duration >= 55
  const isBeginner = level === 'beginner'

  return [
    {
      id: 'warmup',
      name: 'Warm Up',
      description: 'Breathing, spinal mobility, gentle activation',
      targetDuration: isLong ? 600 : 480,
      bpmMin: 60,
      bpmMax: 78,
      emoji: '🌅',
      color: 'blue',
    },
    {
      id: 'standing',
      name: 'Standing & Centre Work',
      description: 'Balance, posture, core awakening',
      targetDuration: isLong ? 720 : 600,
      bpmMin: 75,
      bpmMax: 92,
      emoji: '🧍',
      color: 'teal',
    },
    {
      id: 'floorwork1',
      name: 'Floor Work',
      description: 'Abdominals, legs, glutes — building intensity',
      targetDuration: isLong ? 900 : 780,
      bpmMin: 85,
      bpmMax: 105,
      emoji: '💪',
      color: 'sage',
    },
    ...(isBeginner ? [] : [{
      id: 'peak',
      name: 'Peak Work',
      description: 'Highest intensity — cardio bursts, full body',
      targetDuration: isLong ? 720 : 600,
      bpmMin: 100,
      bpmMax: 130,
      emoji: '🔥',
      color: 'orange',
    }]),
    {
      id: 'cooldown',
      name: 'Cool Down & Stretch',
      description: 'Hip flexors, spine release, savasana',
      targetDuration: isLong ? 600 : 480,
      bpmMin: 60,
      bpmMax: 78,
      emoji: '🧘',
      color: 'purple',
    },
  ]
}

// Reformer Pilates templates
const reformerBlocks = (duration: number, level: string): Omit<ClassBlock, 'songs'>[] => {
  const isLong = duration >= 55
  const isBeginner = level === 'beginner'

  return [
    {
      id: 'footwork',
      name: 'Footwork',
      description: 'Leg press variations, spinal alignment, warmup',
      targetDuration: isLong ? 660 : 540,
      bpmMin: 68,
      bpmMax: 85,
      emoji: '🦶',
      color: 'blue',
    },
    {
      id: 'abdominals',
      name: 'Abdominal Series',
      description: 'Hundreds, coordination, stomach massage',
      targetDuration: isLong ? 720 : 600,
      bpmMin: 80,
      bpmMax: 98,
      emoji: '🎯',
      color: 'teal',
    },
    {
      id: 'legships',
      name: 'Leg & Hip Series',
      description: 'Side lying, lunges, squats, hip work',
      targetDuration: isLong ? 840 : 720,
      bpmMin: 85,
      bpmMax: 100,
      emoji: '💪',
      color: 'sage',
    },
    ...(isBeginner ? [] : [{
      id: 'upperbody',
      name: 'Upper Body & Arms',
      description: 'Rowing, pulling straps, chest expansion',
      targetDuration: isLong ? 600 : 480,
      bpmMin: 82,
      bpmMax: 100,
      emoji: '🏋️',
      color: 'orange',
    }]),
    {
      id: 'stretch',
      name: 'Stretch & Finishing',
      description: 'Elephant, mermaid, spinal twist, cooldown',
      targetDuration: isLong ? 600 : 480,
      bpmMin: 62,
      bpmMax: 78,
      emoji: '🧘',
      color: 'purple',
    },
  ]
}

export function generateTemplate(
  format: 'mat' | 'reformer',
  duration: number,
  level: 'beginner' | 'intermediate' | 'advanced'
): Omit<ClassBlock, 'songs'>[] {
  if (format === 'mat') return matBlocks(duration, level)
  return reformerBlocks(duration, level)
}

export const BLOCK_COLORS: Record<string, { bg: string; border: string; badge: string; bar: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   bar: 'bg-blue-400' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   badge: 'bg-teal-100 text-teal-700',   bar: 'bg-teal-400' },
  sage:   { bg: 'bg-sage-50',   border: 'border-sage-200',   badge: 'bg-sage-100 text-sage-700',   bar: 'bg-sage-400' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-400' },
}
