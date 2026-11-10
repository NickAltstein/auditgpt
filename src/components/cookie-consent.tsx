'use client';

import { useEffect, useState } from 'react';

const COOKIE_CONSENT_KEY = 'auditgpt_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consented) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:right-auto md:max-w-sm bg-[#FAF9F6] border border-[#1C1C1C] p-4 z-50 rounded-2xl flex flex-col gap-3 shadow-[0_8px_30px_rgba(28,28,28,0.04)] select-none">
      <div className="flex flex-col gap-1 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1C1C1C]/50">
          Cookies
        </span>
        <p className="text-[11px] leading-relaxed text-[#1C1C1C]/70">
          We use essential session cookies and privacy-friendly logs to run the scanner. No tracking or marketing scripts are loaded.{' '}
          <a href="/legal" className="underline text-[#0D4F55] hover:text-[#1C1C1C] transition-colors font-medium">
            Learn more
          </a>
        </p>
      </div>
      <div className="flex justify-end border-t border-[#1C1C1C]/10 pt-3">
        <button
          onClick={accept}
          className="rounded-sm bg-[#0D4F55] hover:bg-[#0A3D42] text-white px-5 py-2 text-[11px] font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
