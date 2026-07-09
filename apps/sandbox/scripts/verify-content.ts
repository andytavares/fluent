#!/usr/bin/env tsx
// Verifies authored content by running each concept's exemplar through the
// real execution engine against its lesson test suite (and its testout suite
// when the concept has one). This is the same seam learner code crosses —
// if the exemplar doesn't pass here, the lesson is broken.
//
// Usage: tsx scripts/verify-content.ts [trackSlug ...] [--concepts=slug,slug]
//        (default: all tracks, all concepts)

import { createContentStore } from "@fluent/content-config";
import { runGoCode } from "../src/executor/docker-runner.js";
import { runCode } from "../src/executor/polyglot-runner.js";

const store = createContentStore();
const args = process.argv.slice(2);
const conceptsArg = args.find((a) => a.startsWith("--concepts="));
const onlyConcepts = new Set(conceptsArg ? conceptsArg.slice("--concepts=".length).split(",") : []);
const only = new Set(args.filter((a) => !a.startsWith("--")));

interface Failure {
  track: string;
  concept: string;
  suite: "lesson" | "testout";
  detail: string;
}

async function runSuite(language: string, code: string, testFiles: string[]) {
  if (language === "go") return runGoCode(code, testFiles);
  return runCode(code, language, testFiles[0]);
}

async function verifyConcept(
  trackSlug: string,
  language: string,
  contentPath: string,
  slug: string,
  hasTestout: boolean,
): Promise<Failure[]> {
  const failures: Failure[] = [];
  const exemplar = store.getExemplar(contentPath, language);

  if (!exemplar) {
    return [{ track: trackSlug, concept: slug, suite: "lesson", detail: "missing exemplar" }];
  }

  const lessonTests = store.getLessonTestFiles(contentPath, language);
  if (lessonTests.length === 0) {
    failures.push({ track: trackSlug, concept: slug, suite: "lesson", detail: "missing lesson tests" });
  } else {
    const result = await runSuite(language, exemplar, lessonTests);
    if (result.exitCode !== 0 || result.timedOut) {
      failures.push({
        track: trackSlug,
        concept: slug,
        suite: "lesson",
        detail: `exit ${result.exitCode}${result.timedOut ? " (timeout)" : ""}: ${(result.stderr ?? result.stdout ?? "").slice(0, 400)}`,
      });
    }
  }

  if (hasTestout) {
    const testoutTests = store.getTestoutTestFiles(contentPath, language);
    if (testoutTests.length === 0) {
      failures.push({ track: trackSlug, concept: slug, suite: "testout", detail: "has_testout but no testout tests" });
    } else {
      // The exemplar solves the same task the test-out challenge poses, so it
      // must pass the testout suite too.
      const result = await runSuite(language, exemplar, testoutTests);
      if (result.exitCode !== 0 || result.timedOut) {
        failures.push({
          track: trackSlug,
          concept: slug,
          suite: "testout",
          detail: `exit ${result.exitCode}${result.timedOut ? " (timeout)" : ""}: ${(result.stderr ?? result.stdout ?? "").slice(0, 400)}`,
        });
      }
    }
  }

  return failures;
}

async function main() {
  const tracks = store.listTracks().filter((t) => only.size === 0 || only.has(t.config.slug));
  const failures: Failure[] = [];
  let verified = 0;

  for (const track of tracks) {
    const concepts = store
      .listConcepts(track.dir)
      .filter((c) => onlyConcepts.size === 0 || onlyConcepts.has(c.config.slug));
    process.stdout.write(`${track.config.slug} (${track.config.language}, ${concepts.length} concepts): `);

    const CONCURRENCY = 4;
    const queue = [...concepts];
    const results: Failure[][] = [];
    await Promise.all(
      Array.from({ length: CONCURRENCY }, async () => {
        for (let item = queue.shift(); item; item = queue.shift()) {
          results.push(
            await verifyConcept(
              track.config.slug,
              track.config.language,
              item.contentPath,
              item.config.slug,
              item.config.has_testout,
            ),
          );
        }
      }),
    );

    const trackFailures = results.flat();
    verified += concepts.length;
    failures.push(...trackFailures);
    console.log(trackFailures.length === 0 ? "✓ all pass" : `✗ ${trackFailures.length} failure(s)`);
  }

  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const f of failures) {
      console.log(`  ✗ ${f.track}/${f.concept} [${f.suite}] ${f.detail.replaceAll("\n", " ⏎ ")}`);
    }
  }
  console.log(`\n${verified} concepts verified, ${failures.length} failure(s)`);
  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
