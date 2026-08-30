import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCode, fetchMe, discordAvatarUrl, appOrigin } from "@/lib/discord";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/?error=invalid_state", appOrigin()));
  }

  try {
    const tokens = await exchangeCode(code);
    const me = await fetchMe(tokens.access_token);

    const session = await getSession();
    session.discordId = me.id;
    session.username = me.username;
    session.avatar = discordAvatarUrl(me.id, me.avatar);
    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.expiresAt = Date.now() + tokens.expires_in * 1000;
    await session.save();

    return NextResponse.redirect(new URL("/guilds", appOrigin()));
  } catch (err) {
    console.error("OAuth callback failed", err);
    return NextResponse.redirect(new URL("/?error=oauth_failed", appOrigin()));
  }
}
