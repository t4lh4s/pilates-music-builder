// Each movement has an ideal BPM that reflects its natural tempo
// bpm = the tempo at which the exercise feels most natural/supported by music
// duration = estimated seconds for one standard set

export interface Movement {
  id: string
  name: string
  bpm: number         // ideal music BPM for this movement
  level: 'beginner' | 'intermediate' | 'advanced'
  format: 'mat' | 'reformer' | 'both'
  blocks: string[]    // which block IDs this movement belongs to
  duration: number    // estimated seconds per set
  cues?: string       // brief instructor note
}

export const MOVEMENTS: Movement[] = [

  // ══════════════════════════════════════════════
  // MAT — WARM UP BLOCK
  // ══════════════════════════════════════════════
  { id: 'mat-breathing', name: 'Breathing & Rib Cage Expansion', bpm: 62, level: 'beginner', format: 'mat', blocks: ['warmup'], duration: 90, cues: 'Inhale to expand, exhale to connect' },
  { id: 'mat-spinal-roll', name: 'Spinal Roll Down', bpm: 65, level: 'beginner', format: 'mat', blocks: ['warmup'], duration: 90, cues: 'Articulate one vertebra at a time' },
  { id: 'mat-chest-opener', name: 'Chest Opener', bpm: 64, level: 'beginner', format: 'mat', blocks: ['warmup'], duration: 60, cues: 'Broaden across collar bones' },
  { id: 'mat-hip-rolls', name: 'Hip Rolls', bpm: 68, level: 'beginner', format: 'mat', blocks: ['warmup'], duration: 90, cues: 'Melt through each vertebra' },
  { id: 'mat-cat-cow', name: 'Cat Cow', bpm: 66, level: 'beginner', format: 'mat', blocks: ['warmup'], duration: 75, cues: 'Match movement to breath' },
  { id: 'mat-thread-needle', name: 'Thread the Needle', bpm: 65, level: 'beginner', format: 'mat', blocks: ['warmup'], duration: 75, cues: 'Reach through the arm, rotate thoracic' },
  { id: 'mat-child-pose', name: "Child's Pose", bpm: 62, level: 'beginner', format: 'mat', blocks: ['warmup'], duration: 60, cues: 'Rest and reset' },
  { id: 'mat-hip-flexor-stretch', name: 'Hip Flexor Stretch', bpm: 64, level: 'beginner', format: 'mat', blocks: ['warmup', 'cooldown'], duration: 90, cues: 'Maintain neutral pelvis' },
  { id: 'mat-thoracic-rotation', name: 'Thoracic Rotation', bpm: 66, level: 'beginner', format: 'mat', blocks: ['warmup'], duration: 75, cues: 'Keep hips square, rotate from ribcage' },
  { id: 'mat-pelvic-clock', name: 'Pelvic Clock', bpm: 65, level: 'beginner', format: 'mat', blocks: ['warmup'], duration: 75, cues: 'Small precise movements' },
  { id: 'mat-ankle-circles', name: 'Ankle Circles & Foot Articulation', bpm: 66, level: 'beginner', format: 'mat', blocks: ['warmup'], duration: 60, cues: 'Full range of motion' },
  { id: 'mat-standing-roll', name: 'Standing Roll Down', bpm: 68, level: 'beginner', format: 'mat', blocks: ['warmup', 'standing'], duration: 90, cues: 'Heavy head, soft knees' },

  // ══════════════════════════════════════════════
  // MAT — STANDING & CENTRE WORK
  // ══════════════════════════════════════════════
  { id: 'mat-standing-balance', name: 'Single Leg Balance', bpm: 78, level: 'beginner', format: 'mat', blocks: ['standing'], duration: 75, cues: 'Find a focal point, engage core' },
  { id: 'mat-standing-lunge', name: 'Standing Lunge', bpm: 80, level: 'beginner', format: 'mat', blocks: ['standing'], duration: 90, cues: 'Stack knee over ankle' },
  { id: 'mat-pilates-stance', name: 'Pilates Stance Squats', bpm: 82, level: 'beginner', format: 'mat', blocks: ['standing'], duration: 90, cues: 'Heels together, toes apart, zip inner thighs' },
  { id: 'mat-arabesque', name: 'Standing Arabesque', bpm: 76, level: 'intermediate', format: 'mat', blocks: ['standing'], duration: 75, cues: 'Long line from crown to heel' },
  { id: 'mat-standing-sidekick', name: 'Standing Side Kick', bpm: 84, level: 'intermediate', format: 'mat', blocks: ['standing'], duration: 90, cues: 'Stabilise standing hip' },
  { id: 'mat-standing-oblique', name: 'Standing Oblique Crunch', bpm: 86, level: 'beginner', format: 'mat', blocks: ['standing'], duration: 75, cues: 'Elbow to knee, exhale on crunch' },
  { id: 'mat-standing-glute', name: 'Standing Glute Kick Back', bpm: 84, level: 'beginner', format: 'mat', blocks: ['standing'], duration: 75, cues: 'Maintain neutral spine, no hyperextension' },
  { id: 'mat-standing-passé', name: 'Standing Passé Balance', bpm: 76, level: 'intermediate', format: 'mat', blocks: ['standing'], duration: 75, cues: 'Float the knee up slowly' },
  { id: 'mat-standing-plié', name: 'Parallel & Turned Out Plié', bpm: 80, level: 'beginner', format: 'mat', blocks: ['standing'], duration: 90, cues: 'Press floor away, lengthen spine' },
  { id: 'mat-standing-theraband', name: 'Standing Theraband Row', bpm: 78, level: 'beginner', format: 'mat', blocks: ['standing'], duration: 75, cues: 'Draw elbows back, depress shoulders' },

  // ══════════════════════════════════════════════
  // MAT — FLOOR WORK (ABDOMINALS / CORE)
  // ══════════════════════════════════════════════
  { id: 'mat-hundred', name: 'The Hundred', bpm: 100, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 120, cues: '5 pumps inhale, 5 pumps exhale' },
  { id: 'mat-rollup', name: 'Roll Up', bpm: 72, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Scoop deep, peel slowly' },
  { id: 'mat-rollover', name: 'Roll Over', bpm: 70, level: 'intermediate', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Use control, not momentum' },
  { id: 'mat-single-leg-circles', name: 'Single Leg Circles', bpm: 78, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Stable pelvis, big circles' },
  { id: 'mat-rolling-ball', name: 'Rolling Like a Ball', bpm: 82, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Balance on sitting bones, C-curve' },
  { id: 'mat-single-leg-stretch', name: 'Single Leg Stretch', bpm: 94, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Alternate legs with precision' },
  { id: 'mat-double-leg-stretch', name: 'Double Leg Stretch', bpm: 88, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Arms and legs lengthen simultaneously' },
  { id: 'mat-scissors', name: 'Scissors', bpm: 92, level: 'intermediate', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Equal and opposite legs' },
  { id: 'mat-double-straight-leg', name: 'Double Straight Leg Stretch', bpm: 86, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Lower legs with control' },
  { id: 'mat-criss-cross', name: 'Criss Cross', bpm: 90, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Rotate through thoracic not neck' },
  { id: 'mat-spine-stretch', name: 'Spine Stretch Forward', bpm: 72, level: 'beginner', format: 'mat', blocks: ['floorwork1', 'cooldown'], duration: 75, cues: 'C-curve, reach past heels' },
  { id: 'mat-open-leg-rocker', name: 'Open Leg Rocker', bpm: 76, level: 'intermediate', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Balance, then roll' },
  { id: 'mat-corkscrew', name: 'Corkscrew', bpm: 74, level: 'intermediate', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Keep pelvis still as legs circle' },
  { id: 'mat-saw', name: 'Saw', bpm: 76, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Reach past pinky toe, wring out lungs' },
  { id: 'mat-swan', name: 'Swan', bpm: 72, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Lift from the back, not push from hands' },
  { id: 'mat-swan-dive', name: 'Swan Dive', bpm: 78, level: 'advanced', format: 'mat', blocks: ['floorwork1', 'peak'], duration: 90, cues: 'Rock with control, lengthen' },
  { id: 'mat-single-leg-kick', name: 'Single Leg Kick', bpm: 92, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Two kicks per side, exhale on kick' },
  { id: 'mat-double-leg-kick', name: 'Double Leg Kick', bpm: 86, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Chest lift on extension' },
  { id: 'mat-neck-pull', name: 'Neck Pull', bpm: 74, level: 'intermediate', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'No pulling on the neck, power from core' },
  { id: 'mat-shoulder-bridge', name: 'Shoulder Bridge', bpm: 80, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Stack spine, squeeze glutes at top' },
  { id: 'mat-side-kick-front-back', name: 'Side Kick Front & Back', bpm: 86, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 90, cues: 'Stable pelvis, kick from hip not waist' },
  { id: 'mat-side-kick-up-down', name: 'Side Kick Up & Down', bpm: 84, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Resist on the way down' },
  { id: 'mat-side-kick-circles', name: 'Side Kick Circles', bpm: 82, level: 'intermediate', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Small precise circles from the hip' },
  { id: 'mat-teaser', name: 'Teaser', bpm: 80, level: 'intermediate', format: 'mat', blocks: ['floorwork1', 'peak'], duration: 90, cues: 'V-shape, balance on tailbone' },
  { id: 'mat-hip-circles', name: 'Hip Circles', bpm: 78, level: 'intermediate', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Balance in teaser, circle hips' },
  { id: 'mat-leg-pull-front', name: 'Leg Pull Front', bpm: 84, level: 'intermediate', format: 'mat', blocks: ['floorwork1', 'peak'], duration: 75, cues: 'Plank position, kick leg up' },
  { id: 'mat-leg-pull-back', name: 'Leg Pull Back', bpm: 82, level: 'intermediate', format: 'mat', blocks: ['floorwork1', 'peak'], duration: 75, cues: 'Reverse plank, kick forward' },
  { id: 'mat-kneeling-sidekick', name: 'Kneeling Side Kick', bpm: 84, level: 'intermediate', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Long waist, don\'t collapse' },
  { id: 'mat-mermaid', name: 'Mermaid Stretch', bpm: 68, level: 'beginner', format: 'mat', blocks: ['floorwork1', 'cooldown'], duration: 75, cues: 'Side bend, create space in ribs' },
  { id: 'mat-seal', name: 'Seal', bpm: 80, level: 'beginner', format: 'mat', blocks: ['floorwork1'], duration: 75, cues: 'Clap feet, balance and roll' },

  // ══════════════════════════════════════════════
  // MAT — PEAK WORK
  // ══════════════════════════════════════════════
  { id: 'mat-boomerang', name: 'Boomerang', bpm: 88, level: 'advanced', format: 'mat', blocks: ['peak'], duration: 90, cues: 'Roll over, switch legs, balance' },
  { id: 'mat-crab', name: 'Crab', bpm: 84, level: 'advanced', format: 'mat', blocks: ['peak'], duration: 75, cues: 'Cross legs each roll' },
  { id: 'mat-rocking', name: 'Rocking', bpm: 82, level: 'advanced', format: 'mat', blocks: ['peak'], duration: 75, cues: 'Bow shape, rock from chest' },
  { id: 'mat-control-balance', name: 'Control Balance', bpm: 76, level: 'advanced', format: 'mat', blocks: ['peak'], duration: 90, cues: 'Shoulder stand, alternate legs' },
  { id: 'mat-push-up', name: 'Pilates Push Up', bpm: 96, level: 'intermediate', format: 'mat', blocks: ['peak'], duration: 75, cues: 'Walk out, straight body push up' },
  { id: 'mat-jackknife', name: 'Jackknife', bpm: 78, level: 'advanced', format: 'mat', blocks: ['peak'], duration: 75, cues: 'Control the descent' },
  { id: 'mat-highscissors', name: 'High Scissors', bpm: 100, level: 'advanced', format: 'mat', blocks: ['peak'], duration: 75, cues: 'Fast alternating legs at 45°' },
  { id: 'mat-bicycle', name: 'Bicycle', bpm: 104, level: 'advanced', format: 'mat', blocks: ['peak'], duration: 90, cues: 'Full extension of each leg' },
  { id: 'mat-spider-plank', name: 'Spider Plank', bpm: 108, level: 'intermediate', format: 'mat', blocks: ['peak'], duration: 75, cues: 'Knee to same elbow, keep hips level' },
  { id: 'mat-plank-hold', name: 'Plank Hold', bpm: 96, level: 'beginner', format: 'mat', blocks: ['peak'], duration: 60, cues: 'Long straight line from crown to heel' },
  { id: 'mat-side-plank', name: 'Side Plank', bpm: 90, level: 'intermediate', format: 'mat', blocks: ['peak'], duration: 60, cues: 'Stack hips, reach top arm' },
  { id: 'mat-burpee-pilates', name: 'Pilates Burpee', bpm: 120, level: 'advanced', format: 'mat', blocks: ['peak'], duration: 90, cues: 'Controlled jump, land soft' },
  { id: 'mat-jump-squat', name: 'Jump Squat', bpm: 124, level: 'intermediate', format: 'mat', blocks: ['peak'], duration: 75, cues: 'Land through toes, knees soft' },
  { id: 'mat-mountain-climber', name: 'Mountain Climbers', bpm: 128, level: 'intermediate', format: 'mat', blocks: ['peak'], duration: 75, cues: 'Fast alternate knees, stable shoulders' },

  // ══════════════════════════════════════════════
  // MAT — COOL DOWN
  // ══════════════════════════════════════════════
  { id: 'mat-supine-twist', name: 'Supine Spinal Twist', bpm: 64, level: 'beginner', format: 'mat', blocks: ['cooldown'], duration: 90, cues: 'Both shoulders grounded' },
  { id: 'mat-figure-four', name: 'Figure Four Stretch', bpm: 64, level: 'beginner', format: 'mat', blocks: ['cooldown'], duration: 90, cues: 'Flex foot, pull gently' },
  { id: 'mat-hamstring-stretch', name: 'Supine Hamstring Stretch', bpm: 65, level: 'beginner', format: 'mat', blocks: ['cooldown'], duration: 75, cues: 'Straight leg, dorsi flex foot' },
  { id: 'mat-savasana', name: 'Savasana', bpm: 62, level: 'beginner', format: 'mat', blocks: ['cooldown'], duration: 120, cues: 'Complete stillness and integration' },
  { id: 'mat-prone-rest', name: 'Prone Rest', bpm: 62, level: 'beginner', format: 'mat', blocks: ['cooldown'], duration: 60, cues: 'Let the body fully release' },
  { id: 'mat-seated-forward-fold', name: 'Seated Forward Fold', bpm: 65, level: 'beginner', format: 'mat', blocks: ['cooldown'], duration: 75, cues: 'Hinge from hips, not waist' },
  { id: 'mat-pigeon', name: 'Pigeon Pose', bpm: 64, level: 'beginner', format: 'mat', blocks: ['cooldown'], duration: 90, cues: 'Square hips, breathe into hip' },
  { id: 'mat-spinal-extension', name: 'Spinal Extension Stretch', bpm: 65, level: 'beginner', format: 'mat', blocks: ['cooldown'], duration: 75, cues: 'Gentle release after flexion work' },

  // ══════════════════════════════════════════════
  // REFORMER — FOOTWORK BLOCK
  // ══════════════════════════════════════════════
  { id: 'ref-footwork-parallel', name: 'Footwork — Parallel Heels', bpm: 72, level: 'beginner', format: 'reformer', blocks: ['footwork'], duration: 90, cues: 'Even pressure through heel, zip inner thighs' },
  { id: 'ref-footwork-toes', name: 'Footwork — Parallel Toes', bpm: 74, level: 'beginner', format: 'reformer', blocks: ['footwork'], duration: 90, cues: 'Press through ball of foot, calf lengthens' },
  { id: 'ref-footwork-arches', name: 'Footwork — Arches', bpm: 72, level: 'beginner', format: 'reformer', blocks: ['footwork'], duration: 75, cues: 'Maintain arch, don\'t grip with toes' },
  { id: 'ref-footwork-v', name: 'Footwork — Pilates V (Turned Out)', bpm: 74, level: 'beginner', format: 'reformer', blocks: ['footwork'], duration: 90, cues: 'External rotation from hip, not feet' },
  { id: 'ref-footwork-single', name: 'Single Leg Footwork', bpm: 76, level: 'intermediate', format: 'reformer', blocks: ['footwork'], duration: 90, cues: 'Square hips, don\'t shift' },
  { id: 'ref-footwork-calf-raise', name: 'Calf Raises on Footbar', bpm: 76, level: 'beginner', format: 'reformer', blocks: ['footwork'], duration: 75, cues: 'Two up, three counts down' },
  { id: 'ref-footwork-prances', name: 'Prances', bpm: 84, level: 'beginner', format: 'reformer', blocks: ['footwork'], duration: 75, cues: 'Alternate heel presses, maintain alignment' },
  { id: 'ref-hundred-prep', name: 'Hundred Prep on Reformer', bpm: 96, level: 'beginner', format: 'reformer', blocks: ['footwork', 'abdominals'], duration: 90, cues: '5 pumps in, 5 pumps out' },
  { id: 'ref-frog', name: 'Frog', bpm: 78, level: 'beginner', format: 'reformer', blocks: ['footwork'], duration: 75, cues: 'Heels together, press and return' },
  { id: 'ref-leg-circles-feet', name: 'Leg Circles in Straps', bpm: 76, level: 'beginner', format: 'reformer', blocks: ['footwork', 'legships'], duration: 90, cues: 'Stable pelvis, circle from hip' },

  // ══════════════════════════════════════════════
  // REFORMER — ABDOMINAL SERIES
  // ══════════════════════════════════════════════
  { id: 'ref-hundred', name: 'Hundred on Reformer', bpm: 100, level: 'beginner', format: 'reformer', blocks: ['abdominals'], duration: 120, cues: 'Pump arms, breathe in 5, out 5' },
  { id: 'ref-coordination', name: 'Coordination', bpm: 86, level: 'intermediate', format: 'reformer', blocks: ['abdominals'], duration: 90, cues: 'Open close legs before returning' },
  { id: 'ref-stomach-massage-round', name: 'Stomach Massage — Round Back', bpm: 80, level: 'intermediate', format: 'reformer', blocks: ['abdominals'], duration: 90, cues: 'C-curve spine, push and return' },
  { id: 'ref-stomach-massage-flat', name: 'Stomach Massage — Flat Back', bpm: 84, level: 'intermediate', format: 'reformer', blocks: ['abdominals'], duration: 90, cues: 'Upright spine, hands off bar' },
  { id: 'ref-stomach-massage-twist', name: 'Stomach Massage — Twist', bpm: 82, level: 'advanced', format: 'reformer', blocks: ['abdominals'], duration: 90, cues: 'Rotate ribcage, stable hips' },
  { id: 'ref-short-spine', name: 'Short Spine Massage', bpm: 72, level: 'intermediate', format: 'reformer', blocks: ['abdominals'], duration: 90, cues: 'Articulate slowly through each segment' },
  { id: 'ref-long-spine', name: 'Long Spine Massage', bpm: 70, level: 'advanced', format: 'reformer', blocks: ['abdominals'], duration: 90, cues: 'Control the roll over' },
  { id: 'ref-semicircle', name: 'Semi-Circle', bpm: 74, level: 'intermediate', format: 'reformer', blocks: ['abdominals'], duration: 90, cues: 'Articulate through full arc' },
  { id: 'ref-tendon-stretch', name: 'Tendon Stretch', bpm: 78, level: 'advanced', format: 'reformer', blocks: ['abdominals', 'legships'], duration: 75, cues: 'Balance on footbar, curl and lift' },
  { id: 'ref-elephant', name: 'Elephant', bpm: 78, level: 'intermediate', format: 'reformer', blocks: ['abdominals'], duration: 90, cues: 'Round spine, press carriage with heels' },
  { id: 'ref-knee-stretch-round', name: 'Knee Stretch — Round Back', bpm: 86, level: 'beginner', format: 'reformer', blocks: ['abdominals'], duration: 90, cues: 'Exhale on push, stay curved' },
  { id: 'ref-knee-stretch-arch', name: 'Knee Stretch — Arched Back', bpm: 86, level: 'intermediate', format: 'reformer', blocks: ['abdominals'], duration: 90, cues: 'Hips forward, chest open' },
  { id: 'ref-knee-stretch-knees-off', name: 'Knee Stretch — Knees Off', bpm: 90, level: 'advanced', format: 'reformer', blocks: ['abdominals', 'peak'], duration: 75, cues: 'Hover knees 2 inches, maintain' },
  { id: 'ref-running', name: 'Running on Reformer', bpm: 108, level: 'beginner', format: 'reformer', blocks: ['abdominals', 'peak'], duration: 90, cues: 'Alternate heel presses, fluid rhythm' },

  // ══════════════════════════════════════════════
  // REFORMER — LEG & HIP SERIES
  // ══════════════════════════════════════════════
  { id: 'ref-side-lying-sidekick', name: 'Side Lying — Side Kick', bpm: 84, level: 'beginner', format: 'reformer', blocks: ['legships'], duration: 90, cues: 'Top hip over bottom, flex on kick' },
  { id: 'ref-side-lying-circles', name: 'Side Lying — Leg Circles', bpm: 82, level: 'beginner', format: 'reformer', blocks: ['legships'], duration: 75, cues: 'Stable pelvis, circle from hip socket' },
  { id: 'ref-side-lying-bicycle', name: 'Side Lying — Bicycle', bpm: 88, level: 'intermediate', format: 'reformer', blocks: ['legships'], duration: 75, cues: 'Full extension front and back' },
  { id: 'ref-side-lying-beats', name: 'Side Lying — Inner Thigh Lifts', bpm: 86, level: 'beginner', format: 'reformer', blocks: ['legships'], duration: 75, cues: 'Bottom leg work, don\'t roll' },
  { id: 'ref-kneeling-lunge', name: 'Kneeling Lunge', bpm: 80, level: 'intermediate', format: 'reformer', blocks: ['legships'], duration: 90, cues: 'Front knee tracking, deep hip flexor stretch' },
  { id: 'ref-standing-lunge', name: 'Standing Lunge on Reformer', bpm: 82, level: 'intermediate', format: 'reformer', blocks: ['legships'], duration: 90, cues: 'Control carriage, don\'t let it fly' },
  { id: 'ref-squat-platform', name: 'Squat on Platform', bpm: 86, level: 'intermediate', format: 'reformer', blocks: ['legships'], duration: 90, cues: 'Weight in heels, press platform away' },
  { id: 'ref-hip-abduction', name: 'Hip Abduction in Straps', bpm: 80, level: 'beginner', format: 'reformer', blocks: ['legships'], duration: 75, cues: 'Slow open, control return' },
  { id: 'ref-hip-adduction', name: 'Hip Adduction in Straps', bpm: 80, level: 'beginner', format: 'reformer', blocks: ['legships'], duration: 75, cues: 'Squeeze inner thighs to midline' },
  { id: 'ref-arabesque', name: 'Arabesque on Reformer', bpm: 78, level: 'advanced', format: 'reformer', blocks: ['legships'], duration: 75, cues: 'Long line, don\'t hike hip' },
  { id: 'ref-knee-to-chest', name: 'Knee to Chest Stretch', bpm: 68, level: 'beginner', format: 'reformer', blocks: ['legships', 'stretch'], duration: 60, cues: 'Decompress lumbar spine' },
  { id: 'ref-hamstring-stretch-strap', name: 'Hamstring Stretch in Strap', bpm: 68, level: 'beginner', format: 'reformer', blocks: ['legships', 'stretch'], duration: 75, cues: 'Dorsi flex foot, breathe into back of leg' },

  // ══════════════════════════════════════════════
  // REFORMER — UPPER BODY & ARMS
  // ══════════════════════════════════════════════
  { id: 'ref-rowing-from-hip', name: 'Rowing — From the Hip', bpm: 78, level: 'intermediate', format: 'reformer', blocks: ['upperbody'], duration: 90, cues: 'Hinge forward, sweep arms back' },
  { id: 'ref-rowing-from-chest', name: 'Rowing — From the Chest', bpm: 76, level: 'intermediate', format: 'reformer', blocks: ['upperbody'], duration: 90, cues: 'Round forward, reach to horizon' },
  { id: 'ref-rowing-shave', name: 'Rowing — The Shave', bpm: 78, level: 'intermediate', format: 'reformer', blocks: ['upperbody'], duration: 90, cues: 'Shave up the back of the head' },
  { id: 'ref-rowing-hug', name: 'Rowing — Hug a Tree', bpm: 76, level: 'intermediate', format: 'reformer', blocks: ['upperbody'], duration: 75, cues: 'Round arms, maintain open chest' },
  { id: 'ref-pulling-straps1', name: 'Pulling Straps 1', bpm: 80, level: 'intermediate', format: 'reformer', blocks: ['upperbody'], duration: 75, cues: 'Pull arms back, chest lifts' },
  { id: 'ref-pulling-straps2', name: 'Pulling Straps 2 (T Pull)', bpm: 80, level: 'intermediate', format: 'reformer', blocks: ['upperbody'], duration: 75, cues: 'T position, lift chest' },
  { id: 'ref-chest-expansion', name: 'Chest Expansion', bpm: 76, level: 'beginner', format: 'reformer', blocks: ['upperbody'], duration: 75, cues: 'Open chest, turn head slowly' },
  { id: 'ref-bicep-curls', name: 'Bicep Curls on Reformer', bpm: 80, level: 'beginner', format: 'reformer', blocks: ['upperbody'], duration: 75, cues: 'Stable wrists, full range' },
  { id: 'ref-tricep-press', name: 'Tricep Press on Reformer', bpm: 80, level: 'beginner', format: 'reformer', blocks: ['upperbody'], duration: 75, cues: 'Elbows in, full extension' },
  { id: 'ref-hug-a-tree', name: 'Hug a Tree (Chest Flies)', bpm: 78, level: 'beginner', format: 'reformer', blocks: ['upperbody'], duration: 75, cues: 'Keep slight bend in elbows' },
  { id: 'ref-salute', name: 'Salute', bpm: 78, level: 'intermediate', format: 'reformer', blocks: ['upperbody'], duration: 75, cues: 'Press up overhead, stable core' },
  { id: 'ref-backstroke', name: 'Backstroke', bpm: 82, level: 'intermediate', format: 'reformer', blocks: ['upperbody'], duration: 90, cues: 'Coordinate arms and legs' },
  { id: 'ref-teaser-reformer', name: 'Teaser on Reformer', bpm: 80, level: 'intermediate', format: 'reformer', blocks: ['upperbody', 'peak'], duration: 90, cues: 'Balance in V, use straps lightly' },

  // ══════════════════════════════════════════════
  // REFORMER — PEAK
  // ══════════════════════════════════════════════
  { id: 'ref-jump-board', name: 'Jump Board — Parallel', bpm: 120, level: 'intermediate', format: 'reformer', blocks: ['peak'], duration: 90, cues: 'Land through toes, springs absorb impact' },
  { id: 'ref-jump-board-v', name: 'Jump Board — Pilates V', bpm: 120, level: 'intermediate', format: 'reformer', blocks: ['peak'], duration: 90, cues: 'External rotation, turn out jumps' },
  { id: 'ref-jump-board-single', name: 'Jump Board — Single Leg', bpm: 112, level: 'advanced', format: 'reformer', blocks: ['peak'], duration: 75, cues: 'Balance and control on landing' },
  { id: 'ref-jump-board-crossover', name: 'Jump Board — Crossover', bpm: 116, level: 'advanced', format: 'reformer', blocks: ['peak'], duration: 75, cues: 'Cross feet on each jump' },
  { id: 'ref-star', name: 'Star', bpm: 86, level: 'advanced', format: 'reformer', blocks: ['peak'], duration: 75, cues: 'Side plank on carriage, lift top leg' },
  { id: 'ref-up-stretch', name: 'Up Stretch', bpm: 88, level: 'intermediate', format: 'reformer', blocks: ['peak'], duration: 90, cues: 'Pike up, lengthen through hamstrings' },
  { id: 'ref-down-stretch', name: 'Down Stretch', bpm: 84, level: 'intermediate', format: 'reformer', blocks: ['peak'], duration: 75, cues: 'Arch back, open chest' },
  { id: 'ref-long-stretch', name: 'Long Stretch', bpm: 86, level: 'intermediate', format: 'reformer', blocks: ['peak'], duration: 75, cues: 'Plank on reformer, press back' },

  // ══════════════════════════════════════════════
  // REFORMER — STRETCH & FINISHING
  // ══════════════════════════════════════════════
  { id: 'ref-mermaid', name: 'Mermaid on Reformer', bpm: 66, level: 'beginner', format: 'reformer', blocks: ['stretch'], duration: 90, cues: 'Side bend, reach over and through' },
  { id: 'ref-spinal-twist', name: 'Spinal Twist', bpm: 66, level: 'beginner', format: 'reformer', blocks: ['stretch'], duration: 75, cues: 'Sit tall, rotate from thoracic' },
  { id: 'ref-snake', name: 'Snake', bpm: 74, level: 'advanced', format: 'reformer', blocks: ['stretch', 'peak'], duration: 90, cues: 'Undulate spine through the movement' },
  { id: 'ref-twist-reformer', name: 'Twist on Reformer', bpm: 72, level: 'advanced', format: 'reformer', blocks: ['stretch', 'peak'], duration: 90, cues: 'Side plank twist, thread the needle' },
  { id: 'ref-hip-flexor', name: 'Hip Flexor Stretch', bpm: 65, level: 'beginner', format: 'reformer', blocks: ['stretch'], duration: 90, cues: 'Anterior tilt release, breathe deeply' },
  { id: 'ref-supine-spinal', name: 'Supine Spinal Twist', bpm: 64, level: 'beginner', format: 'reformer', blocks: ['stretch'], duration: 90, cues: 'Let gravity do the work' },
  { id: 'ref-hamstring-stretch', name: 'Hamstring & Calf Stretch', bpm: 65, level: 'beginner', format: 'reformer', blocks: ['stretch'], duration: 75, cues: 'Press heel to ceiling' },
  { id: 'ref-seated-meditation', name: 'Seated Breathing & Integration', bpm: 62, level: 'beginner', format: 'reformer', blocks: ['stretch'], duration: 90, cues: 'Full breath, feel the work done' },
]

// Get movements for a specific format and block
export function getMovementsForBlock(format: 'mat' | 'reformer', blockId: string, level: 'beginner' | 'intermediate' | 'advanced'): Movement[] {
  const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 }
  const userLevel = levelOrder[level]
  return MOVEMENTS.filter(m =>
    (m.format === format || m.format === 'both') &&
    m.blocks.includes(blockId) &&
    levelOrder[m.level] <= userLevel
  )
}

// Calculate the weighted average BPM of selected movements
export function calcTargetBpm(selectedMovements: Movement[]): number {
  if (selectedMovements.length === 0) return 85
  const avg = selectedMovements.reduce((acc, m) => acc + m.bpm, 0) / selectedMovements.length
  return Math.round(avg)
}

// Given a target BPM, return a reasonable BPM range (±12)
export function bpmRangeFromMovements(selectedMovements: Movement[], fallbackMin: number, fallbackMax: number): [number, number] {
  if (selectedMovements.length === 0) return [fallbackMin, fallbackMax]
  const avg = calcTargetBpm(selectedMovements)
  const min = Math.max(60, avg - 12)
  const max = Math.min(160, avg + 12)
  return [min, max]
}
