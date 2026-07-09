#!/usr/bin/env node
import { writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createContentStore } from "@fluent/content-config";

async function buildManifest(contentDir: string, outDir: string) {
  // The store is rooted at the repo root; contentDir is `<root>/content`.
  const content = createContentStore(resolve(contentDir, ".."));

  const manifest: Record<string, unknown> = {};

  for (const track of content.listTracks()) {
    const concepts = content
      .listConcepts(track.dir)
      .map((c) => c.config)
      .sort((a, b) => a.position - b.position);

    manifest[track.config.slug] = {
      ...track.config,
      concepts,
    };

    console.log(`✓ Track: ${track.config.slug} (${concepts.length} concepts)`);
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
