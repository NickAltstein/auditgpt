'use client';

import React from 'react';

export function InvoiceCaseStudyProof() {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-[#0B0D11] p-6 sm:p-7 text-zinc-100 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-0.5 font-mono text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            VERIFIED CASE STUDY • PR #17
          </span>
          <h3 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-white font-display">
            Governing Autonomous Financial Workflows Outside the Model Runtime
          </h3>
        </div>
        <a
          href="https://github.com/NickAltstein/receiptd/pull/17"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 font-mono text-xs text-zinc-300 hover:border-zinc-500 hover:text-white transition flex items-center gap-1.5 shrink-0"
        >
          <span>python3 fixtures/run_invoice_case_study.py</span>
          <span>→</span>
        </a>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4 font-mono text-xs">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">1. SAFE READ &amp; BINDING</div>
          <div className="mt-1.5 font-bold text-emerald-400 text-sm">✓ ALLOWED (Exit 0)</div>
          <div className="mt-1 text-zinc-400 text-[11px]">INV-2026-8891 • 3 line items cited</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">2. INJECTED $14.8K WIRE</div>
          <div className="mt-1.5 font-bold text-rose-400 text-sm">✗ BLOCKED (Exit 2)</div>
          <div className="mt-1 text-zinc-400 text-[11px]">FIN-01 / FIN-02 • 0 invocations</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">3. OFFLINE LEDGER PROOF</div>
          <div className="mt-1.5 font-bold text-emerald-400 text-sm">✓ ED25519 AUTHENTIC</div>
          <div className="mt-1 text-zinc-400 text-[11px]">1-byte flip trips tamper alert</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
          <div className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">4. CI REGRESSION GATE</div>
          <div className="mt-1.5 font-bold text-amber-400 text-sm">✓ MERGE BLOCKED</div>
          <div className="mt-1 text-zinc-400 text-[11px]">314 passed • $0.0063 run spend</div>
        </div>
      </div>
    </section>
  );
}
