import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { canManageGuild } from "@/lib/access";
import { botApi } from "@/lib/botApi";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;
  const session = await getCurrentSession();
  if (!session || !(await canManageGuild(session, guildId))) {
    return NextResponse.json({ error: "not authorized" }, { status: 403 });
  }

  const query = request.nextUrl.searchParams.get("query") ?? "";
  const members = await botApi.listMembers(guildId, query);
  return NextResponse.json(members);
}
