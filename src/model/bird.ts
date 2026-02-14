import {
  BIRD_HEIGHT,
  BIRD_INITIAL_DIMENSION,
  BIRD_JUMP_HEIGHT,
  BIRD_MAX_ROTATION,
  BIRD_MIN_ROTATION,
  BIRD_WEIGHT,
  BIRD_X_POSITION
} from '../constants';
import { clamp, flipRange, rescaleDim, sine as sineWave } from '../utils';
import ParentClass from '../abstracts/parent-class';
import Pipe from './pipe';
import Sfx from './sfx';
import SpriteDestructor from '../lib/sprite-destructor';
import SceneGenerator from './scene-generator';
import { ChaosEvent, generateBirdChaosEvents } from '../enums/pipe-types';

export type IBirdColor = string;
export type IBirdRecords = Map<IBirdColor, HTMLImageElement>;

/**
 * Unfair Flappy Bird - Extreme chaos edition
 * Bird physics with unpredictable chaos events
 */
export default class Bird extends ParentClass {
  private static readonly FLAG_IS_ALIVE = 0b0001;
  private static readonly FLAG_DIED = 0b0010;
  private static readonly FLAG_DOES_LANDED = 0b0100;
  private flags: number;

  public static platformHeight = 0;
  public score: number;

  private wingState: number;
  private scaled: IDimension;
  private rotation: number;
  private force: number;
  private causeOfDeath: number;

  private images: IBirdRecords;
  private color: IBirdColor;
  private lastCoord: number;

  // Reverse zone state
  private isInReverseZone: boolean;

  // Chaos event states
  private activeChaosEvents: ChaosEvent[];
  private pendingFlap: boolean;
  private flapDelayTimer: number;
  private airBurstActive: boolean;
  private airBurstTimer: number;
  private suddenDropCooldown: number;

  // New chaos states
  private gravityMultiplier: number;
  private windForce: number;
  private windTimer: number;

  // Callback for when pipe is passed
  public onPipePassed: (() => void) | null;

  constructor() {
    super();
    this.color = 'yellow';
    this.images = new Map<string, HTMLImageElement>();
    this.force = 0;
    this.scaled = { width: 0, height: 0 };

    this.score = 0;
    this.rotation = 0;
    this.causeOfDeath = 0;
    this.flags = 0b0001;
    this.lastCoord = 0;
    this.wingState = 1;
    this.isInReverseZone = false;

    // Chaos states
    this.activeChaosEvents = [];
    this.pendingFlap = false;
    this.flapDelayTimer = 0;
    this.airBurstActive = false;
    this.airBurstTimer = 0;
    this.suddenDropCooldown = 0;

    // New chaos states
    this.gravityMultiplier = 1.0;
    this.windForce = 0;
    this.windTimer = 0;

    this.onPipePassed = null;
  }

  public init(): void {
    this.images.set('yellow.0', SpriteDestructor.asset('bird-yellow-up'));
    this.images.set('yellow.1', SpriteDestructor.asset('bird-yellow-mid'));
    this.images.set('yellow.2', SpriteDestructor.asset('bird-yellow-down'));
    this.images.set('blue.0', SpriteDestructor.asset('bird-blue-up'));
    this.images.set('blue.1', SpriteDestructor.asset('bird-blue-mid'));
    this.images.set('blue.2', SpriteDestructor.asset('bird-blue-down'));
    this.images.set('red.0', SpriteDestructor.asset('bird-red-up'));
    this.images.set('red.1', SpriteDestructor.asset('bird-red-mid'));
    this.images.set('red.2', SpriteDestructor.asset('bird-red-down'));

    Object.assign(SceneGenerator.birdColorList, ['yellow', 'red', 'blue']);
    this.use(SceneGenerator.bird);
  }

