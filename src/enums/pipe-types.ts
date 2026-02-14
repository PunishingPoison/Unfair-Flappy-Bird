/**
 * Unfair Flappy Bird - Chaos Events
 * Extreme unfairness through overlapping random chaos
 */

export enum PipeType {
  normal = 'normal',
  trollMove = 'trollMove',
  fakeGap = 'fakeGap',
  snapClose = 'snapClose',
  reverseZone = 'reverseZone'
}

export enum ChaosEvent {
  // Pipe chaos events
  doubleTroll = 'doubleTroll',
  gapTeleport = 'gapTeleport',
  gapDrift = 'gapDrift',
  pipeSwap = 'pipeSwap',
  fakeCeiling = 'fakeCeiling',
  phantomPipe = 'phantomPipe',
  lateSpawn = 'lateSpawn',
  collisionShift = 'collisionShift',
  invisiblePipe = 'invisiblePipe',
  magnetPipe = 'magnetPipe',
  shrinkingPipe = 'shrinkingPipe',
  baitPipe = 'baitPipe',
  // Bird chaos events
  flapRandom = 'flapRandom',
  flapDelay = 'flapDelay',
  suddenDrop = 'suddenDrop',
  airBurst = 'airBurst',
  inputLag = 'inputLag',
  gravityShift = 'gravityShift',
  windGust = 'windGust'
}

/**
 * Chaos probability configuration
 * EXTREME unfairness - nearly impossible to pass score 5
 */
export const CHAOS_CONFIG = {
  // Pipe chaos event counts - BALANCED
  eventProbabilities: [
    { count: 0, chance: 0.4 }, // 40% chance of NO events - BREAKS
    { count: 1, chance: 0.4 }, // 40% chance of 1 event
    { count: 2, chance: 0.15 }, // 15% chance of 2 events
    { count: 3, chance: 0.05 }, // 5% chance of 3 events
    { count: 4, chance: 0.0 } // 0% chance of 4 events - REMOVED
  ],

  // Bird chaos chance per pipe pass - REDUCED
  birdChaosChance: 0.2, // 20% - Occasional

  // Late reaction windows (milliseconds before collision)
  lateTriggerDistance: 100, // pixels - Reactable
  maxActivationTime: 0.5, // seconds - Reactable

  // Difficulty escalation - GRADUAL
  minimalChaosPipes: 3, // First 3 pipes are normal
  singleEventPipes: 10, // Next 7 pipes have max 1 event
  fullChaosStart: 20 // Full chaos after pipe 20
};

/**
 * All available chaos events for assignment
 */
export const PIPE_CHAOS_EVENTS = [
  ChaosEvent.doubleTroll,
  ChaosEvent.gapTeleport,
  ChaosEvent.gapDrift,
  ChaosEvent.pipeSwap,
  ChaosEvent.fakeCeiling,
  ChaosEvent.phantomPipe,
  ChaosEvent.lateSpawn,
  ChaosEvent.collisionShift,
  ChaosEvent.invisiblePipe,
  ChaosEvent.magnetPipe,
  ChaosEvent.shrinkingPipe,
  ChaosEvent.baitPipe
];

export const BIRD_CHAOS_EVENTS = [
  ChaosEvent.flapRandom,
  ChaosEvent.flapDelay,
  ChaosEvent.suddenDrop,
  ChaosEvent.airBurst,
  ChaosEvent.inputLag,
  ChaosEvent.gravityShift,
  ChaosEvent.windGust
];

/**
 * Generate random chaos events for a pipe
 * ABSOLUTE MAXIMUM MODE - IMMEDIATE CHAOS FROM PIPE 0
 */
export function generateChaosEvents(pipeIndex: number): ChaosEvent[] {
  const events: ChaosEvent[] = [];

  // ALL PIPES: SCALED CHAOS
  const rand = Math.random();
  let eventCount = 0; // Default 0 events

  // Difficulty scaling
  if (pipeIndex < CHAOS_CONFIG.minimalChaosPipes) {
    return []; // No chaos for first few pipes
  }

  // Gradual difficulty curve
  if (rand < 0.5) {
    eventCount = 1; // 50% chance of 1 event
  } else if (rand < 0.7 && pipeIndex > CHAOS_CONFIG.singleEventPipes) {
    eventCount = 2; // 20% chance of 2 events (only after some pipes)
  }

  // Select random unique events
  const availableEvents = [...PIPE_CHAOS_EVENTS];
  for (let i = 0; i < eventCount && availableEvents.length > 0; i++) {
    const index = Math.floor(Math.random() * availableEvents.length);
    events.push(availableEvents.splice(index, 1)[0]);
  }

  return events;
}

/**
 * Generate bird chaos events
 */
export function generateBirdChaosEvents(): ChaosEvent[] {
  const events: ChaosEvent[] = [];

  if (Math.random() < CHAOS_CONFIG.birdChaosChance) {
    const event = BIRD_CHAOS_EVENTS[Math.floor(Math.random() * BIRD_CHAOS_EVENTS.length)];
    events.push(event);
  }

  return events;
}

/**
 * Deterministic trap assignment (original unfair pipes)
 * RANDOM DISTRIBUTION - No patterns to exploit
 */
export function getTrapType(pipeIndex: number): PipeType {
  // First few pipes are normal (mercy)
  if (pipeIndex < CHAOS_CONFIG.minimalChaosPipes) return PipeType.normal;

  // Random trap assignment - no predictable patterns
  const rand = Math.random();
  if (rand < 0.25) return PipeType.reverseZone;
  if (rand < 0.5) return PipeType.snapClose;
  if (rand < 0.75) return PipeType.fakeGap;
  if (rand < 0.9) return PipeType.trollMove;

  return PipeType.normal;
}

/**
 * Check if pipe should shift up or down (based on index parity)
 */
export function getTrollDirection(pipeIndex: number): 1 | -1 {
  return pipeIndex % 2 === 0 ? 1 : -1;
}
