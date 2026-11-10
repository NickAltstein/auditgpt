'use client';

import React from 'react';
import Image from 'next/image';
import { Terminal, ArrowRight, GitPullRequest } from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  onScrollToTerminal?: () => void;
}

export function Navbar({ onScrollToTerminal }: NavbarProps) {
  const copyQuickInstall = () => {
    navigator.clipboard.writeText('npx auditgpt test');
    toast.success('Command copied: npx auditgpt test');
  };

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex h-16 items-center justify-between rounded-full border border-[#e2e8f0] bg-white/95 px-5 sm:px-6 shadow-[0_4px_24px_rgba(17,24,39,0.06)] backdrop-blur-md">
        {/* Left: Brand Logo & Title */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#111827] shadow-sm transition-transform group-hover:scale-105">
            <Image
              src="/logo-shield.png"
              alt="AuditGPT Shield"
              width={32}
              height={32}
              priority
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#111827] leading-none">
              AuditGPT<span className="text-[#667085] font-normal">.ai</span>
            </span>
            <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-wider text-[#667085] mt-0.5">
              ASTI v1.1 Defense Gate
            </span>
          </div>
        </a>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#475467]">
          <a
            href="https://sandbox.auditgpt.ai/?scenario=prod-drop-table&step=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-3.5 py-1.5 font-mono text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live Exploit Sandbox ↗
          </a>
          <a href="#cli" className="transition-colors hover:text-[#111827]">
            CLI
          </a>
          <a href="#battery" className="transition-colors hover:text-[#111827]">
            50-Test Battery
          </a>
          <a href="#ci-gate" className="transition-colors hover:text-[#111827]">
            CI/CD Gate
          </a>
          <a href="#runtime" className="transition-colors hover:text-[#111827]">
            Observability
          </a>
          <a href="#comparison" className="transition-colors hover:text-[#111827]">
            Comparison
          </a>
          <a href="#pricing" className="transition-colors hover:text-[#111827]">
            Pricing
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://sandbox.auditgpt.ai/?scenario=prod-drop-table&step=1"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#111827] bg-[#111827] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1f2937]"
          >
            <span>Try Sandbox</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#c8f135]" />
          </a>

          <button
            type="button"
            onClick={copyQuickInstall}
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-1.5 font-mono text-xs font-medium text-[#111827] transition-colors hover:bg-white hover:border-[#cbd5e1]"
          >
            <Terminal className="h-3.5 w-3.5 text-[#667085]" />
            <span>npx auditgpt test</span>
          </button>

          <button
            type="button"
            onClick={onScrollToTerminal}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f135] px-4 sm:px-5 py-2 text-xs font-bold text-[#111827] shadow-xs transition-all hover:bg-[#bce628] hover:shadow-sm"
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            <span>Deploy Gate</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
