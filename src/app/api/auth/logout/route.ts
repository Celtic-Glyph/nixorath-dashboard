import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { appOrigin } from "@/lib/discord";

export async function POST() {
  const session = await getSession();
  await session.destroy();
  return NextResponse.redirect(new URL("/", appOrigin()));
}
