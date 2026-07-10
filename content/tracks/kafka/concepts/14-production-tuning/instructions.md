# Production Tuning

## What you'll learn

This is the capstone: the monitoring signals that actually predict a Kafka incident before it happens, the capacity planning math behind partition counts, quotas as the mechanism that keeps one noisy client from starving everyone else, and a checklist that ties every earlier lesson — topics, replication, producers, consumers — into one production-hardened configuration.

## Key concepts

**The four metrics that matter most, and what each one tells you:**

| Metric | What it tells you | Danger sign |
|---|---|---|
| **Consumer lag** (`records-lag-max` / offset delta between latest and committed) | How far behind a consumer group is from the head of the log. | Steadily growing lag means the group can't keep up with produce rate — either add consumer capacity (up to partition count) or find why processing is slow. A lag *spike* that recovers is often just a deploy/rebalance; sustained growth is the real signal. |
| **Under-replicated partitions** (`UnderReplicatedPartitions`, broker JMX) | Count of partitions where the ISR is smaller than the full replica set. | Non-zero means at least one replica is behind or down — durability margin is reduced *right now*, even if writes are still succeeding. This is the earliest warning that a `min.insync.replicas` rejection could be one more failure away. |
| **Request latency percentiles** (produce/fetch request `p99`, `p999`, broker JMX) | Tail latency of client-facing requests, not just the average. | Averages hide the pain — a p50 that looks fine with a p99 that's 50x higher means a meaningful fraction of requests are having a bad time, often from GC pauses, disk I/O contention, or a noisy-neighbor topic on the same broker. |
| **ISR shrink rate** (`IsrShrinksPerSec`, broker JMX) | How often replicas are falling out of the ISR. | A high or rising rate means followers can't keep up with the leader — often under-provisioned network/disk throughput, or a leader taking on more partitions/load than its followers can replicate against. Directly threatens the `min.insync.replicas` durability guarantee from the replication lesson. |

Watching **consumer lag** and **under-replicated partitions** together catches the two most common classes of production incident: "we're falling behind" (lag) and "our durability margin just evaporated" (under-replication) — both are leading indicators that let you react before an outage, not just alert after one.

**Partition count and capacity planning is revisited here with the full picture.** The topics lesson gave the sizing formula (`partitions ≥ max(throughput / per-partition throughput, consumer parallelism needed)`); production planning adds: partition count times replication factor times average message size times retention window is your storage footprint per topic — get this wrong and you either under-provision disk or pay for capacity you don't need. It also adds the operational ceiling from the brokers lesson: total partitions per broker (summed across all topics) affects controller metadata size and failover time — plan per-topic partition counts with the *cluster-wide* total in mind, not topic-by-topic in isolation.

**Quotas prevent one client from starving the cluster for everyone else.** Kafka enforces byte-rate and request-rate quotas per client (`client.id`) or per user (with authentication), configured via `kafka-configs.sh --entity-type clients --entity-name <id> --add-config 'producer_byte_rate=...,consumer_byte_rate=...'` (a dynamic, cluster-wide config, not a per-broker `server.properties` entry). Without quotas, a single misbehaving or newly-onboarded high-volume client can saturate broker network/disk I/O and degrade every other client's latency — quotas are the multi-tenancy safety net, essential the moment more than one team/service shares a cluster.

**The production config checklist — every earlier lesson, in one place:**

- **Topics**: partition count sized for both throughput and consumer parallelism (topics lesson); `min.insync.replicas = replication.factor - 1` (replication lesson); explicit `cleanup.policy` and retention matching the topic's actual purpose — event log vs changelog (retention lesson).
- **Brokers**: `advertised.listeners` explicitly set and reachable from real client networks (brokers lesson); `unclean.leader.election.enable=false` unless staleness is genuinely preferable to unavailability (replication lesson).
- **Producers**: `acks=all` + `enable.idempotence=true` for anything where correctness matters; `linger.ms`/`batch.size`/`compression.type` tuned for throughput where it doesn't (producers lesson); `transactional.id` only where cross-partition atomicity is actually needed (transactions lesson).
- **Consumers**: `session.timeout.ms` and `max.poll.interval.ms` tuned to the *actual* failure modes they detect, not confused with each other (consumers lesson); manual commit, after processing, for at-least-once discipline (offset-management lesson); `CooperativeStickyAssignor` for any group large enough that eager rebalancing's stop-the-world behavior matters.
- **Observability**: consumer lag, under-replicated partitions, request latency percentiles, and ISR shrink rate all alerting, not just dashboarded.

## vs other systems

The monitoring priorities here mirror what you'd track for any distributed, replicated, log-structured system (etcd, Cassandra) — replication health (ISR shrink / under-replication) and consumer-side backlog (lag) are the same two categories of signal you'd watch in any quorum-replicated store, just named differently. What's distinctly Kafka is that lag is measured *per consumer group per partition*, not as a single cluster-wide number — a healthy-looking cluster can still have one specific group falling badly behind while everything else is fine, so alerting has to be per-group, not just cluster-aggregate.

## Watch out

- **A dashboard without alerting on it is not monitoring — it's a screen nobody's watching until the outage already happened.** Consumer lag, under-replicated partitions, latency p99, and ISR shrink rate should all have alert thresholds, not just graphs.
- **Averages hide tail latency problems** — always alert on p99/p999, not just mean request latency; the worst-affected fraction of requests is exactly where user-facing pain shows up first.
- **Quotas are easy to forget until the first noisy-neighbor incident** — set them proactively on any shared cluster, not reactively after one client's onboarding takes everyone else down.

## The task

Write the final, production-hardened configuration for the `payments` topic and its surrounding infrastructure, tying together every earlier lesson's best practice. Write `stub.properties` with five sections, exactly under these markers:

```properties
# === topic config ===
...

# === broker config ===
...

# === producer config ===
...

# === consumer config ===
...

# === monitoring ===
...
```

**Topic config**:
- `min.insync.replicas=2`
- `cleanup.policy=delete`
- `retention.ms=604800000`

**Broker config**:
- `default.replication.factor=3`
- `unclean.leader.election.enable=false`

**Producer config**:
- `acks=all`
- `enable.idempotence=true`
- `compression.type=lz4`
- `linger.ms=10`

**Consumer config**:
- `session.timeout.ms=45000`
- `max.poll.interval.ms=300000`
- `enable.auto.commit=false`
- `partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor`

**Monitoring** — four commented lines naming the metrics this configuration depends on being watched:
- `# monitor=consumer-lag`
- `# monitor=under-replicated-partitions`
- `# monitor=request-latency-p99`
- `# monitor=isr-shrink-rate`
