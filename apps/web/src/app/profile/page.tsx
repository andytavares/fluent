"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { MasteryTable } from "@fluent/ui";

export default function ProfilePage() {
  const [copied, setCopied] = useState(false);
  const profileQuery = trpc.profile.getProfile.useQuery();
  const masteryQuery = trpc.profile.getMastery.useQuery({ trackSlug: "go" });
  const generateCredential = trpc.profile.generateCredential.useMutation();

  async function handleShareCredential() {
    const cred = await generateCredential.mutateAsync({ trackSlug: "go" });
    const url = `${window.location.origin}/credentials/${cred.token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const rows = (masteryQuery.data ?? []).map((cs) => ({
    conceptSlug: cs.conceptId,
    conceptTitle: cs.concept.title,
    state: cs.state as "locked" | "available" | "in_progress" | "mastered" | "completed",
    achievedVia: cs.achievedVia as "placement" | "test_out" | "lesson" | null,
    bestRuntimeMs: null,
    runCount: 0,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {profileQuery.data?.name ?? "Profile"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {profileQuery.data?.email}
          </p>
        </div>
        <button
          onClick={() => void handleShareCredential()}
          className="rounded-lg border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          {copied ? "Copied!" : "Share Go credential"}
        </button>
      </div>

      <h2 className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">
        Mastery — Go track
      </h2>
      <MasteryTable rows={rows} />
    </main>
  );
}
