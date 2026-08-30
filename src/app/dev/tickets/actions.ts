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

export async function sendReply(ticketId: string, method: "server" | "dm", message: string) {
  const session = await assertDev();
  const result = await botApi.devReplyToTicket(ticketId, method, message, session.discordId);
  revalidatePath("/dev/tickets");
  return result;
}

export async function setStatus(ticketId: string, status: "open" | "closed") {
  const session = await assertDev();
  await botApi.devSetTicketStatus(ticketId, status, session.discordId);
  revalidatePath("/dev/tickets");
}
