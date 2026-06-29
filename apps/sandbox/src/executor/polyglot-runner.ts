import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { writeFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { accessSync } from "node:fs";
import type { ExecutionResult, TraceFrame } from "./docker-runner.js";

const TRACE_PREFIX = "__TRACE__:";

// JS/TS shim — prepended to user code so `trace.step({...})` works
const JS_TRACE_SHIM = `const trace={step:(f)=>{try{process.stdout.write("${TRACE_PREFIX}"+JSON.stringify(f)+"\\n")}catch{}}};`;

// Python shim
const PY_TRACE_SHIM = `
import json as __trace_json
class __TraceHelper:
    def step(self, **kwargs): print("${TRACE_PREFIX}" + __trace_json.dumps(kwargs), flush=True)
trace = __TraceHelper()
`.trimStart();

// Extracts trace frames from stdout, returns clean stdout and frames
function extractTrace(raw: string | null): { stdout: string | null; trace: TraceFrame[] } {
  if (!raw) return { stdout: raw, trace: [] };
  const frames: TraceFrame[] = [];
  const clean = raw
    .split("\n")
    .filter((line) => {
      if (line.startsWith(TRACE_PREFIX)) {
        try { frames.push(JSON.parse(line.slice(TRACE_PREFIX.length)) as TraceFrame); } catch { /* ignore malformed */ }
        return false;
      }
      return true;
    })
    .join("\n");
  return { stdout: clean || null, trace: frames };
}

function withTrace(result: ExecutionResult): ExecutionResult {
  const { stdout, trace } = extractTrace(result.stdout);
  return { ...result, stdout, trace: trace.length ? trace : undefined };
}

const execFileAsync = promisify(execFile);
const TIMEOUT_MS = parseInt(process.env["EXECUTION_TIMEOUT_MS"] ?? "30000", 10);

// Find the tsx binary shipped with this monorepo
// This file lives at apps/sandbox/src/executor/ — go 4 levels up to get repo root
const _HERE = dirname(fileURLToPath(import.meta.url));
const TSX_BIN = (() => {
  const repoRoot = join(_HERE, "../../../..");
  const candidates = [
    join(repoRoot, "node_modules/.pnpm/node_modules/.bin/tsx"),
    join(repoRoot, "node_modules/.bin/tsx"),
    join(repoRoot, "apps/sandbox/node_modules/.bin/tsx"),
  ];
  for (const c of candidates) {
    try {
      accessSync(c);
      return c;
    } catch {
      // continue
    }
  }
  return "tsx"; // fallback to PATH
})();

// Detect host kotlinc + java (much faster than Docker when available)
const KOTLINC_BIN = (() => {
  const candidates = ["/opt/homebrew/bin/kotlinc", "/usr/local/bin/kotlinc"];
  for (const c of candidates) {
    try { accessSync(c); return c; } catch { /* continue */ }
  }
  return null;
})();
const JAVA_BIN = (() => {
  const candidates = [
    "/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home/bin/java",
    "/usr/local/bin/java",
    "/usr/bin/java",
  ];
  for (const c of candidates) {
    try { accessSync(c); return c; } catch { /* continue */ }
  }
  return "java";
})();

// Docker images used for languages not available on the host
const DOCKER_IMAGES: Record<string, string> = {
  elixir: "elixir:1.16-alpine",
  java: "eclipse-temurin:21-alpine",
  kotlin: "zenika/kotlin:latest",
  assembly: "fluent-assembly:latest",
};

function stripMainFromC(code: string): string {
  return code.replace(/\n\s*int\s+main\s*\([^)]*\)\s*\{[\s\S]*$/, "\n");
}

// Strip _start entry and its global declaration from ASM stub when linking with a test.
// The test file provides its own _start.
function stripAsmEntry(code: string): string {
  return code
    .replace(/^global\s+_start\s*\n?/gm, "")
    .replace(/\n_start:\n[\s\S]*$/, "\n");
}

function stripKotlinMain(code: string): string {
  return code.replace(/\n\s*fun main\s*\([^)]*\)\s*\{[\s\S]*$/, "\n");
}

function mergeRustStubIntoTest(stub: string, testFile: string): string {
  const pubStub = stub
    .replace(/^fn /gm, "pub fn ")
    .replace(/^pub pub fn /gm, "pub fn ")
    .replace(/^const /gm, "pub const ")
    .replace(/^pub pub const /gm, "pub const ")
    .replace(/^struct /gm, "pub struct ")
    .replace(/^pub pub struct /gm, "pub struct ")
    .replace(/^enum /gm, "pub enum ")
    .replace(/^pub pub enum /gm, "pub enum ")
    .replace(/^type /gm, "pub type ")
    .replace(/^pub pub type /gm, "pub type ");
  const stubNoMain = pubStub.replace(/\n\s*pub fn main\s*\(\s*\)[\s\S]*$/, "\n");

  const modBlock = /mod solution \{[\s\S]*?\n\}/;
  const userMod = `mod solution {\n${stubNoMain}\n}`;
  if (modBlock.test(testFile)) {
    return testFile.replace(modBlock, userMod);
  }
  return `mod solution {\n${stubNoMain}\n}\n\n${testFile}`;
}

async function execInDir(
  dir: string,
  cmd: string,
  args: string[],
): Promise<ExecutionResult> {
  const start = Date.now();
  const result = await execFileAsync(cmd, args, {
    cwd: dir,
    timeout: TIMEOUT_MS,
    maxBuffer: 1024 * 1024,
    env: { ...process.env, NODE_PATH: undefined },
  }).then(
    ({ stdout, stderr }) => ({ stdout, stderr, timedOut: false, exitCode: 0 }),
    (err: NodeJS.ErrnoException & { stdout?: string; stderr?: string; killed?: boolean; code?: number | string }) => ({
      stdout: err.stdout ?? null,
      stderr: err.stderr ?? null,
      timedOut: err.killed === true || err.code === "ETIMEDOUT",
      exitCode: typeof err.code === "number" ? err.code : 1,
    }),
  );
  return {
    stdout: result.stdout || null,
    stderr: result.stderr || null,
    exitCode: result.exitCode,
    runtimeMs: Date.now() - start,
    timedOut: result.timedOut,
  };
}

// Run a command inside a Docker container with the temp dir mounted at /code
async function execInDocker(
  dir: string,
  image: string,
  cmd: string[],
  opts: { platform?: string } = {},
): Promise<ExecutionResult> {
  const platformArgs = opts.platform ? ["--platform", opts.platform] : [];
  return execInDir(dir, "docker", [
    "run", "--rm",
    ...platformArgs,
    "--network=none",
    "--memory=256m",
    "--ulimit", "nofile=1024:1024",
    "-v", `${dir}:/code`,
    "-w", "/code",
    image,
    ...cmd,
  ]);
}

async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = join(tmpdir(), `fluent-${randomUUID()}`);
  await mkdir(dir, { recursive: true });
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export async function runCode(
  code: string,
  language: string,
  testFile?: string,
): Promise<ExecutionResult> {
  const isSuite = !!testFile;

  return withTempDir(async (dir) => {

    // ── JavaScript ────────────────────────────────────────────────────────────
    if (language === "javascript") {
      await writeFile(join(dir, "stub.js"), JS_TRACE_SHIM + "\n" + code, "utf8");
      if (isSuite) {
        await writeFile(join(dir, "solution_test.js"), JS_TRACE_SHIM + "\n" + testFile!, "utf8");
        return withTrace(await execInDir(dir, process.execPath, ["solution_test.js"]));
      }
      return withTrace(await execInDir(dir, process.execPath, ["stub.js"]));
    }

    // ── TypeScript ────────────────────────────────────────────────────────────
    if (language === "typescript") {
      await writeFile(join(dir, "stub.ts"), JS_TRACE_SHIM + "\n" + code, "utf8");
      if (isSuite) {
        await writeFile(join(dir, "solution_test.ts"), JS_TRACE_SHIM + "\n" + testFile!, "utf8");
        return withTrace(await execInDir(dir, TSX_BIN, ["solution_test.ts"]));
      }
      return withTrace(await execInDir(dir, TSX_BIN, ["stub.ts"]));
    }

    // ── Python ────────────────────────────────────────────────────────────────
    if (language === "python") {
      await writeFile(join(dir, "stub.py"), PY_TRACE_SHIM + code, "utf8");
      if (isSuite) {
        await writeFile(join(dir, "solution_test.py"), PY_TRACE_SHIM + testFile!, "utf8");
        return withTrace(await execInDir(dir, "python3", ["solution_test.py"]));
      }
      return withTrace(await execInDir(dir, "python3", ["stub.py"]));
    }

    // ── Ruby ──────────────────────────────────────────────────────────────────
    if (language === "ruby") {
      await writeFile(join(dir, "stub.rb"), code, "utf8");
      if (isSuite) {
        // Normalise require_relative to always point at "stub"
        const cleaned = testFile!.replace(
          /^require_relative\s+["'](exemplar)["']/gm,
          'require_relative "stub"',
        );
        await writeFile(join(dir, "solution_test.rb"), cleaned, "utf8");
        return execInDir(dir, "ruby", ["solution_test.rb"]);
      }
      return execInDir(dir, "ruby", ["stub.rb"]);
    }

    // ── C ─────────────────────────────────────────────────────────────────────
    if (language === "c") {
      if (isSuite) {
        await writeFile(join(dir, "stub_impl.c"), stripMainFromC(code), "utf8");
        await writeFile(join(dir, "solution_test.c"), testFile!, "utf8");
        const o = await execInDir(dir, "gcc", ["-c", "stub_impl.c", "-o", "stub.o", "-w"]);
        if (o.exitCode !== 0) return o;
        const t = await execInDir(dir, "gcc", ["solution_test.c", "stub.o", "-o", "test", "-w"]);
        if (t.exitCode !== 0) return t;
        return execInDir(dir, "./test", []);
      }
      await writeFile(join(dir, "stub.c"), code, "utf8");
      const c = await execInDir(dir, "gcc", ["stub.c", "-o", "stub_out", "-w"]);
      if (c.exitCode !== 0) return c;
      return execInDir(dir, "./stub_out", []);
    }

    // ── C++ ───────────────────────────────────────────────────────────────────
    // Compile stub + test as a single translation unit so the test sees the
    // full class definition (not just a forward declaration).
    if (language === "cpp") {
      if (isSuite) {
        const combined = `${stripMainFromC(code)}\n${testFile!}`;
        await writeFile(join(dir, "combined.cpp"), combined, "utf8");
        const c = await execInDir(dir, "g++", ["combined.cpp", "-o", "test", "-std=c++17", "-w"]);
        if (c.exitCode !== 0) return c;
        return execInDir(dir, "./test", []);
      }
      await writeFile(join(dir, "stub.cpp"), code, "utf8");
      const c = await execInDir(dir, "g++", ["stub.cpp", "-o", "stub_out", "-std=c++17", "-w"]);
      if (c.exitCode !== 0) return c;
      return execInDir(dir, "./stub_out", []);
    }

    // ── Rust ──────────────────────────────────────────────────────────────────
    if (language === "rust") {
      if (isSuite) {
        await writeFile(join(dir, "test.rs"), mergeRustStubIntoTest(code, testFile!), "utf8");
        const c = await execInDir(dir, "rustc", ["test.rs", "-o", "test"]);
        if (c.exitCode !== 0) return c;
        return execInDir(dir, "./test", []);
      }
      await writeFile(join(dir, "main.rs"), code, "utf8");
      const c = await execInDir(dir, "rustc", ["main.rs", "-o", "stub_out"]);
      if (c.exitCode !== 0) return c;
      return execInDir(dir, "./stub_out", []);
    }

    // ── Shell ─────────────────────────────────────────────────────────────────
    if (language === "shell") {
      await writeFile(join(dir, "stub.sh"), code, "utf8");
      if (isSuite) {
        const cleaned = testFile!.replace(
          /^source\s+["']?\$\(dirname[^)]+\)\/exemplar\.sh["']?.*$/gm,
          'source "$(dirname "$0")/stub.sh"',
        );
        await writeFile(join(dir, "solution_test.sh"), cleaned, "utf8");
        return execInDir(dir, "bash", ["solution_test.sh"]);
      }
      return execInDir(dir, "bash", ["stub.sh"]);
    }

    // ── Terraform ─────────────────────────────────────────────────────────────
    // Tests are bash+grep scripts — no terraform CLI needed
    if (language === "terraform") {
      await writeFile(join(dir, "stub.tf"), code, "utf8");
      if (isSuite) {
        await writeFile(join(dir, "solution_test.sh"), testFile!, "utf8");
        // Pass stub.tf as the target so the test validates the user's file
        return execInDir(dir, "bash", ["solution_test.sh", "stub.tf"]);
      }
      // Run-only: just show the file contents (no terraform CLI in dev)
      return { stdout: code, stderr: null, exitCode: 0, runtimeMs: 0, timedOut: false };
    }

    // ── Helm ──────────────────────────────────────────────────────────────────
    // Tests are bash+grep scripts — no helm CLI needed
    if (language === "helm") {
      await writeFile(join(dir, "stub.yaml"), code, "utf8");
      if (isSuite) {
        await writeFile(join(dir, "solution_test.sh"), testFile!, "utf8");
        return execInDir(dir, "bash", ["solution_test.sh"]);
      }
      return { stdout: code, stderr: null, exitCode: 0, runtimeMs: 0, timedOut: false };
    }

    // ── Elixir (Docker) ───────────────────────────────────────────────────────
    if (language === "elixir") {
      await writeFile(join(dir, "stub.ex"), code, "utf8");
      if (isSuite) {
        // Strip Code.require_file — stub.ex is in the same /code dir
        const cleaned = testFile!.replace(
          /^Code\.require_file\s*\(.*?\).*$/gm,
          'Code.require_file("stub.ex", "/code")',
        );
        await writeFile(join(dir, "solution_test.exs"), cleaned, "utf8");
        return execInDocker(dir, DOCKER_IMAGES["elixir"]!, ["elixir", "solution_test.exs"]);
      }
      return execInDocker(dir, DOCKER_IMAGES["elixir"]!, ["elixir", "stub.ex"]);
    }

    // ── Java (Docker) ─────────────────────────────────────────────────────────
    if (language === "java") {
      // stub is Solution.java, test is SolutionTest.java
      await writeFile(join(dir, "Solution.java"), code, "utf8");
      if (isSuite) {
        await writeFile(join(dir, "SolutionTest.java"), testFile!, "utf8");
        const compile = await execInDocker(dir, DOCKER_IMAGES["java"]!, [
          "sh", "-c", "javac Solution.java SolutionTest.java && java SolutionTest",
        ]);
        return compile;
      }
      return execInDocker(dir, DOCKER_IMAGES["java"]!, [
        "sh", "-c", "javac Solution.java && java Solution",
      ]);
    }

    // ── Kotlin ────────────────────────────────────────────────────────────────
    // Strip fun main() from stub before combining — both stub and test define it.
    // Uses host kotlinc when available (brew install kotlin), Docker otherwise.
    if (language === "kotlin") {
      if (isSuite) {
        const combined = `${stripKotlinMain(code)}\n\n${testFile!}`;
        await writeFile(join(dir, "combined.kt"), combined, "utf8");
        if (KOTLINC_BIN) {
          const c = await execInDir(dir, KOTLINC_BIN, ["combined.kt", "-include-runtime", "-d", "combined.jar"]);
          if (c.exitCode !== 0) return c;
          return execInDir(dir, JAVA_BIN, ["-jar", "combined.jar"]);
        }
        return execInDocker(dir, DOCKER_IMAGES["kotlin"]!, [
          "sh", "-c", "kotlinc combined.kt -include-runtime -d combined.jar 2>&1 && java -jar combined.jar",
        ]);
      }
      await writeFile(join(dir, "stub.kt"), code, "utf8");
      if (KOTLINC_BIN) {
        const c = await execInDir(dir, KOTLINC_BIN, ["stub.kt", "-include-runtime", "-d", "stub.jar"]);
        if (c.exitCode !== 0) return c;
        return execInDir(dir, JAVA_BIN, ["-jar", "stub.jar"]);
      }
      return execInDocker(dir, DOCKER_IMAGES["kotlin"]!, [
        "sh", "-c", "kotlinc stub.kt -include-runtime -d stub.jar 2>&1 && java -jar stub.jar",
      ]);
    }

    // ── Assembly x86-64 NASM (Docker — needs Linux syscalls) ─────────────────
    // Tests use `extern` symbols defined in stub.asm, so compile both and link.
    if (language === "assembly") {
      if (isSuite) {
        await writeFile(join(dir, "stub.asm"), stripAsmEntry(code), "utf8");
        await writeFile(join(dir, "solution_test.asm"), testFile!, "utf8");
        return execInDocker(dir, DOCKER_IMAGES["assembly"]!, [
          "sh", "-c",
          "nasm -f elf64 stub.asm -o stub.o && " +
          "nasm -f elf64 solution_test.asm -o test.o && " +
          "ld stub.o test.o -o test && " +
          "./test",
        ], { platform: "linux/amd64" });
      }
      await writeFile(join(dir, "stub.asm"), code, "utf8");
      return execInDocker(dir, DOCKER_IMAGES["assembly"]!, [
        "sh", "-c",
        "nasm -f elf64 stub.asm -o stub.o && " +
        "ld stub.o -o stub_out && " +
        "./stub_out",
      ], { platform: "linux/amd64" });
    }

    return {
      stdout: null,
      stderr: `Language "${language}" is not supported.\n`,
      exitCode: 1,
      runtimeMs: 0,
      timedOut: false,
    };
  });
}
