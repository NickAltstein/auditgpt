'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Check, CheckCircle2, Shield, ShieldCheck, Terminal, ArrowRight, Zap, Building2, Sparkles, HelpCircle } from 'lucide-react';

const TIERS = [
  {
    name: 'Free CLI',
    badge: 'Developer Top-of-Funnel',
    price: '$0',
    frequency: 'forever',
    description: 'Adversarial stress-testing in your local terminal. Zero setup, zero account required.',
    ctaText: 'Install CLI Binary',
    ctaHref: '#install',
    isPopular: false,
    features: [
      'Full ASTI v1.1 adversarial test battery',
      'Unlimited local terminal runs',
      'Interactive ANSI test execution report',
      'Local Markdown & SARIF export',
      'OpenAI, Anthropic & REST protocols',
      'GitHub Issues & Discussions support',
    ],
  },
  {
    name: 'Team',
    badge: 'Self-Serve PR Gate',
    price: '$499',
    frequency: 'per month',
    description: 'Automated GitHub Action PR merge blocking and basic runtime observability.',
    ctaText: 'Deploy Team Gate',
    ctaHref: 'mailto:sales@auditgpt.ai?subject=Team%20Plan%20Inquiry',
    isPopular: true,
    features: [
      'Everything in Free CLI',
      'GitHub Action & GitLab CI PR merge gate',
      'Automated PR comment failure traces',
      'GitHub Security tab SARIF ingestion',
      '5 engineering seats included',
      '2,500 CI/CD stress-test runs / month',
      'Runtime anomaly alerts (100k calls/mo)',
      'OTel & Langfuse trace connectors',
      'Standard email & Slack support (24h, on request)',
    ],
  },
  {
    name: 'Growth',
    badge: 'Scale & Governance',
    price: '$2,499',
    frequency: 'per month',
    description: 'Custom domain scenarios, multi-team RBAC, and high-volume runtime protection.',
    ctaText: 'Upgrade to Growth',
    ctaHref: 'mailto:sales@auditgpt.ai?subject=Growth%20Plan%20Inquiry',
    isPopular: false,
    features: [
      'Everything in Team',
      'Custom adversarial test fixtures & scenarios',
      'Multi-agent state & trace replay debugger',
      '15 engineering seats included',
      '15,000 CI/CD stress-test runs / month',
      'Runtime anomaly alerts (1M calls/mo)',
      'Real-time Slack & PagerDuty incident paging (on request)',
      'LiteLLM Proxy & Helicone middleware',
      'Priority Slack channel support (4h SLA, on request)',
    ],
  },
  {
    name: 'Enterprise',
    badge: 'Security & Compliance',
    price: 'Custom',
    frequency: 'annual ACV',
    description: 'Dedicated VPC runners, Okta SSO/SAML, custom SLAs, and SOC2 compliance packages.',
    ctaText: 'Contact Enterprise Sales',
    ctaHref: 'mailto:sales@auditgpt.ai?subject=Enterprise%20VPC%20Inquiry',
    isPopular: false,
    features: [
      'Everything in Growth',
      'Dedicated AWS/GCP VPC deployment (on request)',
      'Strict zero-data-egress on-prem execution',
      'Okta / Entra ID / Google SSO / SAML / OIDC (on request)',
      'Organization-wide Policy-as-Code rules',
      'Multi-org & custom RBAC permissions',
      'Unlimited CI/CD stress-test runs',
      'Automated SOC2 / ISO 27001 audit exports',
      '1h Dedicated Slack SLA + Named TSE (on request)',
    ],
  },
];

