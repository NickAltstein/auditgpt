'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

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

  const dismiss = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'dismissed');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Notice"
      className="fixed bottom-4 right-4 z-40 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 text-xs text-slate-600 shadow-lg backdrop-blur-sm"
    >
      <p className="leading-snug text-[13px]">
        Essential session state only. Zero tracking.{' '}
        <a href="/privacy" className="font-medium text-[#111827] underline">
          Privacy
        </a>
      </p>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={accept}
          aria-label="Accept essential cookies"
          className="min-h-[36px] rounded-full bg-[#111827] px-3.5 py-1.5 font-medium text-white transition-colors hover:bg-slate-800 cursor-pointer text-xs"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss cookie notice"
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
