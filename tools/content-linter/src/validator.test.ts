import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkBuildsOn, checkFolderBuildsOn, validateExerciseFolder } from "./validator.js";

const VALID_INSTRUCTIONS = [
  "# Test",
  "",
  "This is a test concept with enough content to pass the linter validation check.",
  "",
  "## What you build",
  "",
  "A greeter.",
  "",
  "## The task",
  "",
  "Write `greet`.",
  "",
  "```go",
  "func greet() string",
  "```",
  "",
].join("\n");

async function createValidFolder(base: string): Promise<string> {
  const dir = await mkdtemp(join(base, "exercise-"));
  await writeFile(
    join(dir, "config.json"),
    JSON.stringify({ slug: "test", title: "Test", position: 1, has_testout: false, status: "published" }),
  );
  await writeFile(join(dir, "instructions.md"), VALID_INSTRUCTIONS);
  await writeFile(join(dir, "stub.go"), "package main\n\nfunc main() {}");
  await writeFile(join(dir, "exemplar.go"), "package main\n\nfunc main() {}");
  await writeFile(join(dir, "stub_test.go"), "package main\nimport \"testing\"\nfunc TestStub(t *testing.T) {}");
  return dir;
}

let tmpBase: string;

beforeAll(async () => {
  tmpBase = await mkdtemp(join(tmpdir(), "fluent-linter-"));
});

afterAll(async () => {
  await rm(tmpBase, { recursive: true, force: true });
});

describe("Content linter validator", () => {
  it("returns no errors for a valid exercise folder", async () => {
    const dir = await createValidFolder(tmpBase);
    const errors = await validateExerciseFolder(dir);
    const critical = errors.filter((e) => !e.code.startsWith("W"));
    expect(critical).toHaveLength(0);
  });

  it("E001: reports error for missing folder", async () => {
    const errors = await validateExerciseFolder("/tmp/does-not-exist-12345");
    expect(errors.some((e) => e.code === "E001")).toBe(true);
  });

  it("E002: reports error for missing required file", async () => {
    const dir = await createValidFolder(tmpBase);
    // Remove stub.go
    const { unlink } = await import("node:fs/promises");
    await unlink(join(dir, "stub.go"));
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E002" && e.file === "stub.go")).toBe(true);
  });

  it("E003: reports error for invalid config.json", async () => {
    const dir = await createValidFolder(tmpBase);
    await writeFile(join(dir, "config.json"), "not json");
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E003")).toBe(true);
  });

  it("E004: reports error for invalid config schema", async () => {
    const dir = await createValidFolder(tmpBase);
    await writeFile(join(dir, "config.json"), JSON.stringify({ slug: "", title: "T", position: 0 }));
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E004")).toBe(true);
  });

  it("E007: reports error for missing test file", async () => {
    const dir = await createValidFolder(tmpBase);
    const { unlink } = await import("node:fs/promises");
    await unlink(join(dir, "stub_test.go"));
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E007")).toBe(true);
  });

  it("E008: reports error for has_testout without testout files", async () => {
    const dir = await createValidFolder(tmpBase);
    await writeFile(
      join(dir, "config.json"),
      JSON.stringify({ slug: "test", title: "Test", position: 1, has_testout: true, status: "published" }),
    );
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E008")).toBe(true);
  });

  it("E007: testout tests do not satisfy the lesson test file requirement", async () => {
    const dir = await createValidFolder(tmpBase);
    const { unlink } = await import("node:fs/promises");
    await unlink(join(dir, "stub_test.go"));
    await writeFile(join(dir, "testout_test.go"), "package main");
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E007")).toBe(true);
  });

  it("validates a non-Go folder using the language's file conventions", async () => {
    const dir = await mkdtemp(join(tmpBase, "exercise-py-"));
    await writeFile(
      join(dir, "config.json"),
      JSON.stringify({ slug: "py", title: "Py", position: 1, has_testout: false, status: "published" }),
    );
    await writeFile(join(dir, "instructions.md"), VALID_INSTRUCTIONS);
    await writeFile(join(dir, "stub.py"), "def solve():\n    pass\n");
    await writeFile(join(dir, "exemplar.py"), "def solve():\n    return 1\n");
    await writeFile(join(dir, "solution_test.py"), "import stub\n");
    const errors = await validateExerciseFolder(dir, "python");
    const critical = errors.filter((e) => !e.code.startsWith("W"));
    expect(critical).toHaveLength(0);
  });

  it("E012: reports error when no line is exactly '## The task'", async () => {
    const dir = await createValidFolder(tmpBase);
    await writeFile(join(dir, "instructions.md"), VALID_INSTRUCTIONS.replace("## The task", "## The task:"));
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E012")).toBe(true);
  });

  it("E013: reports error when the task section has no fenced code block", async () => {
    const dir = await createValidFolder(tmpBase);
    const withCodeBeforeTask = "# Test\n\n```go\nx := 1\n```\n\n## The task\n\nWrite `greet`.\n\n## Hints\n\nNone.\n";
    await writeFile(join(dir, "instructions.md"), withCodeBeforeTask);
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E013")).toBe(true);
  });

  it("E014: reports error when the first non-empty line is not a level-1 heading", async () => {
    const dir = await createValidFolder(tmpBase);
    await writeFile(join(dir, "instructions.md"), "\n## Test\n" + VALID_INSTRUCTIONS);
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E014")).toBe(true);
  });

  it("E014: accepts a level-1 heading after leading blank lines", async () => {
    const dir = await createValidFolder(tmpBase);
    await writeFile(join(dir, "instructions.md"), "\n\n" + VALID_INSTRUCTIONS);
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E014")).toBe(false);
  });

  it("W002: reports one warning with the count and first line of code lines wider than 43", async () => {
    const dir = await createValidFolder(tmpBase);
    const wide = "x".repeat(44);
    const content = VALID_INSTRUCTIONS + `\n\`\`\`go\n${"y".repeat(43)}\n${wide}\n\t${"z".repeat(40)}\n\`\`\`\n`;
    await writeFile(join(dir, "instructions.md"), content);
    const errors = await validateExerciseFolder(dir);
    const warnings = errors.filter((e) => e.code === "W002");
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.message).toContain("2 code line(s)");
    expect(warnings[0]?.message).toContain("line 19");
  });

  it("W002: ignores wide lines outside fenced code blocks", async () => {
    const dir = await createValidFolder(tmpBase);
    await writeFile(join(dir, "instructions.md"), VALID_INSTRUCTIONS + "\n" + "w".repeat(80) + "\n");
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "W002")).toBe(false);
  });
});

