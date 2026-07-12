'use client';

import { FormEvent, useMemo, useState } from "react";
import type { AiAlert, AiProviderDashboardItem } from "@/lib/ai";

type AiDashboardData = { providers: AiProviderDashboardItem[]; alerts: AiAlert[] };
type ProviderKind = "openai" | "anthropic" | "gemini";

const providerDefaults: Record<ProviderKind, { label: string; model: string }> = {
  openai: { label: "OpenAI Production", model: "gpt-4.1-mini" },
  anthropic: { label: "Claude Production", model: "claude-sonnet-4-5" },
  gemini: { label: "Gemini Production", model: "gemini-2.5-flash" },
};

function AiIcon({ name, size = 18 }: { name: "alert" | "bolt" | "check" | "close" | "key" | "plus" | "shield" | "test" | "token"; size?: number }) {
  const paths = {
    alert: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4m0 3h.01" /></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6V2Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    key: <><circle cx="8" cy="15" r="3" /><path d="m10.3 12.7 8.2-8.2 2 2-2 2 1.5 1.5-2 2-1.5-1.5-3.9 3.9" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    shield: <><path d="M12 3 5 6v5c0 4.5 2.9 8 7 10 4.1-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    test: <><path d="m8 3 8 8a5.5 5.5 0 0 1-7.8 7.8L5 15.6A5.5 5.5 0 0 1 5 7.8L8 3Z" /><path d="M6 18h12" /></>,
    token: <><circle cx="12" cy="12" r="8" /><path d="M8 12h8M12 8v8" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function providerTone(provider: string) {
  if (provider === "anthropic") return "anthropic";
  if (provider === "gemini") return "gemini";
  return "openai";
}

function statusLabel(status: string) {
  if (status === "connected") return "اتصال برقرار";
  if (status === "error") return "تست ناموفق";
  return "تست نشده";
}

function computeAlerts(providers: AiProviderDashboardItem[], baseAlerts: AiAlert[]): AiAlert[] {
  if (!providers.length) return baseAlerts;
  const alerts: AiAlert[] = [];
  for (const provider of providers) {
    if (provider.isOverLimit) {
      alerts.push({ severity: "critical", text: `${provider.label}: سقف ماهانه‌ی توکن رد شده است.` });
    } else if (provider.isWarning) {
      alerts.push({ severity: "warning", text: `${provider.label}: مصرف به ${provider.usagePercent}٪ از سقف رسیده است.` });
    } else if (provider.lastStatus === "error") {
      alerts.push({ severity: "warning", text: `${provider.label}: آخرین تست اتصال ناموفق بوده است.` });
    }
  }
  return alerts;
}

export default function AiProviderManager({ initialData }: { initialData: AiDashboardData }) {
  const [providers, setProviders] = useState(initialData.providers);
  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState<ProviderKind>("openai");
  const [label, setLabel] = useState(providerDefaults.openai.label);
  const [model, setModel] = useState(providerDefaults.openai.model);
  const [apiKey, setApiKey] = useState("");
  const [tokenLimit, setTokenLimit] = useState("1000000");
  const [threshold, setThreshold] = useState("80");
  const [adding, setAdding] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  const alerts = useMemo(() => computeAlerts(providers, initialData.alerts), [providers, initialData.alerts]);

  const setProviderKind = (value: ProviderKind) => {
    setKind(value);
    setLabel(providerDefaults[value].label);
    setModel(providerDefaults[value].model);
  };

  const addProvider = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdding(true);
    setNotice("");
    try {
      const response = await fetch("/api/admin/ai-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: kind, label, apiKey, model, monthlyTokenLimit: Number(tokenLimit), warningThreshold: Number(threshold) }),
      });
      const result = (await response.json()) as { provider?: AiProviderDashboardItem; error?: string };
      if (!response.ok || !result.provider) throw new Error(result.error ?? "اتصال ذخیره نشد.");
      setProviders((items) => [result.provider!, ...items]);
      setApiKey("");
      setShowForm(false);
      setNotice("اتصال با کلید رمزنگاری‌شده در vault ذخیره شد. اکنون تست اتصال را اجرا کنید.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ذخیره‌سازی ناموفق بود.");
    } finally {
      setAdding(false);
    }
  };

  const testProvider = async (id: number) => {
    setTestingId(id);
    setNotice("");
    try {
      const response = await fetch(`/api/admin/ai-providers/${id}/test`, { method: "POST" });
      const result = (await response.json()) as { provider?: AiProviderDashboardItem; message?: string; error?: string };
      if (!result.provider) throw new Error(result.error ?? "تست اتصال انجام نشد.");
      setProviders((items) => items.map((item) => item.id === id ? result.provider! : item));
      setNotice(result.message ?? "تست اتصال کامل شد.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تست اتصال انجام نشد.");
    } finally {
      setTestingId(null);
    }
  };

  const saveMeter = async (event: FormEvent<HTMLFormElement>, provider: AiProviderDashboardItem) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const monthlyTokenLimit = Number(form.get("limit"));
    const tokensUsed = Number(form.get("used"));
    const warningThreshold = Number(form.get("threshold"));
    setNotice("");
    try {
      const response = await fetch(`/api/admin/ai-providers/${provider.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ monthlyTokenLimit, tokensUsed, warningThreshold }) });
      const result = (await response.json()) as { provider?: AiProviderDashboardItem; error?: string };
      if (!response.ok || !result.provider) throw new Error(result.error ?? "تنظیمات ذخیره نشد.");
      setProviders((items) => items.map((item) => item.id === provider.id ? result.provider! : item));
      setNotice(`سقف و هشدار ${provider.label} ذخیره شد.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تنظیمات ذخیره نشد.");
    }
  };

  return (
    <section className="ai-manager" id="ai-apis">
      <div className="ai-manager-header"><div><p>AI API Control Center</p><h2>کلیدها، توکن‌ها و هشدارهای production</h2><span>کلیدها رمزنگاری‌شده نگهداری می‌شوند و هرگز بعد از ذخیره در پنل نمایش داده نمی‌شوند.</span></div><button onClick={() => setShowForm(!showForm)}><AiIcon name={showForm ? "close" : "plus"} size={17} /> {showForm ? "بستن فرم" : "افزودن API"}</button></div>
      {alerts.length > 0 && <div className="ai-alerts">{alerts.map((alert, index) => <div className={alert.severity} key={`${alert.text}-${index}`}><AiIcon name={alert.severity === "info" ? "shield" : "alert"} size={16} /><span>{alert.text}</span></div>)}</div>}
      {notice && <p className="ai-notice"><AiIcon name="check" size={15} /> {notice}</p>}
      {showForm && <form className="ai-add-form" onSubmit={addProvider}><div className="ai-form-title"><span><AiIcon name="key" size={18} /></span><div><b>اتصال امن API</b><small>کلید فقط یک‌بار ارسال و پیش از ذخیره با AES-256-GCM رمزنگاری می‌شود.</small></div></div><div className="ai-form-grid"><label>ارائه‌دهنده<select value={kind} onChange={(event) => setProviderKind(event.target.value as ProviderKind)}><option value="openai">OpenAI</option><option value="anthropic">Anthropic / Claude</option><option value="gemini">Google Gemini</option></select></label><label>نام این اتصال<input value={label} onChange={(event) => setLabel(event.target.value)} required /></label><label>مدل پیش‌فرض<input value={model} onChange={(event) => setModel(event.target.value)} required dir="ltr" /></label><label>کلید API<input value={apiKey} onChange={(event) => setApiKey(event.target.value)} type="password" required placeholder="کلید هرگز نمایش داده نمی‌شود" dir="ltr" /></label><label>سقف ماهانه توکن<input value={tokenLimit} onChange={(event) => setTokenLimit(event.target.value)} type="number" min="1000" required dir="ltr" /></label><label>آستانه هشدار (%)<input value={threshold} onChange={(event) => setThreshold(event.target.value)} type="number" min="50" max="100" required dir="ltr" /></label></div><div className="ai-add-foot"><span><AiIcon name="shield" size={14} /> کلید در مرورگر یا جدول دیتابیس به‌صورت متن خام نگهداری نمی‌شود.</span><button disabled={adding}>{adding ? "در حال ذخیره..." : "ذخیره‌ی اتصال امن"}</button></div></form>}
      <div className="ai-provider-grid">{providers.map((provider) => <article className={`ai-provider-card ${providerTone(provider.provider)}`} key={provider.id}><div className="ai-provider-top"><div><span className="ai-provider-mark">{provider.provider === "openai" ? "O" : provider.provider === "anthropic" ? "A" : "G"}</span><div><p>{provider.providerName}</p><h3>{provider.label}</h3></div></div><span className={`ai-status ${provider.lastStatus}`}><i /> {statusLabel(provider.lastStatus)}</span></div><div className="ai-key-row"><span><AiIcon name="key" size={14} /> {provider.keyFingerprint}</span><small>{provider.secretSource === "environment" ? `ENV: ${provider.environmentVariable}` : "Encrypted Vault"}</small></div><div className="ai-model-row"><span>مدل فعال</span><b dir="ltr">{provider.model}</b></div><div className="ai-progress-head"><span>مصرف ثبت‌شده</span><b>{provider.tokensUsed.toLocaleString("fa-IR")} <small>از {provider.monthlyTokenLimit.toLocaleString("fa-IR")}</small></b></div><div className="ai-progress"><i className={provider.isOverLimit ? "critical" : provider.isWarning ? "warning" : ""} style={{ width: `${Math.min(100, provider.usagePercent)}%` }} /></div><div className="ai-progress-foot"><span>{provider.usagePercent.toLocaleString("fa-IR")}٪ مصرف شده</span><span>هشدار در {provider.warningThreshold.toLocaleString("fa-IR")}٪</span></div><form className="ai-meter-form" onSubmit={(event) => saveMeter(event, provider)}><label>سقف<input name="limit" type="number" defaultValue={provider.monthlyTokenLimit} min="1000" dir="ltr" /></label><label>مصرف<input name="used" type="number" defaultValue={provider.tokensUsed} min="0" dir="ltr" /></label><label>هشدار٪<input name="threshold" type="number" defaultValue={provider.warningThreshold} min="50" max="100" dir="ltr" /></label><button title="ذخیره سقف و میزان مصرف"><AiIcon name="check" size={16} /></button></form><div className="ai-card-actions"><button onClick={() => testProvider(provider.id)} disabled={testingId === provider.id}><AiIcon name="test" size={16} /> {testingId === provider.id ? "در حال تست..." : "تست اتصال"}</button><span>{provider.lastTestedAt ? `آخرین تست: ${new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(new Date(provider.lastTestedAt))}` : "هنوز تست نشده"}</span></div>{provider.lastError && <p className="ai-provider-error"><AiIcon name="alert" size={14} /> {provider.lastError}</p>}</article>)}</div>
      {providers.length === 0 && <div className="ai-empty"><span><AiIcon name="bolt" size={24} /></span><b>هنوز هیچ کلید AI فعال نیست.</b><p>OpenAI، Claude یا Gemini را اضافه کنید تا healthcheck، مصرف توکن و هشدارها در production زیر نظر باشند.</p></div>}
    </section>
  );
}
