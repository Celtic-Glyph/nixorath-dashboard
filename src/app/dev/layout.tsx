import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { getAccessibleGuilds, isDeveloper } from "@/lib/access";
import { isBotUnreachable } from "@/lib/botApi";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default async function DevLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/");
  if (!isDeveloper(session)) redirect("/guilds?error=not_authorized");

  // Keep the guild nav (Overview/Settings/Coaches/FAQs) visible alongside the
  // Developer section instead of replacing it — same as the guild layout,
  // just anchored to the first server this account manages. If the bot is
  // offline this just falls back to no guild context; the child dev pages
  // show their own offline state independently.
  let guild;
  try {
    guild = (await getAccessibleGuilds(session))[0];
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    guild = undefined;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar guild={guild} isDev />
      <div className="flex flex-1 flex-col">
        <TopBar title="Developer" username={session.username} avatarUrl={session.avatar} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
