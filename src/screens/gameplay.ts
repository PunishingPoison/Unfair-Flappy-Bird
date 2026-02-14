/**
 * Unfair Flappy Bird - Gameplay Screen
 * Classic Flappy Bird with deterministic unfair traps
 */

import BannerInstruction from '../model/banner-instruction';
import BirdModel from '../model/bird';
import CounterModel from '../model/count';
import FlashScreen from '../model/flash-screen';
import { IScreenChangerObject } from '../lib/screen-changer';
import MainGameController from '../game';
import ParentClass from '../abstracts/parent-class';
import PipeGenerator from '../model/pipe-generator';
import ScoreBoard from '../model/score-board';
import Sfx from '../model/sfx';
import { generateVisualChaosEvents } from '../lib/visual-chaos/types';

export type IGameState = 'died' | 'playing' | 'none';

export default class GetReady extends ParentClass implements IScreenChangerObject {
  private bird: BirdModel;
  private pipeGenerator: PipeGenerator;
  private state: string;
  private gameState: IGameState;
  private count: CounterModel;
  private game: MainGameController;
  private bannerInstruction: BannerInstruction;
  private scoreBoard: ScoreBoard;
  private transition: FlashScreen;
  private hideBird: boolean;
  private flashScreen: FlashScreen;
  private showScoreBoard: boolean;

  constructor(game: MainGameController) {
    super();
    this.state = 'waiting';
    this.bird = new BirdModel();
    this.count = new CounterModel();
    this.game = game;
    this.pipeGenerator = this.game.pipeGenerator;
    this.bannerInstruction = new BannerInstruction();
    this.gameState = 'none';
    this.scoreBoard = new ScoreBoard();
    this.transition = new FlashScreen({
      interval: 500,
      strong: 1.0,
      style: 'black',
      easing: 'sineWaveHS'
    });
    this.flashScreen = new FlashScreen({
      style: 'white',
      interval: 180,
      strong: 0.7,
      easing: 'linear'
    });
    this.hideBird = false;
    this.showScoreBoard = false;

    this.transition.setEvent([0.99, 1], this.reset.bind(this));
  }

  public init(): void {
    this.bird.init();
    this.count.init();
    this.bannerInstruction.init();
    this.scoreBoard.init();
    this.setButtonEvent();
    this.flashScreen.init();
    this.transition.init();

    // Set callback for when pipe is passed (for visual chaos)
    this.bird.onPipePassed = () => {
      this.triggerVisualChaos();
    };
  }

  public reset(): void {
    this.gameState = 'none';
    this.state = 'waiting';
    this.game.background.reset();
    this.game.platform.reset();
    this.pipeGenerator.reset();
    this.bannerInstruction.reset();
    this.game.bgPause = false;
    this.hideBird = false;
    this.showScoreBoard = false;
    this.scoreBoard.hide();
    this.bird.reset();
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.bird.resize(this.canvasSize);
    this.count.resize(this.canvasSize);
    this.bannerInstruction.resize(this.canvasSize);
    this.scoreBoard.resize(this.canvasSize);
    this.flashScreen.resize(this.canvasSize);
    this.transition.resize(this.canvasSize);
  }

  /**
   * Check for reverse zone and update bird physics
   */
  private updateReverseZone(): void {
    if (this.state !== 'playing') return;

    const newDim = this.bird.rotatedDimension();
    const boundary = newDim.width - newDim.height / 2;

    const reversePipe = this.pipeGenerator.getReverseZonePipe(this.bird.coordinate.x, this.bird.coordinate.y, boundary);

    this.bird.setReverseZone(reversePipe !== null);
  }

  /**
   * Handle magnet pipes - pull bird toward pipe gaps
   */
  private handleMagnetPipes(): void {
    if (this.state !== 'playing') return;

    for (const pipe of this.pipeGenerator.pipes) {
      if (pipe.chaosEvents.includes('magnetPipe')) {
        const distX = Math.abs(pipe.coordinate.x - this.bird.coordinate.x);
        if (distX < 150) {
          // Magnet pull toward gap center
          const magnetPull = ((150 - distX) / 150) * 3; // Max 3px per frame
          const dirY = pipe.coordinate.y > this.bird.coordinate.y ? 1 : -1;
          this.bird.coordinate.y += magnetPull * dirY;
        }
      }
    }
  }

