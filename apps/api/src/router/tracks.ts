import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { z } from "zod";

// tracks.ts lives at apps/api/src/router/ — go 4 levels up to reach repo root
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
import { router, publicProcedure, protectedProcedure } from "./trpc.js";

export const tracksRouter = router({
  listTracks: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.track.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "asc" },
    });
  }),

  getTrack: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.track.findUniqueOrThrow({ where: { slug: input.slug } });
    }),

  listConcepts: publicProcedure
    .input(z.object({ trackSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const track = await ctx.db.track.findUniqueOrThrow({
        where: { slug: input.trackSlug },
      });
      return ctx.db.concept.findMany({
        where: {
          trackId: track.id,
          status: "published", // filter wip concepts from public responses (FR-038)
        },
        orderBy: { position: "asc" },
      });
    }),

  getConceptLesson: protectedProcedure
    .input(z.object({ trackSlug: z.string(), conceptSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const track = await ctx.db.track.findUniqueOrThrow({
        where: { slug: input.trackSlug },
      });
      const concept = await ctx.db.concept.findUniqueOrThrow({
        where: { trackId_slug: { trackId: track.id, slug: input.conceptSlug } },
        include: { exercises: true },
      });

      const nextConcept = await ctx.db.concept.findFirst({
        where: { trackId: track.id, status: "published", position: { gt: concept.position } },
        orderBy: { position: "asc" },
        select: { slug: true },
      });

      const exercise = concept.exercises.find((e) => e.type === "lesson");
      let instructions = "";
      let stub = "";
      if (exercise?.contentPath) {
        const dir = join(REPO_ROOT, exercise.contentPath);
        try {
          instructions = readFileSync(join(dir, "instructions.md"), "utf8");
          stub = readFileSync(join(dir, "stub.go"), "utf8");
        } catch {
          // content files missing — return empty strings
        }
      }

      return { ...concept, instructions, stub, nextConceptSlug: nextConcept?.slug ?? null };
    }),
});
