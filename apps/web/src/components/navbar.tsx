"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

export function Navbar() {
  const pathname = usePathname();
  const profileQuery = trpc.profile.getProfile.useQuery();

  // Extract trackSlug from path like /tracks/go/...
  const trackSlugMatch = pathname.match(/^\/tracks\/([^/]+)/);
  const trackSlug = trackSlugMatch?.[1];

  const enrollmentsQuery = trpc.enrollments.listEnrollments.useQuery(undefined, {
    enabled: !profileQuery.isError,
  });

  const enrollment = trackSlug
    ? enrollmentsQuery.data?.find((e) => e.track.slug === trackSlug)
    : enrollmentsQuery.data?.[0];

  const activeTrackSlug = trackSlug ?? enrollment?.track.slug;

  return (
    <nav className="h-12 shrink-0 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-base)] flex items-center px-4 gap-6 z-50">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-text-link)] transition-colors"
      >
        Fluent
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link
          href="/dashboard"
          className={
            pathname === "/dashboard"
              ? "text-[var(--color-text-primary)] font-medium"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          }
        >
          Dashboard
        </Link>

        {activeTrackSlug && (
          <Link
            href={`/tracks/${activeTrackSlug}`}
            className={
              pathname.startsWith(`/tracks/${activeTrackSlug}`) && !pathname.includes("/concepts/")
                ? "text-[var(--color-text-primary)] font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            }
          >
            Go Track
          </Link>
        )}

        {pathname.includes("/concepts/") && activeTrackSlug && (
          <Link
            href={`/tracks/${activeTrackSlug}`}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            ← Learning Path
          </Link>
        )}

        {activeTrackSlug && (
          <Link
            href={`/tracks/${activeTrackSlug}/capstone`}
            className={
              pathname.includes("/capstone")
                ? "text-[var(--color-text-primary)] font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            }
          >
            Capstone
          </Link>
        )}
      </div>

      <div className="ml-auto text-xs text-[var(--color-text-secondary)]">
        {profileQuery.data?.email}
      </div>
    </nav>
  );
}
