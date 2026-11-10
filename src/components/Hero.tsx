'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Terminal,
  CheckCircle2,
  GitPullRequest,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export function Hero() {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  // Subtle interactive mouse tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [4, -4]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-4, 4]), { stiffness: 120, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const copyQuickInstall = () => {
    navigator.clipboard.writeText('npx auditgpt test --endpoint http://localhost:8000/agent/v1');
    setCopied(true);
    toast.success('Copied: npx auditgpt test --endpoint http://localhost:8000/agent/v1');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative px-4 pt-12 pb-20 sm:px-6 lg:pt-16 lg:pb-28">
      <div className="mx-auto max-w-6xl">
        {/* Asymmetric 2-Column Grid */}
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Value Prop & CTAs */}
          <div className="space-y-6 lg:col-span-6 text-left">
            {/* Runtime Attribution Pill (Above H1) */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 font-mono text-xs text-slate-700 shadow-2xs"
            >
              <span className="font-semibold text-[#111827]">ASTI v1.1 Defense Gate</span>
              <span className="text-slate-300">|</span>
              <span>
                Runtime Evidence Powered by{' '}
                <a
                  href="https://github.com/NickAltstein/receiptd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-600 underline decoration-sky-600/30 underline-offset-2 hover:text-sky-700"
                >
                  Receiptd (Ed25519 + Merkle)
                </a>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111827] leading-[1.1]"
            >
              Adversarial pre-deployment gating for{' '}
              <span className="text-[#111827] underline decoration-[#c8f135] decoration-4 underline-offset-6">
                autonomous agents.
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-[#475467] leading-relaxed max-w-xl"
            >
              Catch recursive retry loops, destructive tool calls, prompt injections, and runaway token costs before merging to production.
            </motion.p>

            {/* Primary CTA Row */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <div
                onClick={copyQuickInstall}
                className="flex items-center rounded-lg border border-slate-300 bg-[#111827] px-4 py-2.5 font-mono text-xs text-slate-100 shadow-xs cursor-pointer hover:bg-slate-800 transition-colors"
                title="Click to copy command"
              >
                <span className="mr-2 text-sky-400">$</span>
                <span>npx auditgpt test</span>
                {copied ? <Check className="ml-2 h-3.5 w-3.5 text-[#16a34a]" /> : <Copy className="ml-2 h-3.5 w-3.5 text-slate-400" />}
              </div>

              <a
                href="https://sandbox.auditgpt.ai/?scenario=prod-drop-table&step=1"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-mono text-xs font-semibold text-[#111827] shadow-xs transition-colors hover:bg-slate-50"
              >
                Try Live Attack Simulator (WebCrypto) →
              </a>

              <a
                href="#battery"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#c8f135] px-4 py-2.5 text-xs font-bold text-[#111827] shadow-xs transition-all hover:bg-[#bce628]"
              >
                <span>50-Test Battery</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>

            {/* Micro Trust Points */}
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#667085] font-mono"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" /> Zero Data Egress
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" /> Local / CI Sandbox
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" /> MIT Licensed
              </span>
            </motion.div>
          </div>

          {/* Right Column: Floating Product UI Mockup with Subtle Parallax */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6 relative perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Background Soft Glows */}
            <div className="pointer-events-none absolute -top-12 -left-12 h-72 w-72 rounded-full bg-[#c8f135]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-72 w-72 rounded-full bg-[#b8deff]/30 blur-3xl" />

            {/* Tilt Container */}
            <motion.div
              style={reduce ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="relative space-y-4"
            >
              {/* Card 1: Terminal Output Card */}
              <div className="rounded-3xl border border-[#e2e8f0] bg-[#18181b] p-5 sm:p-6 text-white shadow-xl transition-shadow hover:shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-white/70">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                      <div className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                      <div className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                    </div>
                    <span className="ml-2 font-medium">Terminal — auditgpt test</span>
                  </div>
                  <span className="text-white/40">CI Mode: active</span>
                </div>

                <div className="mt-4 space-y-2 font-mono text-xs text-white/90">
                  <div className="text-white/50">$ npx auditgpt test --endpoint http://localhost:8000/agent</div>
                  <div className="text-[#c8f135] font-semibold">⚡ ASTI v1.1 Battery [50 Tests] Running...</div>
                  <div className="space-y-1 pt-1 text-[11px]">
                    <div className="flex justify-between text-white/80">
                      <span>• Loops &amp; Error Cascades</span>
                      <span className="text-[#10b981]">10/10 PASS</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>• Destructive Tool Protection</span>
                      <span className="text-[#10b981]">10/10 PASS</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>• Context &amp; State Degradation</span>
                      <span className="text-[#10b981]">10/10 PASS</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>• Adversarial Injection Rebuff</span>
                      <span className="text-[#10b981]">10/10 PASS</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>• Token &amp; Cost Ceilings</span>
                      <span className="text-[#10b981]">10/10 PASS</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                    <span className="text-[#10b981]">✓ CI GATE PASSED</span>
                    <span className="text-white/60">Score: 100/100 ($0.0084 total)</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Floating GitHub PR Comment Card */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[#111827]">
                    <GitPullRequest className="h-4 w-4 text-[#6366f1]" />
                    <span>github-actions[bot]</span>
                    <span className="font-normal text-[#64748b]">commented on PR #142</span>
                  </div>
                  <span className="rounded-full bg-[#f0fdf4] px-2 py-0.5 font-mono text-[10px] font-bold text-[#16a34a]">
                    Gate Passed
                  </span>
                </div>

                <div className="mt-2.5 text-xs text-[#334155] space-y-1 font-mono">
                  <div className="font-bold text-[#0f172a]">## 🛡️ AuditGPT Agent Defense Gate</div>
                  <div className="text-[11px] text-[#64748b]">
                    Status: 🟢 **PASSED** &bull; Composite Score: `96.0/100` &bull; Max task cost: `$0.0084`
                  </div>
                  <div className="pt-1 text-[11px] text-[#64748b]">
                    Zero recursive retry loops detected. All 50 adversarial vectors verified.
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
