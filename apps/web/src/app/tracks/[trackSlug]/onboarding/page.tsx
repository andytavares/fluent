"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ConfidenceSelector, PlacementTask } from "@fluent/ui";
import type { ConfidenceLevel } from "@fluent/ui";
import { trpc } from "@/lib/trpc/client";
import { useSubmission } from "@/hooks/use-submission";

type Step = "confidence" | "placement" | "done";
type PlacementConcept = {
  id: string;
  slug: string;
  title: string;
  stub: string;
  taskPrompt: string;
};

export default function OnboardingPage() {
  const { trackSlug } = useParams<{ trackSlug: string }>();
  const router = useRouter();
  const [step, setStep] = useState<Step>("confidence");
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [placementConcepts, setPlacementConcepts] = useState<PlacementConcept[]>([]);
  const [currentConceptIdx, setCurrentConceptIdx] = useState(0);
  const [placementResult, setPlacementResult] = useState<{ passed: boolean } | null>(null);

  const trackQuery = trpc.tracks.getTrack.useQuery({ slug: trackSlug });
  const createEnrollment = trpc.enrollments.createEnrollment.useMutation();
  const startPlacement = trpc.placement.startPlacement.useMutation();
  const submitTask = trpc.placement.submitTask.useMutation();
  const skipPlacement = trpc.placement.skipPlacement.useMutation();

  const currentConcept = placementConcepts[currentConceptIdx];
  const onCompleteRef = useRef<((passed: boolean) => void) | undefined>(undefined);

  const { submit: runCode, state: submissionState } = useSubmission({
    conceptId: currentConcept?.id ?? "",
    enrollmentId: enrollmentId ?? "",
    onComplete: (passed) => onCompleteRef.current?.(passed),
  });

  async function advanceOrFinish(conceptId: string, passed: boolean) {
    if (!enrollmentId) return;
    await submitTask.mutateAsync({ enrollmentId, conceptId, passed });
    if (passed) {
      setPlacementResult({ passed: true });
    } else {
      setPlacementResult({ passed: false });
    }
  }

  async function handleConfidenceContinue() {
    if (!trackQuery.data || !confidence) return;

    const enrollment = await createEnrollment.mutateAsync({ trackId: trackQuery.data.id });
    setEnrollmentId(enrollment.id);

    if (confidence === "experienced") {
      const concepts = await startPlacement.mutateAsync({ enrollmentId: enrollment.id });
      setPlacementConcepts(concepts as PlacementConcept[]);
      setStep("placement");
    } else {
      router.push(`/tracks/${trackSlug}`);
    }
  }

  async function handleSkipConcept() {
    // Skip this concept (no score) and continue to the next placement task
    if (currentConceptIdx + 1 < placementConcepts.length) {
      setCurrentConceptIdx((i) => i + 1);
      setPlacementResult(null);
    } else {
      await skipPlacement.mutateAsync({ enrollmentId: enrollmentId! });
      router.push(`/tracks/${trackSlug}`);
    }
  }

  async function handleTakeLesson() {
    // End the entire placement flow and go to the track — pick up from the first available concept
    if (enrollmentId) {
      await skipPlacement.mutateAsync({ enrollmentId });
    }
    router.push(`/tracks/${trackSlug}`);
  }

  function handleContinueAfterResult() {
    if (currentConceptIdx + 1 < placementConcepts.length) {
      setCurrentConceptIdx((i) => i + 1);
      setPlacementResult(null);
    } else {
      router.push(`/tracks/${trackSlug}`);
    }
  }

  function handlePlacementSubmit(code: string) {
    if (!currentConcept) return;
    const conceptId = currentConcept.id;
    onCompleteRef.current = (passed) => void advanceOrFinish(conceptId, passed);
    runCode(code, true);
  }

  function handleTryAgain() {
    setPlacementResult(null);
  }

  if (step === "confidence") {
    const trackTitle = trackQuery.data?.title ?? trackSlug;
    const isBusy = createEnrollment.isPending || startPlacement.isPending;
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold text-[var(--color-text-primary)]">
          Welcome to {trackTitle}
        </h1>
        <p className="mb-8 text-center text-[var(--color-text-secondary)]">
          Tell us your experience level so we can personalize your path.
        </p>
        <ConfidenceSelector value={confidence} onChange={setConfidence} />
        {createEnrollment.error && (
          <p className="mt-3 text-center text-sm text-red-400">
            {createEnrollment.error.message}
          </p>
        )}
        <button
          onClick={handleConfidenceContinue}
          disabled={!confidence || !trackQuery.data || isBusy}
          className="mt-6 w-full rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-interactive-primary-text)] disabled:opacity-50"
        >
          {isBusy ? "Setting up…" : "Continue"}
        </button>
      </main>
    );
  }

  if (step === "placement" && currentConcept) {
    const isRunning = submissionState === "submitting" || submissionState === "streaming";
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Placement</h1>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {currentConceptIdx + 1} / {placementConcepts.length}
          </span>
        </div>
        <PlacementTask
          concept={currentConcept}
          stub={currentConcept.stub}
          taskPrompt={currentConcept.taskPrompt}
          onSubmit={handlePlacementSubmit}
          onSkip={placementResult?.passed ? handleContinueAfterResult : handleSkipConcept}
          onTakeLesson={handleTakeLesson}
          onTryAgain={handleTryAgain}
          isSubmitting={isRunning}
          result={placementResult}
        />
      </main>
    );
  }

  return null;
}
