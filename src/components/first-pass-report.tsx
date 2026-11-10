'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { AuditResult, Claim } from '@/lib/audit-schema';
import { Instrument_Serif } from 'next/font/google';
import Link from 'next/link';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

// Pick the single most useful claim for a first-pass result:
// unsupported first, then overstated, then weakly supported.
function pickClaim(claims: Claim[]): Claim | null {
  const order = [
    'unsupported',
    'overstated',
    'weakly_supported',
    'insufficient_public_evidence',
  ];
  for (const status of order) {
    const match = claims.find((claim) => claim.claim_status === status);
    if (match) return match;
  }
  return claims[0] ?? null;
}

function statusLabel(status: Claim['claim_status']): string {
  switch (status) {
    case 'unsupported':
      return 'Unsupported claim';
    case 'overstated':
      return 'Overstated claim';
    case 'weakly_supported':
    case 'insufficient_public_evidence':
      return 'Weakly supported claim';
    default:
      return 'Reviewed claim';
  }
}

function EmailCapture({ publicId }: { publicId: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/scan-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, email: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not send the scan.');
      }
      setState('done');
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Could not send the scan.');
      setState('idle');
    }
  };

  if (state === 'done') {
    return (
      <div className="border-t border-[#1C1C1C]/10 pt-6 mt-6 text-xs text-neutral-600 font-mono">
        ✓ Audit receipt on its way to <span className="font-semibold text-black">{email.trim()}</span>.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border-t border-[#1C1C1C]/10 pt-6 mt-6">
      <label
        htmlFor="scan-email"
        className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/40"
      >
        Email full audit receipt
      </label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="scan-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          disabled={state === 'sending'}
          className="h-10 flex-1 rounded-full border border-[#1C1C1C]/15 bg-white px-4 text-xs text-[#1C1C1C] placeholder:text-[#1C1C1C]/35 focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C] focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#1C1C1C] bg-[#1C1C1C] text-white px-5 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-neutral-800 disabled:opacity-60 shrink-0"
        >
          {state === 'sending' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            'Send Copy'
          )}
        </button>
      </div>
    </form>
  );
}

