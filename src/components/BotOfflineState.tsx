export default function BotOfflineState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-warning/30 bg-warning/5 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/15 text-2xl">
        🔌
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">Bot is offline</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Nixorath isn&apos;t reachable right now — it may be restarting. This page will work
          again once it reconnects.
        </p>
      </div>
    </div>
  );
}
