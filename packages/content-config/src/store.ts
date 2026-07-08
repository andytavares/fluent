import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative } from "node:path";
import { LANG_EXT, TEST_FILE_PATTERNS } from "./lang.js";
import { conceptConfigSchema, trackConfigSchema } from "./schema.js";
import type { ConceptConfig, TrackConfig } from "./schema.js";

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

export interface ContentStore {
  readonly root: string;
  getLessonStub(contentPath: string, language: string): string;
  getTestoutStub(contentPath: string, language: string): string;
  getInstructions(contentPath: string): string;
  getTaskPrompt(contentPath: string): string;
  getLessonTestFiles(contentPath: string, language: string): string[];
  getTestoutTestFiles(contentPath: string, language: string): string[];
  listTracks(): TrackEntry[];
  listConcepts(trackDir: string): ConceptEntry[];
}

export function extractTaskPrompt(instructions: string): string {
  const match = instructions.match(/## The task\n([\s\S]*?)(?=\n## |$)/);
  return match?.[1]?.trim() ?? "";
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
        .map((name) => join(conceptsDir, name))
        .filter((dir) => existsSync(join(dir, "config.json")))
        .map((dir) => ({
          dir,
          contentPath: relative(root, dir),
          config: conceptConfigSchema.parse(JSON.parse(readFileSync(join(dir, "config.json"), "utf8"))),
        }));
    },
  };
}
