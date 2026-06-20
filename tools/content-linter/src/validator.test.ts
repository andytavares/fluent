import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateExerciseFolder } from "./validator.js";

async function createValidFolder(base: string): Promise<string> {
  const dir = await mkdtemp(join(base, "exercise-"));
  await writeFile(
    join(dir, "config.json"),
    JSON.stringify({ slug: "test", title: "Test", position: 1, has_testout: false, status: "published" }),
  );
  await writeFile(join(dir, "instructions.md"), "# Test\n\nThis is a test exercise with enough content to pass the linter validation check.");
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
});
