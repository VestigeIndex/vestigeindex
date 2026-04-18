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
  private offsetX: number = 0;
  private candleWidth: number = 6;
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

    // Vertical grid lines (time) - using visible range
    const { startIndex, endIndex } = this.getVisibleRange();
    const candleCount = this.candles.length;
    if (candleCount === 0) return;

    const timeStep = Math.max(1, Math.floor((endIndex - startIndex) / 6));
    
    for (let i = startIndex; i < endIndex; i += timeStep) {
      const x = this.indexToX(i);
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
    const w = this.candleWidth;
    const candleBodyWidth = Math.max(1, w - 2);
    
    // Use visible range for performance
    const { startIndex, endIndex } = this.getVisibleRange();
    
    for (let i = startIndex; i < endIndex; i++) {
      const candle = this.candles[i];
      if (!candle) continue;

      const x = this.indexToX(i);
      
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
      ctx.moveTo(x + w / 2, highY);
      ctx.lineTo(x + w / 2, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      ctx.fillRect(x + 1, bodyTop, candleBodyWidth, bodyHeight);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VOLUME
  // ═══════════════════════════════════════════════════════════════════════

  private renderVolume(volumeTop: number): void {
    const ctx = this.ctx;
    const volumeHeight = this.height - volumeTop;
    const w = this.candleWidth;
    const candleBodyWidth = Math.max(1, w - 2);
    
    // Use visible range for performance
    const { startIndex, endIndex } = this.getVisibleRange();
    
    for (let i = startIndex; i < endIndex; i++) {
      const candle = this.candles[i];
      if (!candle || !candle.volume) continue;

      const x = this.indexToX(i);
      const volumePercent = (candle.volume || 0) / this.volumeMax;
      const barHeight = volumePercent * volumeHeight;
      
      const isBull = candle.close >= candle.open;
      ctx.fillStyle = isBull ? this.colors.volumeBull : this.colors.volumeBear;
      
      ctx.fillRect(x + 1, this.height - barHeight, candleBodyWidth, barHeight);
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
    return (index - this.offsetX) * this.candleWidth;
  }

  private xToIndex(x: number): number {
    return Math.floor(x / this.candleWidth + this.offsetX);
  }

  // 🧠 VISIBLE RANGE (performance optimization)
  private getVisibleRange(): { startIndex: number; endIndex: number } {
    const candlesOnScreen = Math.floor((this.width - this.axisWidth) / this.candleWidth);
    
    const startIndex = Math.max(0, Math.floor(this.offsetX));
    const endIndex = Math.min(this.candles.length, startIndex + candlesOnScreen + 2);
    
    return { startIndex, endIndex };
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
  // EVENT HANDLERS (Mouse + Touch)
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
    
    // 📱 TOUCH EVENTS
    this.setupTouchEvents();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TOUCH SUPPORT (Pinch + Drag)
  // ═══════════════════════════════════════════════════════════════════════

  private touchStartX: number = 0;
  private touchStartOffsetX: number = 0;
  private lastTouchDistance: number | null = null;
  private lastTouchCenter: number = 0;

  private setupTouchEvents(): void {
    // Touch start
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    
    // Touch move
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    
    // Touch end
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch - start pan
      this.touchStartX = e.touches[0].clientX;
      this.touchStartOffsetX = this.offsetX;
      this.isDragging = true;
      this.crosshair.visible = false;
    } else if (e.touches.length === 2) {
      // Two fingers - start pinch zoom
      this.isDragging = false;
      this.lastTouchDistance = this.getTouchDistance(e.touches);
      this.lastTouchCenter = this.getTouchCenter(e.touches);
    }
    
    this.requestRender();
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    
    if (e.touches.length === 1 && this.isDragging) {
      // Single finger drag - pan
      const dx = e.touches[0].clientX - this.touchStartX;
      const scaledDx = dx / (this.scaleX * this.candleWidth);
      this.offsetX = this.touchStartOffsetX - scaledDx;
      this.requestRender();
    } else if (e.touches.length === 2) {
      // Two finger pinch - zoom
      const newDistance = this.getTouchDistance(e.touches);
      const newCenter = this.getTouchCenter(e.touches);
      
      if (this.lastTouchDistance !== null) {
        const zoomFactor = newDistance / this.lastTouchDistance;
        
        // Calculate zoom centered on touch center
        const oldScaleX = this.scaleX;
        this.scaleX = Math.max(0.3, Math.min(5, this.scaleX * zoomFactor));
        
        // Adjust offset to zoom centered on touch
        const scaleDiff = this.scaleX / oldScaleX;
        const centerIndex = (this.lastTouchCenter - this.offsetX) / (this.candleWidth * oldScaleX);
        this.offsetX = this.lastTouchCenter - centerIndex * this.candleWidth * this.scaleX;
      }
      
      this.lastTouchDistance = newDistance;
      this.lastTouchCenter = newCenter;
      this.requestRender();
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (e.touches.length === 0) {
      this.isDragging = false;
      this.lastTouchDistance = null;
    } else if (e.touches.length === 1) {
      // Transitioned to single touch - reset drag state
      this.isDragging = false;
      this.lastTouchDistance = null;
    }
  }

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTouchCenter(touches: TouchList): number {
    return (touches[0].clientX + touches[1].clientX) / 2;
  }

  // 🧠 CANDLE WIDTH (dynamic scaling)
  private get candleWidth(): number {
    return Math.max(2, this.scaleX * 6);
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
    const scaledDx = dx / this.candleWidth;
    this.offsetX = this.dragStartOffset + scaledDx;
    this.requestRender();
  }

  private handleMouseUp(): void {
    this.isDragging = false;
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Don't zoom if over axis
    if (mouseX > this.width - this.axisWidth) return;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const oldWidth = this.candleWidth;
    const newWidth = Math.max(2, Math.min(30, oldWidth * zoomFactor));
    
    // Adjust offset to zoom centered on mouse position
    const mouseIndex = this.xToIndex(mouseX);
    const oldOffset = this.offsetX;
    const newOffset = mouseIndex - mouseX / newWidth;
    
    this.offsetX = newOffset;
    this.requestRender();
  }

  private handleDoubleClick(): void {
    this.offsetX = 0;
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