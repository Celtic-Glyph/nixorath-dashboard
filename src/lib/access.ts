import "server-only";
import { SessionData } from "./session";
import { fetchMyGuilds, DiscordUserGuild } from "./discord";
import { isAdministrator } from "./permissions";
import { botApi, BotGuild } from "./botApi";

// Guilds where the session's user is both a Discord Administrator AND the
// bot is actually present. Fetched live from Discord on every call rather
// than cached in the session cookie — a user's full guild list can be large
// enough to blow past the ~4KB cookie size limit.
export async function getAccessibleGuilds(session: SessionData): Promise<BotGuild[]> {
  const botGuilds = await botApi.listGuilds();
  if (process.env.DEV_FAKE_SESSION === "true") {
    return botGuilds;
  }
  const userGuilds = await fetchMyGuilds(session.accessToken);
  const adminGuildIds = new Set(
    userGuilds.filter((g) => isAdministrator(g.permissions)).map((g) => g.id)
  );
  return botGuilds.filter((g) => adminGuildIds.has(g.id));
}

// Servers the user administers where the bot ISN'T present yet — so the
// guild picker can offer a one-click invite for each, instead of just
// silently omitting them.
export async function getInvitableGuilds(session: SessionData): Promise<DiscordUserGuild[]> {
  if (process.env.DEV_FAKE_SESSION === "true") return [];
  const [botGuilds, userGuilds] = await Promise.all([
    botApi.listGuilds(),
    fetchMyGuilds(session.accessToken),
  ]);
  const botGuildIds = new Set(botGuilds.map((g) => g.id));
  return userGuilds.filter((g) => isAdministrator(g.permissions) && !botGuildIds.has(g.id));
}

export async function canManageGuild(session: SessionData, guildId: string): Promise<boolean> {
  if (process.env.DEV_FAKE_SESSION === "true") return true;
  const userGuilds = await fetchMyGuilds(session.accessToken);
  const guild = userGuilds.find((g) => g.id === guildId);
  return !!guild && isAdministrator(guild.permissions);
}

export function isDeveloper(session: SessionData): boolean {
  return session.discordId === process.env.DEV_DISCORD_ID;
}
