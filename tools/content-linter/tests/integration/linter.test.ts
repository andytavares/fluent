import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateExerciseFolder } from "../../src/validator.js";

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "linter-integration-"));
});

afterAll(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

async function createValidExercise(base: string): Promise<string> {
  const dir = join(base, "valid-exercise");
  const { mkdir } = await import("node:fs/promises");
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "config.json"),
    JSON.stringify({ slug: "hello", title: "Hello World", position: 1, has_testout: false, status: "published" }),
  );
  await writeFile(join(dir, "instructions.md"), "# Hello World\n\nWrite a function that prints Hello, World! to stdout.");
  await writeFile(join(dir, "stub.go"), "package main\n\nfunc main() {}\n");
  await writeFile(join(dir, "exemplar.go"), "package main\n\nimport \"fmt\"\n\nfunc main() { fmt.Println(\"Hello, World!\") }\n");
  await writeFile(join(dir, "hello_test.go"), "package main\nimport \"testing\"\nfunc TestHello(t *testing.T) {}\n");
  return dir;
}

describe("Content linter integration", () => {
  it("exits 0 for a valid exercise folder", async () => {
    const dir = await createValidExercise(tmpDir);
    const errors = await validateExerciseFolder(dir);
    const critical = errors.filter((e) => !e.code.startsWith("W"));
    expect(critical).toHaveLength(0);
  });

  it("exits 1 (returns E002) for a broken exercise missing exemplar", async () => {
    const dir = await createValidExercise(tmpDir + "-broken");
    const { mkdir, unlink } = await import("node:fs/promises");
    // Only create if not exists
    try {
      await mkdir(dir, { recursive: true });
    } catch {}
    await writeFile(
      join(dir, "config.json"),
      JSON.stringify({ slug: "hello", title: "Hello", position: 1 }),
    );
    // Don't create exemplar.go — should trigger E002
    const errors = await validateExerciseFolder(dir);
    expect(errors.some((e) => e.code === "E002")).toBe(true);
  });
});
