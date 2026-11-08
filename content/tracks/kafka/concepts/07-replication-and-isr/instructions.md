## What you build

You harden the `payments` topic, the broker defaults and the producer for durability in `stub.properties`. Replicated copies of data, not a topic config, survive a broker failure. This lesson builds on **Keys, Partitioning, and Ordering**.

## Key concepts

### Each partition has one leader and N-1 followers

N is the replication factor. All reads and writes for a partition go through its **leader** replica. **Followers** fetch from the leader without pause and copy its log asynchronously. They use the same fetch mechanism as a consumer, between brokers.

```
partition 0, replication.factor=3:
  broker 1: LEADER   (reads, writes)
  broker 2: follower (fetches, copies)
  broker 3: follower (fetches, copies)
```

### The ISR holds the replicas that are caught up

The **ISR** (in-sync replica set) is the set of replicas close enough to the leader to trust for durability. A follower stays in the ISR if it fetched within `replica.lag.time.max.ms` (default 30 s). A slow, partitioned or crashed follower drops out of the ISR.

The leader keeps writing with the remaining ISR members. It does not wait for a slow replica. When the follower catches up, it rejoins the ISR automatically.

### `acks=all` waits for the ISR, and `min.insync.replicas` gives it meaning

`acks=all` does *not* wait for `replication.factor` replicas. It waits for every replica **now in the ISR**. If the ISR shrinks to the leader alone, the leader alone satisfies `acks=all`.

`min.insync.replicas` closes that gap. It is the minimum ISR size for an `acks=all` write to succeed. Below it, producers get `NotEnoughReplicasException`, and Kafka **rejects** the write. Kafka gives up availability to protect durability.

### Three settings decide durability

With `replication.factor=3`, `min.insync.replicas=2` and `acks=all`:

| Scenario | Result |
|---|---|
| All 3 healthy, ISR = {leader, f1, f2} | A write succeeds once all 3 ISR members acknowledge. Full redundancy. |
| One follower dies, ISR = {leader, f1} | Writes still succeed, because 2 meets the minimum of 2. **One broker failure, no rejected writes, no data-loss risk.** |
| A second follower dies, ISR = {leader} | Kafka **rejects** writes with `NotEnoughReplicasException`, because 1 is below 2. It refuses writes with no redundancy. |
| The leader dies, ISR = {leader, f1} | Kafka elects f1, which is in the ISR and has every acknowledged write. **No acknowledged data loss.** |

This is the point of the lesson. The three settings together tolerate exactly **one** broker failure, with no data loss and no rejected writes. Beyond that, they reject writes and never drop them silently.

### `unclean.leader.election.enable` covers the case with no ISR left

The leader dies, and no follower is in the ISR. Kafka can keep the partition unavailable until an in-sync replica returns. Or it can elect an out-of-sync replica, an "unclean" election, and silently lose the records that replica lacks.

`unclean.leader.election.enable=false` is the safe production default. It refuses the unclean election and keeps the partition unavailable. `true` puts availability first. Use it only where stale data is worse than an outage, such as some caching or metrics cases. Never use it for transactional or financial data.

The ISR is like the healthy replica set of a Raft cluster, but it changes per partition with live fetch lag. A lagging replica leaves the ISR instead of blocking the partition. So without `min.insync.replicas`, the ISR can shrink to the leader alone.

## Watch out

- `acks=all` alone is not a durability guarantee. It is only as strong as `min.insync.replicas`.
- `acks=all` with `min.insync.replicas=1` equals `acks=1` when the ISR shrinks to the leader alone.
- `replication.factor=3` with `min.insync.replicas=3` tolerates no failure. One follower out of the ISR blocks all writes.
- The useful setting is almost always `min.insync.replicas = replication.factor - 1`. It tolerates one failure.
- `unclean.leader.election.enable=true` is a hidden risk. Nothing goes wrong until every ISR replica is gone.
- At that moment, it trades an outage for silent data loss. Very few production systems want that trade.

## The task

Harden the `payments` topic and the broker defaults for durability. The setup must survive one broker failure with no acknowledged write lost. It must never lose data silently, even in a worse failure.

Write three sections in `stub.properties`. Put each one under its exact marker line, in this order:

```properties
# === topic config ===

# === broker config ===

# === producer config ===
```

**Topic config** for `payments`:

1. Add the comment `# replication.factor=3`. It is a `--create` CLI flag, not a `--config` entry.
2. Set `min.insync.replicas=2`.
3. Set `cleanup.policy=delete`.

**Broker config**, the cluster-wide defaults:

1. Set `default.replication.factor=3`.
2. Set `min.insync.replicas=2`.
3. Set `unclean.leader.election.enable=false`.

**Producer config**:

1. Set `acks=all`.
2. Set `enable.idempotence=true`.

No line can set `min.insync.replicas=3`. The file must not contain the text `TODO`.

The complete file:

```properties
# === topic config ===
# replication.factor=3
min.insync.replicas=2
cleanup.policy=delete

# === broker config ===
default.replication.factor=3
min.insync.replicas=2
unclean.leader.election.enable=false

# === producer config ===
acks=all
enable.idempotence=true
```
