"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";

export function useCapstoneSession(enrollmentId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const createSession = trpc.capstone.createSession.useMutation();
  const verifyStepMutation = trpc.capstone.verifyStep.useMutation();
  const getStatus = trpc.capstone.getSessionStatus.useQuery(
    { sessionId: sessionId ?? "" },
    { enabled: !!sessionId, refetchInterval: 3000 },
  );

  const start = useCallback(async () => {
    setStartError(null);
    try {
      const session = await createSession.mutateAsync({ enrollmentId });
      setSessionId(session.id);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Failed to start session");
    }
  }, [enrollmentId, createSession]);

  // Fire-and-poll: the workflow verifies asynchronously and records the step
  // completion; the 3s status poll picks it up.
  const verifyStep = useCallback(
    async (stepNumber: number) => {
      if (!sessionId) return;
      await verifyStepMutation.mutateAsync({ sessionId, stepNumber });
    },
    [sessionId, verifyStepMutation],
  );

  // completedAt is authoritative for expiry: teardown closes the session row
  // when the workflow ends. Client-side math against dbExpiresAt would lie —
  // the workflow's inactivity window resets on every signal, the timestamp
  // doesn't.
  const dbStatus = (() => {
    const session = getStatus.data;
    if (!session) return "provisioning" as const;
    if (session.completedAt) return "expired" as const;
    if (session.dbConnectionEncrypted) return "connected" as const;
    return "provisioning" as const;
  })();

  return {
    sessionId,
    session: getStatus.data ?? null,
    dbStatus,
    start,
    isStarting: createSession.isPending,
    startError,
    verifyStep,
    isVerifying: verifyStepMutation.isPending,
  };
}
