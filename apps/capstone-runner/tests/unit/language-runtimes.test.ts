import { describe, it, expect } from "vitest";
import { LANGUAGE_RUNTIMES, composeAppCommand, ENSURE_CURL_SCRIPT } from "../../src/language-runtimes.js";
import { CAPSTONE_SLUG_BY_TRACK } from "@fluent/capstone-contract";

// Task #29 (per-language capstone content) reads this table's shape to know
// which image/entrypoint/driver each track's capstone runs against — these
// tests pin down the contract it can rely on.

const EXPECTED_TRACK_SLUGS = [
  "go",
  "python",
  "javascript",
  "typescript",
  "ruby",
  "java",
  "kotlin",
  "rust",
  "c",
  "cpp",
  "elixir",
];

describe("LANGUAGE_RUNTIMES", () => {
  it("has an entry for every expected track slug, keyed by that slug", () => {
    for (const slug of EXPECTED_TRACK_SLUGS) {
      expect(LANGUAGE_RUNTIMES[slug]).toBeDefined();
      expect(LANGUAGE_RUNTIMES[slug]!.trackSlug).toBe(slug);
    }
    expect(Object.keys(LANGUAGE_RUNTIMES).sort()).toEqual([...EXPECTED_TRACK_SLUGS].sort());
  });

  it("every entry has a non-empty image, entrypointFilename, setupScript, and runLoopScript", () => {
    for (const slug of EXPECTED_TRACK_SLUGS) {
      const runtime = LANGUAGE_RUNTIMES[slug]!;
      expect(runtime.image.length).toBeGreaterThan(0);
      expect(runtime.entrypointFilename.length).toBeGreaterThan(0);
      expect(runtime.setupScript.length).toBeGreaterThan(0);
      expect(runtime.runLoopScript.length).toBeGreaterThan(0);
    }
  });

  it("stays in lockstep with CAPSTONE_SLUG_BY_TRACK — every runtime has a capstone slug and vice versa", () => {
    expect(Object.keys(LANGUAGE_RUNTIMES).sort()).toEqual(Object.keys(CAPSTONE_SLUG_BY_TRACK).sort());
  });

  it("every runLoopScript polls /code/.deployed and every setupScript signals /code/setup-done (mirrors the pre-existing Go restart-loop contract)", () => {
    for (const slug of EXPECTED_TRACK_SLUGS) {
      const runtime = LANGUAGE_RUNTIMES[slug]!;
      expect(runtime.setupScript).toContain("touch /code/setup-done");
      expect(runtime.runLoopScript).toContain("/code/.deployed");
      expect(runtime.runLoopScript).toContain("/code/out.log");
    }
  });

  it("composeAppCommand prepends the shared ensure-curl preamble before every language's setup (verify.sh drives the learner's server with curl; alpine/debian-slim bases don't ship it)", () => {
    for (const slug of EXPECTED_TRACK_SLUGS) {
      const runtime = LANGUAGE_RUNTIMES[slug]!;
      const command = composeAppCommand(runtime);
      const curlAt = command.indexOf(ENSURE_CURL_SCRIPT);
      const setupAt = command.indexOf(runtime.setupScript);
      expect(curlAt, `${slug} command must include the ensure-curl preamble`).toBeGreaterThanOrEqual(0);
      expect(setupAt).toBeGreaterThan(curlAt);
      expect(command.indexOf(runtime.runLoopScript)).toBeGreaterThan(setupAt);
    }
    // The preamble must handle both package-manager families and log failures.
    expect(ENSURE_CURL_SCRIPT).toContain("apk add");
    expect(ENSURE_CURL_SCRIPT).toContain("apt-get");
    expect(ENSURE_CURL_SCRIPT).toContain("/code/setup.log");
  });

  it("go's scripts are byte-for-byte the pre-existing hardcoded APP_RUN_LOOP_SCRIPT contents, just split at the setup-done boundary", () => {
    const go = LANGUAGE_RUNTIMES["go"]!;
    expect(go.image).toBe("golang:1.21-alpine");
    expect(go.entrypointFilename).toBe("main.go");
    expect(go.setupScript).toMatchInlineSnapshot(`
      "
      apk add --no-cache curl >/dev/null 2>&1
      mkdir -p /code
      cat > /code/go.mod <<'EOF'
      module solution

      go 1.21
      EOF
      (cd /code && go get github.com/jackc/pgx/v5/stdlib) >/code/setup.log 2>&1
      touch /code/setup-done
      "
    `);
    expect(go.runLoopScript).toMatchInlineSnapshot(`
      "
      touch /code/main.go /code/.deployed
      LAST=0
      PID=
      while true; do
        MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
        if [ "$MTIME" != "$LAST" ]; then
          LAST="$MTIME"
          if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
          : > /code/out.log
          (cd /code && go run main.go >> /code/out.log 2>&1) &
          PID=$!
        fi
        sleep 1
      done
      "
    `);
  });

  it("rust and elixir entrypoints live in nested directories, matching their scaffolded project layout", () => {
    expect(LANGUAGE_RUNTIMES["rust"]!.entrypointFilename).toBe("src/main.rs");
    expect(LANGUAGE_RUNTIMES["elixir"]!.entrypointFilename).toBe("lib/main.ex");
  });
});
