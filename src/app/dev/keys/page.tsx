import { botApi, isBotUnreachable } from "@/lib/botApi";
import KeyGenerator from "@/components/KeyGenerator";
import KeyRequestCard from "@/components/KeyRequestCard";
import BotOfflineState from "@/components/BotOfflineState";
import { generateKey, fulfillRequest } from "./actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default async function KeysPage() {
  let keys, keyRequests;
  try {
    [keys, keyRequests] = await Promise.all([botApi.devListKeys(), botApi.devListKeyRequests()]);
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return <BotOfflineState />;
  }
  const sorted = [...keys].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const pendingRequests = keyRequests.filter((r) => r.status === "pending");
  const fulfilledRequests = keyRequests.filter((r) => r.status === "fulfilled");

  return (
    <div className="max-w-3xl space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Pending key requests <span className="font-normal text-muted">({pendingRequests.length})</span>
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-muted">No pending requests from /requestcode.</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((r) => (
              <KeyRequestCard key={r.id} request={r} onFulfill={fulfillRequest} />
            ))}
          </div>
        )}
      </section>

      <KeyGenerator onGenerate={generateKey} />

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Issued keys</h2>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">Key</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Redeemed by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-muted">
                    No keys issued yet.
                  </td>
                </tr>
              )}
              {sorted.map((k) => (
                <tr key={k.key} className="bg-surface/40">
                  <td className="px-4 py-2.5 font-mono text-foreground">{k.key}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{formatDate(k.created_at)}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        k.used ? "bg-muted/15 text-muted" : "bg-success/15 text-success"
                      }`}
                    >
                      {k.used ? "Used" : "Unused"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">
                    {k.used_by ? `${k.used_by} (guild ${k.guild_id})` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {fulfilledRequests.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Fulfilled requests <span className="font-normal text-muted">({fulfilledRequests.length})</span>
          </h2>
          <div className="space-y-3">
            {fulfilledRequests.map((r) => (
              <KeyRequestCard key={r.id} request={r} onFulfill={fulfillRequest} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
