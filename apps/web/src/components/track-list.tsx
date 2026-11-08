import { prisma } from "@/lib/db";
import { LANG_COLORS } from "@/lib/track-colors";

export async function TrackList() {
  const tracks = await prisma.track.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "asc" },
    select: { slug: true, title: true, language: true },
  });

  return (
    <>
      <p className="mb-8 text-xs font-mono tracking-widest text-[var(--color-text-tertiary)] uppercase">
        {tracks.length} tracks
      </p>
      <div className="flex flex-wrap gap-2">
        {tracks.map((track) => (
          <span
            key={track.slug}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)]"
          >
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: LANG_COLORS[track.language] ?? "var(--color-text-tertiary)" }}
            />
            {track.title}
          </span>
        ))}
      </div>
    </>
  );
}
