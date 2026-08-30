"use client";

import { useMemo, useState, useTransition } from "react";
import type { Member } from "@/lib/botApi";

interface RoleOption {
  id: string;
  name: string;
}

interface Chip {
  id: string;
  type: "role" | "user";
  name: string;
}

export default function CoachManager({
  guildId,
  roles,
  initialCoachIds,
  initialResolvedUsers,
  onSave,
}: {
  guildId: string;
  roles: RoleOption[];
  initialCoachIds: string[];
  initialResolvedUsers: Member[];
  onSave: (guildId: string, coachIds: string[]) => Promise<void>;
}) {
  const roleById = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);
  const userById = useMemo(
    () => new Map(initialResolvedUsers.map((m) => [m.id, m])),
    [initialResolvedUsers]
  );

  const [chips, setChips] = useState<Chip[]>(() =>
    initialCoachIds.map((id) => {
      const role = roleById.get(id);
      if (role) return { id, type: "role" as const, name: role.name };
      const user = userById.get(id);
      return { id, type: "user" as const, name: user ? user.display_name : `Unknown user (${id})` };
    })
  );

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);

  const availableRoles = roles.filter((r) => !chips.some((c) => c.id === r.id));

  async function runSearch(value: string) {
    setQuery(value);
    setSaved(false);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/members?query=${encodeURIComponent(value)}`);
      const members = (await res.json()) as Member[];
      setResults(members.filter((m) => !chips.some((c) => c.id === m.id)));
    } finally {
      setSearching(false);
    }
  }

  function addChip(chip: Chip) {
    setChips((prev) => [...prev, chip]);
    setResults((prev) => prev.filter((m) => m.id !== chip.id));
    setSaved(false);
  }

  function removeChip(id: string) {
    setChips((prev) => prev.filter((c) => c.id !== id));
    setSaved(false);
  }

  function save() {
    startSaving(async () => {
      await onSave(
        guildId,
        chips.map((c) => c.id)
      );
      setSaved(true);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {chips.length === 0 && <p className="text-sm text-muted">No coaching staff assigned yet.</p>}
        {chips.map((chip) => (
          <span
            key={chip.id}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
              chip.type === "role"
                ? "border-info/40 bg-info/10 text-info"
                : "border-accent/40 bg-accent/10 text-accent"
            }`}
          >
            {chip.type === "role" ? "@" : ""}
            {chip.name}
            <button
              type="button"
              onClick={() => removeChip(chip.id)}
              className="ml-1 text-current opacity-60 hover:opacity-100"
              aria-label={`Remove ${chip.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Add a role</label>
          <select
            value=""
            onChange={(e) => {
              const role = roleById.get(e.target.value);
              if (role) addChip({ id: role.id, type: "role", name: role.name });
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="">Select a role…</option>
            {availableRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="mb-1 block text-xs font-medium text-muted">Add a specific member</label>
          <input
            value={query}
            onChange={(e) => runSearch(e.target.value)}
            placeholder="Search members…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
          {query && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
              {searching && <p className="px-3 py-2 text-xs text-muted">Searching…</p>}
              {!searching && results.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted">No matches.</p>
              )}
              {results.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    addChip({ id: m.id, type: "user", name: m.display_name });
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-hover"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.avatar_url} alt="" className="h-5 w-5 rounded-full" />
                  {m.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save coaching staff"}
        </button>
        {saved && <span className="text-xs text-success">Saved</span>}
      </div>
    </div>
  );
}
