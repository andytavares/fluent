#!/usr/bin/env tsx
// Static-lints every concept folder in every track with the track's language
// (validateExerciseFolder covers file layout, config schema, stub/exemplar
// presence, lesson-test presence, and testout files when has_testout).
// Complements verify-content, which runs the exemplars.

import { createContentStore } from "@fluent/content-config";
import { validateExerciseFolder } from "./validator.js";

const store = createContentStore();
let errors = 0;

for (const track of store.listTracks()) {
  for (const concept of store.listConcepts(track.dir)) {
    const found = await validateExerciseFolder(concept.dir, track.config.language);
    const critical = found.filter((e) => !e.code.startsWith("W"));
    for (const e of critical) {
      console.error(`✗ ${track.config.slug}/${concept.config.slug} ${e.code}: ${e.message}`);
      errors++;
    }

    // Folder name is `NN-slug`; config must agree — a drifted position
    // collides with unique(trackId, position) at seed time.
    const folder = concept.dir.split("/").at(-1)!;
    const folderPos = parseInt(folder.split("-")[0]!, 10);
    const folderSlug = folder.split("-").slice(1).join("-");
    if (concept.config.position !== folderPos) {
      console.error(`✗ ${track.config.slug}/${folder} E010: config position ${concept.config.position} != folder number ${folderPos}`);
      errors++;
    }
    if (concept.config.slug !== folderSlug) {
      console.error(`✗ ${track.config.slug}/${folder} E011: config slug ${concept.config.slug} != folder slug ${folderSlug}`);
      errors++;
    }
  }
}

console.log(errors === 0 ? "\nAll concept folders lint clean." : `\n${errors} lint error(s).`);
process.exit(errors > 0 ? 1 : 0);
