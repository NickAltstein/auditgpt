import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Trust - Scrutexity',
  description: 'What Scrutexity examines, what it does not, and where its findings come from.',
};

const SECTIONS = [
  {
    title: 'What we examine',
    body: 'The public page or pages you point us to: headlines, body copy, and any linked source material that page makes available.',
  },
  {
    title: 'What we do not examine',
    body: 'Anything behind a login, any internal system, any patient or customer record, or any private data. If it is not visible to a public visitor, Scrutexity does not read it.',
  },
  {
    title: 'How findings are generated',
    body: 'Substantive claims are extracted from the page, then checked against the evidence visible on that same page: sources, credentials, device names, linked studies. Where support is missing, thin, or unclear, that becomes a finding, with the specific gap named.',
  },
  {
    title: 'What requires human review',
    body: 'Every finding is a starting point, not a verdict. Whether a claim needs stronger proof, different wording, or no change at all is a judgment call for you or your counsel to make.',
  },
  {
    title: 'What Scrutexity cannot conclude',
    body: 'Scrutexity cannot determine whether a claim is legally compliant, whether it violates a specific regulation, or whether a company has committed any wrongdoing. It reports what is and is not visibly supported on the page, nothing more.',
  },
];

const DOES_NOT = [
  'Does not provide legal advice.',
  'Does not determine legal violations.',
  'Does not guarantee compliance.',
  'Does not guarantee AI rankings.',
  'Does not fabricate findings.',
];

export default function TrustPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Evidence first. Clear boundaries.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            What we look at, how a finding gets made, and where our judgment stops and yours starts.
          </p>

          <div className="mt-14 space-y-10">
            {SECTIONS.map((s) => (
              <div key={s.title} className="border-t border-border pt-6">
                <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/75">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 border border-border bg-secondary/30 p-6 sm:p-8">
            <h2 className="text-base font-semibold text-foreground">What Scrutexity does not do</h2>
            <ul className="mt-4 space-y-2">
              {DOES_NOT.map((line) => (
                <li key={line} className="text-sm leading-relaxed text-foreground/75">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14 border-t border-border pt-10">
            <h2 className="font-serif text-2xl text-foreground">Data handling and boundaries</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Public-page boundaries</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We read only the public page you give us a URL for. No login, no write access, no connection to
                  your internal systems.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Legal boundaries</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Business and marketing review only. Not legal, medical, regulatory, or compliance advice. Missing
                  evidence is reported as a visibility gap, not a finding of falsity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
