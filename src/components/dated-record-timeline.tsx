'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

const POINTS = [
  { label: 'First observed', value: 'Aug 5, 2026' },
  { label: 'Reviewed', value: 'Aug 5, 2026' },
  { label: 'Updated', value: 'Aug 6, 2026' },
  { label: 'Status', value: 'Clarified' },
] as const;

export function DatedRecordTimeline() {
  const reduce = useReducedMotion();

  return (
    <div className="border border-border bg-card p-6 sm:p-8">
      <div className="relative">
        <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-border sm:block" aria-hidden />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {POINTS.map((point, i) => (
            <motion.div
              key={point.label}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, delay: i * 0.12, ease: EASE }}
              className="relative"
            >
              <span className="relative z-10 block h-3.5 w-3.5 rounded-full border-2 border-primary bg-card" />
              <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">{point.label}</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{point.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Every review is dated and source-linked so you can see what changed and when. This is a change-tracked
        review record, not a certification or guarantee.
      </p>
    </div>
  );
}
