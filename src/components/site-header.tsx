'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Menu } from 'lucide-react';
import { Logo } from '@/components/logo';

const NAV_LINKS = [
  ['Home', '/claim-review'],
  ['How It Works', '/how-it-works'],
  ['Trust', '/trust'],
  ['Pricing', '/pricing'],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/claim-review" className="flex items-center gap-2" aria-label="Scrutexity home" onClick={() => setOpen(false)}>
          <Logo variant="full" height={26} priority />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-foreground/65 transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/snapshot"
            className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Run Your Free Snapshot
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center text-foreground md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-4 md:hidden" aria-label="Primary mobile">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-sm px-2 py-2.5 text-sm font-medium text-foreground/75 hover:bg-secondary hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/snapshot"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-sm bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              Run Your Free Snapshot
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
