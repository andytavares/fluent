"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

export function Navbar() {
  const pathname = usePathname();
  const profileQuery = trpc.profile.getProfile.useQuery();

  const trackSlugMatch = pathname.match(/^\/tracks\/([^/]+)/);
  const trackSlug = trackSlugMatch?.[1];

  const enrollmentsQuery = trpc.enrollments.listEnrollments.useQuery(undefined, {
    enabled: !profileQuery.isError,
  });

  const enrollment = trackSlug
    ? enrollmentsQuery.data?.find((e) => e.track.slug === trackSlug)
    : enrollmentsQuery.data?.[0];

  const activeTrackSlug = trackSlug ?? enrollment?.track.slug;
  const activeTrackTitle = enrollment?.track.title ?? activeTrackSlug;

  const navLink = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={
        active
          ? "text-sm font-medium text-[var(--color-text-primary)]"
          : "text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
      }
    >
      {label}
    </Link>
  );

  return (
    <nav className="h-12 shrink-0 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-base)] flex items-center px-5 gap-6 z-50">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-[var(--color-interactive-primary)] hover:text-[var(--color-interactive-primary-hover)] transition-colors tracking-tight"
      >
        Fluent
      </Link>

      <div className="h-4 w-px bg-[var(--color-border-subtle)]" />

      <div className="flex items-center gap-5">
        {navLink("/dashboard", "Dashboard", pathname === "/dashboard")}
        {navLink("/visualizer", "Visualizer", pathname.startsWith("/visualizer"))}

        {activeTrackSlug && navLink(
          `/tracks/${activeTrackSlug}`,
          activeTrackTitle ?? activeTrackSlug,
          pathname.startsWith(`/tracks/${activeTrackSlug}`) && !pathname.includes("/concepts/"),
        )}

        {pathname.includes("/concepts/") && activeTrackSlug && navLink(
          `/tracks/${activeTrackSlug}`,
          "← Path",
          false,
        )}

        {activeTrackSlug && navLink(
          `/tracks/${activeTrackSlug}/capstone`,
          "Capstone",
          pathname.includes("/capstone"),
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {profileQuery.data?.email && (
          <span className="text-xs font-mono text-[var(--color-text-disabled)] hidden sm:block">
            {profileQuery.data.email}
          </span>
        )}
        <Link
          href="/profile"
          className={
            pathname === "/profile"
              ? "text-sm font-medium text-[var(--color-text-primary)]"
              : "text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          }
        >
          Profile
        </Link>
      </div>
    </nav>
  );
}
