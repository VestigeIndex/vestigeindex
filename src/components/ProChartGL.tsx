import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Spinner } from './ui/spinner';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Cache local para histórico
const CACHE_KEY = 'vestige_chart_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

async function getHistoricalData(symbol: string, limit: number = 500): Promise<CandleData[]> {
  const cacheKey = `${CACHE_KEY}_${symbol}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    } catch (e) {
      console.warn('Cache corrupted, fetching fresh data');
    }
  }

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1h&limit=${limit}`
    );
    if (!response.ok) throw new Error('API error');
    const klines = await response.json();
    const data = klines.map((k: any[]) => ({
      time: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[7])
    }));

    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    return [];
  }
}

async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
    );
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error('Failed to fetch current price:', error);
    return 0;
  }
}

interface OrbitControls {
  update: () => void;
  enableZoom: boolean;
  enablePan: boolean;
  zoomSpeed: number;
}

// Simple OrbitControls implementation
function createOrbitControls(camera: THREE.Camera, domElement: HTMLElement): OrbitControls {
  const controls = {
    enableZoom: true,
    enablePan: true,
    zoomSpeed: 1.2,
    update: () => {}
  };

  let isRotating = false;
  let previousMousePosition = { x: 0, y: 0 };

  domElement.addEventListener('mousedown', (e) => {
    isRotating = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  domElement.addEventListener('mousemove', (e) => {
    if (!isRotating) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    
    camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.01);
    camera.lookAt(0, 0, 0);
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  domElement.addEventListener('mouseup', () => {
    isRotating = false;
  });

  domElement.addEventListener('wheel', (e) => {
    if (!controls.enableZoom) return;
    e.preventDefault();
    const direction = camera.position.clone().normalize();
    const distance = camera.position.length();
    const newDistance = distance + (e.deltaY > 0 ? distance * 0.1 : -distance * 0.1);
    camera.position.copy(direction.multiplyScalar(Math.max(5, newDistance)));
    camera.lookAt(0, 0, 0);
  }, { passive: false });

  return controls;
}

export function ProChartGL({
  symbol,
  height = 500,
  onBuy,
  onSell,
  onClose,
}: {
  symbol: string;
  height?: number;
  onBuy?: () => void;
  onSell?: () => void;
  onClose?: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [data, setData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: CandleData | null }>({
    x: 0,
    y: 0,
    data: null,
  });

  const getLimit = useCallback(() => {
    const limits = { '1D': 24, '1W': 168, '1M': 720, '3M': 2160, '1Y': 8760, 'ALL': 2000 };
    return limits[timeRange];
  }, [timeRange]);

  // Fetch historical data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const limit = getLimit();
      const historicalData = await getHistoricalData(symbol, limit);
      setData(historicalData);
      if (historicalData.length) {
        const latest = historicalData[historicalData.length - 1];
        const previous = historicalData[historicalData.length - 2];
        setCurrentPrice(latest.close);
        setPriceChange(previous ? ((latest.close - previous.close) / previous.close) * 100 : 0);
      }
      setLoading(false);
    };
    fetchData();

    const priceInterval = setInterval(async () => {
      const price = await getCurrentPrice(symbol);
      if (price > 0) {
        setCurrentPrice((prev) => {
          const change = prev > 0 ? ((price - prev) / prev) * 100 : 0;
          setPriceChange(change);
          return price;
        });
      }
    }, 5000);

    return () => clearInterval(priceInterval);
  }, [symbol, timeRange, getLimit]);

  // Configurar WebGL
  useEffect(() => {
    if (!mountRef.current || data.length === 0 || loading) return;

    // Limpiar escena anterior
    if (rendererRef.current) {
      rendererRef.current.dispose();
      mountRef.current.innerHTML = '';
    }

    const width = mountRef.current.clientWidth;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = createOrbitControls(camera, renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    const maxPrice = Math.max(...data.map((d) => d.high));
    const minPrice = Math.min(...data.map((d) => d.low));
    const priceRange = maxPrice - minPrice || 1;
    const candleWidth = 0.5;
    const spacing = 0.7;
    const startX = -(data.length * spacing) / 2;

    // Luces
    const ambientLight = new THREE.AmbientLight(0x404060, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x404060, 0.5);
    backLight.position.set(-10, 5, -10);
    scene.add(backLight);

    // Grid
    const gridHelper = new THREE.GridHelper(50, 20, 0x333333, 0x222222);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Velas 3D con transiciones suaves
    const candleGroup = new THREE.Group();
    scene.add(candleGroup);

    data.forEach((candle, i) => {
      const x = startX + i * spacing;
      const yOpen = ((candle.open - minPrice) / priceRange) * 10 - 5;
      const yClose = ((candle.close - minPrice) / priceRange) * 10 - 5;
      const yHigh = ((candle.high - minPrice) / priceRange) * 10 - 5;
      const yLow = ((candle.low - minPrice) / priceRange) * 10 - 5;

      const isGreen = candle.close >= candle.open;
      const color = isGreen ? 0x10b981 : 0xef4444;
      const emissive = isGreen ? 0x064e3b : 0x7f1d1d;
      const bodyHeight = Math.abs(yClose - yOpen) || 0.05;
      const bodyY = (yOpen + yClose) / 2;

      // Cuerpo de la vela
      const geometry = new THREE.BoxGeometry(candleWidth, bodyHeight, 0.3);
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.3,
        metalness: 0.3,
        roughness: 0.6,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x, bodyY, 0);
      cube.castShadow = true;
      cube.receiveShadow = true;
      candleGroup.add(cube);

      // Mecha (wick)
      const wickHeight = Math.abs(yHigh - yLow);
      if (wickHeight > 0) {
        const wickGeometry = new THREE.BoxGeometry(0.08, wickHeight, 0.08);
        const wickMaterial = new THREE.MeshStandardMaterial({
          color,
          emissive,
          emissiveIntensity: 0.2,
        });
        const wick = new THREE.Mesh(wickGeometry, wickMaterial);
        wick.position.set(x, (yHigh + yLow) / 2, 0);
        wick.castShadow = true;
        candleGroup.add(wick);
      }
    });

    // Línea de precio actual
    if (currentPrice > 0) {
      const yCurrent = ((currentPrice - minPrice) / priceRange) * 10 - 5;
      const lineGeometry = new THREE.BoxGeometry(data.length * spacing + 2, 0.08, 0.1);
      const lineMaterial = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1e40af,
        emissiveIntensity: 0.4,
      });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.set(0, yCurrent, 0.5);
      scene.add(line);
    }

    // Raycaster para tooltip
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltipData: CandleData[] = data;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(candleGroup.children);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const idx = Math.round((point.x - startX) / spacing);
        if (idx >= 0 && idx < tooltipData.length) {
          setTooltip({
            x: event.clientX,
            y: event.clientY,
            data: tooltipData[idx],
          });
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }

      setTooltip({ x: 0, y: 0, data: null });
      renderer.domElement.style.cursor = 'default';
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      rendererRef.current.setSize(newWidth, height);
      cameraRef.current.aspect = newWidth / height;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [data, currentPrice, height, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-black p-4" style={{ height: `${height}px` }}>
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-black p-4 text-white" style={{ height: `${height}px` }}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-black p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-white">{symbol}/USDT</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-3xl font-bold text-white">${currentPrice.toFixed(2)}</span>
            <span className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {onBuy && (
            <button
              onClick={onBuy}
              className="rounded-lg bg-green-600 px-6 py-2 text-white transition hover:bg-green-700"
            >
              Buy
            </button>
          )}
          {onSell && (
            <button
              onClick={onSell}
              className="rounded-lg bg-red-600 px-6 py-2 text-white transition hover:bg-red-700"
            >
              Sell
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-800 px-4 py-2 text-white transition hover:bg-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`rounded px-3 py-1 text-sm ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <div ref={mountRef} style={{ height: `${height}px`, width: '100%' }} />

      {tooltip.data && (
        <div
          className="fixed z-50 rounded-lg border border-gray-700 bg-black/90 p-3 text-sm text-white"
          style={{ left: tooltip.x + 15, top: tooltip.y - 80 }}
        >
          <div className="mb-1 font-bold">{symbol}</div>
          <div>📊 Open: ${tooltip.data.open.toFixed(2)}</div>
          <div>📈 High: ${tooltip.data.high.toFixed(2)}</div>
          <div>📉 Low: ${tooltip.data.low.toFixed(2)}</div>
          <div>🔒 Close: ${tooltip.data.close.toFixed(2)}</div>
          <div>📦 Vol: {Math.round(tooltip.data.volume).toLocaleString()}</div>
        </div>
      )}

      <div className="mt-2 text-center text-xs text-gray-500">
        🖱️ Zoom/pan with mouse | 📊 Real-time data from Binance
      </div>
    </div>
  );
}
