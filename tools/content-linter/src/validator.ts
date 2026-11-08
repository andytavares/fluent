import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { conceptConfigSchema, createContentStore, LANG_EXT, TEST_FILE_PATTERNS } from "@fluent/content-config";
import { extractTaskPrompt } from "@fluent/content-config/task-prompt";

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

  if (files.includes("instructions.md")) {
    const content = await readFile(join(folderPath, "instructions.md"), "utf-8");
    errors.push(...checkInstructions(content));
  }

  return errors;
}

function checkInstructions(content: string): LintError[] {
  const errors: LintError[] = [];
  // W001: instructions.md should have minimum length
  if (content.trim().length < 50) {
    errors.push({ code: "W001", message: "instructions.md is very short (< 50 chars)" });
  }
  return [...errors, ...checkLessonStructure(content)];
}

const MAX_CODE_LINE_WIDTH = 43;

function checkLessonStructure(instructions: string): LintError[] {
  const errors: LintError[] = [];
  const lines = instructions.split("\n");
  const file = "instructions.md";
  if (!lines.includes("## The task")) {
    errors.push({ code: "E012", message: "no '## The task' line", file });
  }
  if (!extractTaskPrompt(instructions).includes("```")) {
    errors.push({ code: "E013", message: "task section has no fenced code block", file });
  }
  const firstLine = lines.find((line) => line.trim().length > 0) ?? "";
  if (firstLine.startsWith("# ")) {
    errors.push({ code: "E014", message: "lesson starts with a '# ' title; the page header shows it", file });
  }
  const wideLines = findWideCodeLines(lines);
  if (wideLines.length > 0) {
    errors.push({
      code: "W002",
      message: `${String(wideLines.length)} code line(s) wider than ${String(MAX_CODE_LINE_WIDTH)} chars, first at line ${String(wideLines[0])}`,
      file,
    });
  }
  return errors;
}

function findWideCodeLines(lines: string[]): number[] {
  const wideLineNumbers: number[] = [];
  let inFence = false;
  lines.forEach((line, index) => {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
    } else if (inFence && line.replace(/\t/g, "    ").length > MAX_CODE_LINE_WIDTH) {
      wideLineNumbers.push(index + 1);
    }
  });
  return wideLineNumbers;
}

export function checkBuildsOn(
  instructions: string,
  position: number,
  earlierTitles: string[],
): LintError | null {
  const file = "instructions.md";
  const section = instructions.match(/## What you build\n([\s\S]*?)(?=\n## |$)/)?.[1];
  if (section === undefined) {
    return { code: "E015", message: "no '## What you build' section", file };
  }
  if (position <= 1) return null;
  if (!/\bbuilds on\b/i.test(section)) {
    return { code: "E015", message: "'## What you build' does not say 'builds on'", file };
  }
  if (!earlierTitles.some((title) => section.includes(title))) {
    return { code: "E015", message: "'## What you build' names no earlier concept title", file };
  }
  return null;
}

// CI lints one folder at a time, so the earlier titles come from the folder's siblings.
export async function checkFolderBuildsOn(folderPath: string): Promise<LintError | null> {
  const concepts = createContentStore().listConcepts(join(folderPath, "../.."));
  const self = concepts.find((concept) => concept.dir === folderPath);
  if (!self) return null;
  const { position } = self.config;
  const earlierTitles = concepts.filter((c) => c.config.position < position).map((c) => c.config.title);
  const instructions = await readFile(join(folderPath, "instructions.md"), "utf-8").catch(() => "");
  return checkBuildsOn(instructions, position, earlierTitles);
}
