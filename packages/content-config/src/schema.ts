import { z } from "zod";

// Single source of truth for content config.json shapes.
// Used by the API seed, the manifest builder, and the content linter.

export const conceptConfigSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().positive(),
  has_testout: z.boolean().default(false),
  status: z.enum(["wip", "published"]).default("wip"),
  prereq_slug: z.string().optional(),
});

export const trackConfigSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  language: z.string().min(1),
  status: z.enum(["coming_soon", "draft", "published"]).default("draft"),
});

export type ConceptConfig = z.infer<typeof conceptConfigSchema>;
export type TrackConfig = z.infer<typeof trackConfigSchema>;
