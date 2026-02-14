import { GAME_SPEED, PIPE_HOLL_SIZE, PIPE_INITIAL_DIMENSION } from '../constants';
import { rescaleDim } from '../utils';
import ParentClass from '../abstracts/parent-class';
import SpriteDestructor from '../lib/sprite-destructor';
import SceneGenerator from './scene-generator';
import { PipeType, ChaosEvent, getTrapType, getTrollDirection, CHAOS_CONFIG } from '../enums/pipe-types';

export interface IPipePairPosition {
  top: ICoordinate;
  bottom: ICoordinate;
}
export interface IPipeScaled {
  top: IDimension;
  bottom: IDimension;
}

export type IPipeColor = string;
export type IPipeRecords = Map<IPipeColor, HTMLImageElement>;

/**
 * Unfair Pipe - Extreme chaos and unfairness
 * Overlapping traps, late triggers, multiple chaos events
 */
export default class Pipe extends ParentClass {
  public static pipeSize: IDimension = {
    width: 0,
    height: 0
  };

  private scaled: IPipeScaled;
  public hollSize: number;
  public pipePosition: IPipePairPosition;
  public isPassed: boolean;
  public pipeIndex: number;

  private images: IPipeRecords;
  private color: IPipeColor;

  // Base trap type
  public type: PipeType;
  public triggered: boolean;

  // Chaos events
  public chaosEvents: ChaosEvent[];

  // Position tracking
  private originalY: number;
  private originalHollSize: number;
  private shiftCount: number;
  private driftOffset: number;
  private driftDirection: number;

  // Snap close animation
  private snapCloseProgress: number;

  // Gap teleport
  private hasTeleported: boolean;
  private teleportTargetY: number;

  // Collision shift
  private collisionOffsetX: number;
  private collisionOffsetY: number;

  // Phantom pipe
  public phantomPipeOffset: number;

  // Late spawn
  public isLateSpawn: boolean;
  private spawnDelay: number;

  // Fake ceiling
  public fakeCeilingY: number;

  // Shrinking pipe
  private shrinkingStarted: boolean;
  private originalPipeWidth: number;

  // Current bird position for triggers
  public currentBirdX: number;

  // Constants - EXTREME
  private static readonly TROLL_SHIFT_DISTANCE = 90; // Larger shift
  private static readonly SNAP_CLOSE_DURATION = 0.08; // Faster snap (80ms)
  private static readonly SNAP_CLOSE_MIN_GAP = 5; // Almost completely closed
  private static readonly TELEPORT_DISTANCE = 120; // Bigger teleport jumps
  private static readonly DRIFT_SPEED = 70; // Faster drift
  private static readonly MAX_SHIFTS = 3; // Triple troll possible

  constructor(pipeIndex: number = 0) {
    super();
    this.images = new Map<string, HTMLImageElement>();
    this.color = 'green';
    this.hollSize = 0;
    this.pipePosition = {
      top: { x: 0, y: 0 },
      bottom: { x: 0, y: 0 }
    };
    this.isPassed = false;
    this.velocity.x = GAME_SPEED;
    this.scaled = {
      top: { width: 0, height: 0 },
      bottom: { width: 0, height: 0 }
    };

    this.pipeIndex = pipeIndex;
    this.type = PipeType.normal;
    this.triggered = false;
    this.chaosEvents = [];

    this.originalY = 0;
    this.originalHollSize = 0;
    this.shiftCount = 0;
    this.driftOffset = 0;
    this.driftDirection = 1;

    this.snapCloseProgress = 0;
    this.hasTeleported = false;
    this.teleportTargetY = 0;

    this.collisionOffsetX = 0;
    this.collisionOffsetY = 0;
    this.phantomPipeOffset = 0;

    this.isLateSpawn = false;
    this.spawnDelay = 0;

    this.fakeCeilingY = 0;

    // Shrinking pipe init
    this.shrinkingStarted = false;
    this.originalPipeWidth = 0;

    this.currentBirdX = 0;
  }

  public init(): void {
    this.images.set('green.top', SpriteDestructor.asset('pipe-green-top'));
    this.images.set('green.bottom', SpriteDestructor.asset('pipe-green-bottom'));
    this.images.set('red.top', SpriteDestructor.asset('pipe-red-top'));
    this.images.set('red.bottom', SpriteDestructor.asset('pipe-red-bottom'));

    Object.assign(SceneGenerator.pipeColorList, ['red', 'green']);
  }

  /**
   * Assign trap type and chaos events
   */
  public assignTrapTypeAndChaos(): void {
    this.type = getTrapType(this.pipeIndex);
  }

