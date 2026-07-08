import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createContentStore, extractTaskPrompt } from "../src/index.js";
import type { ContentStore } from "../src/index.js";

const INSTRUCTIONS = `# Variables

Some intro.

## The task

Declare a variable named x.

## Notes

More text.
`;

let root: string;
let store: ContentStore;
const conceptPath = "content/tracks/go/concepts/01-variables-and-types";

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "fluent-content-"));

  const trackDir = join(root, "content/tracks/go");
  const conceptDir = join(root, conceptPath);
  await mkdir(conceptDir, { recursive: true });

  await writeFile(
    join(trackDir, "config.json"),
    JSON.stringify({
      slug: "go",
      title: "Go",
      description: "The Go track",
      language: "go",
      status: "published",
    }),
  );
  await writeFile(
    join(conceptDir, "config.json"),
    JSON.stringify({ slug: "variables-and-types", title: "Variables", position: 1, has_testout: true, status: "published" }),
  );
  await writeFile(join(conceptDir, "instructions.md"), INSTRUCTIONS);
  await writeFile(join(conceptDir, "stub.go"), "package main // stub");
  await writeFile(join(conceptDir, "exemplar.go"), "package main // exemplar");
  await writeFile(join(conceptDir, "variables_test.go"), "package main // lesson test");
  await writeFile(join(conceptDir, "testout_stub.go"), "package main // testout stub");
  await writeFile(join(conceptDir, "testout_test.go"), "package main // testout test");

  // A second track with no concepts dir, to exercise listTracks/listConcepts edges
  const emptyTrackDir = join(root, "content/tracks/rust");
  await mkdir(emptyTrackDir, { recursive: true });
  await writeFile(
    join(emptyTrackDir, "config.json"),
    JSON.stringify({ slug: "rust", title: "Rust", description: "Soon", language: "rust", status: "coming_soon" }),
  );

  store = createContentStore(root);
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("ContentStore stubs and instructions", () => {
  it("reads the lesson stub for the track language", () => {
    expect(store.getLessonStub(conceptPath, "go")).toBe("package main // stub");
  });

  it("falls back to any stub.* when the extension does not match", () => {
    expect(store.getLessonStub(conceptPath, "python")).toBe("package main // stub");
  });

  it("returns empty string when the concept dir is missing", () => {
    expect(store.getLessonStub("content/tracks/go/concepts/99-nope", "go")).toBe("");
  });

  it("reads the testout stub", () => {
    expect(store.getTestoutStub(conceptPath, "go")).toBe("package main // testout stub");
  });

  it("reads instructions.md", () => {
    expect(store.getInstructions(conceptPath)).toBe(INSTRUCTIONS);
  });

  it("returns empty instructions when missing", () => {
    expect(store.getInstructions("content/tracks/go/concepts/99-nope")).toBe("");
  });

  it("extracts the task prompt from instructions", () => {
    expect(store.getTaskPrompt(conceptPath)).toBe("Declare a variable named x.");
  });
});

describe("ContentStore test files", () => {
  it("returns lesson test files, excluding testout tests", () => {
    expect(store.getLessonTestFiles(conceptPath, "go")).toEqual(["package main // lesson test"]);
  });

  it("returns testout test files only", () => {
    expect(store.getTestoutTestFiles(conceptPath, "go")).toEqual(["package main // testout test"]);
  });

  it("returns [] when the concept dir is missing", () => {
    expect(store.getLessonTestFiles("content/tracks/go/concepts/99-nope", "go")).toEqual([]);
  });
});

describe("ContentStore track/concept listing", () => {
  it("lists tracks with validated configs", () => {
    const tracks = store.listTracks();
    expect(tracks.map((t) => t.config.slug).sort()).toEqual(["go", "rust"]);
    const go = tracks.find((t) => t.config.slug === "go")!;
    expect(go.config.language).toBe("go");
    expect(go.config.status).toBe("published");
  });

  it("lists concepts with contentPath relative to the repo root", () => {
    const go = store.listTracks().find((t) => t.config.slug === "go")!;
    const concepts = store.listConcepts(go.dir);
    expect(concepts).toHaveLength(1);
    expect(concepts[0]!.contentPath).toBe(conceptPath);
    expect(concepts[0]!.config.slug).toBe("variables-and-types");
    expect(concepts[0]!.config.has_testout).toBe(true);
  });

  it("returns [] for a track with no concepts dir", () => {
    const rust = store.listTracks().find((t) => t.config.slug === "rust")!;
    expect(store.listConcepts(rust.dir)).toEqual([]);
  });
});

describe("extractTaskPrompt", () => {
  it("extracts the section under '## The task'", () => {
    expect(extractTaskPrompt(INSTRUCTIONS)).toBe("Declare a variable named x.");
  });

  it("returns empty string when the section is absent", () => {
    expect(extractTaskPrompt("# Nothing here")).toBe("");
  });
});
