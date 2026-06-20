#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";
import { z } from "zod";

const conceptConfigSchema = z.object({
  slug: z.string(),
  title: z.string(),
  position: z.number().int().positive(),
  has_testout: z.boolean().default(false),
  status: z.enum(["wip", "published"]).default("wip"),
  prereq_slug: z.string().optional(),
});

const trackConfigSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  language: z.string(),
  status: z.enum(["coming_soon", "draft", "published"]).default("draft"),
});

async function buildManifest(contentDir: string, outDir: string) {
  const tracksDir = join(contentDir, "tracks");
  const trackFolders = await readdir(tracksDir);

  const manifest: Record<string, unknown> = {};

  for (const trackFolder of trackFolders) {
    const trackPath = join(tracksDir, trackFolder);
    const trackConfigRaw = JSON.parse(
      await readFile(join(trackPath, "config.json"), "utf-8"),
    ) as unknown;
    const trackConfig = trackConfigSchema.parse(trackConfigRaw);

    const conceptsDir = join(trackPath, "concepts");
    let conceptFolders: string[] = [];
    try {
      conceptFolders = await readdir(conceptsDir);
    } catch {
      // no concepts yet
    }

    const concepts = await Promise.all(
      conceptFolders.map(async (folder) => {
        const conceptPath = join(conceptsDir, folder);
        const configRaw = JSON.parse(
          await readFile(join(conceptPath, "config.json"), "utf-8"),
        ) as unknown;
        return conceptConfigSchema.parse(configRaw);
      }),
    );

    concepts.sort((a, b) => a.position - b.position);

    manifest[trackConfig.slug] = {
      ...trackConfig,
      concepts,
    };

    console.log(`✓ Track: ${trackConfig.slug} (${concepts.length} concepts)`);
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\nManifest written to ${join(outDir, "manifest.json")}`);
}

const contentDir = process.argv[2] ?? join(process.cwd(), "content");
const outDir = process.argv[3] ?? join(process.cwd(), "public", "content");

buildManifest(contentDir, outDir).catch((err) => {
  console.error(err);
  process.exit(1);
});
