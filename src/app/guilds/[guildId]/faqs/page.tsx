import { botApi, isBotUnreachable } from "@/lib/botApi";
import FaqManager from "@/components/FaqManager";
import BotOfflineState from "@/components/BotOfflineState";
import { saveFaq, removeFaq } from "./actions";

export default async function FaqsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  let faqs;
  try {
    faqs = await botApi.listFaqs(guildId);
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return <BotOfflineState />;
  }

  return (
    <div className="max-w-2xl">
      <FaqManager guildId={guildId} initialFaqs={faqs} onSave={saveFaq} onDelete={removeFaq} />
    </div>
  );
}
