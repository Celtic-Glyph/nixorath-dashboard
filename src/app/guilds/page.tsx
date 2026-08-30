import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { getAccessibleGuilds, getInvitableGuilds } from "@/lib/access";
import { isBotUnreachable, BotGuild } from "@/lib/botApi";
import { buildBotInviteUrl, discordGuildIconUrl, DiscordUserGuild } from "@/lib/discord";
import TopBar from "@/components/TopBar";
import BotOfflineState from "@/components/BotOfflineState";

export default async function GuildPickerPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  let guilds: BotGuild[];
  let invitable: DiscordUserGuild[];
  try {
    [guilds, invitable] = await Promise.all([
      getAccessibleGuilds(session),
      getInvitableGuilds(session),
    ]);
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return (
      <div className="flex min-h-screen flex-col">
        <TopBar title="Select a server" username={session.username} avatarUrl={session.avatar} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
          <BotOfflineState />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title="Select a server" username={session.username} avatarUrl={session.avatar} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Your servers</h2>
          <a
            href={buildBotInviteUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold"
          >
            + Invite Nixorath
          </a>
        </div>

        {guilds.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center">
            <p className="text-foreground">No manageable servers found.</p>
            <p className="mt-2 text-sm text-muted">
              You need Administrator permission on a server that Nixorath is already in — or
              invite it to one above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {guilds.map((guild) => (
              <Link
                key={guild.id}
                href={`/guilds/${guild.id}`}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center transition hover:border-accent/50 hover:bg-surface-hover"
              >
                {guild.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={guild.icon} alt="" className="h-14 w-14 rounded-2xl" />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover text-lg font-bold text-muted">
                    {guild.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div>
                  <p className="truncate text-sm font-semibold text-foreground">{guild.name}</p>
                  <p className="text-xs text-muted">{guild.member_count} members</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {invitable.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Servers you manage without Nixorath yet
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {invitable.map((guild) => (
                <div
                  key={guild.id}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 p-5 text-center"
                >
                  {guild.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={discordGuildIconUrl(guild.id, guild.icon) ?? undefined}
                      alt=""
                      className="h-14 w-14 rounded-2xl opacity-70"
                    />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover text-lg font-bold text-muted">
                      {guild.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <p className="truncate text-sm font-medium text-muted">{guild.name}</p>
                  <a
                    href={buildBotInviteUrl(guild.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20"
                  >
                    Invite here
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
