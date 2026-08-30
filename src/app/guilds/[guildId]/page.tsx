import { botApi, isBotUnreachable } from "@/lib/botApi";
import StatCard from "@/components/StatCard";
import BotOfflineState from "@/components/BotOfflineState";

export default async function GuildOverviewPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  let config, coaches, reviews, pending;
  try {
    [config, coaches, reviews, pending] = await Promise.all([
      botApi.getConfig(guildId),
      botApi.listCoaches(guildId),
      botApi.listReviews(guildId, 1),
      botApi.listPendingReviews(guildId),
    ]);
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return <BotOfflineState />;
  }

  const ratedCoaches = coaches.filter((c) => c.avg_rating !== null);
  const avgRating =
    ratedCoaches.length > 0
      ? ratedCoaches.reduce((sum, c) => sum + (c.avg_rating ?? 0), 0) / ratedCoaches.length
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            config.setup_completed
              ? "bg-success/15 text-success"
              : "bg-warning/15 text-warning"
          }`}
        >
          {config.setup_completed ? "Setup wizard completed" : "Setup wizard not run yet"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Coaches" value={String(coaches.length)} />
        <StatCard
          label="Average rating"
          value={avgRating !== null ? avgRating.toFixed(1) : "—"}
          accent
        />
        <StatCard label="Total reviews" value={String(reviews.total)} />
        <StatCard label="Pending credits" value={String(pending.length)} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Configuration snapshot</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted uppercase">Coaches</dt>
            <dd className="mt-1 font-mono text-foreground">{config.coach_ids.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted uppercase">Member role</dt>
            <dd className="mt-1 font-mono text-foreground">
              {config.member_role_id ?? "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted uppercase">Review channel</dt>
            <dd className="mt-1 font-mono text-foreground">
              {config.review_channel_id ?? "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted uppercase">Booking channel</dt>
            <dd className="mt-1 font-mono text-foreground">
              {config.booking_channel_id ?? "Not set"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
