import { prisma } from "@/lib/db";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CredentialPage({ params }: Props) {
  const { token } = await params;

  const credential = await prisma.credential.findUnique({
    where: { token },
    include: {
      user: { select: { name: true } },
      track: { select: { title: true } },
    },
  });

  if (!credential) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-surface-base)]">
        <p className="text-[var(--color-text-secondary)]">Credential not found.</p>
      </main>
    );
  }

  const summary = credential.summary as {
    name: string;
    track_title: string;
    completed_at: string;
    tested_out_count: number;
    concepts_total: number;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-surface-base)] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-10 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
          Fluent Certificate of Completion
        </p>
        <h1 className="mt-4 text-2xl font-bold text-[var(--color-text-primary)]">
          {summary.name}
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          completed the{" "}
          <span className="font-semibold text-[var(--color-text-primary)]">
            {summary.track_title}
          </span>{" "}
          track
        </p>
        <div className="my-6 border-t border-[var(--color-border-subtle)]" />
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {summary.concepts_total}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">Concepts completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {summary.tested_out_count}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">Tested out</p>
          </div>
        </div>
        <p className="mt-6 text-xs text-[var(--color-text-disabled)]">
          Completed on {new Date(summary.completed_at).toLocaleDateString()}
        </p>
      </div>
    </main>
  );
}
