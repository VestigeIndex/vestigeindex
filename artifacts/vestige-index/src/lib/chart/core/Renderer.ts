// Renderer - orchestrates all chart rendering layers

import { CoordinateSystem } from './CoordinateSystem';
// import type { Candle } from '../store/chartStore';

export interface RendererConfig {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  coordinateSystem: CoordinateSystem;
}

export interface IndicatorData {
  sma7?: { time: number; value: number }[];
  sma25?: { time: number; value: number }[];
  sma99?: { time: number; value: number }[];
  ema12?: { time: number; value: number }[];
  ema26?: { time: number; value: number }[];
  rsi?: { time: number; value: number }[];
  macd?: { time: number; value: number }[];
}

export class Renderer {
  private config: RendererConfig;
  private candles: Candle[] = [];
  private indicators: IndicatorData = {};

  constructor(config: RendererConfig) {
    this.config = config;
  }

  setCandles(candles: Candle[]): void {
    this.candles = candles;
  }

  setIndicators(indicators: IndicatorData): void {
    this.indicators = indicators;
  }

  update(config: Partial<RendererConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Main render function
  render(): void {
    const { ctx, width, height } = this.config;
    
    // Clear canvas
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Render layers in order
    this.renderGrid();
    this.renderCandles();
    this.renderIndicators();
  }

  // Layer 1: Grid
  private renderGrid(): void {
    const { ctx, width, height, coordinateSystem } = this.config;
    
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 1;

    // Horizontal grid lines (price levels)
    const priceRange = coordinateSystem.getVisiblePriceRange();
    const priceStep = this.calculatePriceStep(priceRange.max - priceRange.min);
    const startPrice = Math.ceil(priceRange.min / priceStep) * priceStep;

    for (let price = startPrice; price <= priceRange.max; price += priceStep) {
      const y = coordinateSystem.priceToY(price);
      if (y >= 0 && y <= height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Vertical grid lines (time)
    const visibleRange = coordinateSystem.getVisibleRange();
    const candleCount = this.candles.length;
    if (candleCount === 0) return;

    const timeStep = Math.max(1, Math.floor((visibleRange.end - visibleRange.start) / 6));
    
    for (let i = visibleRange.start; i <= visibleRange.end; i += timeStep) {
      if (i < 0 || i >= candleCount) continue;
      const x = coordinateSystem.indexToX(i);
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }
  }

  // Layer 2: Candles
  private renderCandles(): void {
    const { ctx, coordinateSystem } = this.config;
    const visibleRange = coordinateSystem.getVisibleRange();
    const scaleX = coordinateSystem.getScaleX();
    const candleWidth = Math.max(1, scaleX * 0.8);

    for (let i = visibleRange.start; i < visibleRange.end && i < this.candles.length; i++) {
      const candle = this.candles[i];
      if (!candle) continue;

      const x = coordinateSystem.indexToX(i);
      const isGreen = candle.close >= candle.open;
      const color = isGreen ? '#10b981' : '#ef4444';

      // Draw wick
      const wickX = x + candleWidth / 2;
      const highY = coordinateSystem.priceToY(candle.high);
      const lowY = coordinateSystem.priceToY(candle.low);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wickX, highY);
      ctx.lineTo(wickX, lowY);
      ctx.stroke();

      // Draw body
      const openY = coordinateSystem.priceToY(candle.open);
      const closeY = coordinateSystem.priceToY(candle.close);
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));

      ctx.fillStyle = color;
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    }
  }

  // Layer 3: Indicators
  private renderIndicators(): void {
    // Draw SMA lines
    if (this.indicators.sma7) {
      this.renderIndicatorLine(this.indicators.sma7, '#fbbf24', 1);
    }
    if (this.indicators.sma25) {
      this.renderIndicatorLine(this.indicators.sma25, '#f97316', 1);
    }
    if (this.indicators.sma99) {
      this.renderIndicatorLine(this.indicators.sma99, '#a855f7', 1);
    }
    
    // Draw EMA lines
    if (this.indicators.ema12) {
      this.renderIndicatorLine(this.indicators.ema12, '#06b6d4', 1);
    }
    if (this.indicators.ema26) {
      this.renderIndicatorLine(this.indicators.ema26, '#ec4899', 1);
    }
  }

  private renderIndicatorLine(
    data: { time: number; value: number }[], 
    color: string,
    lineWidth: number
  ): void {
    const { ctx, coordinateSystem } = this.config;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    let started = false;
    
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      
      // Find index of this time in candles
      const index = this.candles.findIndex(c => c.time === point.time);
      if (index < 0) continue;

      const x = coordinateSystem.indexToX(index);
      const y = coordinateSystem.priceToY(point.value);

      if (x < 0 || x > this.config.width) continue;

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }

  private calculatePriceStep(priceRange: number): number {
    if (priceRange <= 0) return 1;
    
    const rawStep = priceRange / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    
    let niceStep: number;
    if (normalized <= 1) niceStep = 1;
    else if (normalized <= 2) niceStep = 2;
    else if (normalized <= 5) niceStep = 5;
    else niceStep = 10;
    
    return niceStep * magnitude;
  }
}

export function createRenderer(config: RendererConfig): Renderer {
  return new Renderer(config);
}
