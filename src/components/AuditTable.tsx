import type { AuditEntry } from "@/lib/botApi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const ACTION_LABELS: Record<string, string> = {
  "config.update": "Settings updated",
  "faq.upsert": "FAQ added/updated",
  "faq.delete": "FAQ removed",
  "key.generate": "Setup key generated",
  "maintenance.set": "Maintenance mode changed",
  "blacklist.update": "Blacklist updated",
  "ticket.reply": "Ticket reply sent",
  "ticket.status": "Ticket status changed",
};

export default function AuditTable({
  entries,
  actorNameById,
  showGuild = false,
}: {
  entries: AuditEntry[];
  actorNameById?: Map<string, string>;
  showGuild?: boolean;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted">No changes recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface text-xs text-muted uppercase">
          <tr>
            <th className="px-4 py-2.5 font-medium">When</th>
            <th className="px-4 py-2.5 font-medium">Who</th>
            {showGuild && <th className="px-4 py-2.5 font-medium">Server</th>}
            <th className="px-4 py-2.5 font-medium">Action</th>
            <th className="px-4 py-2.5 font-medium">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entries.map((entry, i) => (
            <tr key={i} className="bg-surface/40">
              <td className="px-4 py-2.5 font-mono text-xs text-muted">
                {formatDate(entry.timestamp)}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-foreground">
                {actorNameById?.get(entry.actor_id) ?? entry.actor_id}
              </td>
              {showGuild && (
                <td className="px-4 py-2.5 font-mono text-xs text-muted">
                  {entry.guild_id ?? "—"}
                </td>
              )}
              <td className="px-4 py-2.5 text-foreground">
                {ACTION_LABELS[entry.action] ?? entry.action}
              </td>
              <td className="px-4 py-2.5 text-muted">{entry.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
