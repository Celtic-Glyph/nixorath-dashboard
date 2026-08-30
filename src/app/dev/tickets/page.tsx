import { botApi, isBotUnreachable } from "@/lib/botApi";
import TicketCard from "@/components/TicketCard";
import BotOfflineState from "@/components/BotOfflineState";
import { sendReply, setStatus } from "./actions";

export default async function TicketsPage() {
  let tickets;
  try {
    tickets = await botApi.devListTickets();
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return <BotOfflineState />;
  }

  const open = tickets.filter((t) => t.status === "open");
  const closed = tickets.filter((t) => t.status === "closed");

  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Open tickets <span className="font-normal text-muted">({open.length})</span>
        </h2>
        {open.length === 0 ? (
          <p className="text-sm text-muted">No open tickets — you&apos;re all caught up.</p>
        ) : (
          <div className="space-y-3">
            {open.map((t) => (
              <TicketCard key={t.id} ticket={t} onReply={sendReply} onSetStatus={setStatus} />
            ))}
          </div>
        )}
      </section>

      {closed.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Closed <span className="font-normal text-muted">({closed.length})</span>
          </h2>
          <div className="space-y-3">
            {closed.map((t) => (
              <TicketCard key={t.id} ticket={t} onReply={sendReply} onSetStatus={setStatus} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
