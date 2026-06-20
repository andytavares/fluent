"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { LearningPath } from "@/components/path/LearningPath";

export default function TrackPathPage() {
  const { trackSlug } = useParams<{ trackSlug: string }>();
  const router = useRouter();

  const enrollmentsQuery = trpc.enrollments.listEnrollments.useQuery();
  const resetEnrollment = trpc.enrollments.resetEnrollment.useMutation({
    onSuccess: () => {
      void enrollmentsQuery.refetch();
      router.push(`/tracks/${trackSlug}/onboarding`);
    },
  });
  const enrollment = enrollmentsQuery.data?.find((e) => e.track.slug === trackSlug);

  const conceptStatesQuery = trpc.concepts.listConceptStates.useQuery(
    { enrollmentId: enrollment?.id ?? "" },
    { enabled: !!enrollment },
  );

  if (!enrollment) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <p className="text-[var(--color-text-secondary)]">
          You're not enrolled in this track.{" "}
          <a href={`/tracks/${trackSlug}/onboarding`} className="text-[var(--color-text-link)]">
            Enroll now
          </a>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-xl font-bold text-[var(--color-text-primary)]">
            {enrollment.track.title}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {conceptStatesQuery.data?.filter((cs) => cs.state === "mastered" || cs.state === "completed").length ?? 0} concepts done
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset all progress for this track and start over?")) {
              resetEnrollment.mutate({ trackId: enrollment.track.id });
            }
          }}
          disabled={resetEnrollment.isPending}
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
        >
          Start over
        </button>
      </div>

      {conceptStatesQuery.data ? (
        conceptStatesQuery.data.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-4 py-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              No lessons found — this can happen if the track was updated after you enrolled.
            </p>
            <button
              onClick={() => {
                if (confirm("Reset enrollment and start fresh?")) {
                  resetEnrollment.mutate({ trackId: enrollment.track.id });
                }
              }}
              className="mt-3 text-sm text-[var(--color-text-link)] hover:underline"
            >
              Reset and re-enroll →
            </button>
          </div>
        ) : (
          <LearningPath
            trackSlug={trackSlug}
            conceptStates={
              conceptStatesQuery.data.map((cs) => ({
                conceptId: cs.conceptId,
                state: cs.state as "locked" | "available" | "in_progress" | "mastered" | "completed",
                achievedVia: cs.achievedVia as "placement" | "test_out" | "lesson" | null,
                concept: {
                  slug: cs.concept.slug,
                  title: cs.concept.title,
                  position: cs.concept.position,
                },
              }))
            }
            hasCapstone
          />
        )
      ) : (
        <div className="text-[var(--color-text-secondary)]">Loading…</div>
      )}
    </main>
  );
}
