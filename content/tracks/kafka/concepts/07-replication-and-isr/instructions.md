# Replication and ISR

## What you'll learn

Replication is what actually gives Kafka durability — a topic config alone doesn't survive a broker dying, replicated copies of the data do. This lesson covers leader/follower replication mechanics, what the ISR (in-sync replica set) really tracks, and the durability equation — `acks=all` + `min.insync.replicas` + `replication.factor` — worked through concrete failure scenarios, because the interplay between these three settings is where most "we thought we were durable" incidents come from.

## Key concepts

**Every partition has one leader and N-1 followers, where N is the replication factor.** All reads and writes for a partition go through its **leader** replica. **Followers** replicate by continuously fetching from the leader (the same fetch mechanism a consumer uses, just broker-to-broker) and asynchronously catching their own local log up to the leader's.

```
partition 0, replication.factor=3:
  broker 1: LEADER    (all reads/writes)
  broker 2: follower  (fetches from leader, replicates)
  broker 3: follower  (fetches from leader, replicates)
```

**The ISR (in-sync replica set) is the subset of replicas caught up enough to be trusted for durability.** A follower is in the ISR if it has fetched recent enough (within `replica.lag.time.max.ms`, default 30s) to be considered caught up. A slow, network-partitioned, or crashed follower gets dropped from the ISR — the leader keeps serving writes to the *remaining* ISR members, it doesn't stall waiting for a struggling replica. When the follower catches back up, it rejoins the ISR automatically.

**`acks=all` means "wait for the current ISR," and `min.insync.replicas` is what makes that meaningful.** This is the detail that catches people: `acks=all` does *not* mean "wait for `replication.factor` replicas." It means "wait for every replica **currently in the ISR**." If the ISR has shrunk to just the leader (every follower fell behind or died), `acks=all` with no other constraint is satisfied by the leader alone — an obvious durability hole. `min.insync.replicas` closes it: it's the *minimum* ISR size a write must satisfy for `acks=all` to succeed. If the ISR shrinks below that minimum, producers get `NotEnoughReplicasException` and writes are **rejected** — sacrificing availability to protect durability.

**The durability equation, worked through failure scenarios**, with `replication.factor=3`, `min.insync.replicas=2`, `acks=all`:

| Scenario | Outcome |
|---|---|
| All 3 replicas healthy, ISR = {leader, f1, f2} | Writes succeed once 2 of the 3 (any 2, always including the leader) ack. Full redundancy. |
| One follower dies, ISR shrinks to {leader, f1} (size 2) | Writes still succeed — ISR size (2) still meets `min.insync.replicas` (2). **Tolerates one broker failure with zero write rejection and zero data-loss risk.** |
| A second follower also dies, ISR shrinks to {leader} (size 1) | Writes are **rejected** with `NotEnoughReplicasException` — ISR (1) is below `min.insync.replicas` (2). The cluster protects durability by refusing writes rather than accepting them with no redundancy. |
| The leader itself dies while ISR = {leader, f1} | A new leader is elected from the remaining ISR (f1) — since f1 was in the ISR, it's guaranteed to have every acknowledged write. **Zero acknowledged data loss.** |

This table is the entire point of the lesson: `replication.factor=3` + `min.insync.replicas=2` + `acks=all` tolerates exactly **one** broker failure with zero data loss and zero write rejection, and degrades safely (rejects writes, doesn't silently drop them) beyond that.

**`unclean.leader.election.enable` is the tradeoff switch for the scenario the table doesn't cover: every ISR replica is gone.** If the leader dies and there are *no* in-sync followers left (all had fallen out of the ISR), Kafka faces a choice: stay unavailable for that partition until an in-sync replica comes back, or elect an out-of-sync replica as the new leader anyway (an "unclean" election), accepting silent data loss for whatever the new leader was missing. `unclean.leader.election.enable=false` (the safe, production default) refuses the unclean election and keeps the partition unavailable rather than lose data silently. `true` prioritizes availability over durability — appropriate only for use cases where staleness is worse than an outage (some caching/metrics use cases), essentially never for anything transactional or financial.

## vs other systems

The ISR concept is closest to a quorum-based system's "healthy replica set" (think a Raft cluster's committed-log-replica tracking), but Kafka's version is per-partition and adaptive — replicas move in and out of the ISR continuously based on live fetch lag, rather than being a fixed quorum membership list. This is why Kafka replication tolerates partial slowness gracefully (a lagging replica just quietly drops from the ISR rather than blocking the whole partition) at the cost of the `min.insync.replicas` guard being essential — without it, "the ISR" could silently shrink to nothing.

## Watch out

- **`acks=all` alone is not a durability guarantee — it's only as strong as `min.insync.replicas`.** `acks=all` with `min.insync.replicas=1` gives you exactly the same durability as `acks=1`: satisfied by the leader alone whenever the ISR has shrunk to just the leader.
- **`replication.factor=3` with `min.insync.replicas=3` tolerates *zero* broker failures for writes** — any single follower dropping from the ISR immediately blocks all writes. The useful configuration is almost always `min.insync.replicas = replication.factor - 1`, which tolerates exactly one failure while writes continue.
- **`unclean.leader.election.enable=true` is a silent, retroactive risk** — it doesn't cause a problem until the rare moment every ISR replica is actually gone, at which point it trades an outage for quiet data loss. Very few production systems should ever want that trade.

## The task

Harden the `payments` topic and its cluster-wide broker defaults for maximum durability, tolerating exactly one broker failure without any acknowledged write being lost, and never silently losing data even in a worse failure.

Write `stub.properties` with three sections, exactly under these markers:

```properties
# === topic config ===
...

# === broker config ===
...

# === producer config ===
...
```

**Topic config** for `payments`:
- `# replication.factor=3` (comment metadata, since this is a `--create` CLI flag, not a `--config` entry)
- `min.insync.replicas=2`
- `cleanup.policy=delete`

**Broker config** (cluster-wide defaults):
- `default.replication.factor=3`
- `min.insync.replicas=2`
- `unclean.leader.election.enable=false`

**Producer config**:
- `acks=all`
- `enable.idempotence=true`
