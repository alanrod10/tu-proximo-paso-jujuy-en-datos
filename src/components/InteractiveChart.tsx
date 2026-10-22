import React, { useState } from 'react';
import { formatNumber } from '../utils/formatters';

export interface ChartDataPoint {
  label: string; // ej. "2024" o "1°T 26"
  value: number | null; // valor numérico o null si no disponible / secreto
  secondaryValue?: number | null; // para corriente o indirecto
  isProvisional?: boolean;
  isSecret?: boolean;
  tooltipExtra?: string;
}

interface InteractiveChartProps {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  unit?: string;
  valuePrefix?: string;
  color?: 'emerald' | 'blue' | 'purple' | 'amber';
  height?: number;
  formatValue?: (val: number) => string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  title,
  subtitle,
  unit = '',
  valuePrefix = '',
  color = 'blue',
  height = 240,
  formatValue,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const colorMap = {
    emerald: {
      stroke: '#059669',
      fill: 'rgba(16, 185, 129, 0.12)',
      point: '#10b981',
      bgHover: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    blue: {
      stroke: '#2563eb',
      fill: 'rgba(59, 130, 246, 0.12)',
      point: '#3b82f6',
      bgHover: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    purple: {
      stroke: '#7c3aed',
      fill: 'rgba(139, 92, 246, 0.12)',
      point: '#8b5cf6',
      bgHover: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    amber: {
      stroke: '#d97706',
      fill: 'rgba(245, 158, 11, 0.12)',
      point: '#f59e0b',
      bgHover: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  };

  const theme = colorMap[color] || colorMap.blue;

  // Filtrar valores válidos para escalar
  const validValues = data
    .map((d) => d.value)
    .filter((v): v is number => v !== null && !isNaN(v));

  if (validValues.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
        No hay datos numéricos suficientes para graficar esta serie.
      </div>
    );
  }

  const minValue = Math.min(...validValues);
  const maxValue = Math.max(...validValues);
  // Padding del 10% vertical
  const range = maxValue - minValue || 1;
  const yMin = Math.max(0, minValue - range * 0.1);
  const yMax = maxValue + range * 0.1;
  const yRange = yMax - yMin || 1;

  // Dimensiones SVG
  const width = 600;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (val: number | null) => {
    if (val === null) return paddingTop + plotHeight;
    return paddingTop + plotHeight - ((val - yMin) / yRange) * plotHeight;
  };

  // Construir path de la línea y del área
  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.value),
    val: d.value,
  }));

  const linePath = points
    .filter((p) => p.val !== null)
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(paddingTop + plotHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingTop + plotHeight).toFixed(1)} Z`
    : '';

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];
  const activeCoord = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  const defaultFormatter = (val: number) => formatNumber(Math.round(val));
  const formatFn = formatValue || defaultFormatter;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
      {/* Header del gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          {title && <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Cifra activa o último valor */}
        {activePoint && activePoint.value !== null && (
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-slate-500">{activePoint.label}:</span>
            <span className="text-lg font-black text-slate-900 font-mono">
              {valuePrefix}{formatFn(activePoint.value)} {unit}
              {activePoint.isProvisional && <span className="text-amber-600 font-sans ml-0.5">*</span>}
            </span>
          </div>
        )}
      </div>

      {/* Canvas SVG interactivo */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label={title || 'Gráfico estadístico'}
        >
          {/* Guías horizontales de fondo */}
          {[0, 0.5, 1].map((pct, idx) => {
            const val = yMin + yRange * (1 - pct);
            const y = paddingTop + plotHeight * pct;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {formatFn(val)}
                </text>
              </g>
            );
          })}

          {/* Área sombreada */}
          {areaPath && (
            <path d={areaPath} fill={theme.fill} />
          )}

          {/* Línea principal */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={theme.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Puntos y zonas de detección */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            if (p.val === null) return null;

            return (
              <g key={idx} className="transition-all duration-150">
                {/* Punto visual */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5.5 : 3}
                  fill={isHovered ? theme.stroke : 'white'}
                  stroke={theme.stroke}
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all duration-150"
                />

                {/* Zona transparente de toque/cursor amplia */}
                <rect
                  x={p.x - plotWidth / (data.length * 2)}
                  y={0}
                  width={plotWidth / data.length}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onTouchStart={() => setHoveredIndex(idx)}
                />
              </g>
            );
          })}

          {/* Etiquetas del eje X (mostramos extremos e intermedias para no saturar) */}
          {data.map((d, idx) => {
            const showLabel =
              data.length <= 8 ||
              idx === 0 ||
              idx === data.length - 1 ||
              idx === Math.floor(data.length / 2);

            if (!showLabel) return null;

            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-medium"
              >
                {d.label}
              </text>
            );
          })}
        </svg>

        {/* Tooltip flotante */}
        {hoveredIndex !== null && activePoint && activePoint.value !== null && (
          <div
            className="pointer-events-none absolute z-20 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs shadow-xl space-y-0.5 -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(activeCoord.x / width) * 100}%`,
              top: `${(activeCoord.y / height) * 100}%`,
            }}
          >
            <div className="font-mono text-[10px] text-slate-400">{activePoint.label}</div>
            <div className="font-bold text-white whitespace-nowrap">
              {valuePrefix}{formatFn(activePoint.value)} {unit}
              {activePoint.isProvisional && ' (provisorio*)'}
            </div>
            {activePoint.tooltipExtra && (
              <div className="text-[10px] text-slate-300 font-normal">{activePoint.tooltipExtra}</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>Pasá el cursor o tocá para ver los valores exactos.</span>
        {data.some((d) => d.isProvisional) && (
          <span className="text-amber-700 font-semibold">* Datos con condición provisoria oficial.</span>
        )}
      </div>
    </div>
  );
};