const COMPARISON_MATRIX = [
  {
    category: 'Core Adversarial Testing',
    features: [
      { name: 'ASTI v1.1 Standard Adversarial Test Battery', free: true, team: true, growth: true, ent: true },
      { name: 'Infinite Loop & 500 Error Cascade Traps', free: true, team: true, growth: true, ent: true },
      { name: 'Destructive Tool & Permission Escalation', free: true, team: true, growth: true, ent: true },
      { name: 'Multi-Turn Context & State Degradation', free: true, team: true, growth: true, ent: true },
      { name: 'Prompt Injection & Credential Scan', free: true, team: true, growth: true, ent: true },
      { name: 'Custom Domain Adversarial Fixtures', free: false, team: false, growth: true, ent: true },
    ],
  },
  {
    category: 'CI/CD & Developer Gate',
    features: [
      { name: 'Local CLI Runner (`npx auditgpt test`)', free: true, team: true, growth: true, ent: true },
      { name: 'GitHub Action Automated PR Blocking', free: false, team: true, growth: true, ent: true },
      { name: 'Automated PR Markdown Diffs & Comments', free: false, team: true, growth: true, ent: true },
      { name: 'SARIF Export for GitHub Security Tab', free: 'Manual', team: 'Automated', growth: 'Automated', ent: 'Automated' },
      { name: 'GitLab CI / CircleCI / Custom Webhooks', free: false, team: false, growth: true, ent: true },
    ],
  },
  {
    category: 'Runtime Observability & Defense',
    features: [
      { name: 'Monthly Production Trace Ingestion', free: 'N/A', team: '100,000', growth: '1,000,000', ent: '10,000,000+' },
      { name: 'OpenTelemetry (OTel) & Langfuse Connectors', free: false, team: true, growth: true, ent: true },
      { name: 'LiteLLM Proxy & Helicone Integration', free: false, team: false, growth: true, ent: true },
      { name: 'Real-time Slack & PagerDuty Alerting (on request)', free: false, team: 'Slack', growth: 'Slack + PagerDuty', ent: 'Full Custom' },
    ],
  },
  {
    category: 'Enterprise Security & Governance',
    features: [
      { name: 'Single Sign-On (Okta, Entra ID, SAML, on request)', free: false, team: false, growth: false, ent: true },
      { name: 'Dedicated VPC / Zero-Egress Deployment (on request)', free: false, team: false, growth: false, ent: true },
      { name: 'Multi-Org Policy-as-Code Enforcement', free: false, team: false, growth: false, ent: true },
      { name: 'SOC2 & ISO 27001 AI Risk Audit Packages', free: false, team: false, growth: false, ent: true },
      { name: 'Support SLA', free: 'Community', team: '24h Email', growth: '4h Slack', ent: '1h Slack + Named TSE' },
    ],
  },
];

