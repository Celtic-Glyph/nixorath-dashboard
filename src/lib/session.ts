import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

// Session cookies have a hard ~4KB size limit, and a user's full Discord
// guild list can easily blow past that (iron-session hit "Cookie length is
// too big" for accounts in a lot of servers) — so the guild list is never
// stored here. It's fetched fresh from Discord using the access token
// whenever a permission check needs it (see lib/access.ts).
export interface SessionData {
  discordId: string;
  username: string;
  avatar: string | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me-before-shipping",
  cookieName: "nixorath_dashboard_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

// Raw iron-session accessor — used by the OAuth login/callback/logout routes,
// which need to mutate and .save()/.destroy() the session.
export async function getSession() {
  return getIronSession<Partial<SessionData>>(await cookies(), sessionOptions);
}

// Dev-only escape hatch so pages/layouts can be built and verified with the
// Browser tool before real Discord OAuth credentials exist. Every page reads
// the session through getCurrentSession(), so this is the only place that
// needs to change (and eventually be deleted) once real OAuth is verified.
const FAKE_SESSION: SessionData = {
  discordId: process.env.DEV_FAKE_DISCORD_ID ?? process.env.DEV_DISCORD_ID ?? "0",
  username: "Dev Preview",
  avatar: null,
  accessToken: "fake",
  refreshToken: "fake",
  expiresAt: Date.now() + 1000 * 60 * 60,
};

// Read-only session accessor for pages/layouts. Transparently refreshes an
// expired Discord access token before handing back session data.
export async function getCurrentSession(): Promise<SessionData | null> {
  // Hard gate on NODE_ENV, not just the flag — so this bypass can never fire
  // in a production build even if DEV_FAKE_SESSION is left set by mistake.
  if (process.env.DEV_FAKE_SESSION === "true" && process.env.NODE_ENV !== "production") {
    return FAKE_SESSION;
  }

  const session = await getSession();
  if (!session.discordId || !session.accessToken) return null;

  if (session.expiresAt && session.expiresAt < Date.now()) {
    try {
      const { refreshAccessToken } = await import("./discord");
      const tokens = await refreshAccessToken(session.refreshToken!);
      session.accessToken = tokens.access_token;
      session.refreshToken = tokens.refresh_token;
      session.expiresAt = Date.now() + tokens.expires_in * 1000;
      await session.save();
    } catch {
      await session.destroy();
      return null;
    }
  }

  // Bot-side blacklist check, done once here rather than threaded through
  // every API call — this is the single choke point every page goes through.
  // Fails OPEN (lets the session through) if the bot itself is unreachable,
  // since a restarting bot shouldn't lock the operator out of their own
  // dashboard; guild-level blacklisting is still enforced by the bot itself
  // once it's back up.
  try {
    const { botApi } = await import("./botApi");
    const blacklist = await botApi.devGetBlacklist();
    if (blacklist.some((entry) => entry.id === session.discordId)) {
      await session.destroy();
      return null;
    }
  } catch {
    // bot unreachable — fail open, see comment above
  }

  return session as SessionData;
}
