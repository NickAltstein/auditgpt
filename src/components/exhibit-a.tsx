'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

interface ExhibitAProps {
  claim: string;
  whatWeFound: string;
  evidence: { label: string; value: string }[];
  clearerVersion: string;
  reviewedDate: string;
  finding: string;
  status: string;
}

const DEFAULT_EXHIBIT: ExhibitAProps = {
  claim: '"FDA-approved laser treatments for permanent hair removal."',
  whatWeFound:
    'The public page does not clearly identify the device or supporting documentation for the wording used.',
  evidence: [
    { label: 'Support visible', value: 'Partial' },
    { label: 'Source linked', value: 'No' },
    { label: 'Device identified', value: 'No' },
    { label: 'Review status', value: 'Needs clarification' },
  ],
  clearerVersion:
    '"Laser hair reduction using an FDA-cleared device. Results vary and maintenance sessions are typically required."',
  reviewedDate: 'Aug 5, 2026',
  finding: 'Evidence gap',
  status: 'Needs clarification',
};

function Row({ eyebrow, children, delay }: { eyebrow: string; children: React.ReactNode; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="border-t border-border py-5 first:border-t-0 first:pt-0"
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</div>
      <div className="mt-2">{children}</div>
    </motion.div>
  );
}

export function ExhibitA(props: Partial<ExhibitAProps> = {}) {
  const data = { ...DEFAULT_EXHIBIT, ...props };

  return (
    <div className="w-full border border-border bg-card p-6 sm:p-8">
      <Row eyebrow="Your claim" delay={0}>
        <p className="font-serif text-xl italic leading-snug text-foreground sm:text-2xl">{data.claim}</p>
      </Row>

      <Row eyebrow="What we found" delay={0.08}>
        <p className="text-sm leading-relaxed text-foreground/80">{data.whatWeFound}</p>
      </Row>

      <Row eyebrow="Evidence gap" delay={0.16}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.evidence.map((item) => (
            <div key={item.label} className="border border-border bg-secondary/40 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</div>
              <div className="mt-1 text-xs font-semibold text-foreground">{item.value}</div>
            </div>
          ))}
        </div>
      </Row>

      <Row eyebrow="A clearer version" delay={0.24}>
        <div className="border border-primary/25 bg-primary/[0.04] p-4">
          <p className="font-serif text-base italic leading-relaxed text-primary sm:text-lg">{data.clearerVersion}</p>
        </div>
      </Row>

      <Row eyebrow="Review record" delay={0.32}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-foreground/70">
          <span><span className="text-muted-foreground">Reviewed </span>{data.reviewedDate}</span>
          <span><span className="text-muted-foreground">Finding </span>{data.finding}</span>
          <span><span className="text-muted-foreground">Status </span>{data.status}</span>
        </div>
      </Row>
    </div>
  );
}
