# ADR-002: Sandbox Execution Engine

**Date**: 2026-06-19 | **Revised**: 2026-06-21 | **Status**: Accepted (supersedes Judge0 decision)

## Decision

Use a homegrown execution engine: a Docker-based runner for Go, and host-native compilers/runtimes for most other languages, with Docker fallback for languages not available on the host (Elixir, Java, Kotlin, x86-64 Assembly).

## Motivation

Every lesson run and test-out submission executes untrusted code. The sandbox must enforce wall-clock and memory limits (FR-012), isolate learner sessions (FR-013), and return output within 5 seconds p95 (SC-004).

## Rationale

**Go execution** (`docker-runner.ts`): runs `golang:1.21-alpine` via `docker run --rm --network=none --memory=256m` with the user's code mounted read-only at `/code`. Enforces network isolation, memory cap, and wall-clock timeout (`EXECUTION_TIMEOUT_MS`, default 30 s). Handles both `go run` (run-only) and `go test -v ./...` (test suite).

**Polyglot execution** (`polyglot-runner.ts`): dispatches to the right runner per language:
- **Host-native** (fast, no Docker overhead): JavaScript (`node`), TypeScript (`tsx`), Python (`python3`), Ruby (`ruby`), C (`gcc`), C++ (`g++`), Rust (`rustc`), Shell (`bash`), Terraform (text validation), Helm (text validation).
- **Docker-based** (requires Linux syscalls or uncommon runtimes): Elixir (`elixir:1.16-alpine`), Java (`eclipse-temurin:21-alpine`), Kotlin (`zenika/kotlin:latest` or host `kotlinc` if installed), x86-64 Assembly (`fluent-assembly:latest` with `--platform linux/amd64`).

All paths write code to a tmpdir, execute, and clean up unconditionally. The `trace` protocol (stdout lines prefixed `__TRACE__:`) is supported for JS/TS/Python for the visualizer.

## Why Not Judge0

Judge0 was the original decision (see git history). It was replaced because:

1. **Language coverage**: Judge0 CE's language set is fixed to what's packaged in its Docker image. Adding languages (Terraform, Helm, Assembly with custom tooling) requires forking Judge0's image or running a separate sidecar — the same operational cost as running Docker directly.
2. **Trace protocol**: The visualizer requires a `__TRACE__:` prefix protocol in stdout. Injecting this shim into Judge0 submissions and extracting it from base64-encoded stdout adds unnecessary indirection.
3. **Dependency**: Judge0 is a separate long-running service that must be deployed, updated, and monitored. The current approach uses Docker (already required for Go execution) and host runtimes that are part of the dev/CI environment.
4. **Operational simplicity**: Removing Judge0 eliminates a service from docker-compose and the production deployment graph.

`judge0-client.ts` and its `undici` dependency have been removed.

## Alternatives Considered

- **Firecracker microVMs**: Stronger isolation but requires KVM-capable hardware; disproportionate for 100-learner beta.
- **Piston**: Single primary maintainer — ruled out per Dependency Stewardship (Principle II).
- **Judge0 CE**: See "Why Not Judge0" above.
