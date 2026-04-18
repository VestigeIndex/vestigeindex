// ChartEngine - Professional trading chart with Canvas 2D

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartEngineConfig {
  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
}

export class ChartEngine {
  // Canvas & Context
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // Data
  private candles: Candle[] = [];
  
  // Dimensions
  private width: number = 1000;
  private height: number = 500;
  private axisWidth: number = 70;
  private volumeHeight: number = 0.2; // 20% of height
  
  // View state
  private scaleX: number = 10;
  private offsetX: number = 50;
  private priceMin: number = 0;
  private priceMax: number = 0;
  private volumeMax: number = 0;
  
  // Crosshair state
  private crosshair = { x: 0, y: 0, visible: false, candleIndex: -1 };
  
  // Interaction state
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartOffset: number = 0;
  
  // Animation
  private animationFrameId: number | null = null;
  private needsRender: boolean = true;
  
  // Colors
  private colors = {
    bull: "#00c087",
    bear: "#ff4d4f",
    grid: "rgba(255,255,255,0.08)",
    crosshair: "rgba(255,255,255,0.3)",
    axisBg: "#161b22",
    axisText: "#8b949e",
    volumeBull: "rgba(0,192,135,0.3)",
    volumeBear: "rgba(255,77,79,0.3)",
  };

  constructor(config: ChartEngineConfig) {
    this.container = config.container;
    this.canvas = config.canvas;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    
    // Initial resize
    this.resize();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start render loop
    this.startRenderLoop();
  }

  setCandles(candles: Candle[]): void {
    this.candles = candles;
    this.updatePriceRange();
    this.requestRender();
  }

