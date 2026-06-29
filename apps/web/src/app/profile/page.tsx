"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { MasteryTable } from "@fluent/ui";

export default function ProfilePage() {
  const [copied, setCopied] = useState<string | null>(null);
  const profileQuery = trpc.profile.getProfile.useQuery();
  const masteryQuery = trpc.profile.getMasteryAll.useQuery();
  const generateCredential = trpc.profile.generateCredential.useMutation();

  async function handleShareCredential(trackSlug: string) {
    const cred = await generateCredential.mutateAsync({ trackSlug });
    const url = `${window.location.origin}/credentials/${cred.token}`;
    await navigator.clipboard.writeText(url);
    setCopied(trackSlug);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {profileQuery.data?.name ?? "Profile"}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {profileQuery.data?.email}
        </p>
      </div>

      {masteryQuery.isLoading && (
        <p className="text-[var(--color-text-secondary)]">Loading…</p>
      )}

      {(masteryQuery.data ?? []).map(({ trackSlug, trackTitle, concepts }) => (
        <section key={trackSlug} className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              {trackTitle}
            </h2>
            <button
              onClick={() => void handleShareCredential(trackSlug)}
              disabled={generateCredential.isPending}
              className="rounded-lg border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50 transition-colors"
            >
              {copied === trackSlug ? "Copied!" : "Share credential"}
            </button>
          </div>
          <MasteryTable
            rows={concepts.map((cs) => ({
              conceptSlug: cs.concept.slug,
              conceptTitle: cs.concept.title,
              state: cs.state as "locked" | "available" | "in_progress" | "mastered" | "completed",
              achievedVia: cs.achievedVia as "placement" | "test_out" | "lesson" | null,
              bestRuntimeMs: null,
              runCount: 0,
            }))}
          />
        </section>
      ))}

      {!masteryQuery.isLoading && (masteryQuery.data ?? []).length === 0 && (
        <p className="text-[var(--color-text-secondary)]">
          No track enrollments yet. Pick a track from the dashboard to get started.
        </p>
      )}
    </main>
  );
}
