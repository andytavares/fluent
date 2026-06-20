"use client";

interface ContinueBuildingCardProps {
  sessionId?: string | null;
  currentStep?: number | null;
  trackSlug?: string | null;
  onResume?: () => void;
  onStart?: () => void;
}

export function ContinueBuildingCard({
  sessionId,
  currentStep,
  trackSlug,
  onResume,
  onStart,
}: ContinueBuildingCardProps) {
  const hasSession = sessionId && currentStep != null;

  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        {hasSession ? "Continue building" : "Start the capstone"}
      </h3>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
        {hasSession
          ? `You're on step ${currentStep} of the Go CRUD API capstone.`
          : "Build a real Go CRUD API with a live database."}
      </p>
      <button
        onClick={hasSession ? onResume : onStart}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2 text-sm font-medium text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)]"
      >
        {hasSession ? "Resume →" : "Start project"}
      </button>
    </div>
  );
}
