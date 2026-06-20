"use client";

interface Stat {
  label: string;
  value: string | number;
  description?: string;
}

interface DashboardStatsProps {
  conceptsDone: number;
  testedOut: number;
  timeSavedMs: number;
  capstoneProgress: number;
  totalSteps?: number;
}

function formatTimeSaved(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

export function DashboardStats({
  conceptsDone,
  testedOut,
  timeSavedMs,
  capstoneProgress,
  totalSteps = 6,
}: DashboardStatsProps) {
  const stats: Stat[] = [
    { label: "Concepts done", value: conceptsDone, description: "mastered or completed" },
    { label: "Tested out", value: testedOut, description: "skipped via test-out" },
    { label: "Time saved", value: formatTimeSaved(timeSavedMs), description: "vs lesson-only path" },
    {
      label: "Capstone",
      value: `${capstoneProgress}/${totalSteps}`,
      description: "steps complete",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-4"
        >
          <dt className="text-xs text-[var(--color-text-secondary)]">{stat.label}</dt>
          <dd className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">
            {stat.value}
          </dd>
          {stat.description && (
            <dd className="text-xs text-[var(--color-text-secondary)]">{stat.description}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}
