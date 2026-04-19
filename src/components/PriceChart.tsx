import React, { useMemo } from "react";
import { formatCurrency, formatDate } from "../lib/utils";

interface PriceChartProps {
  data: [number, number][];
  width?: number;
  height?: number;
  showAxis?: boolean;
  showTooltip?: boolean;
}

export default function PriceChart({
  data,
  width = 280,
  height = 120,
  showAxis = false,
  showTooltip = true,
}: PriceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length < 2) return null;

    const prices = data.map((d) => d[1]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = data.map(([timestamp, price], i) => {
      const x = (i / (data.length - 1)) * (width - 40) + 20;
      const y = height - 30 - ((price - min) / range) * (height - 60);
      return { x, y, timestamp, price };
    });

    const path = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;
    
    // Gradient area
    const areaPath = `${path} L ${points[points.length - 1].x},${height - 30} L ${points[0].x},${height - 30} Z`;

    const firstPrice = data[0][1];
    const lastPrice = data[data.length - 1][1];
    const isUp = lastPrice >= firstPrice;
    const color = isUp ? "#10b981" : "#ef4444";

    return { points, path, areaPath, min, max, color, isUp, firstPrice, lastPrice };
  }, [data, width, height]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center text-xs text-muted-foreground" style={{ width, height }}>
        No hay datos disponibles
      </div>
    );
  }

  const { points, path, areaPath, min, max, color, isUp, firstPrice, lastPrice } = chartData;

  return (
    <div className="relative">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`chartGradient-${isUp ? "up" : "down"}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showAxis && (
          <>
            <line x1={20} y1={30} x2={width - 20} y2={30} stroke="#374151" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1={20} y1={height / 2} x2={width - 20} y2={height / 2} stroke="#374151" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1={20} y1={height - 30} x2={width - 20} y2={height - 30} stroke="#374151" strokeWidth="0.5" strokeDasharray="2,2" />
          </>
        )}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#chartGradient-${isUp ? "up" : "down"})`} />

        {/* Line */}
        <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Start and end dots */}
        {points.length > 0 && (
          <>
            <circle cx={points[0].x} cy={points[0].y} r="3" fill={color} />
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={color} />
          </>
        )}
      </svg>

      {/* Price labels */}
      {showAxis && (
        <div className="absolute left-0 top-0 flex flex-col justify-between text-[9px] text-muted-foreground" style={{ height }}>
          <span>${formatCurrency(max).replace("$", "")}</span>
          <span>${formatCurrency((max + min) / 2).replace("$", "")}</span>
          <span>${formatCurrency(min).replace("$", "")}</span>
        </div>
      )}
    </div>
  );
}

// Mini sparkline for cards
export function MiniSparkline({ data, isUp = true, width = 80, height = 24 }: { data: number[]; isUp?: boolean; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  const path = `M ${points.join(" L ")}`;
  const color = isUp ? "#10b981" : "#ef4444";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}