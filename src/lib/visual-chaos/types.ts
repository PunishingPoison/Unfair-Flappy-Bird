/**
 * Unfair Flappy Bird - Visual Chaos System
 * Visual disturbances that impair player perception
 * Affects rendering only, never physics
 */

export enum VisualChaosEvent {
  blackout = 'blackout',
  birdInvisible = 'birdInvisible',
  screenGlitch = 'screenGlitch',
  screenOffset = 'screenOffset',
  flicker = 'flicker',
  staticNoise = 'staticNoise',
  screenShake = 'screenShake',
  blur = 'blur',
  invert = 'invert',
  zoom = 'zoom',
  doubleVision = 'doubleVision',
  colorShift = 'colorShift',
  vignette = 'vignette',
  pixelate = 'pixelate',
  scanlines = 'scanlines',
  extremeContrast = 'extremeContrast',
  rainbow = 'rainbow'
}

export interface VisualChaosEventInstance {
  type: VisualChaosEvent;
  durationMs: number;
  startTime: number;
  active: boolean;
}

/**
 * Chaos probability configuration - MAXIMUM EXTREME
 */
export const VISUAL_CHAOS_CONFIG = {
  // Probability per pipe - MAXIMUM
  singleEventChance: 0.98, // 98% - ALMOST CERTAIN
  doubleEventChance: 0.9, // 90% - CONSTANT STACKING
  tripleEventChance: 0.75, // 75% - VERY COMMON TRIPLE
  quadEventChance: 0.4, // 40% - QUADRUPLE CHAOS

  // Duration range (ms) - EXTREMELY LONG AND PERSISTENT
  minDuration: 1500,
  maxDuration: 6000,

  // Difficulty scaling - START MAXIMUM FROM BEGINNING
  scoreThreshold: 1,
  lowChanceMultiplier: 0.95, // 95% even at start - barely any mercy

  // Effect-specific settings - ABSOLUTE MAXIMUM
  screenOffsetRange: { min: 60, max: 200 },
  glitchSliceHeight: { min: 2, max: 80 },
  staticNoiseDensity: 0.6,
  flickerFrequency: 1, // Every frame
  screenShakeIntensity: { min: 10, max: 30 },
  screenShakeFrequency: 1 // Every frame
};

/**
 * All available visual chaos events
 */
export const ALL_VISUAL_EVENTS = [
  VisualChaosEvent.blackout,
  VisualChaosEvent.birdInvisible,
  VisualChaosEvent.screenGlitch,
  VisualChaosEvent.screenOffset,
  VisualChaosEvent.flicker,
  VisualChaosEvent.staticNoise,
  VisualChaosEvent.screenShake,
  VisualChaosEvent.blur,
  VisualChaosEvent.invert,
  VisualChaosEvent.zoom,
  VisualChaosEvent.doubleVision,
  VisualChaosEvent.colorShift,
  VisualChaosEvent.vignette,
  VisualChaosEvent.pixelate,
  VisualChaosEvent.scanlines,
  VisualChaosEvent.extremeContrast,
  VisualChaosEvent.rainbow
];

/**
 * Generate random visual chaos events - MAXIMUM CHAOS
 */
export function generateVisualChaosEvents(currentScore: number): VisualChaosEventInstance[] {
  const events: VisualChaosEventInstance[] = [];
  const now = Date.now();

  // ABSOLUTE MAXIMUM visual chaos - 4-6 events every single time
  const rand = Math.random();
  let eventCount = 5; // Minimum 5 events

  if (rand < 0.5) {
    eventCount = 7; // 50% chance of 7 events - ABSOLUTE MAXIMUM
  } else if (rand < 0.8) {
    eventCount = 6; // 30% chance of 6 events
  }
  // 20% chance of 5 events

  // Generate events
  const availableEvents = [...ALL_VISUAL_EVENTS];
  for (let i = 0; i < eventCount && availableEvents.length > 0; i++) {
    const index = Math.floor(Math.random() * availableEvents.length);
    const type = availableEvents.splice(index, 1)[0];

    // Long duration for persistent chaos
    const durationMs = 1000 + Math.random() * 1500; // 1-2.5 seconds

    events.push({
      type,
      durationMs,
      startTime: now,
      active: true
    });
  }

  return events;
}
