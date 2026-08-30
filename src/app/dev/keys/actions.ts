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

export async function generateKey(targetUserId: string) {
  const session = await assertDev();
  const result = await botApi.devGenerateKey(targetUserId, session.discordId);
  revalidatePath("/dev/keys");
  return result;
}
