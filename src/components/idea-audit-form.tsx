'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Loader2,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  TrendingDown,
  ShieldAlert,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Zap,
  Activity,
  Cpu,
  Coins,
  Lock,
  Radio,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import type { BusinessAuditResult, AuditTier } from '@/lib/types/business-audit';
import { toast } from 'sonner';

const EASE = [0.16, 1, 0.3, 1] as const;

const SAMPLE_IDEAS = [
  'AutoSEO Ranker Pro (Automated blog generator & ranker)',
  'Autonomous Medical Claim Review Agent with EHR sync',
  'AI Meeting Notes to Jira Ticket Auto-Assigner',
  'AI Cold Outreach Specialist with LinkedIn automation',
  'Autonomous Legal M&A Due Diligence Engine',
];

const SCAN_STAGES = [
  'Deploying 50 standardized tasks across 10 categories (ERI benchmark)...',
  'Injecting 20 multi-turn reasoning traps & measuring drift...',
  'Evaluating Cost per Verified Success against multi-step scaffold baselines...',
  'Computing Empirical Defensibility Index (EDI) vs zero-shot frontier models...',
  'Executing 20 adversarial prompt injection & exfiltration attacks...',
  'Evaluating Circuit Breakers (Security < 40 = Non-compensatory hard cap)...',
  'Compiling ASTI v1.1 Defensible Audit Record...',
];

const PILLAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  eri: Activity,
  cebr: Coins,
  edi: Cpu,
  sc: Lock,
  cvs: Radio,
};

