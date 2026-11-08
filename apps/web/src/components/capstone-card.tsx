"use client";

import { useRouter } from "next/navigation";
import { ContinueBuildingCard } from "@fluent/ui";
import { trpc } from "@/lib/trpc/client";

type CapstoneSession = { sessionId: string; currentStep: number } | null;

export function CapstoneCard({ trackSlug, session }: { trackSlug: string; session: CapstoneSession }) {
  const router = useRouter();
  const options = { enabled: trackSlug !== "" };
  const projectQuery = trpc.capstone.getProject.useQuery({ trackSlug }, options);
  const stepsQuery = trpc.capstone.getSteps.useQuery({ trackSlug }, options);
  if (!projectQuery.data || !stepsQuery.data) return null;

  const openCapstone = () => router.push(`/tracks/${trackSlug}/capstone`);
  return (
    <div className="mt-8">
      <ContinueBuildingCard
        capstoneTitle={projectQuery.data.title}
        stepCount={stepsQuery.data.length}
        {...session}
        trackSlug={trackSlug}
        onResume={openCapstone}
        onStart={openCapstone}
      />
    </div>
  );
}
