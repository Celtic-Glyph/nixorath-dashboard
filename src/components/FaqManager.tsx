"use client";

import { useState, useTransition } from "react";
import type { Faq } from "@/lib/botApi";

export default function FaqManager({
  guildId,
  initialFaqs,
  onSave,
  onDelete,
}: {
  guildId: string;
  initialFaqs: Faq[];
  onSave: (guildId: string, keyword: string, title: string, response: string) => Promise<void>;
  onDelete: (guildId: string, keyword: string) => Promise<void>;
}) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [form, setForm] = useState({ keyword: "", title: "", response: "" });
  const [saving, startSaving] = useTransition();
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  function submit() {
    if (!form.keyword.trim() || !form.title.trim() || !form.response.trim()) return;
    const keyword = form.keyword.trim().toLowerCase();
    startSaving(async () => {
      await onSave(guildId, keyword, form.title.trim(), form.response.trim());
      setFaqs((prev) => {
        const next = prev.filter((f) => f.keyword !== keyword);
        return [...next, { keyword, title: form.title.trim(), response: form.response.trim() }];
      });
      setForm({ keyword: "", title: "", response: "" });
    });
  }

  function remove(keyword: string) {
    setDeletingKey(keyword);
    startSaving(async () => {
      await onDelete(guildId, keyword);
      setFaqs((prev) => prev.filter((f) => f.keyword !== keyword));
      setDeletingKey(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Add / update an FAQ</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            value={form.keyword}
            onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
            placeholder="Trigger keyword"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none sm:col-span-2"
          />
          <textarea
            value={form.response}
            onChange={(e) => setForm((f) => ({ ...f, response: e.target.value }))}
            placeholder="Response shown to members"
            rows={3}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none sm:col-span-3"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="btn-primary mt-3 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {saving && !deletingKey ? "Saving…" : "Save FAQ"}
        </button>
      </div>

      <div className="space-y-2">
        {faqs.length === 0 && <p className="text-sm text-muted">No FAQs configured yet.</p>}
        {faqs.map((faq) => (
          <div key={faq.keyword} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-mono text-accent">{faq.keyword}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{faq.title}</p>
                <p className="mt-1 text-sm text-muted">{faq.response}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(faq.keyword)}
                disabled={saving}
                className="shrink-0 rounded-lg border border-danger/30 px-2.5 py-1 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:opacity-60"
              >
                {deletingKey === faq.keyword ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
