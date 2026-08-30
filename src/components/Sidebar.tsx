"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function NavLink({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-accent/15 text-accent"
          : "text-muted hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Sidebar({
  guild,
  isDev,
}: {
  guild?: { id: string; name: string; icon: string | null };
  isDev: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="fixed top-3.5 left-4 z-40 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground md:hidden"
      >
        ☰
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface px-3 py-4 transition-transform md:static md:z-auto md:w-60 md:translate-x-0 md:bg-surface/60 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/guilds" onClick={() => setOpen(false)} className="mb-4 flex items-center gap-2 px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-white to-neutral-400 text-sm font-bold text-black">
            N
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground">Nixorath</span>
        </Link>

        {guild && (
          <Link
            href="/guilds"
            onClick={() => setOpen(false)}
            className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 hover:border-accent/40"
          >
            {guild.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={guild.icon} alt="" className="h-6 w-6 rounded-md" />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-hover text-[10px] font-bold text-muted">
                {guild.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="truncate text-sm font-medium text-foreground">{guild.name}</span>
            <span className="ml-auto text-xs text-muted">↕</span>
          </Link>
        )}

        {guild && (
          <nav className="flex flex-col gap-1">
            <NavLink href={`/guilds/${guild.id}`} onNavigate={() => setOpen(false)}>
              Overview
            </NavLink>
            <NavLink href={`/guilds/${guild.id}/settings`} onNavigate={() => setOpen(false)}>
              Settings
            </NavLink>
            <NavLink href={`/guilds/${guild.id}/coaches`} onNavigate={() => setOpen(false)}>
              Coaches &amp; Reviews
            </NavLink>
            <NavLink href={`/guilds/${guild.id}/faqs`} onNavigate={() => setOpen(false)}>
              FAQs
            </NavLink>
            <NavLink href={`/guilds/${guild.id}/audit`} onNavigate={() => setOpen(false)}>
              Audit Log
            </NavLink>
          </nav>
        )}

        <div className="grow" />

        {isDev && (
          <nav className="flex flex-col gap-1 border-t border-border pt-3">
            <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">
              Developer
            </p>
            <NavLink href="/dev" onNavigate={() => setOpen(false)}>
              Overview
            </NavLink>
            <NavLink href="/dev/keys" onNavigate={() => setOpen(false)}>
              Setup Keys
            </NavLink>
            <NavLink href="/dev/tickets" onNavigate={() => setOpen(false)}>
              Tickets
            </NavLink>
            <NavLink href="/dev/moderation" onNavigate={() => setOpen(false)}>
              Moderation
            </NavLink>
            <NavLink href="/dev/audit" onNavigate={() => setOpen(false)}>
              Audit Log
            </NavLink>
          </nav>
        )}
      </aside>
    </>
  );
}
