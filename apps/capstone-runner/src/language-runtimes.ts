// Per-language capstone runtime configuration (task #28). This is the stable
// contract that content authoring (task #29) reads exact image/driver/
// entrypoint info from — one entry per track that has (or will have) a
// capstone. Each entry mirrors the shape of the pre-existing Go-only setup
// in provisioner.ts: a one-time setupScript that installs a Postgres client
// library and writes /code/setup-done, and a runLoopScript that polls
// /code/.deployed's mtime and (re)builds/restarts the learner's server.
//
// Contract every runLoopScript honors, regardless of language: the learner's
// server MUST listen on port 8080 and read DATABASE_URL from its environment
// to reach Postgres. Content instructions (task #29) tell learners this.

export interface LanguageRuntime {
  /** Track slug this runtime serves, e.g. "python", "rust". */
  trackSlug: string;
  /** Capstone content slug, e.g. "python-crud-api" (task #29 creates this content dir). */
  capstoneSlug: string;
  /** Docker image with the language's toolchain. */
  image: string;
  /** Path (relative to /code) the learner's submitted code is written to. */
  entrypointFilename: string;
  /**
   * Shell script run ONCE at container startup, before the restart loop, to
   * install a Postgres client library so it's cached and needs no further
   * network access per redeploy. Must write a sentinel /code/setup-done file
   * when finished (waitForAppReady polls this). curl (needed by every step's
   * verify.sh) does NOT need installing here — composeAppCommand prepends the
   * shared ENSURE_CURL_SCRIPT before every language's setupScript.
   */
  setupScript: string;
  /**
   * Shell script that runs in a loop, polling /code/.deployed's mtime, and on
   * change: kills the previous run, (re)builds if the language is compiled,
   * and starts the learner's server in the background with output captured
   * to /code/out.log (truncated on each restart, so a compiled language's
   * build errors land there too, same as a failing `go run` today).
   */
  runLoopScript: string;
}

// Every step's verify.sh drives the learner's server with curl, but most
// base images (alpine, debian-slim) don't ship it. Enforced ONCE here, at
// the same composition point that joins setup + run-loop, so a new language
// runtime can't forget it. Failures land in /code/setup.log, not /dev/null.
export const ENSURE_CURL_SCRIPT = `
mkdir -p /code
(command -v curl >/dev/null 2>&1 || apk add --no-cache curl || (apt-get update -qq && apt-get install -y -qq curl)) >>/code/setup.log 2>&1
`;

/** The app container's full startup command: ensure-curl, then the language's one-time setup, then its restart loop. */
export function composeAppCommand(runtime: LanguageRuntime): string {
  return `${ENSURE_CURL_SCRIPT}\n${runtime.setupScript}\n${runtime.runLoopScript}`;
}

// go — unchanged from the pre-existing hardcoded constants (byte-for-byte
// the same script), just now sourced from this table. golang:1.21-alpine +
// pgx (the actively maintained, database/sql-compatible driver), fetched
// once via `go get` since `go run` alone does no dependency resolution.
const GO_SETUP_SCRIPT = `
apk add --no-cache curl >/dev/null 2>&1
mkdir -p /code
cat > /code/go.mod <<'EOF'
module solution

go 1.21
EOF
(cd /code && go get github.com/jackc/pgx/v5/stdlib) >/code/setup.log 2>&1
touch /code/setup-done
`;

const GO_RUN_LOOP_SCRIPT = `
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
`;

// python — python:3.12-slim (current official slim tag). psycopg3's binary
// wheel needs no compiler/libpq-dev, so a single pip install suffices.
// --break-system-packages works around PEP 668's externally-managed-environment
// guard that Debian-based python images enforce for the system interpreter.
const PYTHON_SETUP_SCRIPT = `
mkdir -p /code
pip install --no-cache-dir --break-system-packages --quiet "psycopg[binary]" >>/code/setup.log 2>&1
touch /code/setup-done
`;

