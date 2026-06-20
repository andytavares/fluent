# Sandbox Service API Contract

**Service**: `apps/sandbox` (Go, internal) | **Date**: 2026-06-19 | **Plan**: [plan.md](../plan.md)

The sandbox service is an internal Go service. It is not exposed to the internet — only `apps/api` calls it. It wraps Judge0's REST API, enforces per-learner rate limiting (FR-016a), and proxies SSE output streams back to the API for forwarding to the browser.

Base URL: `http://sandbox-svc:3001` (internal Kubernetes service DNS)

---

## Endpoints

### `POST /execute`

Submit code for execution (run-only or test suite). Called by `apps/api` after creating a `submissions` row.

**Request**:
```json
{
  "submission_id": "<uuid>",
  "user_id": "<uuid>",
  "language": "go",
  "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"hello\")\n}\n",
  "submission_type": "run",
  "test_code": null,
  "limits": {
    "wall_time_seconds": 10,
    "memory_bytes": 268435456
  }
}
```

For `submission_type: test_suite` or `test_out`, `test_code` contains the hidden test file content.

**Response 202**:
```json
{
  "judge0_token": "<judge0_submission_token>",
  "stream_url": "http://sandbox-svc:3001/stream/<judge0_token>"
}
```

**Response 429** (rate limited):
```json
{
  "error": "rate_limited",
  "retry_after_seconds": 15
}
```

Rate limit policy: 10 executions per user per 60-second sliding window (token bucket). Configurable via environment variable `SANDBOX_RATE_LIMIT_RPM`.

---

### `GET /stream/:judge0Token`

SSE stream of execution output. Polls Judge0 at 200ms intervals and emits output chunks as they arrive.

**Events** (same contract as the public API forwards to the browser):
```
event: stdout
data: {"chunk": "hello\n"}

event: result
data: {
  "exit_code": 0,
  "runtime_ms": 142,
  "memory_bytes": 4096000,
  "timed_out": false,
  "status": "accepted"
}
```

Judge0 status values mapped to `result.status`:
- `Accepted` → `accepted`
- `Time Limit Exceeded` → `timeout`
- `Runtime Error` → `runtime_error`
- `Compilation Error` → `compile_error`
- `Internal Error` → `internal_error`

---

### `GET /healthz`

Returns `200 OK` with `{"status":"ok","judge0_reachable":true}`. Used by K8s liveness probe.

---

## Rate Limit Behavior (FR-016a)

Per-user token bucket:
- Capacity: 10 tokens
- Refill: 1 token per 6 seconds (10/minute steady state)
- On `429`: response includes `retry_after_seconds` — the number of seconds until the next token is available
- Bucket state is stored in-process (not Redis) for v1; acceptable because sandbox instances are not horizontally scaled beyond 1 replica at 100-learner beta scale

The `apps/api` handler reads the `429` from sandbox and forwards `{"error":"rate_limited","retry_after_seconds":N}` to the browser, which displays the "please wait" message (FR-016a UX).

---

## Judge0 Integration Notes

- Judge0 CE REST API: `POST /submissions`, `GET /submissions/:token`
- The sandbox service uses `wait=true` on Judge0 POSTs for executions under 2 seconds expected runtime; for longer runs it polls at 200ms intervals
- Language ID for Go 1.22: Judge0 language ID `95` (Go 1.18.5 on Judge0 CE — verify against deployed instance)
- Stdout/stderr from Judge0 are base64-encoded; the sandbox service decodes before emitting SSE chunks
