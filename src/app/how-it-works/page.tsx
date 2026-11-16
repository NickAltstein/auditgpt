import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { ExhibitA } from '@/components/exhibit-a';

export const metadata: Metadata = {
  title: 'How It Works - Scrutexity',
  description: 'How Scrutexity reviews a public page: scan, review, record.',
};

const STEPS = [
  {
    step: '01',
    title: 'Scan',
    body: 'Paste a public URL. Scrutexity reads the page and identifies the substantive claims on it: the statements a visitor would rely on, not every sentence on the page.',
  },
  {
    step: '02',
    title: 'Review',
    body: 'Each claim is checked against what evidence is visible on the page: is there a source, a study, a credential, a device name, a linked reference? Where support is missing, thin, or unclear, that becomes a finding.',
  },
  {
    step: '03',
    title: 'Record',
    body: 'You get a plain-English snapshot of what was found and a dated review record. A detailed review adds a source-checked write-up and a safer wording suggestion for each flagged claim.',
  },
] as const;

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">How it works</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Three steps. No dashboard to learn, no jargon to decode.
          </p>

          <div className="mt-14 space-y-12">
            {STEPS.map((s) => (
              <div key={s.step} className="border-t border-border pt-6">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm font-semibold text-primary">{s.step}</span>
                  <h2 className="text-xl font-semibold text-foreground">{s.title}</h2>
                </div>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/75">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-border pt-14">
            <h2 className="font-serif text-2xl text-foreground">What a finding looks like</h2>
            <p className="mt-2 text-sm text-muted-foreground">This is the format every review returns.</p>
            <div className="mt-8">
              <ExhibitA />
            </div>
          </div>

          <div className="mt-16 border-t border-border pt-10 text-center">
            <Link
              href="/snapshot"
              className="inline-block rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Run Your Free Snapshot
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
