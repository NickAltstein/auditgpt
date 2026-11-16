import Link from 'next/link';

const FOOTER_LINKS = [
  ['Methodology', '/claim-review-methodology'],
  ['Promises', '/promises'],
  ['Sample review', '/sample-report'],
  ['Legal', '/legal'],
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background py-10 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {FOOTER_LINKS.map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">
          AuditGPT gives a diagnostic first read. It does not provide legal, clinical, regulatory, or medical
          advice.
        </p>
      </div>
    </footer>
  );
}
