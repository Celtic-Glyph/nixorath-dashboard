"use client";

import { useState, useTransition } from "react";
import type { KeyRequest } from "@/lib/botApi";

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function KeyRequestCard({
  request,
  onFulfill,
}: {
  request: KeyRequest;
  onFulfill: (requestId: string) => Promise<{ key: string; dmed: boolean }>;
}) {
  const [fulfilled, setFulfilled] = useState(request.status === "fulfilled");
  const [result, setResult] = useState<{ key: string; dmed: boolean } | null>(null);
  const [sending, startSending] = useTransition();

  function fulfill() {
    startSending(async () => {
      const res = await onFulfill(request.id);
      setResult(res);
      setFulfilled(true);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-accent">{request.id}</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {request.user_name} <span className="text-muted">· {request.guild_name}</span>
          </p>
          <p className="font-mono text-xs text-muted">
            user {request.user_id ?? "—"} · guild {request.guild_id ?? "—"} · channel{" "}
            {request.channel_id ?? "—"}
          </p>
          <p className="text-xs text-muted">{formatDate(request.created_at)}</p>
        </div>
        {fulfilled ? (
          <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
            Fulfilled
          </span>
        ) : (
          <button
            type="button"
            onClick={fulfill}
            disabled={sending}
            className="btn-primary rounded-lg px-4 py-1.5 text-xs font-semibold disabled:opacity-60"
          >
            {sending ? "Sending…" : "Generate & send key"}
          </button>
        )}
      </div>
      {result && (
        <p className="mt-3 rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-xs text-foreground">
          {result.key}{" "}
          <span className={result.dmed ? "text-success" : "text-warning"}>
            {result.dmed ? "— DMed successfully" : "— could not DM (DMs closed)"}
          </span>
        </p>
      )}
    </div>
  );
}
