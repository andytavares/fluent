import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative } from "node:path";
import { LANG_EXT, TEST_FILE_PATTERNS } from "./lang.js";
import { capstoneProjectConfigSchema, capstoneStepConfigSchema, conceptConfigSchema, trackConfigSchema } from "./schema.js";
import { extractTaskPrompt } from "./task-prompt.js";
import type { ConceptConfig, TrackConfig } from "./schema.js";

export { extractTaskPrompt };

// This file lives at packages/content-config/src — three levels up is the repo root.
const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

export interface TrackEntry {
  /** Absolute path to the track directory */
  dir: string;
  config: TrackConfig;
}

export interface ConceptEntry {
  /** Absolute path to the concept directory */
  dir: string;
  /** Path relative to the repo root — the value stored as Exercise.contentPath */
  contentPath: string;
  config: ConceptConfig;
}

export interface CapstoneStepEntry {
  stepNumber: number;
  title: string;
  description: string;
  instructions: string;
  /** Absolute path to the step directory */
  dir: string;
}

export interface CapstoneProjectEntry {
  slug: string;
  title: string;
  description: string;
  language: string;
  stub: string;
}

export interface ContentStore {
  readonly root: string;
  getLessonStub(contentPath: string, language: string): string;
  getTestoutStub(contentPath: string, language: string): string;
  getExemplar(contentPath: string, language: string): string;
  getInstructions(contentPath: string): string;
  getTaskPrompt(contentPath: string): string;
  getLessonTestFiles(contentPath: string, language: string): string[];
  getTestoutTestFiles(contentPath: string, language: string): string[];
  listTracks(): TrackEntry[];
  listConcepts(trackDir: string): ConceptEntry[];
  getCapstoneSteps(capstoneSlug: string): CapstoneStepEntry[];
  getCapstoneProject(capstoneSlug: string): CapstoneProjectEntry | null;
}

function listFiles(dir: string): string[] {
  try {
    return readdirSync(dir).sort();
  } catch {
    return [];
  }
}

function readFileOrEmpty(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function findStub(dir: string, prefix: string, language: string): string {
  const ext = LANG_EXT[language];
  const files = listFiles(dir);
  const match =
    (ext ? files.find((f) => f.startsWith(prefix) && f.endsWith(`.${ext}`)) : undefined) ??
    files.find((f) => f.startsWith(prefix));
  return match ? readFileOrEmpty(join(dir, match)) : "";
}

function findTestFiles(dir: string, language: string, testout: boolean): string[] {
  const pattern = TEST_FILE_PATTERNS[language] ?? /_test\./;
  return listFiles(dir)
    .filter((f) => pattern.test(f) && f.startsWith("testout") === testout)
    .map((f) => readFileOrEmpty(join(dir, f)));
}

export function createContentStore(root: string = DEFAULT_ROOT): ContentStore {
  const abs = (contentPath: string) => join(root, contentPath);

  return {
    root,

    getLessonStub(contentPath, language) {
      return findStub(abs(contentPath), "stub.", language);
    },

    getTestoutStub(contentPath, language) {
      return findStub(abs(contentPath), "testout_stub.", language);
    },

    getExemplar(contentPath, language) {
      return findStub(abs(contentPath), "exemplar.", language);
    },

    getInstructions(contentPath) {
      return readFileOrEmpty(join(abs(contentPath), "instructions.md"));
    },

    getTaskPrompt(contentPath) {
      return extractTaskPrompt(this.getInstructions(contentPath));
    },

    getLessonTestFiles(contentPath, language) {
      return findTestFiles(abs(contentPath), language, false);
    },

    getTestoutTestFiles(contentPath, language) {
      return findTestFiles(abs(contentPath), language, true);
    },

    listTracks() {
      const tracksDir = join(root, "content/tracks");
      return listFiles(tracksDir)
        .map((name) => join(tracksDir, name))
        .filter((dir) => existsSync(join(dir, "config.json")))
        .map((dir) => ({
          dir,
          config: trackConfigSchema.parse(JSON.parse(readFileSync(join(dir, "config.json"), "utf8"))),
        }));
    },

    listConcepts(trackDir) {
      const conceptsDir = join(trackDir, "concepts");
      return listFiles(conceptsDir)
        .filter((name) => /^\d+-.+/.test(name))
        // Numeric, not lexicographic: relying on zero-padding (01, 02, …) to
        // keep string sort aligned with folder order is a latent trap once a
        // track exceeds 9 or 99 concepts.
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .map((name) => join(conceptsDir, name))
        .filter((dir) => existsSync(join(dir, "config.json")))
        .map((dir) => ({
          dir,
          contentPath: relative(root, dir),
          config: conceptConfigSchema.parse(JSON.parse(readFileSync(join(dir, "config.json"), "utf8"))),
        }));
    },

    getCapstoneSteps(capstoneSlug) {
      const capstoneDir = join(root, "content/capstone", capstoneSlug);
      return listFiles(capstoneDir)
        .filter((name) => /^step-\d+$/.test(name))
        .map((name) => join(capstoneDir, name))
        .filter((dir) => existsSync(join(dir, "config.json")))
        .map((dir) => ({
          dir,
          config: capstoneStepConfigSchema.parse(JSON.parse(readFileSync(join(dir, "config.json"), "utf8"))),
          instructions: readFileOrEmpty(join(dir, "instructions.md")),
        }))
        // Numeric, not lexicographic: folder names like step-10 sort before
        // step-2 as strings — sort by the parsed step_number instead.
        .sort((a, b) => a.config.step_number - b.config.step_number)
        .map(({ dir, config, instructions }) => ({
          stepNumber: config.step_number,
          title: config.title,
          description: config.description,
          instructions,
          dir,
        }));
    },

    getCapstoneProject(capstoneSlug) {
      const projectDir = join(root, "content/capstone", capstoneSlug);
      const configPath = join(projectDir, "config.json");
      if (!existsSync(configPath)) return null;

      const config = capstoneProjectConfigSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
      const ext = LANG_EXT[config.language];
      const stub = ext ? readFileOrEmpty(join(projectDir, `stub.${ext}`)) : "";

      return {
        slug: config.slug,
        title: config.title,
        description: config.description,
        language: config.language,
        stub,
      };
    },
  };
}
