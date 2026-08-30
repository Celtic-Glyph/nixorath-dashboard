import { botApi, isBotUnreachable } from "@/lib/botApi";
import AuditTable from "@/components/AuditTable";
import BotOfflineState from "@/components/BotOfflineState";

export default async function DevAuditPage() {
  let entries;
  try {
    entries = await botApi.listAudit();
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return <BotOfflineState />;
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Every dashboard-driven change across every server, including developer-only actions.
      </p>
      <AuditTable entries={entries} showGuild />
    </div>
  );
}
