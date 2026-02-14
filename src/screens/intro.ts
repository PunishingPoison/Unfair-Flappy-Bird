/**
 * Display "FlappyBird"
 * Display the bird close to the middle and at the center
 *
 * Display "Play", "Rate" buttons and maybe include the
 * "Ranking" button but with no function. Just to mimic the
 * original game since ranking only works if the game is
 * connected to Google Play Games or Apple Game Center
 * */

import { rescaleDim } from '../utils';

import BirdModel from '../model/bird';
import { IScreenChangerObject } from '../lib/screen-changer';
import ParentClass from '../abstracts/parent-class';
import PlayButton from '../model/btn-play';
import RankingButton from '../model/btn-ranking';
import RateButton from '../model/btn-rate';
import ToggleSpeaker from '../model/btn-toggle-speaker';
import ToggleFPSBtn from '../model/btn-toggle-fps';
import SpriteDestructor from '../lib/sprite-destructor';
import { APP_VERSION } from '../constants';
import ButtonEventHandler from '../abstracts/button-event-handler';
import ToggleLockFPSBtn from '../model/btn-toggle-lock-fps';

export default class Introduction extends ParentClass implements IScreenChangerObject {
  public playButton: PlayButton;
  public rankingButton: RankingButton;
  public rateButton: RateButton;
  public toggleSpeakerButton: ToggleSpeaker;
  public toggleFpsBtn: ToggleFPSBtn;
  public toggleLockFpsBtn: ToggleLockFPSBtn;

  public btnArray: ButtonEventHandler[];

  private bird: BirdModel;
  private flappyBirdBanner: HTMLImageElement | undefined;

  constructor() {
    super();
    this.bird = new BirdModel();
    this.playButton = new PlayButton();
    this.rankingButton = new RankingButton();
    this.rateButton = new RateButton();
    this.toggleSpeakerButton = new ToggleSpeaker();
    this.toggleFpsBtn = new ToggleFPSBtn();
    this.toggleLockFpsBtn = new ToggleLockFPSBtn();
    this.flappyBirdBanner = void 0;
    this.btnArray = [
      this.playButton,
      this.rateButton,
      this.rankingButton,
      this.toggleFpsBtn,
      this.toggleSpeakerButton,
      this.toggleLockFpsBtn
    ];
  }

  public init(): void {
    this.bird.init();

    for (const btn of this.btnArray) {
      btn.init();
    }

    this.flappyBirdBanner = SpriteDestructor.asset('banner-flappybird');
  }

  public resize(screen_dimension: IDimension): void {
    super.resize(screen_dimension);
    this.bird.resize(screen_dimension);

    for (const btn of this.btnArray) {
      btn.resize(screen_dimension);
    }
  }

  public Update(): void {
    this.bird.doWave(
      {
        x: this.canvasSize.width * 0.5,
        y: this.canvasSize.height * 0.4
      },
      1.4,
      9
    );

    for (const btn of this.btnArray) {
      btn.Update();
    }
  }

  public Display(context: CanvasRenderingContext2D): void {
    for (const btn of this.btnArray) {
      btn.Display(context);
    }

    this.bird.Display(context);

    // "Unfair" text above banner
    const unfairFontSize = this.canvasSize.width * 0.12;
    context.font = `bold ${unfairFontSize}px monospace`;
    context.textAlign = 'center';
    context.fillStyle = '#FF0000';
    context.shadowColor = '#8B0000';
    context.shadowBlur = 4;
    context.fillText('Unfair', this.canvasSize.width * 0.5, this.canvasSize.height * 0.15);
    context.shadowBlur = 0;
    // ----------------------------------

    // Flappy Bird Banner
    const fbbScaled = rescaleDim(
      {
        width: this.flappyBirdBanner!.width,
        height: this.flappyBirdBanner!.height
      },
      { width: this.canvasSize.width * 0.67 }
    );

    context.drawImage(
      this.flappyBirdBanner!,
      this.canvasSize.width * 0.5 - fbbScaled.width / 2,
      this.canvasSize.height * 0.28 - fbbScaled.height / 2,
      fbbScaled.width,
      fbbScaled.height
    );
    // ----------------------------------

    // Copyright - Draw text instead of image
    context.save();
    context.font = `bold ${this.canvasSize.width * 0.035}px monospace`;
    context.textAlign = 'center';
    context.fillStyle = '#666666';
    context.fillText('(c) VCMR 2026', this.canvasSize.width * 0.5, this.canvasSize.height * 0.85);
    context.restore();
    // ----------------------------------

    this.insertAppVersion(context);
  }

  private insertAppVersion(context: CanvasRenderingContext2D): void {
    const fSize = this.canvasSize.width * 0.04;
    const bot = this.canvasSize.height * 0.985;
    const right = this.canvasSize.width * 0.985;

    context.font = `bold ${fSize}px monospace`;
    context.textAlign = 'center';
    context.fillStyle = '#8E8E93';
    context.fillText(`v${APP_VERSION}`, right - 2 * fSize, bot);

    // context.strokeStyle = 'black';
    // context.strokeText(`v${APP_VERSION}`, right - 2 * fSize, bot);
  }

  public mouseDown(coor: ICoordinate): void {
    for (const btn of this.btnArray) {
      btn.mouseEvent('down', coor);
    }
  }

  public mouseUp(coor: ICoordinate): void {
    for (const btn of this.btnArray) {
      btn.mouseEvent('up', coor);
    }
  }

  public startAtKeyBoardEvent(): void {
    this.playButton.click();
  }
}
