'use client';

import React from 'react';
import Image from 'next/image';

interface NavbarProps {
  onScrollToTerminal?: () => void;
}

export function Navbar({ onScrollToTerminal }: NavbarProps) {
  return (
    <header className="sticky top-4 z-50 mx-auto max-w-6xl px-3 sm:px-4">
      <nav className="flex items-center justify-between gap-3 sm:gap-6 rounded-full border border-slate-200/80 bg-white/95 px-3.5 py-2 sm:px-5 sm:py-2.5 shadow-sm backdrop-blur-md">
        {/* Brand Lockup */}
        <a href="#" className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <Image
            src="/logo-shield.png"
            alt="AuditGPT Shield"
            width={36}
            height={36}
            priority
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#111827]">
              AuditGPT<span className="font-normal text-slate-400">.ai</span>
            </span>
            <span className="mt-0.5 font-mono text-xs tracking-wider text-slate-500 uppercase">
              ASTI V1.1 Defense Gate
            </span>
          </div>
        </a>

        {/* Single-Line Navigation Links */}
        <div className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex">
          <a
            href="https://sandbox.auditgpt.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[40px] items-center gap-1.5 py-2 whitespace-nowrap font-semibold text-[#111827] transition-colors hover:text-slate-900"
          >
            Live Sandbox
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9EFFA9] px-2 py-0.5 font-mono text-xs font-bold text-[#111827]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-900 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-slate-900"></span>
              </span>
              DEMO
            </span>
          </a>
          <a href="#architecture" className="min-h-[40px] inline-flex items-center py-2 whitespace-nowrap transition-colors hover:text-[#111827]">
            Architecture
          </a>
          <a href="#battery" className="min-h-[40px] inline-flex items-center py-2 whitespace-nowrap transition-colors hover:text-[#111827]">
            50-Test Battery
          </a>
          <a href="#ci-gate" className="min-h-[40px] inline-flex items-center py-2 whitespace-nowrap transition-colors hover:text-[#111827]">
            CI/CD Gate
          </a>
          <a href="#runtime" className="min-h-[40px] inline-flex items-center py-2 whitespace-nowrap transition-colors hover:text-[#111827]">
            Observability
          </a>
          <a href="#comparison" className="min-h-[40px] inline-flex items-center py-2 whitespace-nowrap transition-colors hover:text-[#111827]">
            Comparison
          </a>
          <a href="#pricing" className="min-h-[40px] inline-flex items-center py-2 whitespace-nowrap transition-colors hover:text-[#111827]">
            Pricing
          </a>
          <a href="/legal" className="min-h-[40px] inline-flex items-center py-2 whitespace-nowrap transition-colors hover:text-[#111827]">
            Terms
          </a>
        </div>

        {/* Single Primary Action */}
        <div className="flex shrink-0 items-center">
          <a
            href="mailto:sales@auditgpt.ai?subject=Team%20Suite%20Inquiry"
            className="inline-flex min-h-[38px] items-center gap-1.5 whitespace-nowrap rounded-full bg-[#9EFFA9] hover:bg-[#86ef92] px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#111827] shadow-2xs transition-all hover:scale-[1.01]"
          >
            <span className="hidden xs:inline sm:inline">Deploy Gate</span>
            <span className="xs:hidden sm:hidden">Deploy</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
