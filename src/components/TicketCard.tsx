"use client";

import { useState, useTransition } from "react";
import type { Ticket, TicketReply } from "@/lib/botApi";

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function TicketCard({
  ticket,
  onReply,
  onSetStatus,
}: {
  ticket: Ticket;
  onReply: (
    ticketId: string,
    method: "server" | "dm",
    message: string
  ) => Promise<{ ok: boolean; error: string | null }>;
  onSetStatus: (ticketId: string, status: "open" | "closed") => Promise<void>;
}) {
  const [replies, setReplies] = useState<TicketReply[]>(ticket.replies);
  const [status, setStatusLocal] = useState(ticket.status);
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<"server" | "dm">("server");
  const [error, setError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const [togglingStatus, startTogglingStatus] = useTransition();

  const canReplyToServer = Boolean(ticket.channel_id);

  function send() {
    if (!message.trim()) return;
    setError(null);
    startSending(async () => {
      const result = await onReply(ticket.id, method, message.trim());
      if (result.ok) {
        setReplies((prev) => [
          ...prev,
          { method, message: message.trim(), timestamp: new Date().toISOString() },
        ]);
        setMessage("");
      } else {
        setError(result.error ?? "Failed to send reply.");
      }
    });
  }

  function toggleStatus() {
    const next = status === "open" ? "closed" : "open";
    startTogglingStatus(async () => {
      await onSetStatus(ticket.id, next);
      setStatusLocal(next);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-accent">{ticket.id}</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {ticket.user_name} <span className="text-muted">· {ticket.guild_name}</span>
          </p>
          <p className="text-xs text-muted">{formatDate(ticket.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              status === "open" ? "bg-success/15 text-success" : "bg-muted/15 text-muted"
            }`}
          >
            {status === "open" ? "Open" : "Closed"}
          </span>
          <button
            type="button"
            onClick={toggleStatus}
            disabled={togglingStatus}
            className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-accent disabled:opacity-60"
          >
            {status === "open" ? "Mark resolved" : "Reopen"}
          </button>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-background/60 p-3 text-sm text-foreground/90">
        {ticket.message}
      </p>

      {replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {replies.map((r, i) => (
            <div key={i} className="rounded-lg border border-border/60 bg-background/40 p-2.5 text-sm">
              <p className="text-xs text-muted">
                Replied via {r.method === "server" ? "their server" : "DM"} · {formatDate(r.timestamp)}
              </p>
              <p className="mt-1 text-foreground/90">{r.message}</p>
            </div>
          ))}
        </div>
      )}

      {status === "open" ? (
        <div className="mt-4 space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a reply…"
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as "server" | "dm")}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            >
              <option value="server" disabled={!canReplyToServer}>
                Reply in their server{!canReplyToServer ? " (unavailable)" : ""}
              </option>
              <option value="dm">DM them directly</option>
            </select>
            <button
              type="button"
              onClick={send}
              disabled={sending || !message.trim()}
              className="btn-primary rounded-lg px-4 py-1.5 text-xs font-semibold disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send reply"}
            </button>
            {error && <span className="text-xs text-danger">{error}</span>}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted">
          This ticket is closed — reopen it to send another reply.
        </p>
      )}
    </div>
  );
}
