"use client";

import { useState, useTransition } from "react";
import type { BlacklistEntry } from "@/lib/botApi";

export default function BlacklistManager({
  initialEntries,
  onUpdate,
}: {
  initialEntries: BlacklistEntry[];
  onUpdate: (action: "add" | "remove", targetId: string, reason?: string) => Promise<void>;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function add() {
    if (!targetId.trim()) return;
    const id = targetId.trim();
    const r = reason.trim() || "No reason specified";
    startTransition(async () => {
      await onUpdate("add", id, r);
      setEntries((prev) => [...prev.filter((e) => e.id !== id), { id, reason: r }]);
      setTargetId("");
      setReason("");
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await onUpdate("remove", id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="User or guild ID"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-accent focus:outline-none"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          disabled={pending || !targetId.trim()}
          className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/20 disabled:opacity-60"
        >
          Blacklist
        </button>
      </div>

      <div className="space-y-2">
        {entries.length === 0 && <p className="text-sm text-muted">Nothing blacklisted.</p>}
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
          >
            <div>
              <p className="font-mono text-sm text-foreground">{e.id}</p>
              <p className="text-xs text-muted">{e.reason}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(e.id)}
              disabled={pending}
              className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted transition hover:border-success/40 hover:text-success disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
