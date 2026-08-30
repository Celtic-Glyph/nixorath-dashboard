function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function TopBar({
  title,
  username,
  avatarUrl,
}: {
  title: string;
  username: string;
  avatarUrl: string | null;
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border py-3.5 pr-4 pl-16 md:px-6">
      <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover text-xs font-bold text-muted">
              {initials(username)}
            </span>
          )}
          <span className="hidden text-sm text-foreground sm:inline">{username}</span>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-danger/50 hover:text-danger"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
