import { botApi, isBotUnreachable } from "@/lib/botApi";
import StatCard from "@/components/StatCard";
import BotOfflineState from "@/components/BotOfflineState";

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

export default async function DevOverviewPage() {
  let stats, guilds;
  try {
    [stats, guilds] = await Promise.all([botApi.devStats(), botApi.devGuilds()]);
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return <BotOfflineState />;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Uptime" value={formatUptime(stats.uptime_seconds)} />
        <StatCard label="Latency" value={`${stats.latency_ms} ms`} />
        <StatCard label="CPU" value={`${stats.cpu_percent}%`} />
        <StatCard label="RAM" value={`${stats.ram_percent}%`} />
        <StatCard label="Servers" value={String(stats.total_guilds)} accent />
        <StatCard label="Users" value={String(stats.total_users)} accent />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">All servers</h2>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">Server</th>
                <th className="px-4 py-2.5 font-medium">Owner</th>
                <th className="px-4 py-2.5 font-medium">Members</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {guilds.map((g) => (
                <tr key={g.id} className="bg-surface/40">
                  <td className="flex items-center gap-2 px-4 py-2.5 text-foreground">
                    {g.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.icon} alt="" className="h-5 w-5 rounded-md" />
                    ) : (
                      <span className="h-5 w-5 rounded-md bg-surface-hover" />
                    )}
                    {g.name}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{g.owner_name ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-foreground">{g.member_count}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">
                    {new Date(g.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
