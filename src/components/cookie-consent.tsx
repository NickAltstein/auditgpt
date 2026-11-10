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
    <div className="fixed bottom-4 left-4 z-40 flex max-w-md items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-lg backdrop-blur-sm">
      <p className="leading-snug">
        Essential session state only. Zero tracking or data egress.{' '}
        <a href="/privacy" className="font-medium text-[#111827] underline">
          Privacy Policy
        </a>
      </p>
      <button
        type="button"
        onClick={accept}
        className="shrink-0 rounded-full bg-[#111827] px-4 py-1.5 font-medium text-white transition-colors hover:bg-slate-800 cursor-pointer"
      >
        Accept
      </button>
    </div>
  );
}
