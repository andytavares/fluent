# Retention and Compaction

## What you'll learn

Kafka topics don't grow forever, but the two ways to bound them — retention and compaction — do fundamentally different things and are chosen based on what a topic *is*: an event log versus a changelog. This lesson covers segment mechanics (why retention limits are never exact), the delete-vs-compact-vs-both cleanup policies, and tombstones — the mechanism that lets you delete a key from a compacted topic.

## Key concepts

**A partition's log is physically split into segments, and retention operates on whole segments, not individual records.** A partition isn't one giant file — it's a sequence of segment files, and only the **active** (currently being written) segment is open; older segments are closed/immutable. `segment.ms` (time-based) and `segment.bytes` (size-based) control when the active segment rolls over into a new one. Retention (`retention.ms` / `retention.bytes`) only deletes **entire closed segments** whose newest record is older than the retention window — it never deletes individual records out of the middle of a segment.

```
segment 1 [oldest] --- segment 2 --- segment 3 --- segment 4 [active, still being written]
   ^ deleted once its *entire* contents are older than retention.ms
```

This is why retention is a *ceiling*, not a precise cutoff: a record can live up to `retention.ms` + however long it takes for its segment to close and roll past the threshold. Setting `segment.ms` very large means retention decisions happen in big, infrequent jumps (worse precision, less overhead); setting it small means finer-grained retention at the cost of more, smaller files.

**`cleanup.policy` picks the bounding strategy, and it's not either/or — it can be both:**

| `cleanup.policy` | Behavior | Typical topic type |
|---|---|---|
| `delete` | Removes whole old segments once past `retention.ms`/`retention.bytes`. Nothing is deduplicated by key. | Plain event logs — clickstreams, metrics, audit trails. |
| `compact` | Never deletes based on age — instead, periodically rewrites segments keeping only the **latest record per key**, discarding older records for keys that have been overwritten. | Changelogs, "latest state per entity" topics — e.g., a Kafka Streams KTable's backing topic, a CDC feed of a database table. |
| `compact,delete` | Both: compacts by key **and** still enforces a retention ceiling. | A changelog that also needs a hard time cap (rare, but valid — e.g., "keep only the latest state, and never older than a year"). |

**Compaction guarantees "at least the latest value per key is retained forever," not "exactly one record per key at every instant."** The compaction process runs periodically (governed by `min.cleanable.dirty.ratio`, below) and only compacts *closed* segments — so at any given moment, the compacted portion of the log has one record per key, but the active (still-open) segment can have multiple records for the same key that haven't been compacted away yet. A consumer reading the raw log can see stale duplicate values for a key until the next compaction pass catches up.

**`min.cleanable.dirty.ratio` controls how eagerly compaction runs.** It's the fraction of "dirty" (uncompacted) log bytes relative to the total that triggers a compaction pass — `0.5` means compaction kicks in once roughly half the log is dirty. Lower values compact more aggressively (less storage waste, more compaction CPU/IO); higher values tolerate more redundant data sitting uncompacted before the next pass (less overhead, more storage used by superseded records in the meantime).

**Tombstones delete a key from a compacted topic.** Producing a record with a key and a **null value** is a tombstone — it marks that key for deletion. Compaction removes all prior records for that key, and eventually removes the tombstone itself too, but only after `delete.retention.ms` has passed — this delay exists so that any consumer that hasn't yet caught up to the tombstone (and needs to see "this key was deleted," not just have it silently vanish) has time to observe it before it's gone for good.

**Compacted topics are the backbone of stateful stream processing.** A Kafka Streams KTable, or any "latest value per key" materialized view, is backed by a compacted topic precisely because it needs unbounded retention of the *current* state per key without unbounded storage growth — new writes for a key supersede, not append to, the topic's effective content for that key (fully explored in the Kafka Streams lesson).

## vs other systems

Compaction is conceptually similar to a database's primary-key upsert semantics, but expressed as a background log-rewriting process rather than an in-place update — which is why it composes so naturally with Kafka's append-only model. There's no equivalent in a typical message queue (SQS, RabbitMQ), which have no concept of "the log itself deduplicates by key over time" — that logic would have to live entirely in application code.

## Watch out

- **Retention windows are approximate, never exact, because deletion happens at segment granularity.** Don't build correctness logic (e.g., "assume this data is gone after exactly `retention.ms`") on top of retention timing.
- **Compaction doesn't run continuously — it's batched and eager only past `min.cleanable.dirty.ratio`.** A compacted topic can have significant duplicate/stale data sitting in it between compaction passes, especially right after a burst of writes.
- **Tombstones aren't instant deletes — they need `delete.retention.ms` to propagate to all consumers before disappearing.** A consumer that's far behind can still legitimately see old tombstones; don't assume "the tombstone is gone from the log" means "no consumer will ever see it."

## The task

Design two topics:

**`clickstream-raw`** — a plain event log with no deduplication, retained for exactly 3 days, with a segment rollover of 1 hour (fine-grained retention decisions).

**`user-profile-changelog`** — a Kafka Streams-style changelog holding the latest profile record per user id, compacted (never age-based deleted), with fairly eager compaction and a 24-hour grace period for tombstones to propagate before being fully removed.

Write `stub.properties` with two sections, exactly under these markers:

```properties
# === retention topic: clickstream-raw ===
...

# === compacted topic: user-profile-changelog ===
...
```

**`clickstream-raw`**:
- `cleanup.policy=delete`
- `retention.ms=259200000` (3 days)
- `segment.ms=3600000` (1 hour)

**`user-profile-changelog`**:
- `cleanup.policy=compact`
- `min.cleanable.dirty.ratio=0.3`
- `delete.retention.ms=86400000` (24 hours)
