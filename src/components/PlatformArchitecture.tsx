'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Lock, Activity, FileCheck2, ArrowRight } from 'lucide-react';

const ARCHITECTURE_PILLARS = [
  {
    step: '01',
    phase: 'TEST',
    tag: 'Pre-Deployment Gate',
    name: 'ASTI Adversarial Battery',
    icon: ShieldCheck,
    accent: '#3b82f6',
    accentBg: 'bg-blue-500/10',
    borderColor: 'border-blue-200',
    description:
      'Multi-step autonomous agent stress testing across 15 multi-turn adversarial harnesses across 5 failure classes plus 35 single-turn probes, mapped to OWASP AISVS 1.0 requirements. Runs locally via CLI or in CI/CD PR merge gates.',
    deliverable: 'Automated Pass/Fail PR Gate · SARIF & ANSI Reports · Zero-Egress Runner',
  },
  {
    step: '02',
    phase: 'ENFORCE',
    tag: 'Execution Boundary',
    name: 'Receiptd Deterministic Hook',
    icon: Lock,
    accent: '#10b981',
    accentBg: 'bg-emerald-500/10',
    borderColor: 'border-emerald-200',
    description:
      'Outside-the-model runtime gate intercepting Bash, SQL mutations, and MCP tool frames. Evaluates policies deterministically in <0.1ms with zero prompt-injection susceptibility.',
    deliverable: 'PreToolUse Interception · Fail-Closed Exit Code 2 · Local Stop Gate',
  },
  {
    step: '03',
    phase: 'MONITOR',
    tag: 'Operational Defense',
    name: 'Runtime Telemetry & Circuit Breakers',
    icon: Activity,
    accent: '#f59e0b',
    accentBg: 'bg-amber-500/10',
    borderColor: 'border-amber-200',
    description:
      'Real-time execution tracing via OpenTelemetry (OTLP), Langfuse, and LiteLLM Proxy. Catches recursive 500 retry loops, memory drift, and token budget blowouts on active agents.',
    deliverable: 'Circuit Breaker Auto-Trip · Cost Ceiling Alerts · Zero Latency Overhead',
  },
  {
    step: '04',
    phase: 'PROVE',
    tag: 'Verifiable Evidence',
    name: 'Cryptographic Audit Ledgers',
    icon: FileCheck2,
    accent: '#8b5cf6',
    accentBg: 'bg-purple-500/10',
    borderColor: 'border-purple-200',
    description:
      'Every tool invocation signs an Ed25519 execution receipt linked into a SHA-256 Merkle chain. Proves exact execution sequences offline without trusting database logs.',
    deliverable: 'Offline `receiptd verify` · 1-Byte Tamper Detection · Non-Repudiable Audit',
  },
];

export function PlatformArchitecture() {
  const reduce = useReducedMotion();

  return (
    <section id="architecture" className="py-20 px-4 sm:px-6 border-t border-slate-200/80 bg-white/60">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 font-mono text-xs text-slate-700 shadow-2xs">
            <span className="font-semibold text-[#111827]">AUDITGPT SECURITY PLATFORM</span>
            <span className="text-slate-300">|</span>
            <span>END-TO-END AGENT ASSURANCE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-[#111827] font-extrabold tracking-tight">
            Test the agent. Enforce its boundaries. Monitor its behavior. Prove what happened.
          </h2>
          <p className="text-sm sm:text-base text-[#475467] leading-relaxed">
            AuditGPT moves beyond single-turn prompt evals to provide a complete security and evidence platform for autonomous AI systems.
          </p>
        </div>

        {/* 4-Pillar Pipeline Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ARCHITECTURE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.step}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Phase {pillar.step}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#667085] font-semibold">
                      {pillar.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${pillar.accentBg}`}>
                      <Icon className="h-5 w-5" style={{ color: pillar.accent }} />
                    </div>
                    <div>
                      <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {pillar.phase}
                      </div>
                      <h3 className="font-display text-sm font-bold text-[#111827] leading-snug">
                        {pillar.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-[#475467] leading-relaxed pt-1">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                    Verified Deliverable
                  </div>
                  <div className="font-mono text-[11px] text-[#111827] font-medium">
                    {pillar.deliverable}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Simulator Banner */}
        <div className="mt-10 rounded-2xl border border-slate-300 bg-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#9EFFA9] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#9EFFA9] animate-pulse" />
              INTERACTIVE VERIFICATION LAB
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display">
              See an attack simulated, a mutation blocked, and the receipt verified.
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Experience the blast-radius simulator in your browser. Flip 1 byte in the ledger to watch the Ed25519 signature fail closed.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <a
              href="https://sandbox.auditgpt.ai/?scenario=prod-drop-table&step=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#9EFFA9] px-5 text-xs font-bold text-[#111827] transition-colors hover:bg-[#86ef92]"
            >
              <span>Open Blast-Radius Simulator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

