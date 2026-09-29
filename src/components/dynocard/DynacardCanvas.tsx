import React from 'react';
import { DynacardPoint } from '../../types';

interface DynacardCanvasProps {
  title: string;
  points: DynacardPoint[];
  strokeLengthM?: number;
  color?: string;
  type: 'SURFACE' | 'DOWNHOLE';
  idealPoints?: DynacardPoint[];
  showIdealOverlay?: boolean;
}

export const DynacardCanvas: React.FC<DynacardCanvasProps> = ({
  title,
  points,
  strokeLengthM = 3.05,
  color = '#22D3EE',
  type,
  idealPoints,
  showIdealOverlay = false,
}) => {
  // SVG dimensions
  const width = 480;
  const height = 300;
  const margin = { top: 25, right: 30, bottom: 40, left: 55 };

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const yMax = 140; // kN
  const yMin = 0;   // kN

  // Coordinates mapping
  const scaleX = (pos: number) => margin.left + pos * plotWidth;
  const scaleY = (load: number) => margin.top + plotHeight - ((load - yMin) / (yMax - yMin)) * plotHeight;

  // Compute card statistics
  const loads = points.map((p) => p.load);
  const pprl = points.length ? Math.max(...loads) : 0;
  const mprl = points.length ? Math.min(...loads) : 0;
  const loadRange = pprl - mprl;

  // Approximate work per stroke (Area = \oint F ds) in kJ
  let workAreaKj = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    workAreaKj += 0.5 * (p1.load + p2.load) * (p2.position - p1.position) * strokeLengthM;
  }
  workAreaKj = Math.abs(Math.round(workAreaKj * 10) / 10);

  // Generate SVG path string
  const generatePathD = (pts: DynacardPoint[]) => {
    if (!pts || pts.length === 0) return '';
    const d = pts.map((p, idx) => {
      const x = scaleX(p.position);
      const y = scaleY(p.load);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return `${d.join(' ')} Z`;
  };

  const pathD = generatePathD(points);
  const idealPathD = idealPoints ? generatePathD(idealPoints) : '';

  // Upstroke / Downstroke midpoint indicators
  const upstrokeMid = points[Math.floor(points.length * 0.25)];
  const downstrokeMid = points[Math.floor(points.length * 0.75)];

  return (
    <div className="panel-scada p-3 rounded flex flex-col justify-between space-y-2 relative group hover:border-border-highlight transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            {title}
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-inset border border-border text-text-muted">
            {type === 'SURFACE' ? 'SURFACE TRANSDUCER' : 'GIBBS RECONSTRUCTION'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[10px] font-mono text-text-muted">
          <span>
            PPRL: <strong className="text-text-primary">{pprl.toFixed(1)} kN</strong>
          </span>
          <span>
            MPRL: <strong className="text-text-primary">{mprl.toFixed(1)} kN</strong>
          </span>
          <span>
            WORK: <strong className="text-status-cyan">{workAreaKj} kJ</strong>
          </span>
        </div>
      </div>

      {/* SVG Plot Canvas */}
      <div className="relative w-full aspect-[16/10] max-h-[310px] flex items-center justify-center bg-bg-inset rounded border border-border overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
        >
          {/* Subtle Grid Lines */}
          {[0, 25, 50, 75, 100, 125].map((yVal) => (
            <g key={yVal}>
              <line
                x1={margin.left}
                y1={scaleY(yVal)}
                x2={width - margin.right}
                y2={scaleY(yVal)}
                stroke="#1F2630"
                strokeWidth={1}
                strokeDasharray={yVal === 0 ? '' : '3 3'}
              />
              <text
                x={margin.left - 8}
                y={scaleY(yVal) + 3}
                fill="#5F6875"
                fontSize={9}
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {yVal}
              </text>
            </g>
          ))}

          {[0, 0.25, 0.5, 0.75, 1.0].map((xVal) => (
            <g key={xVal}>
              <line
                x1={scaleX(xVal)}
                y1={margin.top}
                x2={scaleX(xVal)}
                y2={height - margin.bottom}
                stroke="#1F2630"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text
                x={scaleX(xVal)}
                y={height - margin.bottom + 14}
                fill="#5F6875"
                fontSize={9}
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                {(xVal * strokeLengthM).toFixed(1)}m
              </text>
            </g>
          ))}

          {/* PPRL Reference Line */}
          <line
            x1={margin.left}
            y1={scaleY(pprl)}
            x2={width - margin.right}
            y2={scaleY(pprl)}
            stroke="#EF4444"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.7}
          />

          {/* MPRL Reference Line */}
          <line
            x1={margin.left}
            y1={scaleY(mprl)}
            x2={width - margin.right}
            y2={scaleY(mprl)}
            stroke="#3B82F6"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.6}
          />

          {/* Ideal Comparison Loop (If Enabled) */}
          {showIdealOverlay && idealPathD && (
            <path
              d={idealPathD}
              fill="rgba(34, 197, 94, 0.05)"
              stroke="#22C55E"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              opacity={0.6}
            />
          )}

          {/* Main Card Path */}
          <path
            d={pathD}
            fill={`${color}12`}
            stroke={color}
            strokeWidth={2.4}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Direction Indicator Markers */}
          {upstrokeMid && (
            <g transform={`translate(${scaleX(upstrokeMid.position)}, ${scaleY(upstrokeMid.load)})`}>
              <circle r={3} fill="#22C55E" />
              <text y={-8} fill="#22C55E" fontSize={8} fontFamily="JetBrains Mono" textAnchor="middle">
                UPSTROKE ▶
              </text>
            </g>
          )}

          {downstrokeMid && (
            <g transform={`translate(${scaleX(downstrokeMid.position)}, ${scaleY(downstrokeMid.load)})`}>
              <circle r={3} fill="#F59E0B" />
              <text y={12} fill="#F59E0B" fontSize={8} fontFamily="JetBrains Mono" textAnchor="middle">
                ◀ DOWNSTROKE
              </text>
            </g>
          )}

          {/* Axis Labels */}
          <text
            x={margin.left}
            y={margin.top - 10}
            fill="#8B94A3"
            fontSize={9}
            fontFamily="JetBrains Mono"
            textAnchor="start"
          >
            LOAD (kN)
          </text>

          <text
            x={width - margin.right}
            y={height - margin.bottom + 28}
            fill="#8B94A3"
            fontSize={9}
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            STROKE POSITION ({strokeLengthM}m)
          </text>
        </svg>

        {/* Floating Metrics Badge */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-bg-panel/90 backdrop-blur-xs border border-border px-2 py-0.5 rounded text-[10px] font-mono text-text-secondary">
          <span>RANGE:</span>
          <span className="text-text-primary font-bold">{loadRange.toFixed(1)} kN</span>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1 border-t border-border">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-0.5 bg-status-healthy" />
            <span>Upstroke: Pickup to Peak</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-0.5 bg-status-warning" />
            <span>Downstroke: Valve Release</span>
          </span>
        </div>
        <span className="text-text-muted">100 SAMPLES • 60 FPS CLOCK</span>
      </div>
    </div>
  );
};
