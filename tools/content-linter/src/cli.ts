#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { trackConfigSchema } from "@fluent/content-config";
import { checkFolderBuildsOn, validateExerciseFolder } from "./validator.js";

// Concept folders live at content/tracks/<track>/concepts/<concept>;
// the track's config.json declares the language the folder is linted as.
async function detectLanguage(folderPath: string): Promise<string> {
  try {
    const raw = await readFile(resolve(folderPath, "../../config.json"), "utf-8");
    const parsed = trackConfigSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.language : "go";
  } catch {
    return "go";
  }
}

async function main() {
  const folderArg = process.argv[2];
  if (!folderArg) {
    console.error("Usage: content-linter <exercise-folder>");
    process.exit(1);
  }

  const folderPath = resolve(folderArg);
  const language = await detectLanguage(folderPath);
  console.log(`Linting: ${folderPath} (language: ${language})\n`);

  // Step 1: Static validation
  const errors = await validateExerciseFolder(folderPath, language);
  const buildsOn = await checkFolderBuildsOn(folderPath);
  if (buildsOn) errors.push(buildsOn);

  const criticalErrors = errors.filter((e) => !e.code.startsWith("W"));
  const warnings = errors.filter((e) => e.code.startsWith("W"));

  for (const w of warnings) {
    console.warn(`  ⚠ ${w.code}: ${w.message}${w.file ? ` (${w.file})` : ""}`);
  }

  if (criticalErrors.length > 0) {
    for (const e of criticalErrors) {
      console.error(`  ✗ ${e.code}: ${e.message}${e.file ? ` (${e.file})` : ""}`);
    }
    console.error(`\n${String(criticalErrors.length)} error(s) found. Exiting 1.`);
    process.exit(1);
  }

  console.log("  ✓ Static validation passed");

  console.log("\n✓ All checks passed");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
