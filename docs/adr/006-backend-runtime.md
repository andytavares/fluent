# ADR-006: Backend Runtime

**Date**: 2026-06-19 | **Status**: Accepted

## Decision

Use Node.js 20 LTS + TypeScript 5 for all backend services (`apps/api`, `apps/sandbox`, `apps/capstone-runner`).

## Motivation

The platform uses tRPC for all service communication, Prisma for database access, BullMQ for job queuing, and the Temporal TypeScript SDK for workflow orchestration. All four tools are TypeScript-native and have no first-class Go equivalents.

## Rationale

A unified TypeScript stack means: (1) tRPC enforces end-to-end types across all service boundaries without code generation, (2) Prisma's generated client covers all three services from a single `schema.prisma`, (3) engineers work in one language across the full codebase. Node.js 20 is the current LTS release with a clear support horizon.

## Alternatives Considered

- **Go backends**: Ruled out because tRPC requires TypeScript on both ends; Prisma has no Go client; BullMQ is Node-only; the Temporal Go SDK would introduce a second language solely for the capstone runner.
- **Bun runtime**: Faster than Node.js in benchmarks but not yet LTS-stable; Prisma and some other dependencies have known Bun compatibility gaps. Revisit for v2.
