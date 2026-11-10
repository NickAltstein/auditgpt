'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Pillar } from '@/lib/audit-engine';

interface RadarChartProps {
  pillars: Pillar[];
  size?: number;
}

export function RadarChart({ pillars, size = 300 }: RadarChartProps) {
  const reduce = useReducedMotion();
  const radius = size / 2 - 38;
  const center = size / 2;
  const total = pillars.length;

  const getCoordinates = (value: number, index: number, maxRadius = radius) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const webLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = webLevels.map((lvl) => {
    const points = pillars
      .map((_, i) => {
        const { x, y } = getCoordinates(100, i, radius * lvl);
        return `${x},${y}`;
      })
      .join(' ');
    return points;
  });

  const scorePoints = pillars
    .map((p, i) => {
      const { x, y } = getCoordinates(p.score, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Background Web Grids */}
        {gridPolygons.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill={idx === webLevels.length - 1 ? 'rgba(112, 0, 255, 0.05)' : 'none'}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeDasharray={idx === webLevels.length - 1 ? 'none' : '2 3'}
          />
        ))}

        {/* Axis Spokes */}
        {pillars.map((_, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Glowing Radar Score Polygon */}
        <motion.polygon
          points={scorePoints}
          fill="rgba(0, 240, 255, 0.18)"
          stroke="#00F0FF"
          strokeWidth="2"
          strokeLinejoin="round"
          initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.5, originX: `${center}px`, originY: `${center}px` }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.45))' }}
        />

        {/* Score Nodes */}
        {pillars.map((p, i) => {
          const { x, y } = getCoordinates(p.score, i);
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#00F0FF"
              stroke="#050508"
              strokeWidth="2"
              initial={reduce ? { scale: 1 } : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
            />
          );
        })}

        {/* Axis Labels */}
        {pillars.map((p, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const labelRadius = radius + 22;
          const lx = center + labelRadius * Math.cos(angle);
          const ly = center + labelRadius * Math.sin(angle);

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#94A3B8] font-mono text-[9px] font-semibold uppercase tracking-wider"
            >
              {p.name.split(' ')[0]} ({p.score})
            </text>
          );
        })}
      </svg>
    </div>
  );
}
