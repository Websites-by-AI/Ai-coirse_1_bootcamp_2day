'use client';

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; theme: "light" | "dark"; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ID = "cloudflare-turnstile-script";

export default function TurnstileWidget({ siteKey, theme, onToken }: { siteKey?: string; theme: "light" | "dark"; onToken: (token: string) => void }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!siteKey || !elementRef.current) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !window.turnstile || !elementRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(elementRef.current, {
        sitekey: siteKey,
        theme,
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", render);
      render();
    } else {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = undefined;
    };
  }, [siteKey, theme, onToken]);

  if (!siteKey) return null;
  return <div className="turnstile-wrap"><div ref={elementRef} /><small>تأیید امنیتی Cloudflare برای جلوگیری از ثبت‌نام رباتی</small></div>;
}
