import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Agent Guardrail Audit - Scrutexity',
  description: 'Audit AI-agent transcripts for claim drift and unsupported representations. Coming Q1 2027.',
  robots: { index: false, follow: false },
};

export default function AgentGuardrailWaitlistPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Coming Q1 2027
          </div>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Agent Guardrail Audit
          </h1>
          <p className="mt-5 text-base leading-relaxed text-foreground/70">
            Audit AI-agent transcripts for claim drift and unsupported representations, the same evidence-first
            review Scrutexity runs on web pages, applied to what your agent actually says to customers.
          </p>
          <div className="mt-9">
            <a
              href="mailto:sales@scrutexity.com?subject=Agent%20Guardrail%20Audit%20Waitlist"
              className="inline-block rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Join the Waitlist
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
