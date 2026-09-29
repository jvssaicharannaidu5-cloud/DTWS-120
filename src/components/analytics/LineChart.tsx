import React from 'react';
import { fmt } from '../../data/wells';

export interface ChartSeries {
  name: string;
  data: (number | null)[];
  fill?: boolean;
}

interface LineChartProps {
  series: ChartSeries[];
  labels: string[];
  colors: string[];
  height?: number;
  yUnit?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  series,
  labels,
  colors,
  height = 150,
  yUnit = ''
}) => {
  const w = 640;
  const h = height;
  const pad = { l: 40, r: 16, t: 12, b: 24 };

  const validNumbers = series
    .flatMap((s) => s.data)
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));

  const maxVal = validNumbers.length > 0 ? Math.max(...validNumbers) * 1.08 : 100;
  const minVal = validNumbers.length > 0 ? Math.min(0, Math.min(...validNumbers)) : 0;

  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;

  const getX = (i: number) => pad.l + (i / Math.max(1, labels.length - 1)) * iw;
  const getY = (v: number) => pad.t + ih - ((v - minVal) / (maxVal - minVal || 1)) * ih;

  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        {/* Horizontal Grid lines */}
        {gridSteps.map((g, i) => (
          <g key={i}>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={pad.t + ih * (1 - g)}
              y2={pad.t + ih * (1 - g)}
              stroke="#243040"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text
              x={pad.l - 6}
              y={pad.t + ih * (1 - g) + 3}
              textAnchor="end"
              fill="#6b7c90"
              fontSize="9"
              fontFamily="IBM Plex Mono"
            >
              {fmt(minVal + (maxVal - minVal) * g, 0)}
              {yUnit}
            </text>
          </g>
        ))}

        {/* Series paths */}
        {series.map((s, si) => {
          const color = colors[si % colors.length];
          const points: { x: number; y: number }[] = [];

          s.data.forEach((v, i) => {
            if (typeof v === 'number' && !isNaN(v)) {
              points.push({ x: getX(i), y: getY(v) });
            }
          });

          if (points.length === 0) return null;

          const pathD = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
            .join(' ');

          const areaD = `${pathD} L${points[points.length - 1].x.toFixed(1)},${getY(0).toFixed(
            1
          )} L${points[0].x.toFixed(1)},${getY(0).toFixed(1)} Z`;

          return (
            <g key={si}>
              {s.fill && <path d={areaD} fill={color} opacity="0.12" />}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="2"
                  fill={color}
                  opacity={i % 2 === 0 ? 0.9 : 0}
                />
              ))}
            </g>
          );
        })}

        {/* X Axis labels */}
        {labels.map((lb, i) =>
          i % Math.ceil(labels.length / 7) === 0 || i === labels.length - 1 ? (
            <text
              key={i}
              x={getX(i)}
              y={h - 6}
              textAnchor="middle"
              fill="#6b7c90"
              fontSize="9"
              fontFamily="IBM Plex Mono"
            >
              {lb}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
};
