import { botApi, isBotUnreachable } from "@/lib/botApi";
import CoachManager from "@/components/CoachManager";
import SelectField from "@/components/SelectField";
import BotOfflineState from "@/components/BotOfflineState";
import { updateChannelOrRole, updateCoachIds } from "./actions";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  let guild, config, resolvedCoachUsers;
  try {
    [guild, config] = await Promise.all([botApi.getGuild(guildId), botApi.getConfig(guildId)]);
    resolvedCoachUsers = await botApi.resolveMembers(guildId, config.coach_ids);
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return <BotOfflineState />;
  }

  const roleOptions = guild.roles.map((r) => ({ id: r.id, name: r.name }));
  const channelOptions = guild.channels.map((c) => ({ id: c.id, name: `#${c.name}` }));

  return (
    <div className="max-w-2xl space-y-8">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Coaching staff</h2>
        <p className="mt-1 text-xs text-muted">
          Roles and/or specific members who count as coaches — grants access to{" "}
          <code>/sessioncomplete</code> and <code>/claim</code>.
        </p>
        <div className="mt-4">
          <CoachManager
            guildId={guildId}
            roles={roleOptions}
            initialCoachIds={config.coach_ids}
            initialResolvedUsers={resolvedCoachUsers}
            onSave={updateCoachIds}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Roles &amp; channels</h2>
        <div className="mt-4 space-y-4">
          <SelectField
            label="Member / access role"
            initialValue={config.member_role_id}
            options={roleOptions}
            placeholder="No role set"
            onSave={updateChannelOrRole.bind(null, guildId, "member_role_id")}
          />
          <SelectField
            label="Review logs channel"
            initialValue={config.review_channel_id}
            options={channelOptions}
            placeholder="No channel set"
            onSave={updateChannelOrRole.bind(null, guildId, "review_channel_id")}
          />
          <SelectField
            label="Pricing / booking channel"
            initialValue={config.booking_channel_id}
            options={channelOptions}
            placeholder="No channel set"
            onSave={updateChannelOrRole.bind(null, guildId, "booking_channel_id")}
          />
        </div>
      </section>
    </div>
  );
}