describe("checkBuildsOn (E015)", () => {
  const builds = (body: string) => `# T\n\n## What you build\n\n${body}\n\n## The task\n\n\`\`\`go\nx\n\`\`\`\n`;

  it("accepts position 1 with only the section", () => {
    expect(checkBuildsOn(builds("A greeter."), 1, [])).toBeNull();
  });

  it("reports E015 when the section is missing", () => {
    expect(checkBuildsOn("# T\n\n## The task\n\nx\n", 1, [])?.code).toBe("E015");
  });

  it("reports E015 when a later concept does not say 'builds on'", () => {
    expect(checkBuildsOn(builds("Extends Variables with loops."), 2, ["Variables"])?.code).toBe("E015");
  });

  it("reports E015 when a later concept names no earlier title", () => {
    expect(checkBuildsOn(builds("This builds on earlier work."), 2, ["Variables"])?.code).toBe("E015");
  });

  it("ignores earlier titles that appear only outside the section", () => {
    const text = builds("This builds on earlier work.") + "\nSee Variables.\n";
    expect(checkBuildsOn(text, 2, ["Variables"])?.code).toBe("E015");
  });

  it("accepts a later concept that builds on an earlier title", () => {
    expect(checkBuildsOn(builds("This builds on Variables."), 3, ["Basics", "Variables"])).toBeNull();
  });
});

type ConceptFixture = { folder: string; title: string; intro: string };

async function writeConcept(trackDir: string, fixture: ConceptFixture): Promise<string> {
  const { folder, title, intro } = fixture;
  const dir = join(trackDir, "concepts", folder);
  await mkdir(dir, { recursive: true });
  const position = parseInt(folder, 10);
  const slug = folder.slice(3);
  await writeFile(join(dir, "config.json"), JSON.stringify({ slug, title, position, has_testout: false, status: "published" }));
  await writeFile(join(dir, "instructions.md"), `## What you build\n\n${intro}\n\n## The task\n\n\`\`\`go\nf()\n\`\`\`\n`);
  return dir;
}

describe("checkFolderBuildsOn (E015 for one folder, as CI runs it)", () => {
  it("reports E015 when a later concept names no earlier concept", async () => {
    const trackDir = await mkdtemp(join(tmpBase, "track-"));
    await writeConcept(trackDir, { folder: "01-basics", title: "Basics", intro: "You write a greeter." });
    const dir = await writeConcept(trackDir, { folder: "02-loops", title: "Loops", intro: "You write a counter." });
    const error = await checkFolderBuildsOn(dir);
    expect(error?.code).toBe("E015");
  });

  it("accepts a later concept that builds on an earlier title", async () => {
    const trackDir = await mkdtemp(join(tmpBase, "track-"));
    await writeConcept(trackDir, { folder: "01-basics", title: "Basics", intro: "You write a greeter." });
    const dir = await writeConcept(trackDir, { folder: "02-loops", title: "Loops", intro: "This lesson builds on **Basics**." });
    expect(await checkFolderBuildsOn(dir)).toBeNull();
  });
});
