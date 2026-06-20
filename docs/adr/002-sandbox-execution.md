# ADR-002: Sandbox Execution Engine

**Date**: 2026-06-19 | **Status**: Accepted

## Decision

Use Judge0 CE (self-hosted) for sandboxed code execution.

## Motivation

Every lesson run and test-out submission executes untrusted Go code. The sandbox must enforce wall-clock, CPU, and memory limits (FR-012), isolate learner sessions (FR-013), and return output within 5 seconds p95 (SC-004).

## Rationale

Judge0 wraps Linux `isolate` (cgroups + namespaces + seccomp) and exposes a REST API. Self-hosting gives full control over resource limits, Go version, and data residency. CE edition is MIT-licensed with production deployments at LeetCode, HackerEarth, and others.

## Alternatives Considered

- **Firecracker microVMs**: Stronger isolation but requires KVM-capable hardware; disproportionate for 100-learner beta.
- **Custom isolate wrapper**: Re-implements queue management, language runtime management, and callback handling — all provided by Judge0.
- **Piston**: Single primary maintainer — ruled out per Dependency Stewardship (Principle II).
