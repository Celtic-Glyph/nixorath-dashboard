import "server-only";

const BASE = process.env.BOT_API_URL ?? "http://127.0.0.1:5055";
const SECRET = process.env.BOT_API_SECRET ?? "";

// Thrown specifically when the bot process itself can't be reached at all
// (down, restarting, network-level failure) — distinct from the bot being up
// but returning an error response. Pages catch this one to show a friendly
// "bot is offline" state instead of crashing.
export class BotUnreachableError extends Error {
  constructor() {
    super("The Nixorath bot isn't reachable right now.");
    this.name = "BotUnreachableError";
  }
}

export function isBotUnreachable(err: unknown): err is BotUnreachableError {
  return err instanceof BotUnreachableError;
}

async function botFetch<T>(path: string, init: RequestInit = {}, actingUserId?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
        Authorization: `Bearer ${SECRET}`,
        ...(actingUserId ? { "X-Acting-User-Id": actingUserId } : {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new BotUnreachableError();
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bot API ${path} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface BotGuild {
  id: string;
  name: string;
  icon: string | null;
  member_count: number;
}

export interface GuildDetail extends BotGuild {
  roles: { id: string; name: string; color: string; position: number }[];
  channels: { id: string; name: string }[];
  setup_completed: boolean;
}

export interface Member {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export interface GuildConfig {
  coach_ids: string[];
  member_role_id: string | null;
  review_channel_id: string | null;
  booking_channel_id: string | null;
  setup_completed: boolean;
}

export interface Faq {
  keyword: string;
  title: string;
  response: string;
}

export interface Coach extends Member {
  avg_rating: number | null;
  review_count: number;
}

export interface Review {
  coach_id: number;
  student_id: number;
  rating: number;
  feedback: string;
  timestamp: string;
}

export interface PendingReview {
  student_id: string;
  coach_id: number;
  granted_at: string;
}

export interface DevStats {
  uptime_seconds: number;
  cpu_percent: number;
  ram_percent: number;
  latency_ms: number;
  total_guilds: number;
  total_users: number;
}

export interface DevGuild extends BotGuild {
  owner_id: string | null;
  owner_name: string | null;
  created_at: string;
}

export interface AuthKey {
  key: string;
  created_at: string;
  used: boolean;
  used_by?: string;
  guild_id?: string;
}

export interface KeyRequest {
  id: string;
  guild_id: string | null;
  guild_name: string;
  channel_id: string | null;
  user_id: string | null;
  user_name: string;
  created_at: string;
  status: "pending" | "fulfilled";
}

export interface TicketReply {
  method: "server" | "dm";
  message: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  guild_id: string | null;
  guild_name: string;
  channel_id: string | null;
  user_id: string | null;
  user_name: string;
  message: string;
  created_at: string;
  status: "open" | "closed";
  replies: TicketReply[];
}

export interface BlacklistEntry {
  id: string;
  reason: string;
}

export interface AuditEntry {
  timestamp: string;
  actor_id: string;
  guild_id: string | null;
  action: string;
  detail: string;
}

export const botApi = {
  health: () => botFetch<{ status: string; uptime_seconds: number; guilds: number }>("/internal/health"),

  listGuilds: () => botFetch<BotGuild[]>("/internal/guilds"),
  getGuild: (id: string) => botFetch<GuildDetail>(`/internal/guilds/${id}`),
  listMembers: (id: string, query = "") =>
    botFetch<Member[]>(`/internal/guilds/${id}/members?query=${encodeURIComponent(query)}`),
  resolveMembers: (id: string, ids: string[]) =>
    ids.length === 0
      ? Promise.resolve([] as Member[])
      : botFetch<Member[]>(`/internal/guilds/${id}/members?ids=${ids.join(",")}`),

  getConfig: (id: string) => botFetch<GuildConfig>(`/internal/guilds/${id}/config`),
  patchConfig: (
    id: string,
    body: Partial<{
      coach_ids: string[];
      member_role_id: string | null;
      review_channel_id: string | null;
      booking_channel_id: string | null;
    }>,
    actingUserId?: string
  ) =>
    botFetch<GuildConfig>(
      `/internal/guilds/${id}/config`,
      { method: "PATCH", body: JSON.stringify(body) },
      actingUserId
    ),

  listFaqs: (id: string) => botFetch<Faq[]>(`/internal/guilds/${id}/faqs`),
  upsertFaq: (id: string, keyword: string, title: string, response: string, actingUserId?: string) =>
    botFetch<Faq>(
      `/internal/guilds/${id}/faqs/${encodeURIComponent(keyword)}`,
      { method: "PUT", body: JSON.stringify({ title, response }) },
      actingUserId
    ),
  deleteFaq: (id: string, keyword: string, actingUserId?: string) =>
    botFetch(
      `/internal/guilds/${id}/faqs/${encodeURIComponent(keyword)}`,
      { method: "DELETE" },
      actingUserId
    ),

  listCoaches: (id: string) => botFetch<Coach[]>(`/internal/guilds/${id}/coaches`),
  listReviews: (id: string, limit = 50, offset = 0) =>
    botFetch<{ total: number; reviews: Review[] }>(`/internal/guilds/${id}/reviews?limit=${limit}&offset=${offset}`),
  listPendingReviews: (id: string) => botFetch<PendingReview[]>(`/internal/guilds/${id}/pending-reviews`),

  devStats: () => botFetch<DevStats>("/internal/dev/stats"),
  devGuilds: () => botFetch<DevGuild[]>("/internal/dev/guilds"),
  devListKeys: () => botFetch<AuthKey[]>("/internal/dev/keys"),
  devGenerateKey: (targetUserId: string, actingUserId?: string) =>
    botFetch<{ key: string; dmed: boolean }>(
      "/internal/dev/keys",
      { method: "POST", body: JSON.stringify({ target_user_id: targetUserId }) },
      actingUserId
    ),
  devListKeyRequests: () => botFetch<KeyRequest[]>("/internal/dev/key-requests"),
  devFulfillKeyRequest: (requestId: string, actingUserId?: string) =>
    botFetch<{ key: string; dmed: boolean }>(
      `/internal/dev/key-requests/${requestId}/fulfill`,
      { method: "POST" },
      actingUserId
    ),

  devGetMaintenance: () => botFetch<{ enabled: boolean }>("/internal/dev/maintenance"),
  devSetMaintenance: (enabled: boolean, actingUserId?: string) =>
    botFetch<{ enabled: boolean }>(
      "/internal/dev/maintenance",
      { method: "POST", body: JSON.stringify({ enabled }) },
      actingUserId
    ),
  devGetBlacklist: () => botFetch<BlacklistEntry[]>("/internal/dev/blacklist"),
  devUpdateBlacklist: (action: "add" | "remove", targetId: string, reason?: string, actingUserId?: string) =>
    botFetch<{ blacklisted_ids: string[] }>(
      "/internal/dev/blacklist",
      { method: "POST", body: JSON.stringify({ action, target_id: targetId, reason }) },
      actingUserId
    ),

  listAudit: (guildId?: string, limit = 100) =>
    botFetch<AuditEntry[]>(
      `/internal/audit?limit=${limit}${guildId ? `&guild_id=${guildId}` : ""}`
    ),

  devListTickets: () => botFetch<Ticket[]>("/internal/dev/tickets"),
  devReplyToTicket: (
    ticketId: string,
    method: "server" | "dm",
    message: string,
    actingUserId?: string
  ) =>
    botFetch<{ ok: boolean; error: string | null }>(
      `/internal/dev/tickets/${ticketId}/reply`,
      { method: "POST", body: JSON.stringify({ method, message }) },
      actingUserId
    ),
  devSetTicketStatus: (ticketId: string, status: "open" | "closed", actingUserId?: string) =>
    botFetch<{ ok: boolean }>(
      `/internal/dev/tickets/${ticketId}/status`,
      { method: "POST", body: JSON.stringify({ status }) },
      actingUserId
    ),
};
