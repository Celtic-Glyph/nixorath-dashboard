export default function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p
        className={`mt-1.5 font-mono text-2xl font-semibold ${accent ? "text-accent" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}