  /**
   * Set holl position
   */
  public setHollPosition(coordinate: ICoordinate): void {
    this.hollSize = this.canvasSize.height * PIPE_HOLL_SIZE;
    this.originalHollSize = this.hollSize;
    this.coordinate = coordinate;
    this.originalY = coordinate.y;
    this.teleportTargetY = coordinate.y;
  }

  /**
   * Set chaos events
   */
  public setChaosEvents(events: ChaosEvent[]): void {
    this.chaosEvents = events;

    // Initialize chaos-specific properties
    if (this.chaosEvents.includes(ChaosEvent.gapDrift)) {
      this.driftDirection = Math.random() > 0.5 ? 1 : -1;
    }

    if (this.chaosEvents.includes(ChaosEvent.collisionShift)) {
      this.collisionOffsetX = (Math.random() - 0.5) * 30;
      this.collisionOffsetY = (Math.random() - 0.5) * 40;
    }

    if (this.chaosEvents.includes(ChaosEvent.phantomPipe)) {
      this.phantomPipeOffset = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 40);
    }

    if (this.chaosEvents.includes(ChaosEvent.fakeCeiling)) {
      this.fakeCeilingY = this.originalY - this.hollSize * 0.3;
    }

    if (this.chaosEvents.includes(ChaosEvent.lateSpawn)) {
      this.isLateSpawn = true;
      this.spawnDelay = 0.05 + Math.random() * 0.1;
    }
  }

  /**
   * Check if bird is within late trigger zone
   */
  private isInLateTriggerZone(birdX: number): boolean {
    const width = Pipe.pipeSize.width / 2;
    const pipeLeft = this.coordinate.x - width;
    return birdX >= pipeLeft - CHAOS_CONFIG.lateTriggerDistance && birdX < pipeLeft;
  }

  /**
   * Execute troll move (single or double)
   */
  private executeTrollMove(): void {
    if (this.shiftCount >= Pipe.MAX_SHIFTS && this.chaosEvents.includes(ChaosEvent.doubleTroll)) {
      return;
    }
    if (this.shiftCount >= 1 && !this.chaosEvents.includes(ChaosEvent.doubleTroll)) {
      return;
    }

    const direction = getTrollDirection(this.pipeIndex + this.shiftCount);
    const shift = Pipe.TROLL_SHIFT_DISTANCE * direction * (this.shiftCount % 2 === 0 ? 1 : -1);

    this.coordinate.y += shift;
    this.shiftCount++;

    // For double troll, schedule second shift
    if (this.chaosEvents.includes(ChaosEvent.doubleTroll) && this.shiftCount === 1) {
      setTimeout(() => {
        if (!this.isPassed) {
          this.executeTrollMove();
        }
      }, 150);
    }
  }

  /**
   * Execute gap teleport
   */
  private executeGapTeleport(): void {
    if (this.hasTeleported) return;

    const jumpDistance = (Math.random() - 0.5) * Pipe.TELEPORT_DISTANCE * 2;
    this.teleportTargetY = this.originalY + jumpDistance;
    this.coordinate.y = this.teleportTargetY;
    this.hasTeleported = true;
  }

  /**
   * Update gap drift
   */
  private updateGapDrift(dt: number): void {
    if (!this.isInLateTriggerZone(this.currentBirdX)) return;

    this.driftOffset += this.driftDirection * Pipe.DRIFT_SPEED * dt;

    // Reverse drift direction at limits
    if (Math.abs(this.driftOffset) > 50) {
      this.driftDirection *= -1;
    }

    this.coordinate.y = this.originalY + this.driftOffset;
  }

  /**
   * Execute snap close
   */
  private executeSnapClose(dt: number): void {
    if (this.snapCloseProgress >= 1) return;

    this.snapCloseProgress += dt / Pipe.SNAP_CLOSE_DURATION;
    this.snapCloseProgress = Math.min(this.snapCloseProgress, 1);

    const minGap = Pipe.SNAP_CLOSE_MIN_GAP;
    this.hollSize = this.originalHollSize - (this.originalHollSize - minGap) * this.snapCloseProgress;

    if (this.snapCloseProgress >= 1) {
      this.triggered = true;
    }
  }

  /**
   * Check if bird is in reverse zone
   */
  public isInReverseZone(birdX: number, birdY: number, birdWidth: number): boolean {
    if (this.type !== PipeType.reverseZone) return false;

    const width = Pipe.pipeSize.width / 2;
    const hcx = this.coordinate.x + this.collisionOffsetX;
    const radius = this.hollSize / 2;

    const xOverlap = Math.abs(hcx - width) <= birdX + birdWidth && hcx + width >= birdX - birdWidth;
    const yInGap =
      birdY >= this.coordinate.y + this.collisionOffsetY - radius && birdY <= this.coordinate.y + this.collisionOffsetY + radius;

    return xOverlap && yInGap;
  }

  /**
   * Check if this pipe actually has collision (bait pipes don't)
   */
  public hasCollision(): boolean {
    // Bait pipes have no collision - they're just visual traps
    if (this.chaosEvents.includes(ChaosEvent.baitPipe)) {
      return false;
    }
    return true;
  }

  /**
   * Get effective gap bounds for collision
   */
  public getEffectiveGapBounds(): { top: number; bottom: number; isSolid: boolean; hasCeiling: boolean; ceilingY: number } {
    const radius = this.hollSize / 2;
    const effectiveY = this.coordinate.y + this.collisionOffsetY;

    if (this.type === PipeType.fakeGap) {
      return {
        top: effectiveY,
        bottom: effectiveY,
        isSolid: true,
        hasCeiling: false,
        ceilingY: 0
      };
    }

    return {
      top: effectiveY - radius,
      bottom: effectiveY + radius,
      isSolid: false,
      hasCeiling: this.chaosEvents.includes(ChaosEvent.fakeCeiling),
      ceilingY: this.fakeCeilingY
    };
  }

  /**
   * Get phantom pipe collision bounds
   */
  public getPhantomBounds(): { x: number; top: number; bottom: number } | null {
    if (!this.chaosEvents.includes(ChaosEvent.phantomPipe)) return null;

    return {
      x: this.coordinate.x + this.phantomPipeOffset,
      top: this.coordinate.y - this.hollSize * 0.5,
      bottom: this.coordinate.y + this.hollSize * 0.5
    };
  }

  /**
   * Reset after pass
   */
  public resetAfterPass(): void {
    if (this.type === PipeType.snapClose) {
      this.hollSize = this.originalHollSize;
      this.snapCloseProgress = 0;
      this.triggered = false;
    }
  }

  /**
   * Check collision with phantom pipe
   */
  public checkPhantomCollision(birdX: number, birdY: number, birdWidth: number, birdHeight: number): boolean {
    const phantom = this.getPhantomBounds();
    if (!phantom) return false;

    const width = Pipe.pipeSize.width / 2;
    const xOverlap = Math.abs(phantom.x - width) <= birdX + birdWidth && phantom.x + width >= birdX - birdWidth;
    const yHit = birdY - birdHeight < phantom.top || birdY + birdHeight > phantom.bottom;

    return xOverlap && yHit;
  }

  /**
   * Resize
   */
  public resize({ width, height }: IDimension): void {
    const oldX = (this.coordinate.x / this.canvasSize.width) * 100;
    const oldY = (this.originalY / this.canvasSize.height) * 100;

    super.resize({ width, height });

    const min = this.canvasSize.width * 0.18;
    Pipe.pipeSize = rescaleDim(PIPE_INITIAL_DIMENSION, { width: min });

    this.hollSize = this.canvasSize.height * PIPE_HOLL_SIZE;
    this.originalHollSize = this.hollSize;

    this.coordinate.x = width * (oldX / 100);
    this.originalY = height * (oldY / 100);
    if (this.shiftCount === 0) {
      this.coordinate.y = this.originalY;
    }

    this.velocity.x = width * GAME_SPEED;

    this.scaled.top = rescaleDim(
      { width: this.images.get(`${this.color}.top`)!.width, height: this.images.get(`${this.color}.top`)!.height },
      { width: min }
    );

    this.scaled.bottom = rescaleDim(
      { width: this.images.get(`${this.color}.bottom`)!.width, height: this.images.get(`${this.color}.bottom`)!.height },
      { width: min }
    );
  }

  public isOut(): boolean {
    return this.coordinate.x + Pipe.pipeSize.width < 0;
  }

  public use(select: IPipeColor): void {
    this.color = select;
  }

  /**
   * Update with all chaos events
   */
  public Update(dt: number): void {
    // Handle late spawn
    if (this.isLateSpawn && this.spawnDelay > 0) {
      this.spawnDelay -= dt;
      return;
    }

    this.coordinate.x -= this.velocity.x * dt;

    // Late trigger chaos events (very late, <200ms)
    if (this.isInLateTriggerZone(this.currentBirdX)) {
      // Troll move
      if ((this.type === PipeType.trollMove || this.chaosEvents.includes(ChaosEvent.doubleTroll)) && this.shiftCount === 0) {
        this.executeTrollMove();
      }

      // Gap teleport
      if (this.chaosEvents.includes(ChaosEvent.gapTeleport) && !this.hasTeleported) {
        this.executeGapTeleport();
      }

      // Snap close
      if (this.type === PipeType.snapClose) {
        this.executeSnapClose(dt);
      }
    }

    // Gap drift (continuous while approaching)
    if (this.chaosEvents.includes(ChaosEvent.gapDrift)) {
      this.updateGapDrift(dt);
    }

    // Shrinking pipe - narrows as bird approaches
    if (this.chaosEvents.includes(ChaosEvent.shrinkingPipe)) {
      if (this.isInLateTriggerZone(this.currentBirdX) && !this.shrinkingStarted) {
        this.shrinkingStarted = true;
        this.originalPipeWidth = Pipe.pipeSize.width;
      }
      if (this.shrinkingStarted && Pipe.pipeSize.width > this.originalPipeWidth * 0.4) {
        Pipe.pipeSize.width *= 0.98; // Shrink by 2% per frame
      }
    }

    // Magnet pipe - pulls bird toward gap center
    if (this.chaosEvents.includes(ChaosEvent.magnetPipe)) {
      // Magnet effect is applied in gameplay.ts
    }
  }

  public Display(context: CanvasRenderingContext2D): void {
    // Don't render during late spawn delay
    if (this.isLateSpawn && this.spawnDelay > 0) return;

    // Invisible pipe - completely invisible but still deadly
    if (this.chaosEvents.includes(ChaosEvent.invisiblePipe)) {
      // Only show faint outline when very close
      const distToBird = Math.abs(this.coordinate.x - this.currentBirdX);
      if (distToBird > 60) {
        return; // Completely invisible
      }
      // Show ghostly outline when close
      context.globalAlpha = 0.15;
    }

    // Bait pipe - looks like normal pipe but no collision
    // Bait pipes look completely normal (that's the trick!)

    const width = Pipe.pipeSize.width / 2;
    const posX = this.coordinate.x;
    const posY = this.coordinate.y;
    const radius = this.hollSize / 2;

    this.drawChaosHints(context, posX, posY, radius, width);

    context.save();

    // Visual glitch effect for chaos pipes
    if (this.chaosEvents.length > 0 && Math.random() > 0.95) {
      context.globalAlpha = 0.9;
    }

    context.drawImage(
      this.images.get(`${this.color}.top`)!,
      posX - width,
      -(this.scaled.top.height - Math.abs(posY - radius)),
      this.scaled.top.width,
      this.scaled.top.height
    );

    context.drawImage(
      this.images.get(`${this.color}.bottom`)!,
      posX - width,
      posY + radius,
      this.scaled.bottom.width,
      this.scaled.bottom.height
    );

    context.restore();
  }

  /**
   * Draw subtle chaos hints
   */
  private drawChaosHints(context: CanvasRenderingContext2D, posX: number, posY: number, radius: number, width: number): void {
    // Base trap hints
    switch (this.type) {
      case PipeType.trollMove:
        context.save();
        context.fillStyle = 'rgba(100, 100, 100, 0.4)';
        context.font = '10px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const dir = getTrollDirection(this.pipeIndex);
        context.fillText(dir > 0 ? '▼' : '▲', posX, posY);
        context.restore();
        break;

      case PipeType.fakeGap:
        context.save();
        context.fillStyle = 'rgba(0, 0, 0, 0.15)';
        context.fillRect(posX - width * 0.3, posY - radius * 0.8, width * 0.6, radius * 1.6);
        context.restore();
        break;

      case PipeType.snapClose:
        context.save();
        context.strokeStyle = 'rgba(200, 50, 50, 0.3)';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(posX - width * 0.2, posY - radius * 0.5);
        context.lineTo(posX + width * 0.2, posY - radius * 0.5);
        context.moveTo(posX - width * 0.2, posY + radius * 0.5);
        context.lineTo(posX + width * 0.2, posY + radius * 0.5);
        context.stroke();
        context.restore();
        break;

      case PipeType.reverseZone:
        context.save();
        context.strokeStyle = 'rgba(100, 50, 150, 0.2)';
        context.lineWidth = 1;
        context.beginPath();
        context.arc(posX, posY, radius * 0.3, 0, Math.PI * 2);
        context.stroke();
        context.restore();
        break;
    }

    // Chaos event hints (very subtle)
    if (this.chaosEvents.length > 0) {
      context.save();
      context.fillStyle = 'rgba(255, 0, 0, 0.15)';
      context.fillRect(posX - 2, posY - radius, 4, radius * 2);
      context.restore();
    }
  }
}
