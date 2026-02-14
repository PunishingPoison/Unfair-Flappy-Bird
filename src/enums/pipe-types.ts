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
  // Pipe chaos event counts - EXTREME
  eventProbabilities: [
    { count: 0, chance: 0.0 }, // 0% chance of no events - ALWAYS chaos
    { count: 1, chance: 0.4 }, // 40% chance of 1 event
    { count: 2, chance: 0.75 }, // 75% chance of 2 events (35% extra)
    { count: 3, chance: 0.5 }, // 50% chance of 3 events
    { count: 4, chance: 0.25 } // 25% chance of 4 events - OVERLOAD
  ],

  // Bird chaos chance per pipe pass - MAXIMUM
  birdChaosChance: 0.95, // 95% - ALMOST CERTAIN

  // Late reaction windows (milliseconds before collision)
  lateTriggerDistance: 35, // pixels - VIRTUALLY IMPOSSIBLE to react
  maxActivationTime: 0.06, // seconds - <60ms, physically impossible for humans

  // Difficulty escalation - START HARD IMMEDIATELY
  minimalChaosPipes: 0, // Pipes start with chaos immediately
  singleEventPipes: 1, // Only pipe 0 is easier
  fullChaosStart: 1 // Pipe 1+: FULL CHAOS
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

  // ALL PIPES: ABSOLUTE MAXIMUM CHAOS IMMEDIATELY - NO MERCY
  const rand = Math.random();
  let eventCount = 4; // Minimum 4 events from the very first pipe

  // Stack multiple events ABSOLUTE MAXIMUM
  if (rand < 0.5) {
    eventCount = 7; // 50% chance of 7 events - ABSOLUTE INSANITY
  } else if (rand < 0.8) {
    eventCount = 6; // 30% chance of 6 events
  } else if (rand < 0.95) {
    eventCount = 5; // 15% chance of 5 events
  }
  // 5% chance of 4 events (minimum)

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
  // Pipe 0 is normal (mercy)
  if (pipeIndex === 0) return PipeType.normal;

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
