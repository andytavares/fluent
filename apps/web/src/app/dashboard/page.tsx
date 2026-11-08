"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { DashboardStats } from "@fluent/ui";
import { CapstoneCard } from "@/components/capstone-card";
import { LANG_COLORS } from "@/lib/track-colors";

export default function DashboardPage() {
  const dashboardQuery = trpc.dashboard.getDashboard.useQuery();
  const tracksQuery = trpc.tracks.listTracks.useQuery();
  const resetEnrollment = trpc.enrollments.resetEnrollment.useMutation({
    onSuccess: () => void dashboardQuery.refetch(),
  });
  const devMasterAll = trpc.enrollments.devMasterAll.useMutation({
    onSuccess: () => void dashboardQuery.refetch(),
  });

  if (dashboardQuery.isLoading || tracksQuery.isLoading) {
    return <div className="p-8 text-[var(--color-text-secondary)]">Loading…</div>;
  }

  const enrollments = dashboardQuery.data ?? [];
  const primary = enrollments[0];
  const allTracks = tracksQuery.data ?? [];

  const enrolledSlugs = new Set(enrollments.map((e) => e.track.slug));
  const availableTracks = allTracks.filter((t) => t.status === "published" && !enrolledSlugs.has(t.slug));
  const comingSoonTracks = allTracks.filter((t) => t.status === "coming_soon");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>

      {primary ? (
        <>
          <DashboardStats
            conceptsDone={primary.stats.conceptsDone}
            testedOut={primary.stats.testedOut}
            timeSavedMs={primary.stats.timeSavedMs}
            capstoneProgress={primary.stats.capstoneProgress}
          />

          <CapstoneCard trackSlug={primary.track.slug} session={primary.continueBuildingCard} />

          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Tracks in progress
            </h2>
            <div className="grid gap-3">
              {enrollments.map((e) => {
                const total = e.enrollment.conceptStates.length;
                const done = e.stats.conceptsDone;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div
                    key={e.track.slug}
                    className="flex items-center gap-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-4 py-3.5 hover:border-[var(--color-border-default)] transition-colors"
                  >
                    {/* Language color dot */}
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: LANG_COLORS[e.track.language] ?? "#a1a1aa" }}
                    />
                    <Link href={`/tracks/${e.track.slug}`} className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{e.track.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 flex-1 rounded-full bg-[var(--color-surface-overlay)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-interactive-primary)] transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-xs font-mono text-[var(--color-text-secondary)]">
                          {done}/{total}
                        </span>
                      </div>
                    </Link>
                    <div className="flex shrink-0 items-center gap-4">
                      <button
                        onClick={() => devMasterAll.mutate({ trackId: e.track.id })}
                        disabled={devMasterAll.isPending}
                        className="text-xs text-[var(--color-text-disabled)] hover:text-amber-400 disabled:opacity-50 transition-colors"
                      >
                        Master all
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Reset all progress for ${e.track.title}?`)) {
                            resetEnrollment.mutate({ trackId: e.track.id });
                          }
                        }}
                        disabled={resetEnrollment.isPending}
                        className="text-xs text-[var(--color-text-disabled)] hover:text-red-400 disabled:opacity-50 transition-colors"
                      >
                        Reset
                      </button>
                      <Link href={`/tracks/${e.track.slug}`} className="text-xs font-medium text-[var(--color-text-link)] hover:text-[var(--color-interactive-primary-hover)] transition-colors">
                        Continue →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <p className="text-[var(--color-text-secondary)]">
          You have no tracks yet. Pick one below.
        </p>
      )}

      {(availableTracks.length > 0 || comingSoonTracks.length > 0) && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
            {primary ? "More tracks" : "Available tracks"}
          </h2>
          <div className="grid gap-3">
            {availableTracks.map((track) => (
              <Link
                key={track.slug}
                href={`/tracks/${track.slug}`}
                className="flex items-center gap-4 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-4 py-3.5 hover:border-[var(--color-interactive-primary)]/50 transition-colors group"
              >
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: LANG_COLORS[track.language] ?? "#a1a1aa" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{track.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-secondary)]">{track.description}</p>
                </div>
                <span className="ml-4 shrink-0 text-xs font-medium text-[var(--color-text-link)] transition-colors group-hover:text-[var(--color-interactive-primary)]">Start →</span>
              </Link>
            ))}
            {comingSoonTracks.map((track) => (
              <div
                key={track.slug}
                className="flex items-center gap-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-base)] px-4 py-3.5 opacity-50 cursor-default"
              >
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: LANG_COLORS[track.language] ?? "#52525b" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{track.title}</p>
                </div>
                <span className="ml-4 shrink-0 text-xs text-[var(--color-text-disabled)]">coming soon</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
