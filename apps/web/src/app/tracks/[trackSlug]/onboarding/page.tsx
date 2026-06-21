"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ConfidenceSelector, PlacementTask } from "@fluent/ui";
import type { ConfidenceLevel } from "@fluent/ui";
import { trpc } from "@/lib/trpc/client";
import { useSubmission } from "@/hooks/use-submission";

type Step = "confidence" | "placement";
type PlacementConcept = {
  id: string;
  slug: string;
  title: string;
  stub: string;
  taskPrompt: string;
  language?: string;
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
  // Pre-fetch concepts so we can jump to the first one for beginners
  const conceptsQuery = trpc.tracks.listConcepts.useQuery({ trackSlug });
  const createEnrollment = trpc.enrollments.createEnrollment.useMutation();
  const startPlacement = trpc.placement.startPlacement.useMutation();
  const submitTask = trpc.placement.submitTask.useMutation();
  const skipPlacement = trpc.placement.skipPlacement.useMutation();

  const currentConcept = placementConcepts[currentConceptIdx];
  const onCompleteRef = useRef<((passed: boolean) => void) | undefined>(undefined);

  const { submit: runCode, state: submissionState } = useSubmission({
    conceptId: currentConcept?.id ?? "",
    enrollmentId: enrollmentId ?? "",
    language: currentConcept?.language,
    onComplete: (passed) => onCompleteRef.current?.(passed),
  });

  async function handleConfidenceContinue() {
    if (!trackQuery.data || !confidence) return;

    const enrollment = await createEnrollment.mutateAsync({ trackId: trackQuery.data.id });
    setEnrollmentId(enrollment.id);

    if (confidence === "experienced") {
      // Test-out flow
      const concepts = await startPlacement.mutateAsync({ enrollmentId: enrollment.id });
      setPlacementConcepts(concepts as PlacementConcept[]);
      setStep("placement");
    } else {
      // Beginner/some experience → go straight to the first lesson
      const firstConcept = conceptsQuery.data?.[0];
      if (firstConcept) {
        router.push(`/tracks/${trackSlug}/concepts/${firstConcept.slug}`);
      } else {
        router.push(`/tracks/${trackSlug}`);
      }
    }
  }

  // "Skip this concept" in placement → end test-out, go to lesson list
  async function handleSkipToLessons() {
    if (enrollmentId) {
      await skipPlacement.mutateAsync({ enrollmentId });
    }
    router.push(`/tracks/${trackSlug}`);
  }

  // After passing a concept, move to the next one (or finish)
  function handleNextConcept() {
    if (currentConceptIdx + 1 < placementConcepts.length) {
      setCurrentConceptIdx((i) => i + 1);
      setPlacementResult(null);
    } else {
      // Finished all placement concepts
      router.push(`/tracks/${trackSlug}`);
    }
  }

  // Score current concept and show result
  async function advanceOrFinish(conceptId: string, passed: boolean) {
    if (!enrollmentId) return;
    await submitTask.mutateAsync({ enrollmentId, conceptId, passed });
    setPlacementResult({ passed });
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
          How much experience do you have with this language?
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
          className="mt-6 w-full rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-interactive-primary-text)] disabled:opacity-50 transition-colors"
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
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Test out</h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Pass each challenge to skip it. Skip any time to go straight to lessons.
            </p>
          </div>
          <span className="text-sm font-mono text-[var(--color-text-secondary)]">
            {currentConceptIdx + 1} / {placementConcepts.length}
          </span>
        </div>
        <PlacementTask
          concept={currentConcept}
          stub={currentConcept.stub}
          taskPrompt={currentConcept.taskPrompt}
          onSubmit={handlePlacementSubmit}
          onSkip={handleSkipToLessons}
          onTakeLesson={handleSkipToLessons}
          onTryAgain={handleTryAgain}
          isSubmitting={isRunning}
          result={placementResult}
          onNext={handleNextConcept}
        />
      </main>
    );
  }

  return null;
}
