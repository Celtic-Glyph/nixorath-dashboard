"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession, SessionData } from "@/lib/session";
import { isDeveloper } from "@/lib/access";
import { botApi } from "@/lib/botApi";

async function assertDev(): Promise<SessionData> {
  const session = await getCurrentSession();
  if (!session || !isDeveloper(session)) {
    throw new Error("Developer access required.");
  }
  return session;
}

export async function setMaintenance(enabled: boolean) {
  const session = await assertDev();
  await botApi.devSetMaintenance(enabled, session.discordId);
  revalidatePath("/dev/moderation");
}

export async function updateBlacklist(action: "add" | "remove", targetId: string, reason?: string) {
  const session = await assertDev();
  await botApi.devUpdateBlacklist(action, targetId, reason, session.discordId);
  revalidatePath("/dev/moderation");
}
