'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useReducedMotion } from 'framer-motion';

interface ForensicScoreRingProps {
  score: number;
  verdict: 'VERIFIED' | 'CAUTION' | 'CRITICAL' | 'RED FLAG';
  size?: number;
  strokeWidth?: number;
}

export function ForensicScoreRing({
  score,
  verdict,
  size = 140,
  strokeWidth = 8,
}: ForensicScoreRingProps) {
  const reduce = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const springScore = useSpring(0, { stiffness: 90, damping: 18 });
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    springScore.set(score);
    const unsubscribe = springScore.on('change', (latest) => {
      setDisplayScore(Math.round(latest));
    });
    return () => unsubscribe();
  }, [score, springScore]);

  const getVerdictColors = () => {
    if (score >= 80) {
      return { stroke: '#16a34a', text: 'text-[#16a34a]' };
    }
    if (score >= 60) {
      return { stroke: '#d97706', text: 'text-[#d97706]' };
    }
    return { stroke: '#dc2626', text: 'text-[#dc2626]' };
  };

  const colors = getVerdictColors();
  const progressOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg] overflow-visible">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ebeff5"
          strokeWidth={strokeWidth}
        />

        {/* Dynamic Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={reduce ? { strokeDashoffset: progressOffset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-mono text-3xl font-extrabold tracking-tight ${colors.text}`}>
          {reduce ? score : displayScore}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#58718a]">
          / 100
        </span>
      </div>
    </div>
  );
}
