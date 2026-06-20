import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { z } from "zod";

// tracks.ts lives at apps/api/src/router/ — go 4 levels up to reach repo root
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

const LANG_EXT: Record<string, string> = {
  go: "go",
  javascript: "js",
  typescript: "ts",
  c: "c",
  cpp: "cpp",
  java: "java",
};

function findStubFile(dir: string, ext: string): string {
  try {
    const files = readdirSync(dir);
    const stub = files.find((f) => f.startsWith("stub.") && f.endsWith(`.${ext}`));
    if (stub) return readFileSync(join(dir, stub), "utf8");
    // fallback: any stub.* file
    const anyStub = files.find((f) => f.startsWith("stub."));
    if (anyStub) return readFileSync(join(dir, anyStub), "utf8");
  } catch {
    // missing dir or files
  }
  return "";
}

import { router, publicProcedure, protectedProcedure } from "./trpc.js";

export const tracksRouter = router({
  listTracks: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.track.findMany({
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

      const exercise = concept.exercises.find((e: { type: string }) => e.type === "lesson");
      const ext = LANG_EXT[track.language] ?? "go";
      let instructions = "";
      let stub = "";
      if (exercise?.contentPath) {
        const dir = join(REPO_ROOT, exercise.contentPath);
        try {
          instructions = readFileSync(join(dir, "instructions.md"), "utf8");
        } catch {
          // missing instructions — leave empty
        }
        stub = findStubFile(dir, ext);
      }

      return { ...concept, instructions, stub, nextConceptSlug: nextConcept?.slug ?? null };
    }),
});
