import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { ClaimEvidenceArtifact } from '@/components/claim-evidence-artifact';
import { ExhibitA } from '@/components/exhibit-a';
import { DifferentiationArtifact } from '@/components/differentiation-artifact';
import { DatedRecordTimeline } from '@/components/dated-record-timeline';

export const metadata: Metadata = {
  title: 'Scrutexity — See what your site claims, and what’s missing to back it up',
  description:
    'Scrutexity analyzes your public claims, identifies evidence gaps, and shows you what to clarify. Paste a public URL and get a free 3-point snapshot.',
};

const HOW_IT_WORKS = [
  ['01', 'Scan', 'Paste a public URL and let Scrutexity identify the substantive claims on the page.'],
  ['02', 'Review', 'We examine what supports those claims, identify missing evidence, and flag language that needs clarification.'],
  ['03', 'Record', 'You receive a clear snapshot of what was found and what to review next.'],
] as const;

const TRUST_POINTS = [
  ['Public pages only', 'We analyze the public information you provide.'],
  ['Source-linked', 'Findings are tied to observable language and supporting sources where available.'],
  ['Human-readable', 'You see the claim, the gap, and what to clarify.'],
  ['No legal theater', 'Scrutexity is intelligence software, not a regulator or law firm.'],
] as const;

const PRICING_TEASER = [
  ['Free Snapshot', '$0', '3-point claim snapshot, delivered by email.'],
  ['Claim Support Review', '$99', 'One detailed Exhibit A finding, with sourcing and safer wording.'],
  ['Scrutexity Watch', '$1,500/mo', 'Ongoing monitoring, evidence drift, and owner alerts.'],
] as const;

export default function ClaimReviewHome() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h1 className="font-serif text-4xl leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
                See what your site claims, and what&apos;s missing to back it up.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground/70">
                Scrutexity analyzes your public claims, identifies evidence gaps, and shows you what to clarify.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Paste a public URL. Get a free 3-point snapshot.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/snapshot"
                  className="rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Run Your Free Snapshot
                </Link>
                <a
                  href="#exhibit-a"
                  className="text-sm font-semibold text-foreground/70 underline underline-offset-4 hover:text-foreground"
                >
                  See an Example
                </a>
              </div>
            </div>
            <div className="lg:col-span-6">
              <ClaimEvidenceArtifact />
            </div>
          </div>
        </section>

        {/* Live example / Exhibit A */}
        <section id="exhibit-a" className="border-t border-border bg-secondary/20 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              What Scrutexity finds
            </div>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              One claim. One evidence gap. One clearer path forward.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              A real example of the kind of finding a Claim Support Review returns.
            </p>
            <div className="mt-8">
              <ExhibitA />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">How it works</h2>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3">
              {HOW_IT_WORKS.map(([step, title, body]) => (
                <div key={step} className="border-t-2 border-primary pt-4">
                  <span className="font-mono text-xs font-semibold text-primary">{step}</span>
                  <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Differentiation */}
        <section className="border-t border-border bg-secondary/20 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Why this is different
            </div>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Not a score. A reason.
            </h2>
            <div className="mt-8">
              <DifferentiationArtifact />
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="border-t border-border px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Evidence first. Clear boundaries.
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST_POINTS.map(([title, body]) => (
                <div key={title} className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
            <Link
              href="/trust"
              className="mt-8 inline-block text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80"
            >
              See our full trust page
            </Link>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="border-t border-border bg-secondary/20 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Free to start. Clear at every step.
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PRICING_TEASER.map(([name, price, body]) => (
                <div key={name} className="border border-border bg-card p-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{name}</div>
                  <div className="mt-2 font-serif text-2xl text-foreground">{price}</div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
            <Link
              href="/pricing"
              className="mt-6 inline-block text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80"
            >
              See full pricing
            </Link>
          </div>
        </section>

        {/* Dated record */}
        <section className="border-t border-border px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              A dated record, not just a scan.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              We don&apos;t just tell you something is unclear. We create a record of what was observed and what
              changed.
            </p>
            <div className="mt-8">
              <DatedRecordTimeline />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-primary px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="font-serif text-3xl text-primary-foreground sm:text-4xl">Run Your Free Snapshot</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/80">
            Paste a public URL and see what your site claims, and what&apos;s missing to back it up.
          </p>
          <Link
            href="/snapshot"
            className="mt-7 inline-block rounded-sm bg-primary-foreground px-7 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
          >
            Run Your Free Snapshot
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
