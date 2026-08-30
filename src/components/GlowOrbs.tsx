export default function GlowOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="pulse-glow absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-white/20 blur-3xl" />
      <div
        className="pulse-glow absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-white/[0.15] blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="pulse-glow absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-white/[0.12] blur-3xl"
        style={{ animationDelay: "1s" }}
      />
    </div>
  );
}
