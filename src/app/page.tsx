import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getCurrentSession();
  if (session) redirect("/guilds");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-md">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-neutral-400 text-xl font-bold text-black">
          N
        </span>
        <h1 className="text-xl font-bold text-white">Nixorath Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Manage coaching staff, server settings, and FAQs for your server.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error === "invalid_state"
              ? "Login expired or was tampered with — please try again."
              : "Something went wrong signing you in — please try again."}
          </p>
        )}

        <a
          href="/api/auth/login"
          className="btn-primary mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
        >
          Sign in with Discord
        </a>
      </div>
    </main>
  );
}
