import { botApi, isBotUnreachable } from "@/lib/botApi";
import Toggle from "@/components/Toggle";
import BlacklistManager from "@/components/BlacklistManager";
import BotOfflineState from "@/components/BotOfflineState";
import { setMaintenance, updateBlacklist } from "./actions";

export default async function ModerationPage() {
  let maintenance, blacklist;
  try {
    [maintenance, blacklist] = await Promise.all([
      botApi.devGetMaintenance(),
      botApi.devGetBlacklist(),
    ]);
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return <BotOfflineState />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Maintenance mode</h2>
            <p className="mt-1 text-xs text-muted">
              Blocks all non-developer command usage across every server while enabled.
            </p>
          </div>
          <Toggle initialEnabled={maintenance.enabled} onToggle={setMaintenance} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Blacklist</h2>
        <p className="mt-1 text-xs text-muted">
          Blocked user or server IDs — every command is rejected for them, everywhere.
        </p>
        <div className="mt-4">
          <BlacklistManager initialEntries={blacklist} onUpdate={updateBlacklist} />
        </div>
      </section>
    </div>
  );
}