const PYTHON_RUN_LOOP_SCRIPT = `
touch /code/main.py /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    (cd /code && python /code/main.py >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

// javascript — node:22-alpine (current Node LTS). `pg` is the de facto
// standard, actively maintained Postgres client for Node.
const JAVASCRIPT_SETUP_SCRIPT = `
mkdir -p /code
(cd /code && npm init -y >/code/setup.log 2>&1 && npm install pg >>/code/setup.log 2>&1)
touch /code/setup-done
`;

const JAVASCRIPT_RUN_LOOP_SCRIPT = `
touch /code/main.js /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    (cd /code && node /code/main.js >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

// typescript — node:22-alpine + tsx (runs .ts directly, no separate compile
// step needed for a restart loop, unlike a plain tsc build).
const TYPESCRIPT_SETUP_SCRIPT = `
mkdir -p /code
(cd /code && npm init -y >/code/setup.log 2>&1 && npm install pg typescript tsx >>/code/setup.log 2>&1)
touch /code/setup-done
`;

const TYPESCRIPT_RUN_LOOP_SCRIPT = `
touch /code/main.ts /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    (cd /code && npx tsx /code/main.ts >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

// ruby — ruby:3.3-alpine. The `pg` gem has a native extension, so alpine
// needs build tools + postgresql-dev (libpq headers) to compile it once.
const RUBY_SETUP_SCRIPT = `
apk add --no-cache build-base postgresql-dev >/dev/null 2>&1
mkdir -p /code
gem install pg --no-document >/code/setup.log 2>&1
touch /code/setup-done
`;

const RUBY_RUN_LOOP_SCRIPT = `
touch /code/main.rb /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    (cd /code && ruby /code/main.rb >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

// java — eclipse-temurin:21-jdk-alpine (official-tier, actively maintained
// JDK image). The JDBC driver jar is fetched once from Maven Central (pinned
// at the current pgjdbc release, 42.7.13) to a fixed path so javac/java can
// -cp against it without a full Maven/Gradle project.
const POSTGRESQL_JDBC_VERSION = "42.7.13";
const JDBC_DRIVER_PATH = "/opt/drivers/postgresql.jar";

const JAVA_SETUP_SCRIPT = `
apk add --no-cache curl >/dev/null 2>&1
mkdir -p /code /opt/drivers
curl -sSL -o ${JDBC_DRIVER_PATH} https://repo1.maven.org/maven2/org/postgresql/postgresql/${POSTGRESQL_JDBC_VERSION}/postgresql-${POSTGRESQL_JDBC_VERSION}.jar >/code/setup.log 2>&1
touch /code/setup-done
`;

const JAVA_RUN_LOOP_SCRIPT = `
touch /code/Main.java /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    mkdir -p /code/out
    (cd /code && javac Main.java -cp ${JDBC_DRIVER_PATH} -d /code/out >> /code/out.log 2>&1 && java -cp /code/out:${JDBC_DRIVER_PATH} Main >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

// kotlin — same JDK-tier base image as java (eclipse-temurin:21-jdk-alpine),
// with the official kotlinc compiler (current stable 2.4.0, from JetBrains'
// own GitHub releases, not a niche/unofficial pre-built image) installed
// once at startup. Same JDBC driver jar as java. A top-level `main` in
// Main.kt compiles to class MainKt (Kotlin's standard convention).
const KOTLIN_VERSION = "2.4.0";

const KOTLIN_SETUP_SCRIPT = `
apk add --no-cache curl unzip bash >/dev/null 2>&1
mkdir -p /code /opt/drivers
curl -sSL -o /tmp/kotlinc.zip https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-compiler-${KOTLIN_VERSION}.zip >/code/setup.log 2>&1
unzip -q /tmp/kotlinc.zip -d /opt >>/code/setup.log 2>&1
rm -f /tmp/kotlinc.zip
curl -sSL -o ${JDBC_DRIVER_PATH} https://repo1.maven.org/maven2/org/postgresql/postgresql/${POSTGRESQL_JDBC_VERSION}/postgresql-${POSTGRESQL_JDBC_VERSION}.jar >>/code/setup.log 2>&1
touch /code/setup-done
`;

const KOTLIN_RUN_LOOP_SCRIPT = `
touch /code/Main.kt /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    mkdir -p /code/out
    (cd /code && /opt/kotlinc/bin/kotlinc Main.kt -cp ${JDBC_DRIVER_PATH} -include-runtime -d /code/out/app.jar >> /code/out.log 2>&1 && java -cp /code/out/app.jar:${JDBC_DRIVER_PATH} MainKt >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

// rust — rust:1-slim (Debian base, not rust:1-alpine: alpine's musl target
// adds cross-compilation footguns for crates with C dependencies that aren't
// worth it here). A tiny fixed Cargo.toml scaffolds a real cargo project so
// the learner's submitted code just becomes src/main.rs; `cargo build
// --release` handles both dependency fetch (once, at setup) and rebuild (on
// every redeploy) instead of hand-rolling rustc --extern flags. Uses the
// synchronous `postgres` crate (over tokio-postgres) — no async runtime
// needed for a simple restart-loop learner server, which keeps the
// generated code closer in spirit to the other languages' blocking servers.
const RUST_SETUP_SCRIPT = `
mkdir -p /code/src
cat > /code/Cargo.toml <<'EOF'
[package]
name = "solution"
version = "0.1.0"
edition = "2021"

[dependencies]
postgres = "0.19"
EOF
echo 'fn main() {}' > /code/src/main.rs
(cd /code && cargo build --release) >/code/setup.log 2>&1
touch /code/setup-done
`;

const RUST_RUN_LOOP_SCRIPT = `
touch /code/src/main.rs /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    (cd /code && cargo build --release >> /code/out.log 2>&1 && ./target/release/solution >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

// c — gcc:latest (official, Debian-based). libpq-dev provides the Postgres C
// client library (libpq) headers + shared lib.
const C_SETUP_SCRIPT = `
mkdir -p /code
(apt-get update -qq && apt-get install -y -qq libpq-dev) >/code/setup.log 2>&1
touch /code/setup-done
`;

const C_RUN_LOOP_SCRIPT = `
touch /code/main.c /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    (cd /code && gcc main.c -lpq -o app >> /code/out.log 2>&1 && ./app >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

// cpp — same base image + Postgres client lib as c, compiled with g++.
const CPP_SETUP_SCRIPT = C_SETUP_SCRIPT;

const CPP_RUN_LOOP_SCRIPT = `
touch /code/main.cpp /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    (cd /code && g++ main.cpp -lpq -o app >> /code/out.log 2>&1 && ./app >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

// elixir — elixir:1.17-alpine. A minimal fixed mix.exs adds the `postgrex`
// dependency (the actively maintained, de facto standard Postgres driver for
// the BEAM); `mix deps.get` fetches it once. The learner's code becomes
// lib/main.ex inside this Mix project — `mix run --no-halt` both compiles
// (surfacing compile errors the same way `go run` does) and runs it, so no
// separate build step is needed in the loop.
const ELIXIR_SETUP_SCRIPT = `
apk add --no-cache ca-certificates >/dev/null 2>&1
mkdir -p /code/lib
cat > /code/mix.exs <<'EOF'
defmodule Solution.MixProject do
  use Mix.Project

  def project do
    [
      app: :solution,
      version: "0.1.0",
      elixir: "~> 1.17",
      deps: deps()
    ]
  end

  def application do
    [extra_applications: [:logger]]
  end

  defp deps do
    [{:postgrex, "~> 0.19"}]
  end
end
EOF
mix local.hex --force >/code/setup.log 2>&1
mix local.rebar --force >>/code/setup.log 2>&1
(cd /code && mix deps.get) >>/code/setup.log 2>&1
touch /code/setup-done
`;

const ELIXIR_RUN_LOOP_SCRIPT = `
touch /code/lib/main.ex /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    (cd /code && mix run --no-halt >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

export const LANGUAGE_RUNTIMES: Record<string, LanguageRuntime> = {
  go: {
    trackSlug: "go",
    capstoneSlug: "go-crud-api",
    image: "golang:1.21-alpine",
    entrypointFilename: "main.go",
    setupScript: GO_SETUP_SCRIPT,
    runLoopScript: GO_RUN_LOOP_SCRIPT,
  },
  python: {
    trackSlug: "python",
    capstoneSlug: "python-crud-api",
    image: "python:3.12-slim",
    entrypointFilename: "main.py",
    setupScript: PYTHON_SETUP_SCRIPT,
    runLoopScript: PYTHON_RUN_LOOP_SCRIPT,
  },
  javascript: {
    trackSlug: "javascript",
    capstoneSlug: "javascript-crud-api",
    image: "node:22-alpine",
    entrypointFilename: "main.js",
    setupScript: JAVASCRIPT_SETUP_SCRIPT,
    runLoopScript: JAVASCRIPT_RUN_LOOP_SCRIPT,
  },
  typescript: {
    trackSlug: "typescript",
    capstoneSlug: "typescript-crud-api",
    image: "node:22-alpine",
    entrypointFilename: "main.ts",
    setupScript: TYPESCRIPT_SETUP_SCRIPT,
    runLoopScript: TYPESCRIPT_RUN_LOOP_SCRIPT,
  },
  ruby: {
    trackSlug: "ruby",
    capstoneSlug: "ruby-crud-api",
    image: "ruby:3.3-alpine",
    entrypointFilename: "main.rb",
    setupScript: RUBY_SETUP_SCRIPT,
    runLoopScript: RUBY_RUN_LOOP_SCRIPT,
  },
  java: {
    trackSlug: "java",
    capstoneSlug: "java-crud-api",
    image: "eclipse-temurin:21-jdk-alpine",
    entrypointFilename: "Main.java",
    setupScript: JAVA_SETUP_SCRIPT,
    runLoopScript: JAVA_RUN_LOOP_SCRIPT,
  },
  kotlin: {
    trackSlug: "kotlin",
    capstoneSlug: "kotlin-crud-api",
    image: "eclipse-temurin:21-jdk-alpine",
    entrypointFilename: "Main.kt",
    setupScript: KOTLIN_SETUP_SCRIPT,
    runLoopScript: KOTLIN_RUN_LOOP_SCRIPT,
  },
  rust: {
    trackSlug: "rust",
    capstoneSlug: "rust-crud-api",
    image: "rust:1-slim",
    entrypointFilename: "src/main.rs",
    setupScript: RUST_SETUP_SCRIPT,
    runLoopScript: RUST_RUN_LOOP_SCRIPT,
  },
  c: {
    trackSlug: "c",
    capstoneSlug: "c-crud-api",
    image: "gcc:latest",
    entrypointFilename: "main.c",
    setupScript: C_SETUP_SCRIPT,
    runLoopScript: C_RUN_LOOP_SCRIPT,
  },
  cpp: {
    trackSlug: "cpp",
    capstoneSlug: "cpp-crud-api",
    image: "gcc:latest",
    entrypointFilename: "main.cpp",
    setupScript: CPP_SETUP_SCRIPT,
    runLoopScript: CPP_RUN_LOOP_SCRIPT,
  },
  elixir: {
    trackSlug: "elixir",
    capstoneSlug: "elixir-crud-api",
    image: "elixir:1.17-alpine",
    entrypointFilename: "lib/main.ex",
    setupScript: ELIXIR_SETUP_SCRIPT,
    runLoopScript: ELIXIR_RUN_LOOP_SCRIPT,
  },
};
