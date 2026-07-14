"use client";

import { useEffect, useMemo, useState } from "react";
import type { RuntimeIssue, RuntimeStatus } from "@/lib/runtime-status";

const severityLabel: Record<RuntimeIssue["severity"], string> = {
  critical: "خطای مهم",
  warning: "هشدار",
};

export default function ConfigWarningModal({
  initialStatus,
}: {
  initialStatus?: RuntimeStatus | null;
}) {
  const [status, setStatus] = useState<RuntimeStatus | null>(initialStatus ?? null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const apply = (runtime: RuntimeStatus) => {
      if (cancelled) return;
      setStatus(runtime);
      // Only open modal when there is a real secret/DB problem.
      if (runtime.issues.length > 0 && !dismissed) setOpen(true);
      else setOpen(false);
    };

    const load = async () => {
      try {
        const response = await fetch("/api/auth/settings", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { runtime?: RuntimeStatus };
        if (payload.runtime) apply(payload.runtime);
      } catch {
        // Silent on optional status fetch failures when site is otherwise fine.
      }
    };

    if (initialStatus) {
      apply(initialStatus);
    } else {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [dismissed, initialStatus]);

  const issues = status?.issues ?? [];
  const hasCritical = useMemo(
    () => issues.some((issue) => issue.severity === "critical"),
    [issues],
  );

  // No issues => no FAB, no modal.
  if (!status || issues.length === 0) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          className="config-warning-fab"
          onClick={() => setOpen(true)}
          aria-label="نمایش هشدارهای پیکربندی"
        >
          {hasCritical ? "!" : "i"}
          <span>هشدار تنظیمات</span>
        </button>
      )}

      {open && (
        <div className="config-warning-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="config-warning-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="config-warning-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <p>CONFIGURATION</p>
                <h2 id="config-warning-title">یک یا چند Secret لازم تنظیم نشده</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="بستن">
                ×
              </button>
            </header>

            <p className="config-warning-summary">{status.summary}</p>

            <ul className="config-warning-list">
              {issues.map((issue) => (
                <li key={issue.id} data-severity={issue.severity}>
                  <div>
                    <b>
                      {severityLabel[issue.severity]} · {issue.title}
                    </b>
                    <p>{issue.detail}</p>
                    <small>{issue.fix}</small>
                  </div>
                </li>
              ))}
            </ul>

            <div className="config-warning-actions">
              <button
                type="button"
                onClick={() => {
                  setDismissed(true);
                  setOpen(false);
                }}
              >
                فهمیدم
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
