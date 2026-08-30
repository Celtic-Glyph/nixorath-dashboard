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

export async function saveFaq(guildId: string, keyword: string, title: string, response: string) {
  const session = await assertAccess(guildId);
  await botApi.upsertFaq(guildId, keyword, title, response, session.discordId);
  revalidatePath(`/guilds/${guildId}/faqs`);
}

export async function removeFaq(guildId: string, keyword: string) {
  const session = await assertAccess(guildId);
  await botApi.deleteFaq(guildId, keyword, session.discordId);
  revalidatePath(`/guilds/${guildId}/faqs`);
}
