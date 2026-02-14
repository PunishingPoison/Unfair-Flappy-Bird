import { PIPE_DISTANCE, PIPE_MIN_GAP } from '../constants';
import { randomClamp } from '../utils';
import Pipe from './pipe';
import SceneGenerator from './scene-generator';
import { IPipeColor } from './pipe';
import { generateChaosEvents } from '../enums/pipe-types';

export interface IRange {
  min: number;
  max: number;
}

export interface IPipeGeneratorOption {
  max: number;
  width: number;
  height: number;
}

export interface IPipeGeneratorValue {
  position: ICoordinate;
}

/**
 * Unfair Pipe Generator - Extreme chaos edition
 * Creates overlapping chaos events with aggressive probabilities
 */
export default class PipeGenerator {
  private range: IRange;
  private width: number;
  public pipes: Pipe[];
  private distance: number;
  private initialXPos: number;
  private canvasSize: IDimension;
  private pipeColor: IPipeColor;
  private spawnCount: number;
  private pendingSwapPipe: Pipe | null;

  constructor() {
    this.range = { max: 0, min: 0 };
    this.width = 0;
    this.pipes = [];
    this.distance = 0;
    this.initialXPos = 0;
    this.canvasSize = { width: 0, height: 0 };
    this.pipeColor = 'green';
    this.spawnCount = 0;
    this.pendingSwapPipe = null;
  }

  public reset(): void {
    this.pipes.splice(0, this.pipes.length);
    this.spawnCount = 0;
    this.pendingSwapPipe = null;
    this.resize({
      max: this.range.max,
      width: this.canvasSize.width,
      height: this.canvasSize.height
    });
    this.pipeColor = SceneGenerator.pipe;
  }

  public resize({ max, width, height }: IPipeGeneratorOption): void {
    this.range = { max, min: height * PIPE_MIN_GAP };
    this.distance = width * PIPE_DISTANCE;
    this.width = width;
    this.canvasSize = { width, height };

    for (const pipe of this.pipes) {
      pipe.resize(this.canvasSize);
    }
  }

  public needPipe(): boolean {
    const pipeLen = this.pipes.length;

    if (pipeLen === 0) {
      this.initialXPos = (this.width + Pipe.pipeSize.width) * 2;
      return true;
    }

    if (this.distance <= this.width - this.pipes[pipeLen - 1].coordinate.x) {
      this.initialXPos = this.width + Pipe.pipeSize.width;
      return true;
    }

    return false;
  }

  public generate(): IPipeGeneratorValue {
    return {
      position: {
        x: this.initialXPos,
        y: randomClamp(this.range.min, this.range.max - this.range.min)
      }
    };
  }

  /**
   * Get the reverse zone pipe that bird is currently in
   */
  public getReverseZonePipe(birdX: number, birdY: number, birdWidth: number): Pipe | null {
    for (const pipe of this.pipes) {
      if (pipe.isInReverseZone(birdX, birdY, birdWidth)) {
        return pipe;
      }
    }
    return null;
  }

  /**
   * Handle pipe swap chaos event
   */
  private handlePipeSwap(): void {
    if (this.pipes.length < 2) return;

    const currentPipe = this.pipes[this.pipes.length - 2];
    const nextPipe = this.pipes[this.pipes.length - 1];

    if (currentPipe && nextPipe && currentPipe.chaosEvents.includes('pipeSwap') && this.pendingSwapPipe !== currentPipe) {
      // Swap gap positions
      const tempY = currentPipe.coordinate.y;
      currentPipe.coordinate.y = nextPipe.coordinate.y;
      nextPipe.coordinate.y = tempY;

      this.pendingSwapPipe = currentPipe;
    }
  }

  public Update(dt: number, birdX: number): void {
    if (this.needPipe()) {
      const pipe = new Pipe(this.spawnCount);

      pipe.init();
      pipe.use(this.pipeColor);
      pipe.resize(this.canvasSize);
      pipe.setHollPosition(this.generate().position);

      // Assign trap type and chaos events
      pipe.assignTrapTypeAndChaos();
      pipe.setChaosEvents(generateChaosEvents(this.spawnCount));

      this.pipes.push(pipe);

      // Handle pipe swap if present
      this.handlePipeSwap();

      this.spawnCount++;
    }

    for (let index = 0; index < this.pipes.length; index++) {
      // Pass bird position to pipe for chaos triggers
      this.pipes[index].currentBirdX = birdX;
      this.pipes[index].Update(dt);

      // Reset snap close pipes after they pass
      if (this.pipes[index].isPassed && this.pipes[index].type === 'snapClose') {
        this.pipes[index].resetAfterPass();
      }

      if (this.pipes[index].isOut()) {
        this.pipes.splice(index, 1);
        index--;
      }
    }
  }
}
