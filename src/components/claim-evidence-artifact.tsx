'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

const CLAIMS = [
  {
    claim: '"Clinically proven to deliver 22% weight loss."',
    source: 'clinic.com/program',
    gap: 'Evidence not clearly visible on the public page.',
    safer: '"Part of a physician-guided program. Individual results vary."',
  },
  {
    claim: '"The #1 rated service in the region."',
    source: 'clinic.com/about',
    gap: 'No linked ranking source or methodology.',
    safer: '"Highly rated by our clients. See verified reviews."',
  },
  {
    claim: '"Guaranteed results in 7 days."',
    source: 'clinic.com/results',
    gap: 'No supporting study or disclaimer visible nearby.',
    safer: '"Many clients notice a difference within the first week."',
  },
] as const;

const STAGES = ['Claim', 'Source', 'Evidence gap', 'Safer language', 'Record'] as const;

export function ClaimEvidenceArtifact() {
  const reduce = useReducedMotion();
  const [claimIndex, setClaimIndex] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const durations = [1400, 1400, 1600, 1600, 2600];
    const t = setTimeout(() => {
      if (stage < STAGES.length - 1) {
        setStage((s) => s + 1);
      } else {
        setStage(0);
        setClaimIndex((i) => (i + 1) % CLAIMS.length);
      }
    }, durations[stage]);
    return () => clearTimeout(t);
  }, [stage, reduce]);

  const active = reduce ? STAGES.length - 1 : stage;
  const current = CLAIMS[claimIndex];

  return (
    <div className="w-full border border-border bg-card p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-7">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Reading a claim
        </span>
        <div className="flex items-center gap-1.5">
          {STAGES.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                i <= active ? 'bg-primary' : 'bg-border'
              }`}
              aria-hidden
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex min-h-[220px] flex-col justify-center gap-4">
        <div className="min-h-[56px]">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Claim</div>
          <AnimatePresence mode="wait">
            <motion.p
              key={claimIndex}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mt-1 font-serif text-lg italic leading-snug text-foreground"
            >
              {current.claim}
            </motion.p>
          </AnimatePresence>
        </div>

        {active >= 1 && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="min-h-[36px]"
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Source</div>
            <div className="mt-1 font-mono text-xs text-foreground/70">{current.source}</div>
          </motion.div>
        )}

        {active >= 2 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="min-h-[44px] border-l-2 border-primary/40 pl-3"
          >
            <div className="text-[10px] uppercase tracking-wider text-primary">Evidence gap</div>
            <p className="mt-1 text-sm text-foreground/75">{current.gap}</p>
          </motion.div>
        )}

        {active >= 3 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-[44px] border border-primary/25 bg-primary/[0.04] p-3"
          >
            <div className="text-[10px] uppercase tracking-wider text-primary">Safer language</div>
            <p className="mt-1 font-serif text-sm italic text-primary">{current.safer}</p>
          </motion.div>
        )}

        {active >= 4 && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground"
          >
            <span>Dated review record saved</span>
            <span className="font-mono">Aug 5, 2026</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