export default function PricingPage() {
  const copyCli = () => {
    navigator.clipboard.writeText('npx auditgpt test');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#111827] font-sans antialiased">
      <Navbar />

      <main className="py-16 px-4 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-3.5 py-1 text-xs font-semibold text-[#475467] shadow-xs">
              <ShieldCheck className="h-4 w-4 text-[#16a34a]" />
              <span>Transparent Developer &amp; Enterprise Pricing</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#111827]">
              Predictable stress-testing for{' '}
              <span className="underline decoration-[#9EFFA9] decoration-4 underline-offset-6">
                autonomous agents.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#475467] leading-relaxed">
              Start with the free open-source CLI. Scale to automated PR merge gates and dedicated VPC runtime defense.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                  tier.isPopular
                    ? 'border-2 border-[#111827] bg-[#111827] text-white shadow-xl relative'
                    : 'border border-[#e2e8f0] bg-white text-[#111827] shadow-xs hover:shadow-md'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-3 right-6 font-mono text-[10px] uppercase font-bold text-[#111827] bg-[#9EFFA9] px-3 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold">{tier.name}</h3>
                  </div>
                  <div className={`text-[11px] font-mono mt-1 ${tier.isPopular ? 'text-[#9EFFA9]' : 'text-[#667085]'}`}>
                    {tier.badge}
                  </div>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {tier.price}
                    </span>
                    <span className={`text-xs font-mono ${tier.isPopular ? 'text-white/60' : 'text-[#667085]'}`}>
                      / {tier.frequency}
                    </span>
                  </div>

                  <p className={`mt-3 text-xs leading-relaxed ${tier.isPopular ? 'text-white/80' : 'text-[#475467]'}`}>
                    {tier.description}
                  </p>

                  <div className={`my-6 border-t ${tier.isPopular ? 'border-white/10' : 'border-[#f1f5f9]'}`} />

                  <div className="space-y-2.5 text-xs">
                    {tier.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 mt-0.5 ${
                            tier.isPopular ? 'text-[#9EFFA9]' : 'text-[#16a34a]'
                          }`}
                        />
                        <span className={tier.isPopular ? 'text-white/90' : 'text-[#111827]'}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={tier.ctaHref}
                  className={`mt-8 block text-center rounded-full py-3 font-mono text-xs font-bold transition-all ${
                    tier.isPopular
                      ? 'bg-[#9EFFA9] text-[#111827] hover:bg-[#86ef92] shadow-sm'
                      : 'border border-[#e2e8f0] bg-[#f8fafc] text-[#111827] hover:bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  {tier.ctaText}
                </a>
              </div>
            ))}
          </div>

          {/* Deep Feature Matrix */}
          <div className="mt-24">
            <div className="text-center space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                Detailed Capability Matrix
              </h2>
              <p className="text-xs sm:text-sm text-[#475467]">
                Compare technical features across local CLI, CI/CD defense gates, and enterprise VPC deployments.
              </p>
            </div>

            <div className="mt-10 overflow-x-auto rounded-3xl border border-[#e2e8f0] bg-white shadow-xs">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="p-4 sm:p-5 text-[#667085] uppercase w-1/3">Feature Dimension</th>
                    <th className="p-4 sm:p-5 text-[#111827] text-center w-1/6">Free CLI</th>
                    <th className="p-4 sm:p-5 font-bold text-[#111827] bg-[#9EFFA9]/20 text-center w-1/6 border-l border-r border-[#9EFFA9]/40">
                      Team ($499)
                    </th>
                    <th className="p-4 sm:p-5 text-[#111827] text-center w-1/6">Growth ($2,499)</th>
                    <th className="p-4 sm:p-5 text-[#111827] text-center w-1/6">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {COMPARISON_MATRIX.map((section, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <tr className="bg-[#f8fafc]/70">
                        <td colSpan={5} className="p-3.5 px-5 font-bold text-[#111827] text-[11px] uppercase tracking-wider">
                          {section.category}
                        </td>
                      </tr>
                      {section.features.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#f8fafc]/40 transition-colors">
                          <td className="p-4 sm:p-5 text-[#334155] font-sans font-medium text-xs">{row.name}</td>
                          <td className="p-4 sm:p-5 text-center text-[#667085]">
                            {typeof row.free === 'boolean' ? (
                              row.free ? (
                                <Check className="h-4 w-4 text-[#16a34a] mx-auto" />
                              ) : (
                                <span className="text-gray-300">—</span>
                              )
                            ) : (
                              row.free
                            )}
                          </td>
                          <td className="p-4 sm:p-5 text-center font-bold text-[#111827] bg-[#9EFFA9]/10 border-l border-r border-[#9EFFA9]/40">
                            {typeof row.team === 'boolean' ? (
                              row.team ? (
                                <Check className="h-4 w-4 text-[#16a34a] mx-auto" />
                              ) : (
                                <span className="text-gray-300">—</span>
                              )
                            ) : (
                              row.team
                            )}
                          </td>
                          <td className="p-4 sm:p-5 text-center text-[#334155]">
                            {typeof row.growth === 'boolean' ? (
                              row.growth ? (
                                <Check className="h-4 w-4 text-[#16a34a] mx-auto" />
                              ) : (
                                <span className="text-gray-300">—</span>
                              )
                            ) : (
                              row.growth
                            )}
                          </td>
                          <td className="p-4 sm:p-5 text-center font-semibold text-[#111827]">
                            {typeof row.ent === 'boolean' ? (
                              row.ent ? (
                                <Check className="h-4 w-4 text-[#16a34a] mx-auto" />
                              ) : (
                                <span className="text-gray-300">—</span>
                              )
                            ) : (
                              row.ent
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Install Banner */}
          <div id="install" className="mt-20 rounded-3xl bg-[#111827] p-8 sm:p-12 text-white text-center shadow-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-xs font-semibold text-[#9EFFA9] mb-3">
              <Terminal className="h-3.5 w-3.5" /> Start Stress-Testing in 30 Seconds
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Zero configuration required.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/80">
              Run the full ASTI v1.1 adversarial test battery locally against your agent endpoint:
            </p>
            <div className="mt-6 mx-auto max-w-md flex items-center justify-between rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur-md">
              <div className="font-mono text-xs text-[#9EFFA9] px-3">
                npx auditgpt test --endpoint http://localhost:8000
              </div>
              <button
                type="button"
                onClick={copyCli}
                className="rounded-full bg-[#9EFFA9] px-4 py-1.5 font-mono text-xs font-bold text-[#111827] hover:bg-[#86ef92]"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#667085]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827]">
              <img src="/logo-shield.png" alt="AuditGPT" className="h-6 w-6 object-contain" />
            </div>
            <span className="font-display text-base font-bold text-[#111827]">
              AuditGPT<span className="text-[#667085] font-normal">.ai</span>
            </span>
          </div>
          <div className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} AuditGPT.ai &mdash; Snyk for Autonomous AI Agents. MIT Licensed.
          </div>
        </div>
      </footer>
    </div>
  );
}
