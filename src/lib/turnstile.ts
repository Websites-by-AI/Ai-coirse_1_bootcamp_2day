type TurnstileResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export function isTurnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token: string | undefined, remoteIp?: string | null) {
  if (!isTurnstileEnabled()) return { ok: true, skipped: true } as const;
  if (!token) return { ok: false, message: "تأیید امنیتی Cloudflare کامل نشده است." } as const;

  try {
    const form = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token });
    if (remoteIp) form.set("remoteip", remoteIp);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await response.json().catch(() => ({}))) as TurnstileResponse;
    if (response.ok && result.success) return { ok: true, skipped: false } as const;
    return { ok: false, message: "تأیید امنیتی Cloudflare ناموفق بود؛ صفحه را تازه‌سازی کنید." } as const;
  } catch {
    return { ok: false, message: "سرویس تأیید Cloudflare در دسترس نیست؛ دوباره تلاش کنید." } as const;
  }
}