  private updatePriceRange(): void {
    if (this.candles.length === 0) return;
    
    const prices = this.candles.flatMap(c => [c.high, c.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    
    this.priceMin = min - padding;
    this.priceMax = max + padding;
    
    // Calculate volume max
    const volumes = this.candles.map(c => c.volume || 0);
    this.volumeMax = Math.max(...volumes, 1);
  }

  private requestRender(): void {
    this.needsRender = true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER ORDER: clear → grid → candles → volume → price axis → crosshair
  // ═══════════════════════════════════════════════════════════════════════

  private render(): void {
    if (!this.needsRender) return;
    this.needsRender = false;
    
    const ctx = this.ctx;
    const chartHeight = this.height * (1 - this.volumeHeight);
    const volumeTop = this.height * (1 - this.volumeHeight);
    
    // 1. Clear
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 2. Grid (price area only)
    this.renderGrid(chartHeight);
    
    // 3. Candles
    this.renderCandles(chartHeight);
    
    // 4. Volume
    this.renderVolume(volumeTop);
    
    // 5. Price axis
    this.renderPriceAxis(chartHeight);
    
    // 6. Crosshair
    this.renderCrosshair(chartHeight);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GRID
  // ═══════════════════════════════════════════════════════════════════════

  private renderGrid(chartHeight: number): void {
    const ctx = this.ctx;
    ctx.strokeStyle = this.colors.grid;
    ctx.lineWidth = 1;

    // Horizontal grid lines (price levels)
    const priceRange = this.priceMax - this.priceMin;
    const priceStep = this.calculatePriceStep(priceRange);
    const startPrice = Math.ceil(this.priceMin / priceStep) * priceStep;

    for (let price = startPrice; price <= this.priceMax; price += priceStep) {
      const y = this.priceToY(price);
      if (y >= 0 && y <= chartHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width - this.axisWidth, y);
        ctx.stroke();
      }
    }

    // Vertical grid lines (time)
    const visibleStart = Math.floor((-this.offsetX) / this.scaleX);
    const visibleEnd = Math.floor((this.width - this.axisWidth - this.offsetX) / this.scaleX);
    const candleCount = this.candles.length;
    if (candleCount === 0) return;

    const timeStep = Math.max(1, Math.floor((visibleEnd - visibleStart) / 6));
    
    for (let i = Math.max(0, visibleStart); i <= Math.min(candleCount - 1, visibleEnd); i += timeStep) {
      const x = i * this.scaleX + this.offsetX;
      if (x >= 0 && x <= this.width - this.axisWidth) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
        ctx.stroke();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CANDLES
  // ═══════════════════════════════════════════════════════════════════════

  private renderCandles(chartHeight: number): void {
    const ctx = this.ctx;
    const candleWidth = Math.max(1, this.scaleX * 0.8);
    
    const visibleStart = Math.floor((-this.offsetX) / this.scaleX);
    const visibleEnd = Math.floor((this.width - this.axisWidth - this.offsetX) / this.scaleX);
    
    for (let i = Math.max(0, visibleStart); i < Math.min(this.candles.length, visibleEnd + 1); i++) {
      const candle = this.candles[i];
      if (!candle) continue;

      const x = i * this.scaleX + this.offsetX;
      
      const openY = this.priceToY(candle.open);
      const closeY = this.priceToY(candle.close);
      const highY = this.priceToY(candle.high);
      const lowY = this.priceToY(candle.low);

      const isBull = candle.close >= candle.open;
      const color = isBull ? this.colors.bull : this.colors.bear;

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VOLUME
  // ═══════════════════════════════════════════════════════════════════════

  private renderVolume(volumeTop: number): void {
    const ctx = this.ctx;
    const volumeHeight = this.height - volumeTop;
    const candleWidth = Math.max(1, this.scaleX * 0.8);
    
    const visibleStart = Math.floor((-this.offsetX) / this.scaleX);
    const visibleEnd = Math.floor((this.width - this.axisWidth - this.offsetX) / this.scaleX);
    
    for (let i = Math.max(0, visibleStart); i < Math.min(this.candles.length, visibleEnd + 1); i++) {
      const candle = this.candles[i];
      if (!candle || !candle.volume) continue;

      const x = i * this.scaleX + this.offsetX;
      const volumePercent = (candle.volume || 0) / this.volumeMax;
      const barHeight = volumePercent * volumeHeight;
      
      const isBull = candle.close >= candle.open;
      ctx.fillStyle = isBull ? this.colors.volumeBull : this.colors.volumeBear;
      
      ctx.fillRect(x, this.height - barHeight, candleWidth, barHeight);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PRICE AXIS
  // ═══════════════════════════════════════════════════════════════════════

  private renderPriceAxis(chartHeight: number): void {
    const ctx = this.ctx;
    const axisX = this.width - this.axisWidth;
    
    // Background
    ctx.fillStyle = this.colors.axisBg;
    ctx.fillRect(axisX, 0, this.axisWidth, this.height);
    
    // Separator line
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(axisX, 0);
    ctx.lineTo(axisX, this.height);
    ctx.stroke();
    
    // Price labels
    ctx.fillStyle = this.colors.axisText;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    
    const priceRange = this.priceMax - this.priceMin;
    const priceStep = this.calculatePriceStep(priceRange);
    const startPrice = Math.ceil(this.priceMin / priceStep) * priceStep;
    
    for (let price = startPrice; price <= this.priceMax; price += priceStep) {
      const y = this.priceToY(price);
      if (y >= 0 && y <= chartHeight) {
        const label = this.formatPrice(price);
        ctx.fillText(label, axisX + 5, y + 3);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CROSSHAIR
  // ═══════════════════════════════════════════════════════════════════════

  private renderCrosshair(chartHeight: number): void {
    if (!this.crosshair.visible) return;
    
    const ctx = this.ctx;
    const axisX = this.width - this.axisWidth;
    
    // Vertical line
    ctx.strokeStyle = this.colors.crosshair;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(this.crosshair.x, 0);
    ctx.lineTo(this.crosshair.x, this.height);
    ctx.stroke();
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, this.crosshair.y);
    ctx.lineTo(axisX, this.crosshair.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Price label on axis
    const price = this.yToPrice(this.crosshair.y);
    const priceLabel = this.formatPrice(price);
    
    ctx.fillStyle = this.colors.axisBg;
    ctx.fillRect(axisX + 1, this.crosshair.y - 8, this.axisWidth - 1, 16);
    ctx.fillStyle = this.colors.bull;
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(priceLabel, axisX + 5, this.crosshair.y + 3);
    
    // Time label at bottom
    if (this.crosshair.candleIndex >= 0 && this.crosshair.candleIndex < this.candles.length) {
      const candle = this.candles[this.crosshair.candleIndex];
      const timeLabel = this.formatTime(candle.time);
      
      ctx.fillStyle = this.colors.axisBg;
      const labelWidth = ctx.measureText(timeLabel).width + 10;
      ctx.fillRect(this.crosshair.x - labelWidth / 2, this.height - 18, labelWidth, 16);
      ctx.fillStyle = this.colors.axisText;
      ctx.textAlign = "center";
      ctx.fillText(timeLabel, this.crosshair.x, this.height - 6);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COORDINATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  private priceToY(price: number): number {
    const range = this.priceMax - this.priceMin;
    if (range === 0) return this.height / 2;
    const chartHeight = this.height * (1 - this.volumeHeight);
    return chartHeight - ((price - this.priceMin) / range) * chartHeight;
  }

  private yToPrice(y: number): number {
    const range = this.priceMax - this.priceMin;
    const chartHeight = this.height * (1 - this.volumeHeight);
    return this.priceMax - (y / chartHeight) * range;
  }

  private indexToX(index: number): number {
    return index * this.scaleX + this.offsetX;
  }

  private xToIndex(x: number): number {
    return Math.floor((x - this.offsetX) / this.scaleX);
  }

  private calculatePriceStep(priceRange: number): number {
    if (priceRange <= 0) return 1;
    const rawStep = priceRange / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    if (normalized <= 1) return 1 * magnitude;
    if (normalized <= 2) return 2 * magnitude;
    if (normalized <= 5) return 5 * magnitude;
    return 10 * magnitude;
  }

  private formatPrice(price: number): string {
    if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(6);
  }

  private formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════

  private setupEventListeners(): void {
    // Mouse move - crosshair
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    
    // Mouse leave - hide crosshair
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    
    // Mouse down - start pan
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    
    // Mouse move (global) - pan
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMoveDrag(e));
    
    // Mouse up - end pan
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    
    // Mouse leave - end pan
    this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    
    // Wheel - zoom
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    
    // Double click - reset
    this.canvas.addEventListener('dblclick', () => this.handleDoubleClick());
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if in chart area (not axis)
    if (x < this.width - this.axisWidth && y < this.height * (1 - this.volumeHeight)) {
      this.crosshair.x = x;
      this.crosshair.y = y;
      this.crosshair.visible = true;
      this.crosshair.candleIndex = this.xToIndex(x);
      this.requestRender();
    } else {
      this.crosshair.visible = false;
      this.requestRender();
    }
  }

  private handleMouseLeave(): void {
    this.crosshair.visible = false;
    this.requestRender();
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Only start drag if clicking on chart area
    if (x < this.width - this.axisWidth) {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartOffset = this.offsetX;
      this.crosshair.visible = false;
    }
  }

  private handleMouseMoveDrag(e: MouseEvent): void {
    if (!this.isDragging) return;
    
    const dx = e.clientX - this.dragStartX;
    this.offsetX = this.dragStartOffset + dx;
    this.requestRender();
  }

  private handleMouseUp(): void {
    this.isDragging = false;
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Don't zoom if over axis
    if (mouseX > this.width - this.axisWidth) return;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScaleX = Math.max(2, Math.min(50, this.scaleX * zoomFactor));
    
    // Adjust offset to zoom centered on mouse position
    const mousePrice = this.xToIndex(mouseX);
    const oldOffset = this.offsetX;
    const newOffset = mouseX - mousePrice * newScaleX;
    
    this.scaleX = newScaleX;
    this.offsetX = newOffset;
    this.requestRender();
  }

  private handleDoubleClick(): void {
    this.scaleX = 10;
    this.offsetX = 50;
    this.requestRender();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER LOOP (requestAnimationFrame)
  // ═══════════════════════════════════════════════════════════════════════

  private startRenderLoop(): void {
    const render = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RESIZE & DESTROY
  // ═══════════════════════════════════════════════════════════════════════

  resize(): void {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.requestRender();
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