## What you build

You configure two topics in `stub.properties`: an event log with time retention, and a compacted changelog. Retention and compaction bound a topic in different ways. Choose by what the topic is: an event log or a changelog. This lesson builds on **Replication and ISR**.

## Key concepts

### A partition log is a chain of segments

A partition is not one file. It is a sequence of segment files. Kafka writes only to the newest, **active** segment. Older segments stay closed and do not change. `segment.ms` (time) and `segment.bytes` (size) decide when the active segment rolls over to a new one.

```
seg 1 -- seg 2 -- seg 3 -- seg 4 (active)
^ deleted when all of it is past retention
```

### Retention deletes whole segments

`retention.ms` and `retention.bytes` delete only entire closed segments. A segment goes when its newest record is older than the retention window. Kafka never deletes single records from the middle of a segment.

So retention is a ceiling, not an exact cutoff. A record can live for `retention.ms` plus the time its segment takes to close. A large `segment.ms` gives big, rare deletion jumps with less overhead. A small `segment.ms` gives finer retention, with more and smaller files.

### `cleanup.policy` picks the strategy

The policy can be one value or both:

- **`delete`**: removes old segments past `retention.ms` or `retention.bytes`. No deduplication by key. Use it for event logs: clickstreams, metrics, audit trails.
- **`compact`**: never deletes by age. It rewrites segments and keeps only the **latest record per key**. Use it for changelogs and latest-state topics, for example a KTable backing topic or a CDC feed.
- **`compact,delete`**: compacts by key and also enforces a retention ceiling. It is rare but valid, for example "latest state, never older than a year".

### Compaction keeps at least the latest value per key

Compaction does not give exactly one record per key at every moment. It runs from time to time and compacts only closed segments. The active segment can hold several records for one key. A consumer that reads the raw log can see stale duplicates until the next compaction pass.

### `min.cleanable.dirty.ratio` sets how eager compaction is

The ratio is the share of dirty (uncompacted) bytes in the log that starts a compaction pass. With `0.5`, compaction starts when about half the log is dirty.

- A lower value compacts more often: less wasted storage, more CPU and I/O.
- A higher value waits longer: less overhead, more storage for old records.

### A tombstone deletes a key

A record with a key and a **null value** is a tombstone. Compaction removes all earlier records for that key. Later, compaction removes the tombstone too, after `delete.retention.ms`. The delay gives a slow consumer time to see the delete before the tombstone goes.

### Compacted topics back stateful stream processing

A Kafka Streams KTable, or any latest-value-per-key view, uses a compacted topic. It keeps the current state per key forever, without unbounded storage growth. A new write for a key replaces the old value instead of adding to it. The Kafka Streams lesson covers this in full.

Compaction is like a primary-key upsert in a database, done as a background log rewrite. SQS and RabbitMQ have no equivalent; that logic must live in application code.

## Watch out

- Retention is approximate because deletion works on whole segments. Do not build logic on exact retention timing.
- Compaction runs in batches, past `min.cleanable.dirty.ratio`. A compacted topic can hold many stale duplicates after a write burst.
- A tombstone is not an instant delete. It stays for `delete.retention.ms` so that slow consumers can see it.
- A consumer far behind can still see an old tombstone. Its absence from the log does not mean no consumer saw it.

## The task

Design two topics. Each section of `stub.properties` starts with its exact marker line.

**`clickstream-raw`** is a plain event log with no deduplication:

1. Set `cleanup.policy=delete`.
2. Set `retention.ms=259200000` (3 days).
3. Set `segment.ms=3600000` (1 hour) for fine retention steps.

**`user-profile-changelog`** holds the latest profile record per user id:

1. Set `cleanup.policy=compact`. It must not have a `retention.ms` line.
2. Set `min.cleanable.dirty.ratio=0.3` for fairly eager compaction.
3. Set `delete.retention.ms=86400000` (24 hours) for tombstones.

Use exactly this content:

```properties
# === retention topic: clickstream-raw ===
cleanup.policy=delete
retention.ms=259200000
segment.ms=3600000

# === compacted topic: user-profile-changelog ===
cleanup.policy=compact
min.cleanable.dirty.ratio=0.3
delete.retention.ms=86400000
```
