import "server-only";

const DISCORD_API = "https://discord.com/api/v10";

// Behind a reverse proxy (Caddy), a request's own perceived host/protocol
// isn't reliable for building redirect targets — it can resolve to the
// backend's local bind address instead of the real public domain. Derive
// the app's real origin from the one absolute URL we already require to be
// configured correctly, instead of trusting request.url.
export function appOrigin(): string {
  return new URL(process.env.DISCORD_REDIRECT_URI ?? "http://localhost:3000").origin;
}

// View Channels, Send Messages, Embed Links, Attach Files, Read Message
// History — the minimal set Nixorath actually uses (embeds, review posts,
// DMs handled outside guild perms, log exports).
const BOT_INVITE_PERMISSIONS = "117760";

export function buildBotInviteUrl(guildId?: string) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID ?? "",
    scope: "bot applications.commands",
    permissions: BOT_INVITE_PERMISSIONS,
  });
  if (guildId) {
    params.set("guild_id", guildId);
    params.set("disable_guild_select", "true");
  }
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export function buildAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID ?? "",
    redirect_uri: process.env.DISCORD_REDIRECT_URI ?? "",
    response_type: "code",
    scope: "identify guilds",
    state,
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

async function tokenRequest(body: URLSearchParams): Promise<TokenResponse> {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Discord token request failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<TokenResponse>;
}

export function exchangeCode(code: string) {
  return tokenRequest(
    new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID ?? "",
      client_secret: process.env.DISCORD_CLIENT_SECRET ?? "",
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI ?? "",
    })
  );
}

export function refreshAccessToken(refreshToken: string) {
  return tokenRequest(
    new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID ?? "",
      client_secret: process.env.DISCORD_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })
  );
}

// Discord's API returns just an avatar hash, not a usable image URL — this
// builds the actual CDN URL (animated avatars get a "a_" hash prefix and
// need .gif instead of .png).
export function discordAvatarUrl(userId: string, avatarHash: string | null): string | null {
  if (!avatarHash) return null;
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=128`;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
}

export async function fetchMe(accessToken: string): Promise<DiscordUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Discord fetchMe failed: ${res.status}`);
  return res.json() as Promise<DiscordUser>;
}

export interface DiscordUserGuild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
}

// Same deal as discordAvatarUrl — /users/@me/guilds returns an icon hash,
// not a URL. Guild icons don't have animated-hash prefixes like avatars do.
export function discordGuildIconUrl(guildId: string, iconHash: string | null): string | null {
  if (!iconHash) return null;
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png?size=128`;
}

// Discord's rate limit on this specific endpoint is notably tight, and every
// permission check in lib/access.ts calls it — a single page load can easily
// trigger 2+ concurrent calls (e.g. the guild picker fetches both accessible
// and invitable guilds in parallel), and normal clicking around multiplies
// that fast. Cache per-token (including in-flight requests, so concurrent
// callers share one HTTP call instead of each firing their own) for a short
// TTL — long enough to absorb a burst of navigation/saves, short enough that
// permission changes still show up promptly.
interface GuildsCacheEntry {
  promise: Promise<DiscordUserGuild[]>;
  expiresAt: number;
}
const guildsCache = new Map<string, GuildsCacheEntry>();
const GUILDS_CACHE_TTL_MS = 45_000;

export function fetchMyGuilds(accessToken: string): Promise<DiscordUserGuild[]> {
  const cached = guildsCache.get(accessToken);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const promise = (async () => {
    const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      guildsCache.delete(accessToken);
      throw new Error(`Discord fetchMyGuilds failed: ${res.status}`);
    }
    return res.json() as Promise<DiscordUserGuild[]>;
  })();

  guildsCache.set(accessToken, { promise, expiresAt: Date.now() + GUILDS_CACHE_TTL_MS });
  return promise;
}
