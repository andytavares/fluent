"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";

export function useCapstoneSession(enrollmentId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const createSession = trpc.capstone.createSession.useMutation();
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

  const dbStatus = (() => {
    if (!getStatus.data) return "provisioning" as const;
    if (getStatus.data.dbConnectionEncrypted) return "connected" as const;
    if (getStatus.data.completedAt) return "expired" as const;
    return "provisioning" as const;
  })();

  return {
    sessionId,
    session: getStatus.data ?? null,
    dbStatus,
    start,
    isStarting: createSession.isPending,
    startError,
  };
}
