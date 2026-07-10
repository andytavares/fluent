import { z } from "zod";

// Single source of truth for content config.json shapes.
// Used by the API seed, the manifest builder, and the content linter.

// Concept sequencing is linear by `position` — there is deliberately no
// prereq field here; a prerequisite graph was removed as dead (no reader
// or writer ever existed).
export const conceptConfigSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().positive(),
  has_testout: z.boolean().default(false),
  status: z.enum(["wip", "published"]).default("wip"),
});

export const trackConfigSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  language: z.string().min(1),
  status: z.enum(["coming_soon", "draft", "published"]).default("draft"),
});

export const capstoneStepConfigSchema = z.object({
  step_number: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
});

export const capstoneProjectConfigSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  language: z.string().min(1),
  steps: z.number().int().positive().optional(),
});

export type ConceptConfig = z.infer<typeof conceptConfigSchema>;
export type TrackConfig = z.infer<typeof trackConfigSchema>;
export type CapstoneStepConfig = z.infer<typeof capstoneStepConfigSchema>;
export type CapstoneProjectConfig = z.infer<typeof capstoneProjectConfigSchema>;