function BrowserMockup({
  websiteUrl,
  claim,
  claimLabel,
}: {
  websiteUrl: string;
  claim: Claim | null;
  claimLabel: string;
}) {
  let displayUrl = websiteUrl;
  try {
    if (!displayUrl.startsWith('http://') && !displayUrl.startsWith('https://')) {
      displayUrl = 'https://' + displayUrl;
    }
    const parsed = new URL(displayUrl);
    displayUrl = parsed.hostname;
  } catch (e) {
    // Keep raw url if parse fails
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-[#1C1C1C] bg-[#FAF9F6] shadow-[0_4px_20px_rgba(28,28,28,0.02)] overflow-hidden min-h-[460px]">
      {/* Browser Bar */}
      <div className="bg-[#FAF9F6] border-b border-[#1C1C1C] px-4 py-3.5 flex items-center gap-3">
        {/* Mac OS Window controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-400 border border-[#1C1C1C]/25" />
          <span className="w-2 h-2 rounded-full bg-yellow-400 border border-[#1C1C1C]/25" />
          <span className="w-2 h-2 rounded-full bg-green-400 border border-[#1C1C1C]/25" />
        </div>
        {/* Address bar */}
        <div className="flex-1 bg-white border border-[#1C1C1C]/15 rounded-full px-3 py-1 flex items-center justify-center text-[10px] font-mono text-[#1C1C1C]/65 select-none">
          <span className="text-[#0D4F55] opacity-50 mr-0.5">https://</span>
          {displayUrl}
        </div>
      </div>

      {/* Simulated Webpage Contents */}
      <div className="flex-1 bg-[#F5F2EB] p-6 flex flex-col justify-between relative overflow-y-auto min-h-[380px]">
        {/* Mock clinic header */}
        <div className="flex items-center justify-between border-b border-[#1C1C1C]/5 pb-4">
          <span className="font-serif font-bold text-xs tracking-wider text-stone-800">
            AURELIA CLINIC
          </span>
          <div className="flex gap-3 text-[9px] font-semibold text-stone-600">
            <span>TREATMENTS</span>
            <span>ABOUT</span>
          </div>
        </div>

        {/* Hero Section of Mock Site */}
        <div className="my-auto py-8 flex flex-col items-center justify-center">
          <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#0D4F55]/60 mb-2">
            AESTHETIC INJECTABLE CARE
          </span>
          
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-stone-900 text-center leading-tight mb-6">
            Bespoke clinical outcomes in Manhattan.
          </h2>

          {/* FLAGGED CLAIM CONTAINER */}
          <div className="relative w-full border border-[#0D4F55] bg-[#0D4F55]/5 p-5 rounded-xl shadow-none transition-all">
            <span className="absolute -top-2 left-3 bg-[#0D4F55] text-white px-2.5 py-0.5 text-[8px] font-mono uppercase tracking-widest font-semibold rounded-full border border-[#1C1C1C]/10">
              FLAGGED: {claimLabel}
            </span>
            <p className="text-stone-800 text-sm md:text-base font-serif italic text-center font-medium py-1">
              "{claim ? claim.original_text : 'Permanent fat reduction in one session.'}"
            </p>
          </div>
        </div>

        {/* Mock clinic footer */}
        <div className="border-t border-[#1C1C1C]/5 pt-4 text-[8px] font-mono text-stone-500 flex justify-between">
          <span>AURELIA CLINIC © 2026</span>
          <span>MANHATTAN, NY</span>
        </div>
      </div>
    </div>
  );
}

export function FirstPassReport({
  audit,
  websiteUrl,
  publicId,
  createdAt,
}: {
  audit: AuditResult;
  websiteUrl: string;
  publicId: string;
  createdAt?: Date;
}) {
  const claim = pickClaim(audit.claim_audit?.claims ?? []);
  const proofGap =
    claim?.support_gap ||
    audit.support_gaps?.[0] ||
    'No visible proof gap was identified on this page.';
  const saferRewrite = claim?.safer_framing || '';
  const timestamp = createdAt
    ? new Date(createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Just now';

  const claimLabel = claim ? statusLabel(claim.claim_status) : 'Claims Reviewed';

  return (
    <div className="mx-auto max-w-5xl">
      {/* Split-pane Diagnostic Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Mock Browser highlighting Flagged Claim */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <BrowserMockup 
            websiteUrl={websiteUrl} 
            claim={claim} 
            claimLabel={claimLabel} 
          />
        </div>

        {/* Right Side: Governed Receipt */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-[#1C1C1C] bg-[#FAF9F6] p-6 shadow-[0_4px_20px_rgba(28,28,28,0.02)] min-h-[460px]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1C1C1C]/10 pb-4">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#1C1C1C]/40">
                AUDIT RECEIPT // FIRST_PASS
              </span>
              <span className="text-[10px] font-semibold text-[#1C1C1C] mt-0.5">
                SCANNED: {timestamp}
              </span>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0D4F55] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0D4F55]" />
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 py-5 flex flex-col justify-start gap-4">
            
            {/* Extracted Claim */}
            <div>
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#1C1C1C]/40">
                [01] EXTRACTED CLAIM
              </span>
              <div className="font-mono text-xs font-semibold text-[#1C1C1C] bg-white/40 border border-[#1C1C1C]/5 p-3 rounded-lg mt-1 shadow-inner leading-relaxed">
                "{claim ? claim.original_text : 'N/A'}"
              </div>
            </div>

            {/* Classification */}
            <div>
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#1C1C1C]/40">
                [02] CLASSIFICATION
              </span>
              <div className="mt-1">
                <span className="rounded-full bg-[#1C1C1C] text-white px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                  {claim ? claim.claim_status.replace(/_/g, ' ') : 'Reviewed claim'}
                </span>
              </div>
            </div>

            {/* Evidence Gap */}
            <div>
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#1C1C1C]/40">
                [03] EVIDENCE GAP
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                {proofGap}
              </p>
            </div>

            {/* Governed Rewrite */}
            {saferRewrite && (
              <div className="border-t border-[#1C1C1C]/10 pt-4">
                <span className="font-mono text-[9px] font-bold tracking-widest text-[#1C1C1C]/40">
                  [04] GOVERNED RESOLUTION
                </span>
                <blockquote className={`${instrumentSerif.className} text-xl text-[#0D4F55] leading-snug italic font-medium mt-1`}>
                  “{saferRewrite}”
                </blockquote>
              </div>
            )}
          </div>

          {/* Email capture inside the receipt panel */}
          <EmailCapture publicId={publicId} />
        </div>
      </div>

      {/* Conversion CTA Section below the split panes */}
      <div className="mt-16 border-t border-[#1C1C1C] pt-12 text-left flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-[#FAF9F6] p-6 rounded-2xl border shadow-none">
        <div className="max-w-xl">
          <h2 className="text-2xl font-serif font-semibold text-stone-900">
            Need the full claim inventory?
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#1C1C1C]/75">
            Get a Claim Intelligence Report: every single claim on your page mapped directly to visible clinical proof, source-linked enforcement trends, and AI-engine rewrites.
          </p>
        </div>
        <Link
          href={`/pricing?publicId=${publicId}`}
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#1C1C1C] bg-[#0D4F55] px-8 text-xs font-bold uppercase tracking-wider text-white shadow-none transition-all hover:bg-[#0A3D42] active:translate-y-[1px] shrink-0"
        >
          Get full report ($497)
          <ArrowRight className="ml-2 h-3 w-3" />
        </Link>
      </div>

      {/* Footnote Disclosures */}
      <p className="mt-8 text-[10px] leading-relaxed text-[#1C1C1C]/45 text-left max-w-3xl">
        AuditGPT is a Scrutexity product. This diagnostic view provides a first-pass review of public text against enforcement databases. It does not provide legal, clinical, regulatory, or medical advice. Reviewed does not mean approved, endorsed, or error-free.
      </p>
    </div>
  );
}
