// ChartEngine - main chart controller

import { CoordinateSystem, createCoordinateSystem } from './CoordinateSystem';
import { Renderer, createRenderer } from './Renderer';

// Removed unused imports that were causing path issues
// import type { Candle } from '../store/chartStore';
// import { calculateSMAOnCandles } from '../indicators/sma';
// import { calculateEMAOnCandles } from '../indicators/ema';

export interface ChartEngineConfig {
  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
}

export class ChartEngine {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private coordinateSystem: CoordinateSystem;
  private renderer: Renderer;
  
  private candles: Candle[] = [];
  private animationFrameId: number | null = null;
  
  // View state
  private scaleX: number = 10;
  private offsetX: number = 50;
  private priceMin: number = 0;
  private priceMax: number = 0;

  constructor(config: ChartEngineConfig) {
    this.container = config.container;
    this.canvas = config.canvas;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    
    // Initialize coordinate system
    this.coordinateSystem = createCoordinateSystem({
      width: this.canvas.width,
      height: this.canvas.height,
      priceMin: this.priceMin,
      priceMax: this.priceMax,
      scaleX: this.scaleX,
      offsetX: this.offsetX,
    });

    // Initialize renderer
    this.renderer = createRenderer({
      ctx: this.ctx,
      width: this.canvas.width,
      height: this.canvas.height,
      coordinateSystem: this.coordinateSystem,
    });

    // Setup event listeners
    this.setupEventListeners();
    
    // Start render loop
    this.startRenderLoop();
  }

  setCandles(candles: Candle[]): void {
    this.candles = candles;
    this.updatePriceRange();
    this.renderer.setCandles(candles);
  }

  private updatePriceRange(): void {
    if (this.candles.length === 0) return;
    
    const prices = this.candles.flatMap(c => [c.high, c.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    
    this.priceMin = min - padding;
    this.priceMax = max + padding;
    
    this.coordinateSystem.update({
      priceMin: this.priceMin,
      priceMax: this.priceMax,
    });
  }

  private setupEventListeners(): void {
    // Mouse wheel - zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.scaleX = Math.max(2, Math.min(50, this.scaleX * delta));
      this.updateCoordinateSystem();
    }, { passive: false });

    // Mouse drag - pan
    let isDragging = false;
    let startX = 0;
    let startOffset = 0;

    this.canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startOffset = this.offsetX;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      this.offsetX = startOffset + dx;
      this.updateCoordinateSystem();
    });

    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      isDragging = false;
    });

    // Double click - reset
    this.canvas.addEventListener('dblclick', () => {
      this.scaleX = 10;
      this.offsetX = 50;
      this.updateCoordinateSystem();
    });
  }

  private updateCoordinateSystem(): void {
    this.coordinateSystem.update({
      width: this.canvas.width,
      height: this.canvas.height,
      scaleX: this.scaleX,
      offsetX: this.offsetX,
      priceMin: this.priceMin,
      priceMax: this.priceMax,
    });

    this.renderer.update({
      width: this.canvas.width,
      height: this.canvas.height,
      coordinateSystem: this.coordinateSystem,
    });
  }

  private startRenderLoop(): void {
    const render = () => {
      this.renderer.render();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  resize(): void {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.updateCoordinateSystem();
  }

  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

export function createChartEngine(config: ChartEngineConfig): ChartEngine {
  return new ChartEngine(config);
}
