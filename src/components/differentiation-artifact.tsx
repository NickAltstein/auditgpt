'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const SCRUTEXITY_STEPS = ['Claim', 'Evidence', 'Gap', 'Pattern', 'Safer language', 'Dated record'];

export function DifferentiationArtifact() {
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="border border-border bg-secondary/30 p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Most tools
        </div>
        <div className="mt-6 flex items-center gap-3 text-sm">
          <span className="border border-border bg-card px-3 py-1.5 font-medium text-foreground/70">Claim</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="border border-border bg-card px-3 py-1.5 font-medium text-foreground/70">Risk score</span>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          A number, with no visible reasoning behind it.
        </p>
      </div>

      <div className="border border-primary/25 bg-primary/[0.03] p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Scrutexity
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
          {SCRUTEXITY_STEPS.map((step, i) => (
            <motion.span
              key={step}
              initial={reduce ? false : { opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: EASE }}
              className="flex items-center gap-2"
            >
              <span className="border border-primary/30 bg-card px-3 py-1.5 font-medium text-foreground">
                {step}
              </span>
              {i < SCRUTEXITY_STEPS.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary/50" />
              )}
            </motion.span>
          ))}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-foreground/75">
          The claim, the evidence, what&apos;s missing, and what to do next.
        </p>
      </div>
    </div>
  );
}
