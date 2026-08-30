"use client";

import { useState, useTransition } from "react";

export default function Toggle({
  initialEnabled,
  onToggle,
  labelOn = "Enabled",
  labelOff = "Disabled",
}: {
  initialEnabled: boolean;
  onToggle: (next: boolean) => Promise<void>;
  labelOn?: string;
  labelOff?: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        startTransition(async () => {
          await onToggle(next);
        });
      }}
      className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 transition disabled:opacity-60 ${
        enabled ? "border-danger/50 bg-danger/15" : "border-border bg-surface"
      }`}
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          enabled ? "bg-danger" : "bg-surface-hover"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      <span className={`text-xs font-semibold ${enabled ? "text-danger" : "text-muted"}`}>
        {enabled ? labelOn : labelOff}
      </span>
    </button>
  );
}
