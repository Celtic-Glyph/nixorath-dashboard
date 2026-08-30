"use client";

import { useState, useTransition } from "react";

export default function SelectField({
  label,
  initialValue,
  options,
  placeholder,
  onSave,
}: {
  label: string;
  initialValue: string | null;
  options: { id: string; name: string }[];
  placeholder: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setDirty(true);
            setSaved(false);
          }}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() =>
            startSaving(async () => {
              await onSave(value);
              setDirty(false);
              setSaved(true);
            })
          }
          className="shrink-0 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {saved && <p className="mt-1 text-xs text-success">Saved</p>}
    </div>
  );
}