  private variableReset(): void {
    this.score = 0;
    this.rotation = 0;
    this.causeOfDeath = 0;
    this.flags = 0b0001;
    this.lastCoord = 0;
    this.wingState = 1;
    this.isInReverseZone = false;

    // Reset chaos states
    this.activeChaosEvents = [];
    this.pendingFlap = false;
    this.flapDelayTimer = 0;
    this.airBurstActive = false;
    this.airBurstTimer = 0;
    this.suddenDropCooldown = 0;

    // Reset new chaos states
    this.gravityMultiplier = 1.0;
    this.windForce = 0;
    this.windTimer = 0;
  }

  public reset(): void {
    this.variableReset();
    this.resize(this.canvasSize);
    this.use(SceneGenerator.bird);
  }

  public get alive(): boolean {
    return (this.flags & Bird.FLAG_IS_ALIVE) !== 0;
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });
    this.coordinate.y = Bird.platformHeight * 0.5;
    this.coordinate.x = width * BIRD_X_POSITION;
    this.force = height * BIRD_JUMP_HEIGHT;
    this.scaled = rescaleDim(BIRD_INITIAL_DIMENSION, { height: height * BIRD_HEIGHT });
  }

  /**
   * Trigger new chaos events (called when passing a pipe)
   */
  public triggerChaosEvents(): void {
    this.activeChaosEvents = generateBirdChaosEvents();
  }

  /**
   * Chaos flap - with randomness and delays
   */
  public flap(): void {
    if (this.coordinate.y < 0 || (this.flags & Bird.FLAG_IS_ALIVE) === 0) return;

    // Handle input lag chaos - randomly eats inputs
    if (this.activeChaosEvents.includes(ChaosEvent.inputLag)) {
      if (Math.random() < 0.35) {
        // 35% chance to completely ignore the flap - MORE FREQUENT
        return; // Input eaten!
      }
    }

    // Handle flap delay chaos
    if (this.activeChaosEvents.includes(ChaosEvent.flapDelay) && !this.pendingFlap) {
      this.pendingFlap = true;
      this.flapDelayTimer = 0.05 + Math.random() * 0.07; // 50-120ms delay
      return;
    }

    this.executeFlap();
  }

  /**
   * Execute the actual flap with chaos multipliers
   */
  private executeFlap(): void {
    Sfx.wing();

    let flapForce = this.force;

    // Flap random: 0.7 - 1.3 multiplier
    if (this.activeChaosEvents.includes(ChaosEvent.flapRandom)) {
      const randomMultiplier = 0.7 + Math.random() * 0.6;
      flapForce *= randomMultiplier;
    }

    // Air burst: reduces lift
    if (this.airBurstActive) {
      flapForce *= 0.6;
    }

    // Apply flap (reversed if in reverse zone)
    if (this.isInReverseZone) {
      this.velocity.y = -flapForce;
    } else {
      this.velocity.y = flapForce;
    }

    this.lastCoord = this.coordinate.y;
    this.pendingFlap = false;
    this.flapDelayTimer = 0;
  }

  /**
   * Set reverse zone state
   */
  public setReverseZone(inReverse: boolean): void {
    this.isInReverseZone = inReverse;
  }

  /**
   * Check if bird touches the platform
   */
  private doesHitTheFloor(): boolean {
    return this.coordinate.y + this.rotatedDimension().height > Math.abs(this.canvasSize.height - Bird.platformHeight);
  }

  /**
   * Check collision with all unfair traps including phantom pipes
   */
  public isDead(pipes: Pipe[]): boolean {
    if (this.doesHitTheFloor()) {
      this.flags &= ~Bird.FLAG_IS_ALIVE;
      this.causeOfDeath = 1;
      return (this.flags & Bird.FLAG_IS_ALIVE) === 0;
    }

    const newDim = this.rotatedDimension();
    const boundary = newDim.width - newDim.height / 2;

    for (const pipe of pipes) {
      try {
        // Skip bait pipes - they look real but don't collide
        if (!pipe.hasCollision()) {
          continue;
        }

        const hcx = pipe.coordinate.x;
        const width = Pipe.pipeSize.width / 2;

        // Skip past pipe
        if (hcx + width < this.coordinate.x - boundary) continue;

        // Is Inside of Pipes?
        if (Math.abs(hcx - width) <= this.coordinate.x + boundary) {
          // Score counting
          if (hcx < this.coordinate.x && !pipe.isPassed) {
            this.score++;
            Sfx.point();
            pipe.isPassed = true;

            // Trigger new chaos events on each pipe pass
            this.triggerChaosEvents();

            // Notify gameplay screen for visual chaos
            if (this.onPipePassed) {
              this.onPipePassed();
            }
          }

          // Get effective gap bounds
          const gapBounds = pipe.getEffectiveGapBounds();

          // Collision check
          if (
            gapBounds.isSolid ||
            this.coordinate.y - newDim.height < gapBounds.top ||
            this.coordinate.y + newDim.height > gapBounds.bottom
          ) {
            this.flags &= ~Bird.FLAG_IS_ALIVE;
            this.causeOfDeath = 2;
            break;
          }

          // Fake ceiling check
          if (gapBounds.hasCeiling && this.coordinate.y - newDim.height < gapBounds.ceilingY) {
            this.flags &= ~Bird.FLAG_IS_ALIVE;
            this.causeOfDeath = 2;
            break;
          }
        }

        // Check phantom pipe collision (invisible trap)
        if (pipe.checkPhantomCollision(this.coordinate.x, this.coordinate.y, boundary, newDim.height)) {
          this.flags &= ~Bird.FLAG_IS_ALIVE;
          this.causeOfDeath = 2;
          break;
        }

        // Only the first pipe should be checked
        break;
      } catch (err) {}
    }

    return (this.flags & Bird.FLAG_IS_ALIVE) === 0;
  }

  public rotatedDimension(): IDimension {
    const rad = (this.rotation * Math.PI) / 180;
    const w = this.scaled.width / 2;
    const h = this.scaled.height / 2;
    const sTheta = Math.sin(rad);
    const cTheta = Math.cos(rad);

    return {
      width: 2 * Math.sqrt(Math.pow(w * cTheta, 2) + Math.pow(h * sTheta, 2)),
      height: 2 * Math.sqrt(Math.pow(w * sTheta, 2) + Math.pow(h * cTheta, 2))
    };
  }

  public playDead(): void {
    if ((this.flags & Bird.FLAG_DIED) !== 0) return;
    this.flags |= Bird.FLAG_DIED;
    if (this.causeOfDeath === 2) Sfx.die();
  }

  public use(color: IBirdColor): void {
    this.color = color;
  }

  public doWave({ x, y }: ICoordinate, frequency: number, amplitude: number): void {
    this.flapWing(3);
    y += sineWave(frequency, amplitude);
    this.coordinate = { x, y };
  }

  private flapWing(speed: number): void {
    this.wingState = (1 + sineWave(speed, 2)) | 0;
    if (this.rotation > 70) this.wingState = 1;
  }

  private handleRotation(dt: number): void {
    this.rotation += (this.coordinate.y < this.lastCoord ? -7.2 : 6.5) * dt * 48;
    this.rotation = clamp(BIRD_MIN_ROTATION, BIRD_MAX_ROTATION, this.rotation);

    if ((this.flags & Bird.FLAG_IS_ALIVE) === 0) {
      this.wingState = 1;
      return;
    }

    const birdMinRot = Math.abs(BIRD_MIN_ROTATION);
    const f = 4 + ((this.rotation + birdMinRot) / (birdMinRot + BIRD_MAX_ROTATION)) * 3.2;
    this.flapWing(flipRange(4, 8.2, f));
  }

  public Update(dt: number): void {
    // Always above the floor
    if (this.doesHitTheFloor() || (this.flags & Bird.FLAG_DOES_LANDED) !== 0) {
      this.flags |= Bird.FLAG_DOES_LANDED;
      this.coordinate.y = this.canvasSize.height - Bird.platformHeight - this.rotatedDimension().height;
      this.handleRotation(dt);
      return;
    }

    // Handle delayed flap
    if (this.pendingFlap && this.flapDelayTimer > 0) {
      this.flapDelayTimer -= dt;
      if (this.flapDelayTimer <= 0) {
        this.executeFlap();
      }
    }

    // Handle sudden drop chaos - ABSOLUTE MAXIMUM
    if (this.suddenDropCooldown > 0) {
      this.suddenDropCooldown -= dt;
    }
    if (this.activeChaosEvents.includes(ChaosEvent.suddenDrop) && this.suddenDropCooldown <= 0 && Math.random() < 0.15) {
      // 15% chance per frame - EXTREMELY FREQUENT
      this.velocity.y += this.canvasSize.height * 0.8; // VERY STRONG downward spike
      this.suddenDropCooldown = 0.5; // 0.5 second cooldown - VERY frequent
    }

    // Handle air burst chaos - ABSOLUTE MAXIMUM
    if (this.activeChaosEvents.includes(ChaosEvent.airBurst)) {
      if (!this.airBurstActive && Math.random() < 0.1) {
        // 10% chance to start - EXTREMELY LIKELY
        this.airBurstActive = true;
        this.airBurstTimer = 5.0; // 5 seconds duration - VERY LONG
      }
      if (this.airBurstActive) {
        this.airBurstTimer -= dt;
        if (this.airBurstTimer <= 0) {
          this.airBurstActive = false;
        }
      }
    }

    // Handle gravity shift chaos - randomly changes gravity strength
    if (this.activeChaosEvents.includes(ChaosEvent.gravityShift)) {
      if (Math.random() < 0.08) {
        // 8% chance per frame to change gravity - VERY FREQUENT
        this.gravityMultiplier = 0.3 + Math.random() * 2.0; // 0.3x to 2.3x gravity - MORE EXTREME
      }
    } else {
      this.gravityMultiplier = 1.0;
    }

    // Handle wind gust chaos - horizontal force
    if (this.activeChaosEvents.includes(ChaosEvent.windGust)) {
      if (this.windTimer <= 0 && Math.random() < 0.1) {
        // 10% chance to start wind - VERY FREQUENT
        this.windForce = (Math.random() - 0.5) * 150; // Random wind direction and strength - STRONGER
        this.windTimer = 2.0 + Math.random() * 3; // 2-5 seconds of wind - LONGER
      }
      if (this.windTimer > 0) {
        this.windTimer -= dt;
        this.coordinate.x += this.windForce * dt;
        // Clamp bird to screen bounds
        this.coordinate.x = clamp(this.scaled.width, this.canvasSize.width - this.scaled.width, this.coordinate.x);
      }
    }

    // Classic gravity with air burst and gravity shift modification - EXTREME
    let gravity = this.canvasSize.height * BIRD_WEIGHT * this.gravityMultiplier;
    if (this.airBurstActive) {
      gravity *= 1.5; // MUCH stronger gravity during air burst
    }

    this.velocity.y += gravity * dt;
    this.velocity.y = Math.min(this.velocity.y, this.canvasSize.height * 0.793);
    this.velocity.y = clamp(-this.canvasSize.height * 0.8, this.canvasSize.height * 0.793, this.velocity.y);

    this.coordinate.y += this.velocity.y * dt;

    this.handleRotation(dt);
  }

  public Display(context: CanvasRenderingContext2D): void {
    const birdKeyString = `${this.color}.${this.wingState}`;

    context.save();
    context.translate(this.coordinate.x, this.coordinate.y);
    context.rotate((this.rotation * Math.PI) / 180);

    // Visual glitch during chaos
    if (this.activeChaosEvents.length > 0 && Math.random() > 0.95) {
      context.globalAlpha = 0.8;
      context.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    }

    context.drawImage(
      this.images.get(birdKeyString)!,
      -this.scaled.width,
      -this.scaled.height,
      this.scaled.width * 2,
      this.scaled.height * 2
    );

    context.restore();
  }
}
