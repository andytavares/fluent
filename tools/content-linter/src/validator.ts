import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

export type LintError = {
  code: string;
  message: string;
  file?: string;
};

const REQUIRED_FILES = [
  "config.json",
  "instructions.md",
  "stub.go",
  "exemplar.go",
] as const;

const configSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().positive(),
  has_testout: z.boolean().default(false),
  status: z.enum(["wip", "published"]).default("wip"),
});

export async function validateExerciseFolder(folderPath: string): Promise<LintError[]> {
  const errors: LintError[] = [];

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
  for (const required of REQUIRED_FILES) {
    if (!files.includes(required)) {
      errors.push({ code: "E002", message: `Missing required file: ${required}`, file: required });
    }
  }

  // E003: config.json must be valid JSON
  if (files.includes("config.json")) {
    try {
      const { readFile } = await import("node:fs/promises");
      const raw = await readFile(join(folderPath, "config.json"), "utf-8");
      const parsed = JSON.parse(raw) as unknown;

      // E004: config must match schema
      const result = configSchema.safeParse(parsed);
      if (!result.success) {
        errors.push({
          code: "E004",
          message: `config.json schema invalid: ${result.error.message}`,
          file: "config.json",
        });
      }
    } catch {
      errors.push({ code: "E003", message: "config.json is not valid JSON", file: "config.json" });
    }
  }

  // E005: stub.go must be non-empty
  if (files.includes("stub.go")) {
    const { readFile } = await import("node:fs/promises");
    const content = await readFile(join(folderPath, "stub.go"), "utf-8");
    if (content.trim().length === 0) {
      errors.push({ code: "E005", message: "stub.go is empty", file: "stub.go" });
    }
  }

  // E006: exemplar.go must be non-empty
  if (files.includes("exemplar.go")) {
    const { readFile } = await import("node:fs/promises");
    const content = await readFile(join(folderPath, "exemplar.go"), "utf-8");
    if (content.trim().length === 0) {
      errors.push({ code: "E006", message: "exemplar.go is empty", file: "exemplar.go" });
    }
  }

  // E007: test file required (slug_test.go or *_test.go)
  const hasTestFile = files.some((f) => f.endsWith("_test.go") && !f.startsWith("testout"));
  if (!hasTestFile) {
    errors.push({ code: "E007", message: "Missing test file (*_test.go)" });
  }

  // E008: if has_testout, must have testout_stub.go and testout_test.go
  if (files.includes("config.json")) {
    try {
      const { readFile } = await import("node:fs/promises");
      const raw = await readFile(join(folderPath, "config.json"), "utf-8");
      const config = JSON.parse(raw) as { has_testout?: boolean };
      if (config.has_testout) {
        if (!files.includes("testout_stub.go")) {
          errors.push({ code: "E008", message: "has_testout=true but testout_stub.go missing", file: "testout_stub.go" });
        }
        if (!files.includes("testout_test.go")) {
          errors.push({ code: "E008", message: "has_testout=true but testout_test.go missing", file: "testout_test.go" });
        }
      }
    } catch {
      // already caught above
    }
  }

  // W001: instructions.md should have minimum length
  if (files.includes("instructions.md")) {
    const { readFile } = await import("node:fs/promises");
    const content = await readFile(join(folderPath, "instructions.md"), "utf-8");
    if (content.trim().length < 50) {
      errors.push({ code: "W001", message: "instructions.md is very short (< 50 chars)" });
    }
  }

  return errors;
}
