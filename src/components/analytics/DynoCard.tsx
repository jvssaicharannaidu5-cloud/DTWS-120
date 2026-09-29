import React, { useMemo } from 'react';
import { Well } from '../../types';
import { fmt } from '../../data/wells';

interface DynoCardProps {
  well: Well;
}

export const DynoCard: React.FC<DynoCardProps> = ({ well }) => {
  const strokeInches = well.stroke || 144;

  const pts = useMemo(() => {
    const a: [number, number][] = [];
    const fill = (well.fillage || 80) / 100;

    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const pos = t * strokeInches;
      let load: number;

      if (t < 0.5) {
        // Upstroke portion
        const u = t / 0.5;
        load =
          8.2 +
          14 * Math.min(1, u / 0.18) -
          (u > fill ? 9 * ((u - fill) / (1 - fill + 0.01)) : 0);
      } else {
        // Downstroke portion
        const u = (t - 0.5) / 0.5;
        load = 6.4 - 2.8 * u + Math.sin(u * 8) * 0.25;
      }

      if (well.status === 'critical') {
        load += Math.sin(t * 40) * 1.8;
      }

      a.push([pos, load]);
    }
    return a;
  }, [well, strokeInches]);

  const w = 480;
  const h = 168;
  const pad = { l: 44, r: 16, t: 14, b: 26 };
  const maxL = 26;
  const minL = 0;

  const getX = (p: number) => pad.l + (p / strokeInches) * (w - pad.l - pad.r);
  const getY = (l: number) => pad.t + (1 - (l - minL) / (maxL - minL)) * (h - pad.t - pad.b);

  const d =
    pts
      .map((p, i) => `${i ? 'L' : 'M'}${getX(p[0]).toFixed(1)},${getY(p[1]).toFixed(1)}`)
      .join(' ') + ' Z';

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        {/* Load Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
          <g key={i}>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={pad.t + (h - pad.t - pad.b) * (1 - g)}
              y2={pad.t + (h - pad.t - pad.b) * (1 - g)}
              stroke="#243040"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text
              x={pad.l - 6}
              y={pad.t + (h - pad.t - pad.b) * (1 - g) + 3}
              textAnchor="end"
              fill="#6b7c90"
              fontSize="9"
              fontFamily="IBM Plex Mono"
            >
              {fmt(minL + (maxL - minL) * g, 0)}
            </text>
          </g>
        ))}

        {/* Dynamometer Card Shape */}
        <path
          d={d}
          fill="rgba(46, 230, 199, 0.08)"
          stroke="#2ee6c7"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Fluid Pound Warning Marker if critical/low fillage */}
        {well.fillage < 60 && (
          <g transform={`translate(${getX(strokeInches * 0.62)}, ${getY(14)})`}>
            <circle cx="0" cy="0" r="4" fill="#f43f5e" className="animate-ping" opacity="0.75" />
            <circle cx="0" cy="0" r="3" fill="#f43f5e" />
            <text x="6" y="3" fill="#f43f5e" fontSize="8" fontFamily="IBM Plex Mono">
              FLUID POUND INFLECTION
            </text>
          </g>
        )}

        {/* Axis Labels */}
        <text
          x={w / 2}
          y={h - 6}
          textAnchor="middle"
          fill="#8b9bb0"
          fontSize="9"
          fontFamily="IBM Plex Mono"
        >
          POSITION (0 - {strokeInches} in) · SURFACE DYNAMOMETER
        </text>
        <text
          x={14}
          y={14}
          fill="#8b9bb0"
          fontSize="9"
          fontFamily="IBM Plex Mono"
          transform="rotate(-90 14 80)"
        >
          LOAD (klbf)
        </text>
      </svg>
    </div>
  );
};
