'use client';

import React from 'react';
import { Activity, Flame, Cpu, ShieldCheck } from 'lucide-react';

const RUNTIME_INTEGRATIONS = [
  { name: 'OpenTelemetry (OTel)', type: 'Standard Protocol', status: 'Native OTLP' },
  { name: 'Langfuse', type: 'Trace Ingestion', status: 'Auto-Hook' },
  { name: 'LiteLLM Proxy', type: 'Gateway Middleware', status: 'Plugin' },
  { name: 'Helicone / LangSmith', type: 'Trace Mirroring', status: 'Webhook' },
];

export function RuntimeObservability() {
  return (
    <section id="runtime" className="py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#58718a] flex items-center justify-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Production Runtime Layer
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-4xl text-[#242426] font-bold">
            Continuous Runtime Anomaly &amp; Drift Monitoring
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-[#58718a]">
            Pre-deployment gating stops bad PRs. The runtime layer monitors production traces for live context drift, recursive retry loops, and sudden cost spikes.
          </p>
        </div>

        {/* 3 Cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <div className="makro-card p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebeff5] text-[#242426]">
              <Flame className="h-5 w-5 text-[#e05243]" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#242426]">
              Cost-per-Task Anomaly Alerts
            </h3>
            <p className="text-xs text-[#58718a] leading-relaxed">
              Detects when background agent retries drive effective task costs above your defined threshold ($0.15), alerting via Slack or PagerDuty (on request) before monthly bills explode.
            </p>
          </div>

          <div className="makro-card p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebeff5] text-[#242426]">
              <Activity className="h-5 w-5 text-[#242426]" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#242426]">
              Production Loop Circuit Breaker
            </h3>
            <p className="text-xs text-[#58718a] leading-relaxed">
              Monitors active multi-agent orchestrations and automatically terminates recursive execution cycles when an agent repeats duplicate tool calls $\ge 3$ times.
            </p>
          </div>

          <div className="makro-card p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebeff5] text-[#242426]">
              <Cpu className="h-5 w-5 text-[#2e9e6b]" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#242426]">
              OTel &amp; Trace Native
            </h3>
            <p className="text-xs text-[#58718a] leading-relaxed">
              Zero vendor lock-in. Stream agent traces via standard OpenTelemetry (OTLP), Langfuse, LiteLLM, or custom webhooks via background streaming.
            </p>
          </div>
        </div>

        {/* Integration Grid */}
        <div className="makro-card mt-6 p-6">
          <div className="flex items-center justify-between border-b border-[rgba(36,36,38,0.08)] pb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#242426]">
              Supported Trace &amp; Gateway Adapters
            </span>
            <span className="font-mono text-xs text-[#16a34a] font-semibold">
              Zero-Egress &bull; Local Evaluator Ready
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {RUNTIME_INTEGRATIONS.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-[rgba(36,36,38,0.08)] bg-[#f8fafc] p-3 text-xs font-mono"
              >
                <div className="font-bold text-[#242426]">{item.name}</div>
                <div className="text-[#475467] text-xs mt-0.5">{item.type}</div>
                <div className="mt-2 flex items-center justify-end border-t border-[rgba(36,36,38,0.08)] pt-1.5 text-xs">
                  <span className="font-semibold text-[#242426]">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
