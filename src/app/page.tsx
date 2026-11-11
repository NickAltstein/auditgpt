'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { AdversarialBattery } from '@/components/AdversarialBattery';
import { CliGateSection } from '@/components/CliGateSection';
import { RuntimeObservability } from '@/components/RuntimeObservability';
import { CompetitiveMatrix } from '@/components/CompetitiveMatrix';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Terminal,
  GitPullRequest,
  TrendingUp,
  DollarSign,
  Lock,
} from 'lucide-react';

const FOUNDER_BENEFITS = [
  {
    icon: DollarSign,
    title: 'Zero Runaway Inference Bills',
    description:
      'Prevent background agent retry loops and runaway token blowouts from turning a $50/mo staging bill into a $12,000 billing emergency.',
  },
  {
    icon: Lock,
    title: 'Immunity to Data & Prompt Leaks',
    description:
      'Ensure multi-turn prompt injections, role-play jailbreaks, and memory scanning cannot exfiltrate internal system prompts or API keys.',
  },
  {
    icon: TrendingUp,
    title: 'Automated Merge Gate Compliance',
    description:
      'Empower engineering teams to ship agent features rapidly without worrying that a prompt tweak broke multi-turn constraints in production.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How is AuditGPT different from prompt evals (Promptfoo, DeepEval)?',
    answer:
      'Prompt eval tools test single/few-turn output quality. AuditGPT tests multi-step autonomous agent state machines under chaotic failure conditions — simulating mock 500 API cascades, schema mutations, prompt injections, and token-cost cliffs.',
  },
  {
    question: 'How do I run AuditGPT locally in my development workflow?',
    answer:
      'Run `npx auditgpt test --endpoint http://localhost:8000/agent/v1` against any local or staging endpoint. The CLI executes the 50-test ASTI v1.1 battery in parallel and outputs immediate pass/fail exit codes with failure traces.',
  },
  {
    question: 'How does the GitHub Action PR gate block broken agent builds?',
    answer:
      'Whenever a pull request touches agents, prompts, or tools, the action boots your staging container, runs the adversarial suite, and exits with code 1 if an agent enters recursive loops or leaks credentials, blocking the merge.',
  },
  {
    question: 'Does AuditGPT send our proprietary prompts or data to third parties?',
    answer:
      'Strictly zero data egress. The open-source CLI runs completely on your local machine or CI runner. Enterprise VPC deployments run on isolated dedicated nodes inside your AWS/GCP perimeter.',
  },
  {
    question: 'What trace platforms does the runtime observability layer support?',
    answer:
      'AuditGPT hooks natively into standard OpenTelemetry (OTLP) collectors, Langfuse, LiteLLM Proxy, Helicone, and LangSmith without adding runtime latency.',
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] bg-dot-matrix text-[#111827] font-sans antialiased">
      <link rel="canonical" href="https://auditgpt.ai" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Floating Pill Navbar */}
      <Navbar onScrollToTerminal={scrollToTop} />

      <main>
        {/* Hero Section: Asymmetric Split Layout */}
        <section id="cli">
          <Hero />
        </section>

        {/* 1. 50-Test Battery */}
        <AdversarialBattery />

        {/* 2. For Founders & Platform Leaders */}
        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Executive ROI &amp; Reliability
              </div>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#111827] font-bold">
                Built for Founders &amp; AI Platform Leaders
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-[#475467]">
                Autonomous agents operate without human intervention. AuditGPT ensures reliability, data protection, and unit economics before features merge.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {FOUNDER_BENEFITS.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="makro-card p-6 sm:p-8 space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#111827] text-[#9EFFA9]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#111827]">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-[#475467] leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. CLI & CI/CD Gate */}
        <section id="ci-gate">
          <CliGateSection />
        </section>

        {/* 4. Runtime Observability */}
        <RuntimeObservability />

        {/* 5. Competitive Matrix */}
        <section id="comparison">
          <CompetitiveMatrix />
        </section>

        {/* 6. Pricing Grid */}
        <section id="pricing" className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Commercial Packaging
              </div>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#111827] font-bold">
                Predictable Chaos Testing for Engineering Teams
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-[#475467]">
                Open-source CLI for individual builders. Automated PR merge gates and runtime anomaly alerting for engineering organizations.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Free CLI */}
              <div className="makro-card p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs font-semibold uppercase text-[#667085]">
                    Free CLI
                  </div>
                  <div className="mt-3 font-mono text-3xl font-bold text-[#111827]">
                    $0 <span className="text-xs text-[#667085] font-normal">/ forever</span>
                  </div>
                  <p className="mt-2 text-xs text-[#475467]">
                    Full 50-test ASTI battery for local development and debugging. Zero account required.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-xs text-[#111827]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>All 50 adversarial test vectors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Local execution (`npx auditgpt test`)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Markdown &amp; SARIF trace exports</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Community Discord &amp; GitHub support</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={scrollToTop}
                  aria-label="Scroll to top to run local CLI test"
                  className="mt-6 w-full min-h-[40px] rounded-full border border-[#e2e8f0] bg-[#f8fafc] py-2.5 font-mono text-xs font-semibold text-[#111827] transition-colors hover:bg-white cursor-pointer"
                >
                  Run Local CLI Test
                </button>
              </div>

              {/* Team */}
              <div className="rounded-3xl border border-[#111827] bg-[#111827] p-6 sm:p-7 text-white relative flex flex-col justify-between shadow-xl">
                <div className="absolute top-4 right-5 font-mono text-xs uppercase font-bold text-[#111827] bg-[#9EFFA9] px-3 py-1 rounded-full">
                  Recommended
                </div>
                <div>
                  <div className="font-mono text-xs font-semibold uppercase text-[#9EFFA9]">
                    Team
                  </div>
                  <div className="mt-3 font-mono text-3xl font-bold text-white">
                    $499 <span className="text-xs text-white/60 font-normal">/ mo</span>
                  </div>
                  <p className="mt-2 text-xs text-white/80">
                    Automated GitHub Action PR merge blocking and basic runtime observability.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-xs text-white/90">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#9EFFA9]" />
                      <span>GitHub Action PR merge gate</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#9EFFA9]" />
                      <span>5 engineering seats included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#9EFFA9]" />
                      <span>2,500 CI/CD stress-test runs / mo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#9EFFA9]" />
                      <span>Runtime anomaly alerts (100k calls/mo)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#9EFFA9]" />
                      <span>OTel &amp; Langfuse trace connectors</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="mailto:sales@auditgpt.ai?subject=Team%20Plan%20Inquiry"
                  className="mt-6 block text-center rounded-full bg-[#9EFFA9] py-2.5 font-mono text-xs font-bold text-[#111827] shadow-sm transition-all hover:bg-[#86ef92]"
                >
                  Deploy Team Gate
                </a>
              </div>

              {/* Growth */}
              <div className="makro-card p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs font-semibold uppercase text-[#667085]">
                    Growth
                  </div>
                  <div className="mt-3 font-mono text-3xl font-bold text-[#111827]">
                    $2,499 <span className="text-xs text-[#667085] font-normal">/ mo</span>
                  </div>
                  <p className="mt-2 text-xs text-[#475467]">
                    Custom domain scenarios, multi-team RBAC, and high-volume runtime protection.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-xs text-[#111827]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Everything in Team</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Custom domain adversarial scenarios</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Multi-agent state &amp; trace replay</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>15 engineering seats &amp; 15k runs/mo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Priority Slack support (4h SLA, on request)</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="mailto:sales@auditgpt.ai?subject=Growth%20Plan%20Inquiry"
                  className="mt-6 block text-center rounded-full border border-[#e2e8f0] bg-[#f8fafc] py-2.5 font-mono text-xs font-semibold text-[#111827] transition-colors hover:bg-white"
                >
                  Upgrade to Growth
                </a>
              </div>

              {/* Enterprise */}
              <div className="makro-card p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs font-semibold uppercase text-[#667085]">
                    Enterprise
                  </div>
                  <div className="mt-3 font-mono text-3xl font-bold text-[#111827]">
                    Custom <span className="text-xs text-[#667085] font-normal">/ annual</span>
                  </div>
                  <p className="mt-2 text-xs text-[#475467]">
                    Dedicated VPC runners, Okta SSO/SAML, custom SLAs, and SOC2 compliance packages.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-xs text-[#111827]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Everything in Growth</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Dedicated AWS/GCP VPC deployment (on request)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Okta / Entra ID / Google SSO / SAML (on request)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>Unlimited CI/CD stress-test runs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      <span>1h Dedicated Slack SLA + Named TSE (on request)</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="mailto:sales@auditgpt.ai?subject=Enterprise%20VPC%20Inquiry"
                  className="mt-6 block text-center rounded-full border border-[#e2e8f0] bg-[#f8fafc] py-2.5 font-mono text-xs font-semibold text-[#111827] transition-colors hover:bg-white"
                >
                  Contact Enterprise Sales
                </a>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#111827] hover:underline"
              >
                <span>Compare all features across Free, Team, Growth &amp; Enterprise</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
        <section id="faq" className="py-20 px-4 sm:px-6 border-t border-[#e2e8f0]">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Developer FAQ
              </div>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#111827] font-bold">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="mt-8 space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="makro-card overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      className="w-full min-h-[48px] p-4 sm:p-5 flex items-center justify-between gap-3 text-left font-display text-sm sm:text-base font-semibold text-[#111827] cursor-pointer"
                    >
                      <span>{item.question}</span>
                      <ChevronRight
                        className={`h-4 w-4 text-[#667085] transition-transform ${
                          isOpen ? 'rotate-90 text-[#111827]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div
                        id={`faq-answer-${idx}`}
                        className="border-t border-[#f1f5f9] bg-[#f8fafc] p-4 sm:p-5 text-[13px] sm:text-sm text-[#475467] leading-relaxed"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. Final CTA */}
        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-[#111827] bg-[#111827] p-8 sm:p-12 text-center text-white shadow-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-[#9EFFA9] mb-3">
                <ShieldCheck className="h-3.5 w-3.5" /> Stop Shipping Broken Agent PRs
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                Stress-test before production.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-white/80">
                Run the open-source CLI locally or add the GitHub Action gate to block runaway loops and prompt injections before merge.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={scrollToTop}
                  aria-label="Scroll to top to run auditgpt test"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#9EFFA9] px-6 py-2.5 font-mono text-xs font-bold text-[#111827] shadow-sm transition-all hover:bg-[#86ef92] cursor-pointer"
                >
                  <Terminal className="h-4 w-4" />
                  <span>Run npx auditgpt test</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <a
                  href="#ci-gate"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 font-mono text-xs font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <GitPullRequest className="h-3.5 w-3.5 text-[#9EFFA9]" />
                  <span>View GitHub Action Config</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#111827] shadow-sm">
                <img
                  src="/logo-shield.png"
                  alt="AuditGPT Shield"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <div className="font-display text-xl font-extrabold tracking-tight text-[#111827]">
                  AuditGPT<span className="text-[#667085] font-normal">.ai</span>
                </div>
                <p className="text-xs text-[#667085] mt-0.5">
                  Adversarial pre-deployment stress-testing and runtime defense for autonomous AI agents.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-[#475467]">
              <a href="https://sandbox.auditgpt.ai" target="_blank" rel="noopener noreferrer" className="font-bold text-[#111827] hover:underline">
                Live Sandbox &rarr;
              </a>
              <a href="#cli" className="hover:text-[#111827]">CLI</a>
              <a href="#battery" className="hover:text-[#111827]">50-Test Battery</a>
              <a href="#ci-gate" className="hover:text-[#111827]">CI/CD Gate</a>
              <a href="#runtime" className="hover:text-[#111827]">Observability</a>
              <a href="#pricing" className="hover:text-[#111827]">Pricing</a>
              <a href="/legal" className="hover:text-[#111827]">Terms</a>
              <a href="mailto:contact@auditgpt.ai" className="hover:text-[#111827]">Contact</a>
            </div>
          </div>

          <div className="border-t border-[#f1f5f9] pt-4 text-xs text-[#475467] leading-relaxed font-mono">
            <p>
              <strong className="text-[#111827]">Zero Data Egress &amp; Sandbox Isolation:</strong> AuditGPT executes adversarial evaluation suites locally or inside your private VPC runner. Powered by <a href="https://github.com/NickAltstein/receiptd" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#111827] underline">Receiptd</a> runtime enforcement and Ed25519 execution receipts. We never train on, store, or exfiltrate private prompts, schemas, or tool payloads.
            </p>
            <p className="pt-2 text-[#667085]">
              &copy; {new Date().getFullYear()} AuditGPT.ai &mdash; Snyk for Autonomous AI Agents. MIT Licensed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
