/**
 * Unfair Flappy Bird - Visual Chaos System
 * Manages and applies visual disturbances
 */

import { VisualChaosEvent, VisualChaosEventInstance } from './types';

export default class VisualChaosSystem {
  private activeEvents: VisualChaosEventInstance[];
  private canvas: HTMLCanvasElement;
  private tempCanvas: HTMLCanvasElement;
  private tempContext: CanvasRenderingContext2D;
  private frameCount: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.activeEvents = [];
    this.frameCount = 0;

    // Create temp canvas for effects
    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = canvas.width;
    this.tempCanvas.height = canvas.height;
    this.tempContext = this.tempCanvas.getContext('2d')!;
  }

  /**
   * Add new visual chaos events
   */
  public addEvents(events: VisualChaosEventInstance[]): void {
    this.activeEvents.push(...events);
  }

  /**
   * Update active events - remove expired ones
   */
  public update(): void {
    const now = Date.now();
    this.frameCount++;

    // Remove expired events
    this.activeEvents = this.activeEvents.filter((event) => {
      return now - event.startTime < event.durationMs;
    });
  }

  /**
   * Check if a specific effect is active
   */
  public isActive(type: VisualChaosEvent): boolean {
    return this.activeEvents.some((e) => e.type === type);
  }

  /**
   * Check if bird should be invisible
   */
  public isBirdInvisible(): boolean {
    return this.isActive(VisualChaosEvent.birdInvisible);
  }

  /**
   * Apply all visual chaos effects to the rendered frame
   */
  public applyChaos(context: CanvasRenderingContext2D): void {
    if (this.activeEvents.length === 0) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Get current canvas content
    this.tempContext.drawImage(this.canvas, 0, 0);

    // Clear main canvas
    context.clearRect(0, 0, width, height);

    // Apply screen shake
    if (this.isActive(VisualChaosEvent.screenShake)) {
      const shakeX = (Math.random() - 0.5) * 60;
      const shakeY = (Math.random() - 0.5) * 60;
      context.save();
      context.translate(shakeX, shakeY);
    }

    // Apply screen offset
    if (this.isActive(VisualChaosEvent.screenOffset)) {
      const offsetX = (Math.random() - 0.5) * 300;
      const offsetY = (Math.random() - 0.5) * 300;
      context.save();
      context.translate(offsetX, offsetY);
    }

    // Draw the base image
    context.drawImage(this.tempCanvas, 0, 0);

    // Restore from shake/offset
    if (this.isActive(VisualChaosEvent.screenShake) || this.isActive(VisualChaosEvent.screenOffset)) {
      context.restore();
    }

    // Apply blackout (semi-transparent overlay)
    if (this.isActive(VisualChaosEvent.blackout)) {
      context.fillStyle = 'rgba(0, 0, 0, 0.85)';
      context.fillRect(0, 0, width, height);
    }

    // Apply flicker
    if (this.isActive(VisualChaosEvent.flicker) && this.frameCount % 2 === 0) {
      context.fillStyle = 'rgba(255, 255, 255, 0.3)';
      context.fillRect(0, 0, width, height);
    }

    // Apply screen glitch
    if (this.isActive(VisualChaosEvent.screenGlitch)) {
      this.applyGlitch(context, width, height);
    }

    // Apply static noise
    if (this.isActive(VisualChaosEvent.staticNoise)) {
      this.applyNoise(context, width, height);
    }

    // Apply scanlines
    if (this.isActive(VisualChaosEvent.scanlines)) {
      this.applyScanlines(context, width, height);
    }

    // Apply vignette
    if (this.isActive(VisualChaosEvent.vignette)) {
      this.applyVignette(context, width, height);
    }

    // Apply color effects using composite operations
    if (this.isActive(VisualChaosEvent.invert)) {
      context.globalCompositeOperation = 'difference';
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
    }

    if (this.isActive(VisualChaosEvent.colorShift)) {
      context.globalCompositeOperation = 'hue';
      context.fillStyle = `hsla(${Math.random() * 360}, 100%, 50%, 0.5)`;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
    }

    if (this.isActive(VisualChaosEvent.rainbow)) {
      const gradient = context.createLinearGradient(0, 0, width, height);
      const hue = (Date.now() / 5) % 360;
      gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.3)`);
      gradient.addColorStop(1, `hsla(${(hue + 180) % 360}, 100%, 50%, 0.3)`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }

    if (this.isActive(VisualChaosEvent.doubleVision)) {
      context.globalAlpha = 0.5;
      context.drawImage(this.tempCanvas, 10, 0);
      context.drawImage(this.tempCanvas, -10, 0);
      context.globalAlpha = 1.0;
    }

    if (this.isActive(VisualChaosEvent.zoom)) {
      context.save();
      context.translate(width / 2, height / 2);
      context.scale(1.3, 1.3);
      context.translate(-width / 2, -height / 2);
      context.drawImage(this.tempCanvas, 0, 0);
      context.restore();
    }

    if (this.isActive(VisualChaosEvent.blur)) {
      context.filter = 'blur(4px)';
      context.drawImage(this.tempCanvas, 0, 0);
      context.filter = 'none';
    }

    if (this.isActive(VisualChaosEvent.pixelate)) {
      this.applyPixelate(context, width, height);
    }

    if (this.isActive(VisualChaosEvent.extremeContrast)) {
      context.filter = 'contrast(200%) brightness(150%) saturate(200%)';
      context.drawImage(this.tempCanvas, 0, 0);
      context.filter = 'none';
    }
  }

  private applyGlitch(context: CanvasRenderingContext2D, width: number, height: number): void {
    const numGlitches = 10 + Math.floor(Math.random() * 10);
    for (let i = 0; i < numGlitches; i++) {
      const y = Math.random() * height;
      const h = 5 + Math.random() * 20;
      const offset = (Math.random() - 0.5) * 50;
      context.drawImage(this.tempCanvas, 0, y, width, h, offset, y, width, h);
    }
  }

  private applyNoise(context: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.3) {
        const noise = Math.random() * 255;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 100;
      }
    }
    context.putImageData(imageData, 0, 0);
  }

  private applyScanlines(context: CanvasRenderingContext2D, width: number, height: number): void {
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    for (let y = 0; y < height; y += 3) {
      context.fillRect(0, y, width, 1);
    }
  }

  private applyVignette(context: CanvasRenderingContext2D, width: number, height: number): void {
    const gradient = context.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.9);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }

  private applyPixelate(context: CanvasRenderingContext2D, width: number, height: number): void {
    const pixelSize = 12;
    context.imageSmoothingEnabled = false;
    context.drawImage(this.tempCanvas, 0, 0, width / pixelSize, height / pixelSize);
    context.drawImage(this.canvas, 0, 0, width / pixelSize, height / pixelSize, 0, 0, width, height);
    context.imageSmoothingEnabled = true;
  }

  public clear(): void {
    this.activeEvents = [];
  }

  public resize(width: number, height: number): void {
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;
  }
}
