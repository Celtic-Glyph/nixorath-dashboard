import { botApi, isBotUnreachable } from "@/lib/botApi";
import AuditTable from "@/components/AuditTable";
import BotOfflineState from "@/components/BotOfflineState";

export default async function GuildAuditPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  let entries, actors;
  try {
    entries = await botApi.listAudit(guildId);
    const actorIds = [...new Set(entries.map((e) => e.actor_id))].filter((id) => id !== "unknown");
    actors = await botApi.resolveMembers(guildId, actorIds);
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return <BotOfflineState />;
  }

  const actorNameById = new Map(actors.map((a) => [a.id, a.display_name]));

  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        A record of every change made through this dashboard for this server.
      </p>
      <AuditTable entries={entries} actorNameById={actorNameById} />
    </div>
  );
}
