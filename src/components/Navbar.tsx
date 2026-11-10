'use client';

import React from 'react';
import Image from 'next/image';

interface NavbarProps {
  onScrollToTerminal?: () => void;
}

export function Navbar({ onScrollToTerminal }: NavbarProps) {
  return (
    <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4">
      <nav className="flex items-center justify-between gap-6 rounded-full border border-slate-200/80 bg-white/95 px-5 py-2.5 shadow-sm backdrop-blur-md">
        {/* Brand Lockup */}
        <a href="#" className="flex shrink-0 items-center gap-3">
          <Image
            src="/logo-shield.png"
            alt="AuditGPT Shield"
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-full object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-[#111827]">
              AuditGPT<span className="font-normal text-slate-400">.ai</span>
            </span>
            <span className="mt-0.5 font-mono text-[10px] tracking-wider text-slate-400 uppercase">
              ASTI V1.1 Defense Gate
            </span>
          </div>
        </a>

        {/* Single-Line Navigation Links */}
        <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          <a
            href="https://sandbox.auditgpt.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-[#111827] transition-colors hover:text-slate-900"
          >
            Live Sandbox
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b5f22b] px-2 py-0.5 font-mono text-[10px] font-bold text-[#111827]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-900 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-slate-900"></span>
              </span>
              DEMO
            </span>
          </a>
          <a href="#cli" className="whitespace-nowrap transition-colors hover:text-[#111827]">
            CLI
          </a>
          <a href="#battery" className="whitespace-nowrap transition-colors hover:text-[#111827]">
            50-Test Battery
          </a>
          <a href="#ci-gate" className="whitespace-nowrap transition-colors hover:text-[#111827]">
            CI/CD Gate
          </a>
          <a href="#runtime" className="whitespace-nowrap transition-colors hover:text-[#111827]">
            Observability
          </a>
          <a href="#comparison" className="whitespace-nowrap transition-colors hover:text-[#111827]">
            Comparison
          </a>
          <a href="#pricing" className="whitespace-nowrap transition-colors hover:text-[#111827]">
            Pricing
          </a>
          <a href="/legal" className="whitespace-nowrap transition-colors hover:text-[#111827]">
            Terms
          </a>
        </div>

        {/* Single Primary Action */}
        <div className="flex shrink-0 items-center">
          <a
            href="mailto:sales@auditgpt.ai?subject=Team%20Suite%20Inquiry"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#b5f22b] px-5 py-2.5 text-sm font-semibold text-[#111827] shadow-2xs transition-transform hover:scale-[1.01]"
          >
            <span>Deploy Gate</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
