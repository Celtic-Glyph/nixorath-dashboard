import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { canManageGuild, isDeveloper } from "@/lib/access";
import { botApi, isBotUnreachable, GuildDetail } from "@/lib/botApi";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import BotOfflineState from "@/components/BotOfflineState";

export default async function GuildLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const session = await getCurrentSession();
  if (!session) redirect("/");
  if (!(await canManageGuild(session, guildId))) redirect("/guilds?error=not_authorized");

  let guild: GuildDetail | null;
  try {
    guild = await botApi.getGuild(guildId);
  } catch (err) {
    if (isBotUnreachable(err)) {
      return (
        <div className="flex min-h-screen">
          <Sidebar isDev={isDeveloper(session)} />
          <div className="flex flex-1 flex-col">
            <TopBar title="Nixorath" username={session.username} avatarUrl={session.avatar} />
            <main className="flex-1 px-6 py-6">
              <BotOfflineState />
            </main>
          </div>
        </div>
      );
    }
    guild = null;
  }
  if (!guild) redirect("/guilds?error=guild_not_found");

  return (
    <div className="flex min-h-screen">
      <Sidebar guild={{ id: guild.id, name: guild.name, icon: guild.icon }} isDev={isDeveloper(session)} />
      <div className="flex flex-1 flex-col">
        <TopBar title={guild.name} username={session.username} avatarUrl={session.avatar} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
