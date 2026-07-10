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

  // A capstone project config + stub, to exercise getCapstoneProject.
  const capstoneProjectDir = join(root, "content/capstone/go-crud-api");
  await mkdir(capstoneProjectDir, { recursive: true });
  await writeFile(
    join(capstoneProjectDir, "config.json"),
    JSON.stringify({
      slug: "go-crud-api",
      title: "Go CRUD API",
      description: "Build a REST API with a real PostgreSQL database.",
      language: "go",
      steps: 6,
    }),
  );
  await writeFile(join(capstoneProjectDir, "stub.go"), "package main\n\n// stub\n");

  // Capstone steps 1 through 11, to exercise the numeric-vs-lexicographic sort
  // bug (folder "step-10"/"step-11" sort before "step-2" as strings).
  const capstoneDir = join(root, "content/capstone/go-crud-api");
  for (let n = 1; n <= 11; n++) {
    const stepDir = join(capstoneDir, `step-${n}`);
    await mkdir(stepDir, { recursive: true });
    await writeFile(
      join(stepDir, "config.json"),
      JSON.stringify({ step_number: n, title: `Step ${n} title`, description: `Step ${n} description` }),
    );
    // Leave instructions.md missing for step 1 to exercise the empty-instructions case.
    if (n !== 1) {
      await writeFile(join(stepDir, "instructions.md"), `Instructions for step ${n}`);
    }
  }

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

  it("reads the exemplar for the track language", () => {
    expect(store.getExemplar(conceptPath, "go")).toBe("package main // exemplar");
  });

  it("returns empty string when the exemplar is missing", () => {
    expect(store.getExemplar("content/tracks/go/concepts/99-nope", "go")).toBe("");
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

describe("ContentStore capstone steps", () => {
  it("returns steps ordered numerically by step_number, not lexicographically by folder name", () => {
    const steps = store.getCapstoneSteps("go-crud-api");
    expect(steps.map((s) => s.stepNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("maps title, description, and instructions fields correctly", () => {
    const steps = store.getCapstoneSteps("go-crud-api");
    const step5 = steps.find((s) => s.stepNumber === 5)!;
    expect(step5.title).toBe("Step 5 title");
    expect(step5.description).toBe("Step 5 description");
    expect(step5.instructions).toBe("Instructions for step 5");
    expect(step5.dir).toBe(join(root, "content/capstone/go-crud-api/step-5"));
  });

  it("returns empty string for instructions when instructions.md is missing", () => {
    const steps = store.getCapstoneSteps("go-crud-api");
    const step1 = steps.find((s) => s.stepNumber === 1)!;
    expect(step1.instructions).toBe("");
  });

  it("returns [] for a capstone slug that does not exist", () => {
    expect(store.getCapstoneSteps("nonexistent-capstone")).toEqual([]);
  });
});

describe("ContentStore capstone project", () => {
  it("reads the project config and language-matched stub", () => {
    const project = store.getCapstoneProject("go-crud-api");
    expect(project).toEqual({
      slug: "go-crud-api",
      title: "Go CRUD API",
      description: "Build a REST API with a real PostgreSQL database.",
      language: "go",
      stub: "package main\n\n// stub\n",
    });
  });

  it("returns null for a capstone slug that does not exist", () => {
    expect(store.getCapstoneProject("nonexistent-capstone")).toBeNull();
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
