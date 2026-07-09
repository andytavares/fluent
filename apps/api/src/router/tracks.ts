import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./trpc.js";
import { createContentStore } from "@fluent/content-config";

const content = createContentStore();

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
      let instructions = "";
      let stub = "";
      let testoutStub = "";
      if (exercise?.contentPath) {
        instructions = content.getInstructions(exercise.contentPath);
        stub = content.getLessonStub(exercise.contentPath, track.language);
        if (concept.hasTestout) {
          testoutStub = content.getTestoutStub(exercise.contentPath, track.language);
        }
      }

      return { ...concept, instructions, stub, testoutStub, nextConceptSlug: nextConcept?.slug ?? null, language: track.language };
    }),
});
