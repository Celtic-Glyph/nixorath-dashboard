"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession, SessionData } from "@/lib/session";
import { canManageGuild } from "@/lib/access";
import { botApi } from "@/lib/botApi";

async function assertAccess(guildId: string): Promise<SessionData> {
  const session = await getCurrentSession();
  if (!session || !(await canManageGuild(session, guildId))) {
    throw new Error("Not authorized to manage this server.");
  }
  return session;
}

export async function updateChannelOrRole(
  guildId: string,
  field: "member_role_id" | "review_channel_id" | "booking_channel_id",
  value: string
) {
  const session = await assertAccess(guildId);
  await botApi.patchConfig(guildId, { [field]: value || null }, session.discordId);
  revalidatePath(`/guilds/${guildId}/settings`);
  revalidatePath(`/guilds/${guildId}`);
}

export async function updateCoachIds(guildId: string, coachIds: string[]) {
  const session = await assertAccess(guildId);
  await botApi.patchConfig(guildId, { coach_ids: coachIds }, session.discordId);
  revalidatePath(`/guilds/${guildId}/settings`);
  revalidatePath(`/guilds/${guildId}`);
  revalidatePath(`/guilds/${guildId}/coaches`);
}