  /**
   * Trigger visual chaos events
   */
  private triggerVisualChaos(): void {
    if (this.state !== 'playing') return;

    const events = generateVisualChaosEvents(this.bird.score);
    this.game.visualChaos.addEvents(events);
  }

  public Update(dt: number): void {
    this.flashScreen.Update(dt);
    this.transition.Update(dt);
    this.scoreBoard.Update(dt);

    if (!this.bird.alive) {
      this.game.bgPause = true;
      this.bird.Update(dt);
      return;
    }

    if (this.state === 'waiting') {
      this.bird.doWave(
        {
          x: this.bird.coordinate.x,
          y: this.canvasSize.height * 0.48
        },
        1,
        6
      );
      return;
    }

    // Update unfair trap mechanics
    this.updateReverseZone();

    // Handle magnet pipes - pull bird toward gap
    this.handleMagnetPipes();

    this.bannerInstruction.Update(dt);

    // Pass bird X position to pipe generator for trap triggers
    this.pipeGenerator.Update(dt, this.bird.coordinate.x);

    // EXTREME: Constant visual chaos EVERY SINGLE FRAME
    this.triggerVisualChaos();

    this.bird.Update(dt);

    if (this.bird.isDead(this.pipeGenerator.pipes)) {
      this.flashScreen.reset();
      this.flashScreen.start();

      this.gameState = 'died';

      window.setTimeout(() => {
        this.scoreBoard.setScore(this.bird.score);
        this.showScoreBoard = true;
        window.setTimeout(() => {
          this.scoreBoard.showBoard();
          Sfx.swoosh();
        }, 700);
        this.scoreBoard.showBanner();
        Sfx.swoosh();
      }, 500);

      Sfx.hit(() => {
        this.bird.playDead();
      });
    }
  }

  public Display(context: CanvasRenderingContext2D): void {
    if (this.state === 'playing' || this.state === 'waiting') {
      this.bannerInstruction.Display(context);

      if (this.gameState !== 'died' || !this.showScoreBoard) {
        this.count.setNum(this.bird.score);
        this.count.Display(context);
      }

      // Hide bird if visual chaos birdInvisible is active
      const shouldShowBird = !this.hideBird && !this.game.visualChaos.isBirdInvisible();
      if (shouldShowBird) this.bird.Display(context);

      this.scoreBoard.Display(context);
    }

    this.flashScreen.Display(context);
    this.transition.Display(context);
  }

  private setButtonEvent(): void {
    this.scoreBoard.onRestart(() => {
      if (this.transition.status.running) return;
      this.transition.reset();
      this.transition.start();
    });
  }

  public click({ x, y }: ICoordinate): void {
    if (this.gameState === 'died') return;

    this.state = 'playing';
    this.gameState = 'playing';
    this.bannerInstruction.tap();

    // EXTREME: Trigger bird chaos IMMEDIATELY on game start
    this.bird.triggerChaosEvents();

    // EXTREME: Trigger visual chaos IMMEDIATELY when game starts
    this.triggerVisualChaos();
    this.triggerVisualChaos();
    this.triggerVisualChaos(); // Triple stack at start!

    this.bird.flap();

    // EXTREME: Also trigger on EVERY flap during gameplay
    if (this.state === 'playing') {
      this.triggerVisualChaos();
    }
  }

  public mouseDown({ x, y }: ICoordinate): void {
    // Classic Flappy Bird - no charged flap, just ignore
    this.scoreBoard.mouseDown({ x, y });
  }

  public mouseUp({ x, y }: ICoordinate): void {
    // Classic Flappy Bird - no charged flap
    this.scoreBoard.mouseUp({ x, y });
  }

  public startAtKeyBoardEvent(): void {
    if (this.gameState === 'died') this.scoreBoard.triggerPlayATKeyboardEvent();
  }
}
