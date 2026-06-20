"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { DashboardStats, ContinueBuildingCard } from "@fluent/ui";

export default function DashboardPage() {
  const router = useRouter();
  const dashboardQuery = trpc.dashboard.getDashboard.useQuery();

  if (dashboardQuery.isLoading) {
    return <div className="p-8 text-[var(--color-text-secondary)]">Loading…</div>;
  }

  const enrollments = dashboardQuery.data ?? [];
  const primary = enrollments[0];

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
        </>
      ) : (
        <div className="text-[var(--color-text-secondary)]">
          No enrollments yet.{" "}
          <a href="/tracks/go" className="text-[var(--color-text-link)]">
            Browse tracks
          </a>
        </div>
      )}
    </main>
  );
}
