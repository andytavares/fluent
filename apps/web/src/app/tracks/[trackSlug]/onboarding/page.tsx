"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ConfidenceSelector, PlacementTask } from "@fluent/ui";
import type { ConfidenceLevel } from "@fluent/ui";
import { trpc } from "@/lib/trpc/client";

type Step = "confidence" | "placement" | "done";

export default function OnboardingPage() {
  const { trackSlug } = useParams<{ trackSlug: string }>();
  const router = useRouter();
  const [step, setStep] = useState<Step>("confidence");
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [placementConcepts, setPlacementConcepts] = useState<Array<{ slug: string; title: string; id: string }>>([]);
  const [currentConceptIdx, setCurrentConceptIdx] = useState(0);

  const trackQuery = trpc.tracks.getTrack.useQuery({ slug: trackSlug });
  const createEnrollment = trpc.enrollments.createEnrollment.useMutation();
  const startPlacement = trpc.placement.startPlacement.useMutation();
  const submitTask = trpc.placement.submitTask.useMutation();
  const skipPlacement = trpc.placement.skipPlacement.useMutation();

  async function handleConfidenceContinue() {
    if (!trackQuery.data || !confidence) return;

    const enrollment = await createEnrollment.mutateAsync({ trackId: trackQuery.data.id });
    setEnrollmentId(enrollment.id);

    if (confidence === "experienced") {
      const concepts = await startPlacement.mutateAsync({ enrollmentId: enrollment.id });
      setPlacementConcepts(concepts as Array<{ slug: string; title: string; id: string }>);
      setStep("placement");
    } else {
      router.push(`/tracks/${trackSlug}`);
    }
  }

  async function handleSkipPlacement() {
    if (!enrollmentId) return;
    await skipPlacement.mutateAsync({ enrollmentId });
    router.push(`/tracks/${trackSlug}`);
  }

  async function handlePlacementSubmit(code: string) {
    if (!enrollmentId || !placementConcepts[currentConceptIdx]) return;

    // In real flow, code is executed by Judge0 — for now we mark as passed
    await submitTask.mutateAsync({
      enrollmentId,
      conceptId: placementConcepts[currentConceptIdx]!.id,
      passed: true,
    });

    if (currentConceptIdx + 1 < placementConcepts.length) {
      setCurrentConceptIdx((i) => i + 1);
    } else {
      router.push(`/tracks/${trackSlug}`);
    }
  }

  if (step === "confidence") {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold text-[var(--color-text-primary)]">
          Welcome to the Go track
        </h1>
        <p className="mb-8 text-center text-[var(--color-text-secondary)]">
          Tell us your experience level so we can personalize your path.
        </p>
        <ConfidenceSelector value={confidence} onChange={setConfidence} />
        <button
          onClick={handleConfidenceContinue}
          disabled={!confidence}
          className="mt-6 w-full rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-interactive-primary-text)] disabled:opacity-50"
        >
          Continue
        </button>
      </main>
    );
  }

  const currentConcept = placementConcepts[currentConceptIdx];
  if (step === "placement" && currentConcept) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Placement</h1>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {currentConceptIdx + 1} / {placementConcepts.length}
          </span>
        </div>
        <PlacementTask
          concept={currentConcept}
          stub={`package main\n\nfunc main() {\n  // ${currentConcept.title}\n}\n`}
          onSubmit={handlePlacementSubmit}
          onSkip={handleSkipPlacement}
        />
      </main>
    );
  }

  return null;
}
