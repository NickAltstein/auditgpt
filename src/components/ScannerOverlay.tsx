'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Activity, CheckCircle2 } from 'lucide-react';

const LOG_MESSAGES = [
  'Initializing ASTI v1.1 adversarial harness & sandbox isolation...',
  'Deploying 50 standardized domain stress test vectors (Run 1/3)...',
  'Injecting 20 multi-turn cognitive reasoning traps & boundary probes...',
  'Executing adversarial prompt injection & data exfiltration tests...',
  'Reverse-engineering token burn economics & wrapper latency delta...',
  'Calculating non-compensatory security circuit breakers...',
  'Generating immutable cryptographic forensic casefile...',
];

interface ScannerOverlayProps {
  isLoading: boolean;
  targetQuery: string;
}

export function ScannerOverlay({ isLoading, targetQuery }: ScannerOverlayProps) {
  const reduce = useReducedMotion();
  const [tokensBurned, setTokensBurned] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setTokensBurned(0);
      setActiveStep(0);
      return;
    }

    const startTime = Date.now();
    const duration = 2200;
    const targetTokens = 48920;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(Math.pow(progress, 0.8) * targetTokens);
      setTokensBurned(current);

      const stepIndex = Math.min(
        Math.floor((elapsed / duration) * LOG_MESSAGES.length),
        LOG_MESSAGES.length - 1
      );
      setActiveStep(stepIndex);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className="makro-card relative mt-8 w-full p-6 sm:p-8 font-mono shadow-md"
      >
        <div className="space-y-6">
          {/* Header HUD */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(36,36,38,0.08)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#242426] text-[#9EFFA9]">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#242426]">
                  Live Adversarial Execution
                </div>
                <div className="text-sm font-semibold text-[#58718a] truncate max-w-sm">
                  Subject: &ldquo;{targetQuery}&rdquo;
                </div>
              </div>
            </div>

            {/* Token Counter */}
            <div className="flex items-center gap-3 rounded-xl border border-[rgba(36,36,38,0.08)] bg-[#f8fafc] px-4 py-2 text-right">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#58718a]">
                  Trace Tokens Burned
                </div>
                <div className="text-lg font-bold text-[#242426]">
                  {tokensBurned.toLocaleString()} <span className="text-xs text-[#58718a]">/ 48,920</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sequential Terminal Logs */}
          <div className="space-y-2 rounded-xl bg-[#242426] p-4 text-xs font-mono text-[#ffffffbf]">
            {LOG_MESSAGES.map((msg, idx) => {
              const isCompleted = idx < activeStep;
              const isCurrent = idx === activeStep;

              if (idx > activeStep + 1) return null;

              return (
                <motion.div
                  key={idx}
                  initial={reduce ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-2.5 ${
                    isCurrent
                      ? 'text-[#9EFFA9] font-semibold'
                      : isCompleted
                      ? 'text-white'
                      : 'text-white/30'
                  }`}
                >
                  <span className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#9EFFA9]" />
                    ) : isCurrent ? (
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#9EFFA9] border-t-transparent" />
                    ) : (
                      <span className="inline-block h-3.5 w-3.5 rounded-full border border-white/20" />
                    )}
                  </span>
                  <span>{msg}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebeff5]">
            <motion.div
              className="h-full bg-[#242426]"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
