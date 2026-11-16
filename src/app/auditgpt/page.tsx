import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'AuditGPT is now Scrutexity',
  description: 'AuditGPT is now Scrutexity. The diagnostic engine evolved into a broader evidence-first claim intelligence platform.',
};

export default function AuditGptBridgePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            AuditGPT is now Scrutexity.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-foreground/70">
            The diagnostic engine evolved into a broader evidence-first claim intelligence platform. Same
            public-page review, same plain-English findings, one product.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/snapshot"
              className="rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Run Your Free Snapshot
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-foreground/70 underline underline-offset-4 hover:text-foreground"
            >
              Learn about Scrutexity
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
