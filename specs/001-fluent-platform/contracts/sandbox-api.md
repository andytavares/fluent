# Sandbox Service Contract

**Service**: `apps/sandbox` (TypeScript/Fastify) | **Revised**: 2026-06-21 | **Plan**: [plan.md](../plan.md)

The sandbox is a TypeScript/Fastify process. It is not called directly by the API over HTTP — the API enqueues a BullMQ job (Redis-backed) and the sandbox worker picks it up. The sandbox also exposes HTTP endpoints for SSE streaming, health checks, and Prometheus metrics.

---

## Job Queue Interface (BullMQ)

**Queue name**: `code-execution`

The API enqueues jobs via `ExecutionQueue.enqueue()`. The sandbox worker (`execution-worker.ts`) processes them concurrently.

### Job payload

```ts
{
  jobId: string;        // UUID — same as the DB submission ID
  userId: string;
  conceptId: string;
  exerciseId?: string;
  code: string;
  language: string;     // see execution engine table below
  isSuite: boolean;
  testFiles?: string[]; // test file content (not paths) — populated by API when isSuite=true
}
```

### Result protocol (Redis Streams)

Results are written to a Redis Stream at key `result:{jobId}`. The SSE endpoint tails this stream and forwards events to the browser.

| `type` field | Additional fields | Description |
|---|---|---|
| `stdout` | `data: string` | Captured stdout |
| `stderr` | `data: string` | Captured stderr |
| `trace` | `data: JSON string` | Serialized `TraceFrame[]` (JS/TS/Python only) |
| `result` | `exit_code`, `runtime_ms`, `timed_out` | Terminal event — stream ends after this |

Stream TTL: 5 minutes. The stream token → jobId mapping lives at `stream:{token}` (TTL 10 min).

---

## HTTP Endpoints

Base URL: `http://localhost:3002` (configurable via `SANDBOX_PORT` / `HOST` env vars).

### `GET /stream/:token`

SSE stream of execution output. Resolves the token to a jobId via Redis, then polls the Redis Stream at 200 ms intervals and forwards events.

**Events**:

```
event: stdout
data: {"data":"hello\n"}

event: stderr
data: {"data":"undefined: x\n"}

event: trace
data: {"frames":[{"label":"step 1","state":{"x":1}}]}

event: result
data: {"exit_code":0,"runtime_ms":142,"timed_out":false}

event: error
data: {"message":"Stream timeout"}
```

Connection closes after `result` or `error`. Max wait: 60 seconds. Returns `404` if token not found.

### `GET /healthz`

Returns `{"status":"ok"}`.

### `GET /readyz`

Pings Redis. Returns `{"status":"ok"}` if reachable.

### `GET /metrics`

Prometheus metrics (prom-client). Scraped by the Prometheus container in docker-compose.

---

## tRPC Router (`/trpc`)

The sandbox exposes a tRPC router for internal procedure calls.

### `execution.execute` (mutation)

**Input**: `{ jobId, code, language, isSuite }`
**Output**: `{ jobId, streamUrl: "/stream/{jobId}" }`

Validates the job and enforces per-user rate limiting (token bucket, Redis-backed). In normal flow the job is already enqueued by the API via BullMQ; this procedure is used for direct internal calls.

---

## Execution Engine

| Language | Runner | Mechanism |
|---|---|---|
| `go` | `docker-runner.ts` | `docker run --rm --network=none --memory=256m golang:1.21-alpine go run`/`go test` |
| `javascript` | `polyglot-runner.ts` | host `node` process |
| `typescript` | `polyglot-runner.ts` | host `tsx` binary |
| `python` | `polyglot-runner.ts` | host `python3` |
| `ruby` | `polyglot-runner.ts` | host `ruby` |
| `c` | `polyglot-runner.ts` | host `gcc` (compile + run) |
| `cpp` | `polyglot-runner.ts` | host `g++` (compile + run, `-std=c++17`) |
| `rust` | `polyglot-runner.ts` | host `rustc` (compile + run) |
| `shell` | `polyglot-runner.ts` | host `bash` |
| `terraform` | `polyglot-runner.ts` | text/grep validation (no terraform CLI) |
| `helm` | `polyglot-runner.ts` | text/grep validation (no helm CLI) |
| `elixir` | `polyglot-runner.ts` | `docker run elixir:1.16-alpine` |
| `java` | `polyglot-runner.ts` | `docker run eclipse-temurin:21-alpine` (javac + java) |
| `kotlin` | `polyglot-runner.ts` | host `kotlinc` + `java` if available, else `docker run zenika/kotlin:latest` |
| `assembly` | `polyglot-runner.ts` | `docker run --platform linux/amd64 fluent-assembly:latest` (NASM + ld) |

**Timeout**: `EXECUTION_TIMEOUT_MS` (default 30 000 ms).
**Memory cap**: 256 MB enforced by Docker for Docker-based paths; uncapped for host-native paths.

Each execution writes code to a tmpdir, runs, and cleans up unconditionally.

### Trace protocol

For JavaScript, TypeScript, and Python, a `trace.step({...})` shim is prepended to user code. Output lines prefixed `__TRACE__:` are stripped from stdout and emitted as `trace` SSE events containing serialized `TraceFrame[]`. Used by the step visualizer in the UI.
