# Topics, Partitions, and Offsets

## What you'll learn

Kafka isn't a queue and it isn't a pub/sub bus in the traditional sense — it's a distributed, append-only commit log. Every other concept in this track (ordering, delivery semantics, replication, consumer groups) is a consequence of that one design decision. This lesson builds the mental model: what a topic actually is on disk, why partitions are the unit of parallelism, and how offsets work as per-partition bookmarks.

## Key concepts

**A topic is a named stream; a partition is the physical log.** A topic is a logical category (`orders`, `clickstream`). Under the hood, a topic is split into one or more **partitions**, and each partition is an ordered, append-only sequence of records stored as files on a broker's disk — literally a sequence of log segment files (`00000000000000000000.log`, `00000000000000368769.log`, ...). Records are never modified in place. A producer only ever appends to the tail; a consumer only ever reads forward from some position.

```
topic: orders (3 partitions)

partition 0: [msg0][msg1][msg2][msg3]...   -> broker 1 (leader)
partition 1: [msg0][msg1][msg2]...          -> broker 2 (leader)
partition 2: [msg0][msg1][msg2][msg3][msg4] -> broker 3 (leader)
```

Each partition lives on a broker (with replicas on others — covered in the replication lesson). Partitions are the unit Kafka distributes across the cluster and across consumers. There is no "global" ordering across a topic — only per-partition ordering. That single sentence resolves half the "why is my message out of order" bugs you'll ever debug in Kafka.

**Offsets are per-partition bookmarks, not global sequence numbers.** Every record in a partition gets a monotonically increasing integer, the **offset**, assigned by the broker at append time — 0, 1, 2, 3, ... A consumer doesn't track "how many messages have I read from this topic"; it tracks "what offset have I consumed up to, in *each* partition I'm assigned." Offsets are meaningless without a partition to scope them: `(orders, partition 1, offset 4502)` uniquely identifies one record; `offset 4502` alone means nothing.

```
partition 1 offsets: 0   1   2   3   4   5   6
                      [A] [B] [C] [D] [E] [F] [G]
                                   ^
                         consumer has committed offset 3 (next read: offset 4, "D")
```

This is why replaying data in Kafka means seeking a *consumer* to an earlier offset on a *partition* — there's no concept of "rewind the topic," only "rewind this partition's read position."

**Partition count is your parallelism ceiling.** Within one consumer group, Kafka assigns each partition to exactly one consumer at a time. That means:

- If a topic has 12 partitions, at most 12 consumers in a single group can be doing useful work concurrently. A 13th consumer in that group sits idle.
- Fewer consumers than partitions is fine — each consumer just gets multiple partitions.
- You can increase partition count later (`kafka-topics.sh --alter --partitions N`), but you can never decrease it, and increasing it **reassigns the key→partition mapping for every existing key** (see the keys/ordering lesson) — so plan partition count for your ordering and parallelism needs up front, not as an afterthought.

Sizing rule of thumb: `partitions ≥ max(target_throughput / per_partition_throughput, max_consumer_parallelism_needed)`. A single partition on modern hardware typically sustains somewhere in the 5-20 MB/s range for writes depending on record size, compression, and replication — so a target of 100 MB/s and no other constraint suggests roughly 10-20 partitions, then round up to match your desired consumer parallelism.

**More partitions isn't free.** Every partition is an open file handle (times the replication factor) on every broker that hosts a replica, adds to controller metadata size, and lengthens leader-election time during a broker failure (more partitions to fail over = more work for the controller). Thousands of partitions per broker is a real operational ceiling, not a theoretical one — over-provisioning "just in case" has a cost.

## Watch out

- **"Ordering" without qualification is a trap.** Kafka guarantees order *within a partition* only. Two records with different keys (and therefore likely different partitions) have no ordering guarantee relative to each other, even if produced by the same producer in sequence.
- **Offsets are not timestamps and not row counts.** They're an opaque, monotonically increasing per-partition sequence. Two different partitions being at "offset 500" doesn't mean they hold related data or were written at the same time.
- **You cannot shrink partition count.** If you over-provision, you're stuck re-creating the topic (and migrating data) to reduce it. Under-provisioning is the safer default mistake — you can always add partitions later, just not remove them.

## The task

You're creating the topic configuration for `clickstream`, a high-volume event topic. Requirements:

- The team runs a single consumer group with **12** consumer instances that must all be able to do useful work in parallel — so the topic needs **12** partitions.
- The topic must **tolerate one broker failure** without losing the ability to serve reads/writes, which requires a replication factor of **3** (leader + 2 followers; covered fully in the replication lesson — for now, just set the number).
- Events must be retained for **exactly 7 days** (604800000 ms) for reprocessing, after which old data should be deleted (this is a plain event log, not a compacted changelog).
- Because losing acknowledged writes is unacceptable, at least **2** in-sync replicas must acknowledge a write for it to be considered committed (`min.insync.replicas`).

Write `stub.properties` as the config you'd pass to `kafka-topics.sh --create --topic clickstream --config <this file>`, plus three commented metadata lines (since `--partitions` and `--replication-factor` are CLI flags, not `--config` entries) recording the values you chose. Use exactly this shape:

```properties
# topic=clickstream
# partitions=12
# replication.factor=3
cleanup.policy=delete
retention.ms=604800000
min.insync.replicas=2
```
