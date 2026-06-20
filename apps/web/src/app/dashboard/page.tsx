"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { DashboardStats, ContinueBuildingCard } from "@fluent/ui";

export default function DashboardPage() {
  const router = useRouter();
  const dashboardQuery = trpc.dashboard.getDashboard.useQuery();
  const tracksQuery = trpc.tracks.listTracks.useQuery();
  const resetEnrollment = trpc.enrollments.resetEnrollment.useMutation({
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

          <div className="mt-8">
            {primary.continueBuildingCard ? (
              <ContinueBuildingCard
                sessionId={primary.continueBuildingCard.sessionId}
                currentStep={primary.continueBuildingCard.currentStep}
                trackSlug={primary.continueBuildingCard.trackSlug}
                onResume={() =>
                  router.push(`/tracks/${primary.continueBuildingCard?.trackSlug}/capstone`)
                }
                onStart={() => router.push(`/tracks/${primary.track.slug}/capstone`)}
              />
            ) : (
              <ContinueBuildingCard
                onResume={() => router.push(`/tracks/${primary.track.slug}/capstone`)}
                onStart={() => router.push(`/tracks/${primary.track.slug}/capstone`)}
              />
            )}
          </div>

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
                    className="flex items-center gap-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-4 py-3 hover:border-[var(--color-border-default)] transition-colors"
                  >
                    <Link href={`/tracks/${e.track.slug}`} className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{e.track.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-[var(--color-bg-subtle)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-interactive-primary)]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                          {done}/{total}
                        </span>
                      </div>
                    </Link>
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        onClick={() => {
                          if (confirm(`Reset all progress for ${e.track.title}?`)) {
                            resetEnrollment.mutate({ trackId: e.track.id });
                          }
                        }}
                        disabled={resetEnrollment.isPending}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-red-400 disabled:opacity-50"
                      >
                        Reset
                      </button>
                      <Link href={`/tracks/${e.track.slug}`} className="text-xs text-[var(--color-text-link)]">
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
          No enrollments yet. Pick a track below to get started.
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
                className="flex items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-4 py-3 hover:border-[var(--color-border-default)] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{track.title}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{track.description}</p>
                </div>
                <span className="ml-4 shrink-0 text-xs text-[var(--color-text-link)]">Start →</span>
              </Link>
            ))}
            {comingSoonTracks.map((track) => (
              <div
                key={track.slug}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-base)] px-4 py-3 opacity-60 cursor-default"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{track.title}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{track.description}</p>
                </div>
                <span className="ml-4 shrink-0 text-xs text-[var(--color-text-tertiary)]">coming soon</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
