# ADR-008: Async Work Split (BullMQ + Temporal)

**Date**: 2026-06-19 | **Status**: Accepted

## Decision

Use BullMQ for short-lived async jobs and Temporal for long-running stateful workflows. They are complementary, not alternatives.

## Motivation

The platform has two categories of async work with fundamentally different characteristics:

1. **Code execution** (lesson runs, test suites, test-out, placement): short-lived (seconds), stateless, benefit from queuing, concurrency limits, and retry-with-backoff.
2. **Capstone session lifecycle**: long-running (up to 30 minutes), stateful, requires durable timers, external signals (learner activity resets the inactivity countdown), and multi-step activity sequencing with guaranteed cleanup.

## Rationale

**BullMQ** is a Redis-backed job queue. It is the right fit for code execution because: jobs are created and resolved in seconds, Redis provides durable queue state across API restarts, and BullMQ's concurrency and rate-limiting controls map cleanly onto the sandbox pool size.

**Temporal** is a durable workflow orchestration engine. It is the right fit for capstone sessions because: (1) `workflow.sleep(30 * 60 * 1000)` persists across worker restarts — a BullMQ delayed job would need to be cancelled and re-enqueued on every learner action and would lose state on crash; (2) Temporal's signal mechanism allows the API to reset the inactivity timer by sending a `learner-active` signal to the running workflow; (3) each activity (provision, verify, teardown) has guaranteed execution with configurable retry policies.

Both tools use Redis — BullMQ for queue state, and Temporal's self-hosted deployment can share the same Redis cluster (Temporal uses its own persistence layer but the ops footprint is manageable alongside BullMQ).

## Alternatives Considered

- **BullMQ only**: Cannot model the capstone session as a single durable entity with external signals. Would require polling + manual state management in Redis — reinventing Temporal's core abstraction.
- **Temporal only**: Temporal's overhead (workflow history, task queues) is disproportionate for a simple 5-second code execution job. BullMQ is simpler, faster, and better-understood for this use case.
- **AWS SQS + Step Functions**: Cloud-vendor lock-in; not suitable for a self-hosted deployment target.
