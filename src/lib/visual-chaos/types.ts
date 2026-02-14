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
  // Probability per pipe - REDUCED FROM EXTREME
  singleEventChance: 0.3, // 30% - Occasional
  doubleEventChance: 0.1, // 10% - Rare
  tripleEventChance: 0.05, // 5% - Very Rare
  quadEventChance: 0.0, // 0% - Disabled

  // Duration range (ms) - REDUCED
  minDuration: 500,
  maxDuration: 2000,

  // Difficulty scaling
  scoreThreshold: 5,
  lowChanceMultiplier: 0.5, // 50% chance below threshold

  // Effect-specific settings - BALANCED
  screenOffsetRange: { min: 10, max: 25 }, // Max ~10% of screen width (288px)
  glitchSliceHeight: { min: 2, max: 20 },
  staticNoiseDensity: 0.2,
  flickerFrequency: 10, // Slower flicker
  screenShakeIntensity: { min: 2, max: 5 }, // Very Light
  screenShakeFrequency: 5 // Less frequent
};

/**
 * All available visual chaos events
 */
export const ALL_VISUAL_EVENTS = [
  VisualChaosEvent.blackout,
  // VisualChaosEvent.birdInvisible, // REMOVED
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

  // REDUCED visual chaos - generally 0-2 events
  const rand = Math.random();
  let eventCount = 1; // Default 1 event if triggered

  if (rand < 0.1) {
    eventCount = 2; // 10% chance of 2 events
  }

  // Cap at 2 events max
  eventCount = Math.min(eventCount, 2);

  // Generate events
  const availableEvents = [...ALL_VISUAL_EVENTS];
  for (let i = 0; i < eventCount && availableEvents.length > 0; i++) {
    const index = Math.floor(Math.random() * availableEvents.length);
    const type = availableEvents.splice(index, 1)[0];

    // Duration logic
    let durationMs = 500 + Math.random() * 1000; // Default: 0.5-1.5 seconds

    // Short duration for distraction effects (Shake, Blur)
    if (type === VisualChaosEvent.screenShake || type === VisualChaosEvent.blur) {
      durationMs = 200 + Math.random() * 300; // 0.2-0.5 seconds (Very Short)
    }

    events.push({
      type,
      durationMs,
      startTime: now,
      active: true
    });
  }

  return events;
}