export function IdeaAuditForm() {
  const reduce = useReducedMotion();
  const [input, setInput] = useState('');
  const [tier, setTier] = useState<AuditTier>('tier1_flash');
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BusinessAuditResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState<string | null>('eri');

  useEffect(() => {
    if (!loading) {
      setStageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % SCAN_STAGES.length);
    }, 600);
    return () => clearInterval(interval);
  }, [loading]);

  const runAudit = async (customText?: string) => {
    const textToAudit = (customText || input).trim();
    if (loading || textToAudit.length < 3) return;
    if (customText) setInput(customText);

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/idea-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: textToAudit, tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Stress-test failed.');
      setResult(data.audit);
      setExpandedPillar(data.audit.circuit_breaker?.tripped ? 'sc' : 'eri');
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message || 'Stress-test failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdownReport = () => {
    if (!result) return;
    const p = result.pillars;
    const md = `# AuditGPT ASTI v1.1 Stress-Test Teardown: ${result.input_summary}

**Composite Score:** ${result.composite_score} / 100 ${result.circuit_breaker.hardCapApplied ? `(Hard Capped from Raw: ${result.raw_composite_score})` : ''}
**Verdict Band:** ${result.verdict}
**Direct Action:** ${result.verdict_action}
**Summary:** ${result.verdict_summary}

${result.circuit_breaker.tripped ? `> ⚡ **CIRCUIT BREAKER HARD GATE:** ${result.circuit_breaker.reason}\n` : ''}

---

## 📊 ASTI v1.1 Five-Pillar Matrix
- **Execution Reliability Index (ERI, 30%):** ${p.eri.score}/100 (Contribution: +${p.eri.weighted_contribution})
- **Cost Efficiency & Burn Rate (CEBR, 25%):** ${p.cebr.score}/100 (Contribution: +${p.cebr.weighted_contribution})
- **Empirical Defensibility Index (EDI, 20%):** ${p.edi.score}/100 (Contribution: +${p.edi.weighted_contribution})
- **Safety & Compliance (SC, 15% - Hard Gate):** ${p.sc.score}/100 (Contribution: +${p.sc.weighted_contribution})
- **Commercial & Community Signals (CVS, 10%):** ${p.cvs.score}/100 (Contribution: +${p.cvs.weighted_contribution})

---

## 🚨 The Uncomfortable Question
> ${result.uncomfortable_question}

## ⚠️ Top Fatal Flaws
${result.fatal_flaws.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## 🔄 Pivot & Hardening Actions
${result.pivot_suggestions.map((pv, i) => `${i + 1}. ${pv}`).join('\n')}

---
Audited by AuditGPT.ai (ASTI v1.1 Non-Compensatory Protocol) — The Crash-Test Lab for AI Services.
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success('ASTI v1.1 Stress-Test Teardown copied to clipboard in Markdown format');
    setTimeout(() => setCopied(false), 2500);
  };

  const getVerdictStyle = (score: number, circuitBreaker: boolean) => {
    if (circuitBreaker) return 'bg-[#C25E49]/15 text-[#C25E49] border-[#C25E49]/40';
    if (score >= 90) return 'bg-[#0D4F55]/15 text-[#0D4F55] border-[#0D4F55]/30';
    if (score >= 75) return 'bg-[#5E7A5A]/15 text-[#5E7A5A] border-[#5E7A5A]/30';
    if (score >= 60) return 'bg-[#E8C36A]/20 text-[#9E6A1B] border-[#E8C36A]/40';
    if (score >= 40) return 'bg-[#D97757]/15 text-[#D97757] border-[#D97757]/30';
    return 'bg-[#C25E49]/15 text-[#C25E49] border-[#C25E49]/40';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#0D4F55]';
    if (score >= 75) return 'text-[#5E7A5A]';
    if (score >= 60) return 'text-[#9E6A1B]';
    if (score >= 40) return 'text-[#D97757]';
    return 'text-[#C25E49]';
  };

  const getProgressBg = (score: number) => {
    if (score >= 90) return 'bg-[#0D4F55]';
    if (score >= 75) return 'bg-[#5E7A5A]';
    if (score >= 60) return 'bg-[#E8C36A]';
    if (score >= 40) return 'bg-[#D97757]';
    return 'bg-[#C25E49]';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Test Tier Selector */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span>Execution Tier:</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card/60 p-1 text-xs">
          <button
            type="button"
            onClick={() => setTier('tier1_flash')}
            className={`rounded-md px-3 py-1 font-mono text-[11px] transition-all ${
              tier === 'tier1_flash'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tier 1: Flash (3m)
          </button>
          <button
            type="button"
            onClick={() => setTier('tier2_full')}
            className={`rounded-md px-3 py-1 font-mono text-[11px] transition-all ${
              tier === 'tier2_full'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tier 2: Full (50-Task)
          </button>
          <button
            type="button"
            onClick={() => setTier('tier3_monitoring')}
            className={`rounded-md px-3 py-1 font-mono text-[11px] transition-all ${
              tier === 'tier3_monitoring'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tier 3: Continuous
          </button>
        </div>
      </div>

      {/* Search / Input Container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runAudit();
        }}
        className="w-full"
      >
        <div className="relative flex flex-col gap-3 rounded-lg border border-border bg-card p-2 sm:flex-row shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste an AI agent URL, repository, tool name, or business concept to stress-test..."
            disabled={loading}
            className="w-full flex-1 bg-transparent px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || input.trim().length < 3}
            className="flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Stress-Testing...</span>
              </>
            ) : (
              <>
                <span>Stress-Test Agent</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Prompts */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-mono text-[11px] uppercase tracking-wider text-foreground/60 mr-1">
            Test a sample:
          </span>
          {SAMPLE_IDEAS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => runAudit(sample)}
              disabled={loading}
              className="rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] text-foreground/75 transition-colors hover:border-primary/50 hover:bg-card hover:text-foreground disabled:pointer-events-none"
            >
              {sample}
            </button>
          ))}
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-3 rounded-md border border-[#C25E49]/30 bg-[#C25E49]/10 p-4 text-sm text-[#C25E49]"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Scanning / Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="mt-10 overflow-hidden rounded-xl border border-border bg-card p-8 shadow-md"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20 opacity-75"></span>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary bg-primary/10 text-primary">
                  <Activity className="h-6 w-6 animate-pulse" />
                </div>
              </div>

              <div className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                ASTI v1.1 Non-Compensatory Stress-Test In Progress
              </div>

              <h3 className="mt-2 text-lg font-semibold text-foreground">
                Executing 5-Pillar Matrix with Security Circuit Breaker...
              </h3>

              <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 font-mono text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <span>{SCAN_STAGES[stageIndex]}</span>
              </div>

              <div className="mt-8 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full bg-primary"
                  animate={{
                    width: ['10%', '35%', '65%', '90%', '100%'],
                  }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                ERI (30%) &bull; CEBR (25%) &bull; EDI (20%) &bull; SC (15% Hard Gate) &bull; CVS (10%)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ASTI v1.1 Results Scorecard */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-12 space-y-8"
          >
            {/* Circuit Breaker Alert Banner (if tripped) */}
            {result.circuit_breaker.tripped && (
              <div className="rounded-xl border border-[#C25E49]/40 bg-[#C25E49]/10 p-5 shadow-xs">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#C25E49]">
                  <Zap className="h-4 w-4 text-[#C25E49]" />
                  CIRCUIT BREAKER TRIPPED &mdash; NON-COMPENSATORY HARD GATE APPLIED
                </div>
                <p className="mt-2 text-sm text-foreground/90 leading-relaxed font-medium">
                  {result.circuit_breaker.reason}
                </p>
                <div className="mt-3 flex items-center gap-4 font-mono text-xs text-[#C25E49]">
                  <span>Raw Weighted Score: <strong className="line-through">{result.raw_composite_score}</strong></span>
                  <span>&rarr;</span>
                  <span>Hard-Capped Final Score: <strong>{result.composite_score}</strong></span>
                </div>
              </div>
            )}

            {/* Verdict Header Card */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Subject Tested:
                  </span>
                  <span className="font-semibold text-foreground text-sm truncate max-w-md">
                    &ldquo;{result.input_summary}&rdquo;
                  </span>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  Standard: <strong className="text-foreground">ASTI v1.1 (Non-Compensatory)</strong>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-4 py-1.5 font-mono text-xs font-bold tracking-wider ${getVerdictStyle(
                          result.composite_score,
                          result.circuit_breaker.tripped
                        )}`}
                      >
                        VERDICT: {result.verdict}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        Composite: <strong className={`text-xl font-bold ${getScoreColor(result.composite_score)}`}>{result.composite_score}/100</strong>
                      </span>
                    </div>

                    <h2 className="mt-4 font-serif text-2xl sm:text-3xl text-foreground leading-snug">
                      {result.verdict_summary}
                    </h2>

                    <p className="mt-2 text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">Action Directive:</span> {result.verdict_action}
                    </p>
                  </div>

                  {/* Composite Score Dial */}
                  <div className="flex shrink-0 items-center justify-center self-start md:self-auto">
                    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background p-5 min-w-[140px] text-center shadow-xs">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        ASTI Composite
                      </span>
                      <span className={`mt-1 font-mono text-5xl font-extrabold tracking-tight ${getScoreColor(result.composite_score)}`}>
                        {result.composite_score}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">out of 100</span>
                    </div>
                  </div>
                </div>

                {/* The Uncomfortable Question Box */}
                <div className="mt-6 rounded-lg border border-[#C25E49]/30 bg-[#C25E49]/5 p-5">
                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#C25E49]">
                    <Flame className="h-4 w-4" />
                    The Uncomfortable Question
                  </div>
                  <blockquote className="mt-2 font-serif text-lg font-medium italic text-foreground/90 leading-relaxed border-l-2 border-[#C25E49] pl-3">
                    &ldquo;{result.uncomfortable_question}&rdquo;
                  </blockquote>
                </div>
              </div>
            </div>

            {/* ASTI 5-Pillar Score Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl text-foreground">
                  ASTI v1.1 Metric Matrix (5 Weighted Dimensions)
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  Click to inspect sub-metrics &amp; formulas
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(result.pillars).map(([key, pillar]) => {
                  const Icon = PILLAR_ICONS[key] || Activity;
                  const isExpanded = expandedPillar === key;

                  return (
                    <div
                      key={key}
                      className="overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-foreground/30"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPillar(isExpanded ? null : key)
                        }
                        className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">
                                {pillar.name}
                              </span>
                              <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                Weight: {Math.round(pillar.weight * 100)}%
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground truncate hidden sm:block">
                              {pillar.critique}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="flex items-baseline gap-1 justify-end">
                              <span className={`font-mono text-sm font-bold ${getScoreColor(pillar.score)}`}>
                                {pillar.score}
                              </span>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                (+{pillar.weighted_contribution.toFixed(1)} pts)
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full ${getProgressBg(pillar.score)}`}
                                style={{ width: `${pillar.score}%` }}
                              />
                            </div>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-border bg-muted/20 px-5 py-4 text-sm"
                          >
                            <p className="text-xs text-foreground/80 font-medium mb-3">
                              {pillar.critique}
                            </p>

                            <div className="grid gap-2 sm:grid-cols-2">
                              {Object.entries(pillar.sub_metrics).map(([subKey, sub]) => (
                                <div
                                  key={subKey}
                                  className="rounded-md border border-border bg-card p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-xs text-foreground">
                                      {sub.name}
                                    </span>
                                    <span className="font-mono text-xs font-bold text-foreground">
                                      {sub.raw_score} <span className="text-[10px] text-muted-foreground">({sub.weight})</span>
                                    </span>
                                  </div>
                                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                    {sub.explanation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fatal Flaws & Pivot Suggestions */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-[#C25E49]/30 bg-[#C25E49]/5 p-6 shadow-xs">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#C25E49]">
                  <AlertTriangle className="h-4 w-4" />
                  Top Fatal Flaws
                </div>
                <ul className="mt-4 space-y-3">
                  {result.fatal_flaws.map((flaw, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
                      <span className="font-mono text-xs font-bold text-[#C25E49] mt-0.5">
                        0{idx + 1}.
                      </span>
                      <span>{flaw}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-xs">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="h-4 w-4" />
                  Pivot &amp; Hardening Recommendations
                </div>
                <ul className="mt-4 space-y-3">
                  {result.pivot_suggestions.map((pivot, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
                      <span className="font-mono text-xs font-bold text-primary mt-0.5">
                        0{idx + 1}.
                      </span>
                      <span>{pivot}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <button
                type="button"
                onClick={copyMarkdownReport}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied Report!' : 'Export ASTI v1.1 Markdown Teardown'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Stress-Test Another Subject</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
