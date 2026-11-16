'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X, ShieldAlert, Zap, Layers, Flame, ArrowRight } from 'lucide-react';

const COMPETITIVE_COMPARISON = [
  {
    dimension: 'Primary Focus',
    testmu: 'Manual policy forms & slow UI checks',
    promptfoo: 'Static prompt diffs & red-teaming',
    deepeval: 'Unit tests for RAG semantic accuracy',
    langsmith: 'Passive production tracing & logs',
    auditgpt: 'Adversarial chaos & economic gating for agents',
  },
  {
    dimension: 'Developer Friction',
    testmu: 'Heavy dashboard setup & sales demos',
    promptfoo: 'Local CLI config',
    deepeval: 'Python pytest setup',
    langsmith: 'SDK tracing integration',
    auditgpt: 'Zero-config local CLI (npx auditgpt test)',
  },
  {
    dimension: 'Failure Detection',
    testmu: 'Abstract policy violations',
    promptfoo: 'Semantic similarity & basic injection',
    deepeval: 'Assertion errors on expected outputs',
    langsmith: 'Post-hoc latency & cost charts',
    auditgpt: 'Infinite retry loops, tool cascades, token cliffs',
  },
  {
    dimension: 'CI/CD Action',
    testmu: 'Non-blocking dashboard reports',
    promptfoo: 'Matrix diff comparisons',
    deepeval: 'Pytest exit codes',
    langsmith: 'None (dashboard-only telemetry)',
    auditgpt: 'Hard PR merge gates, SARIF exports, exit codes',
  },
  {
    dimension: 'Economic Defense',
    testmu: 'None',
    promptfoo: 'None',
    deepeval: 'None',
    langsmith: 'Retrospective billing charts',
    auditgpt: 'Hard cost-per-task ceilings & loop circuit breakers',
  },
];

const SILVER_BULLETS = [
  {
    target: 'vs. TestMu Agent Assurance',
    badge: 'Direct Challenger Teardown',
    color: '#e05243',
    flaw: 'Extension of traditional QA testing with high manual overhead, slow test cycles, and no bottom-up developer velocity.',
    silverBullet:
      '“Can your engineers run TestMu locally in their terminal right now on their current Git branch in 30 seconds, or does it require syncing test data to a third-party dashboard?”',
  },
  {
    target: 'vs. LangSmith / Langfuse / Helicone',
    badge: 'Observability Giants',
    color: '#242426',
    flaw: 'Passive telemetry records disasters after they occur in production, after the customer sees broken outputs, and after the token bill explodes.',
    silverBullet:
      '“When an engineer pushes a PR that introduces a recursive retry loop, does LangSmith block that branch from merging to production, or does it simply graph the $4,000 cost spike tomorrow morning?”',
  },
  {
    target: 'vs. Promptfoo & DeepEval',
    badge: 'Prompt Eval Tools',
    color: '#2e9e6b',
    flaw: 'Built for single-turn prompt diffing and RAG semantic benchmarks. Zero specialized harnesses for multi-turn agent state machines or tool dependency loops.',
    silverBullet:
      '“Promptfoo tells you if a prompt is aligned, but what tool in your stack verifies that your multi-step agent halts after 3 failed tool retries instead of burning through your API budget?”',
  },
];

export function CompetitiveMatrix() {
  const reduce = useReducedMotion();

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#58718a]">
            Architectural Positioning
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-4xl text-[#242426] font-bold">
            Why Generic Eval &amp; Tracing Tools Fall Short
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-[#58718a]">
            Traditional prompt diffing and passive trace logging were built for single-turn chatbots. Autonomous multi-step agents require adversarial chaos gating.
          </p>
        </div>

        {/* Competitive Comparison Table */}
        <div className="makro-card mt-10 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[rgba(36,36,38,0.08)] bg-[#f8fafc]">
                <th className="p-4 sm:p-5 text-[#58718a] uppercase tracking-wider">Dimension</th>
                <th className="p-4 sm:p-5 text-[#58718a]">TestMu Assurance</th>
                <th className="p-4 sm:p-5 text-[#58718a]">Promptfoo / DeepEval</th>
                <th className="p-4 sm:p-5 text-[#58718a]">LangSmith / Langfuse</th>
                <th className="p-4 sm:p-5 font-bold text-[#242426] bg-[#9EFFA9]/20 border-l border-r border-[#9EFFA9]/40">
                  AuditGPT.ai
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(36,36,38,0.08)]">
              {COMPETITIVE_COMPARISON.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f8fafc]/60 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-[#242426] bg-[#f8fafc]/40">{row.dimension}</td>
                  <td className="p-4 sm:p-5 text-[#58718a]">{row.testmu}</td>
                  <td className="p-4 sm:p-5 text-[#58718a]">{row.promptfoo}</td>
                  <td className="p-4 sm:p-5 text-[#58718a]">{row.langsmith}</td>
                  <td className="p-4 sm:p-5 font-bold text-[#242426] bg-[#9EFFA9]/10 border-l border-r border-[#9EFFA9]/40">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-[#16a34a] shrink-0" />
                      <span>{row.auditgpt}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Silver-Bullet Closing Cards */}
        <div className="mt-12">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#58718a] mb-4 text-center">
            Executive Positioning &amp; Displacement Battlecards
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {SILVER_BULLETS.map((card, idx) => (
              <div
                key={idx}
                className="makro-card p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${card.color}15`, color: card.color }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-base font-bold text-[#242426]">
                    {card.target}
                  </h3>

                  <p className="mt-2 text-xs text-[#58718a] leading-relaxed">
                    <strong className="text-[#242426]">Architectural Flaw:</strong> {card.flaw}
                  </p>
                </div>

                <div className="rounded-xl border border-[rgba(36,36,38,0.08)] bg-[#f8fafc] p-3 text-xs italic text-[#242426] font-mono leading-relaxed">
                  <div className="text-xs uppercase font-bold not-italic text-[#475467] mb-1">
                    The Silver-Bullet Question:
                  </div>
                  {card.silverBullet}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
