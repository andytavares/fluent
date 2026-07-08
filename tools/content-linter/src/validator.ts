import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { conceptConfigSchema, LANG_EXT, TEST_FILE_PATTERNS } from "@fluent/content-config";

export type LintError = {
  code: string;
  message: string;
  file?: string;
};

export async function validateExerciseFolder(
  folderPath: string,
  language = "go",
): Promise<LintError[]> {
  const errors: LintError[] = [];
  const ext = LANG_EXT[language] ?? language;

  // E001: folder must exist
  try {
    const s = await stat(folderPath);
    if (!s.isDirectory()) {
      errors.push({ code: "E001", message: `Not a directory: ${folderPath}` });
      return errors;
    }
  } catch {
    errors.push({ code: "E001", message: `Folder not found: ${folderPath}` });
    return errors;
  }

  const files = await readdir(folderPath);

  // E002: required files present
  const requiredFiles = ["config.json", "instructions.md", `stub.${ext}`, `exemplar.${ext}`];
  for (const required of requiredFiles) {
    if (!files.includes(required)) {
      errors.push({ code: "E002", message: `Missing required file: ${required}`, file: required });
    }
  }

  // E003: config.json must be valid JSON
  if (files.includes("config.json")) {
    try {
      const raw = await readFile(join(folderPath, "config.json"), "utf-8");
      const parsed = JSON.parse(raw) as unknown;

      // E004: config must match schema
      const result = conceptConfigSchema.safeParse(parsed);
      if (!result.success) {
        errors.push({
          code: "E004",
          message: `config.json schema invalid: ${result.error.message}`,
          file: "config.json",
        });
      } else if (result.data.has_testout) {
        // E008: if has_testout, must have testout stub and test files
        if (!files.includes(`testout_stub.${ext}`)) {
          errors.push({ code: "E008", message: `has_testout=true but testout_stub.${ext} missing`, file: `testout_stub.${ext}` });
        }
        if (!files.includes(`testout_test.${ext}`)) {
          errors.push({ code: "E008", message: `has_testout=true but testout_test.${ext} missing`, file: `testout_test.${ext}` });
        }
      }
    } catch {
      errors.push({ code: "E003", message: "config.json is not valid JSON", file: "config.json" });
    }
  }

  // E005: stub must be non-empty
  if (files.includes(`stub.${ext}`)) {
    const stubContent = await readFile(join(folderPath, `stub.${ext}`), "utf-8");
    if (stubContent.trim().length === 0) {
      errors.push({ code: "E005", message: `stub.${ext} is empty`, file: `stub.${ext}` });
    }
  }

  // E006: exemplar must be non-empty
  if (files.includes(`exemplar.${ext}`)) {
    const exemplarContent = await readFile(join(folderPath, `exemplar.${ext}`), "utf-8");
    if (exemplarContent.trim().length === 0) {
      errors.push({ code: "E006", message: `exemplar.${ext} is empty`, file: `exemplar.${ext}` });
    }
  }

  // E007: lesson test file required (testout tests don't count)
  const testPattern = TEST_FILE_PATTERNS[language] ?? /_test\./;
  const hasTestFile = files.some((f) => testPattern.test(f) && !f.startsWith("testout"));
  if (!hasTestFile) {
    errors.push({ code: "E007", message: `Missing test file (*_test.${ext})` });
  }

  // W001: instructions.md should have minimum length
  if (files.includes("instructions.md")) {
    const content = await readFile(join(folderPath, "instructions.md"), "utf-8");
    if (content.trim().length < 50) {
      errors.push({ code: "W001", message: "instructions.md is very short (< 50 chars)" });
    }
  }

  return errors;
}
