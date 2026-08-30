"use client";

import { useState, useTransition } from "react";

export default function KeyGenerator({
  onGenerate,
}: {
  onGenerate: (targetUserId: string) => Promise<{ key: string; dmed: boolean }>;
}) {
  const [targetUserId, setTargetUserId] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ key: string; dmed: boolean } | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">Generate a setup key</h2>
      <p className="mt-1 text-xs text-muted">
        Mints a single-use key and DMs it to the target Discord user, same as{" "}
        <code>/generatekey</code>.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={targetUserId}
          onChange={(e) => {
            setTargetUserId(e.target.value);
            setResult(null);
          }}
          placeholder="Target Discord user ID"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          disabled={pending || !targetUserId.trim()}
          onClick={() =>
            startTransition(async () => {
              const res = await onGenerate(targetUserId.trim());
              setResult(res);
            })
          }
          className="btn-primary shrink-0 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "Generating…" : "Generate"}
        </button>
      </div>
      {result && (
        <p className="mt-3 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
          {result.key}{" "}
          <span className={result.dmed ? "text-success" : "text-warning"}>
            {result.dmed ? "— DMed successfully" : "— could not DM (DMs closed)"}
          </span>
        </p>
      )}
    </div>
  );
}
