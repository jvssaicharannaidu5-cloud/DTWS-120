import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#2ee6c7',
  w = 72,
  h = 22
}) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="block overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
};
