import { z } from "zod";
import { router, protectedProcedure } from "./trpc.js";
import { CredentialService } from "../service/credential.js";

export const profileRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id!;
    return ctx.db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    });
  }),

  getMastery: protectedProcedure
    .input(z.object({ trackSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id!;
      const track = await ctx.db.track.findUniqueOrThrow({
        where: { slug: input.trackSlug },
      });
      const enrollment = await ctx.db.enrollment.findUniqueOrThrow({
        where: { userId_trackId: { userId, trackId: track.id } },
      });
      return ctx.db.conceptState.findMany({
        where: { enrollmentId: enrollment.id },
        include: {
          concept: { select: { slug: true, title: true, position: true } },
        },
        orderBy: { concept: { position: "asc" } },
      });
    }),

  getMasteryAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id!;
    const enrollments = await ctx.db.enrollment.findMany({
      where: { userId },
      include: { track: { select: { slug: true, title: true } } },
      orderBy: { startedAt: "asc" },
    });
    return Promise.all(
      enrollments.map(async (enrollment) => ({
        trackSlug: enrollment.track.slug,
        trackTitle: enrollment.track.title,
        concepts: await ctx.db.conceptState.findMany({
          where: { enrollmentId: enrollment.id },
          include: { concept: { select: { slug: true, title: true, position: true } } },
          orderBy: { concept: { position: "asc" } },
        }),
      })),
    );
  }),

  generateCredential: protectedProcedure
    .input(z.object({ trackSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;
      const service = new CredentialService(ctx.db);
      return service.generateCredential(userId, input.trackSlug);
    }),

  getCredential: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.credential.findUniqueOrThrow({ where: { token: input.token } });
    }),
});
