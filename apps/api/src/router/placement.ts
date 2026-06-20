import { z } from "zod";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { router, protectedProcedure } from "./trpc.js";
import { PlacementService } from "../service/placement.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

const LANG_EXT: Record<string, string> = {
  go: "go",
  javascript: "js",
  typescript: "ts",
  c: "c",
  cpp: "cpp",
  java: "java",
};

function readStub(dir: string, ext: string): string {
  try {
    const files = readdirSync(dir);
    const match = files.find((f) => f.startsWith("stub.") && f.endsWith(`.${ext}`))
      ?? files.find((f) => f.startsWith("stub."));
    return match ? readFileSync(join(dir, match), "utf8") : "";
  } catch {
    return "";
  }
}

function extractTaskPrompt(instructions: string): string {
  const match = instructions.match(/## The task\n([\s\S]*?)(?=\n## |$)/);
  return match?.[1]?.trim() ?? "";
}

export const placementRouter = router({
  startPlacement: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const service = new PlacementService(ctx.db);
      const concepts = await service.startPlacement(input.enrollmentId);

      const enrollment = await ctx.db.enrollment.findUniqueOrThrow({
        where: { id: input.enrollmentId },
        include: { track: true },
      });
      const ext = LANG_EXT[enrollment.track.language] ?? "go";

      return Promise.all(
        concepts.map(async (concept) => {
          const exercise = await ctx.db.exercise.findFirst({
            where: { conceptId: concept.id, type: "lesson" },
          });
          let stub = "";
          let taskPrompt = "";
          if (exercise?.contentPath) {
            const dir = join(REPO_ROOT, exercise.contentPath);
            stub = readStub(dir, ext);
            try {
              const instructions = readFileSync(join(dir, "instructions.md"), "utf8");
              taskPrompt = extractTaskPrompt(instructions);
            } catch {
              // missing instructions — leave empty
            }
          }
          return { ...concept, stub, taskPrompt };
        }),
      );
    }),

  submitTask: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
        conceptId: z.string().uuid(),
        passed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const service = new PlacementService(ctx.db);
      return service.scoreTask(input.enrollmentId, input.conceptId, input.passed);
    }),

  skipPlacement: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const service = new PlacementService(ctx.db);
      return service.skipPlacement(input.enrollmentId);
    }),
});
