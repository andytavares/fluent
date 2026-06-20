# ADR-003: Capstone DB Provisioning

**Date**: 2026-06-19 | **Status**: Accepted

## Decision

Use Kubernetes Jobs with an ephemeral PostgreSQL sidecar (one Pod per learner capstone session).

## Motivation

The capstone requires each learner to have a real, isolated PostgreSQL database for the duration of their session (FR-023, FR-024). The verifier makes HTTP requests against the learner's running Go server, which connects to this database.

## Rationale

A K8s Job with a Postgres sidecar in the same Pod means: (1) the learner's server and database share a network namespace (`localhost` connectivity, no external networking needed), (2) Pod termination is the guaranteed cleanup mechanism (FR-024), (3) true per-learner isolation with no risk of schema collision.

## Alternatives Considered

- **Schema-per-tenant on shared Postgres**: More efficient but harder to enforce resource limits, more complex crash recovery.
- **Docker per learner (non-K8s)**: Doesn't scale horizontally; harder to manage lifecycle than K8s Jobs.
