# ADR-007: API Communication (tRPC)

**Date**: 2026-06-19 | **Status**: Accepted

## Decision

Use tRPC for all service-to-service and frontend-to-API communication.

## Motivation

The platform requires type-safe communication between `apps/web` → `apps/api` and `apps/api` → `apps/sandbox`. Without a shared type contract enforced at compile time, API drift (adding a field server-side without updating the client) becomes a runtime bug class.

## Rationale

tRPC generates a fully typed client from the server router definition — no schema files, no separate code generation step. TypeScript errors appear immediately in consuming code when the server contract changes. The Fastify adapter (`@trpc/server/adapters/fastify`) integrates cleanly with the chosen HTTP server.

## Alternatives Considered

- **GraphQL**: Adds a query language useful for external consumers. Since v1 has exactly one consumer (the Next.js frontend), GraphQL's flexibility is unnecessary complexity. No external API consumers in v1.
- **gRPC**: Requires protobuf compilation in the build pipeline and binary encoding. For TypeScript-to-TypeScript calls, tRPC achieves the same type safety at a fraction of the setup cost. gRPC's advantages (binary protocol, streaming, cross-language) are not needed here.
- **REST + OpenAPI**: Code generation required to get type safety; extra tooling to maintain. tRPC provides the same result with less setup.
