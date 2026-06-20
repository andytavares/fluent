#!/usr/bin/env node
import { resolve } from "node:path";
import { validateExerciseFolder } from "./validator.js";
import { runExerciseChecks } from "./runner.js";

async function main() {
  const folderArg = process.argv[2];
  if (!folderArg) {
    console.error("Usage: content-linter <exercise-folder>");
    process.exit(1);
  }

  const folderPath = resolve(folderArg);
  console.log(`Linting: ${folderPath}\n`);

  // Step 1: Static validation
  const errors = await validateExerciseFolder(folderPath);

  const criticalErrors = errors.filter((e) => !e.code.startsWith("W"));
  const warnings = errors.filter((e) => e.code.startsWith("W"));

  for (const w of warnings) {
    console.warn(`  ⚠ ${w.code}: ${w.message}${w.file ? ` (${w.file})` : ""}`);
  }

  if (criticalErrors.length > 0) {
    for (const e of criticalErrors) {
      console.error(`  ✗ ${e.code}: ${e.message}${e.file ? ` (${e.file})` : ""}`);
    }
    console.error(`\n${criticalErrors.length} error(s) found. Exiting 1.`);
    process.exit(1);
  }

  console.log("  ✓ Static validation passed");

  // Step 2: Runtime checks (go build + go test)
  const runResult = await runExerciseChecks(folderPath);

  if (!runResult.stubBuilds) {
    console.error(`  ✗ E004: stub.go does not compile\n${runResult.stderr}`);
    process.exit(1);
  }
  console.log("  ✓ stub.go compiles");

  if (!runResult.exemplarPasses) {
    console.error(`  ✗ E004: exemplar tests fail\n${runResult.stderr}`);
    process.exit(1);
  }
  console.log("  ✓ exemplar tests pass");

  console.log("\n✓ All checks passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
