// Coordinate system - converts between chart values and pixel coordinates

export interface CoordinateSystemConfig {
  width: number;
  height: number;
  priceMin: number;
  priceMax: number;
  scaleX: number;
  offsetX: number;
}

export class CoordinateSystem {
  private config: CoordinateSystemConfig;

  constructor(config: CoordinateSystemConfig) {
    this.config = { ...config };
  }

  update(config: Partial<CoordinateSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Price to Y coordinate (inverted - higher price = lower Y)
  priceToY(price: number): number {
    const { height, priceMin, priceMax } = this.config;
    const range = priceMax - priceMin;
    if (range === 0) return height / 2;
    return height - ((price - priceMin) / range) * height;
  }

  // Y coordinate to price
  yToPrice(y: number): number {
    const { height, priceMin, priceMax } = this.config;
    const range = priceMax - priceMin;
    return priceMax - (y / height) * range;
  }

  // Index to X coordinate
  indexToX(index: number): number {
    const { width, scaleX, offsetX } = this.config;
    return (index * scaleX) + offsetX;
  }

  // X coordinate to index
  xToIndex(x: number): number {
    const { scaleX, offsetX } = this.config;
    return Math.floor((x - offsetX) / scaleX);
  }

  // Get visible range of candle indices
  getVisibleRange(): { start: number; end: number } {
    const { width, scaleX, offsetX } = this.config;
    const startIndex = this.xToIndex(0);
    const endIndex = this.xToIndex(width);
    return { start: Math.max(0, startIndex), end: endIndex };
  }

  // Get price range for visible area
  getVisiblePriceRange(): { min: number; max: number } {
    return {
      min: this.yToPrice(this.config.height),
      max: this.yToPrice(0)
    };
  }

  // Get width in pixels
  getWidth(): number {
    return this.config.width;
  }

  // Get height in pixels
  getHeight(): number {
    return this.config.height;
  }

  // Get scale
  getScaleX(): number {
    return this.config.scaleX;
  }

  // Get offset
  getOffsetX(): number {
    return this.config.offsetX;
  }
}

export function createCoordinateSystem(config: CoordinateSystemConfig): CoordinateSystem {
  return new CoordinateSystem(config);
}