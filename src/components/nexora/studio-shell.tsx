import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  Disc3,
  Inbox,
  Library,
  Plus,
  Radio,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { Onboarding } from "./onboarding";
import { PlayerBar } from "./player-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { ensureMyProfile } from "@/lib/nexora/api";
import type { Profile } from "@/lib/nexora/types";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Лента", icon: Radio },
  { to: "/explore", label: "Найти", icon: Compass },
  { to: "/create", label: "Загрузить", icon: Plus },
  { to: "/inbox", label: "Входящие", icon: Inbox },
  { to: "/library", label: "Моя музыка", icon: Library },
  { to: "/profile", label: "Профиль", icon: UserRound },
] as const;

export function StudioShell() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    let live = true;
    void ensureMyProfile()
      .then((p) => {
        if (live) setProfile(p);
      })
      .catch(() => {
        if (live) setProfile(null);
      })
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, [user?.id]);

  if (isPending) {
    return (
      <div className="flex min-h-dvh bg-bg">
        <div className="hidden w-56 border-r border-border p-4 md:block">
          <Skeleton className="h-8 w-28" />
          <div className="mt-8 space-y-3">
            {NAV.map((n) => (
              <Skeleton key={n.to} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-6 h-40 w-full" />
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const needsOnboarding = ready && profile && profile.profileType === "user";

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      {needsOnboarding ? (
        <Onboarding profile={profile} onDone={setProfile} />
      ) : null}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
          <div className="px-4 pt-5 pb-4">
            <Logo size="sm" />
            <p className="mt-1.5 pl-0.5 text-xs text-subtle">Студия коллабораций</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-3">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150",
                    active
                      ? "bg-elevated text-fg shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-accent)_35%,transparent)]"
                      : "text-muted hover:bg-elevated hover:text-fg",
                  )}
                >
                  <Icon className={cn("size-4", active && "text-accent")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4">
            <div className="mb-2 flex items-center gap-2 text-xs text-subtle">
              <Disc3 className="size-3.5" />
              {profile ? `@${profile.username}` : "…"}
            </div>
            <UserButton />
          </div>
        </aside>
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <PlayerBar />
      <nav className="grid grid-cols-5 border-t border-border bg-surface md:hidden">
        {NAV.filter((n) => n.to !== "/library").map((item) => {
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-wider",
                active ? "text-accent" : "text-subtle",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
