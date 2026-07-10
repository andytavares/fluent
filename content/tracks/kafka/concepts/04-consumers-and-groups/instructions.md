# Consumers and Groups

## What you'll learn

Consumers don't have data pushed to them — they pull, on a loop, and that loop's timing interacts with group membership in ways that cause the two most common Kafka production incidents: unexpected rebalance storms and consumers being kicked out of a group mid-processing. This lesson covers the poll loop, how groups assign partitions, and the two timeout settings that fail in opposite ways.

## Key concepts

**The poll loop is the whole consumer API.** There's no callback-driven "message arrived" model — you call `poll(timeout)` in a loop, and it returns a batch of records (up to `max.poll.records`) pulled from whichever partitions this consumer is currently assigned.

```
while (running) {
    records = consumer.poll(Duration.ofMillis(500));
    for (record : records) {
        process(record);          // your code
    }
    consumer.commitSync();        // acknowledge progress (see the offset-management lesson)
}
```

`poll()` is also how the consumer client sends heartbeats and detects that it needs to rejoin the group — which is exactly why *how long your processing takes between poll calls* matters so much (see `max.poll.interval.ms` below).

**A consumer group is a set of consumers sharing `group.id`, each partition assigned to exactly one member.** Kafka's **group coordinator** (a broker) tracks membership and triggers a **rebalance** — reassigning partitions — whenever membership changes: a consumer joins, leaves, crashes, or is kicked out for being unresponsive.

**Partition assignment strategy determines how partitions are divided among members**, set via `partition.assignment.strategy` (a list of assignor class names, first mutually-supported one wins):

| Assignor | Behavior |
|---|---|
| `RangeAssignor` (legacy default) | Assigns contiguous partition ranges per topic per consumer — can skew when a group consumes multiple topics with the same partition count. |
| `RoundRobinAssignor` | Spreads partitions round-robin across all consumers, topic-agnostic — more even, but reshuffles almost everything on any membership change. |
| `StickyAssignor` | Balances like round-robin but **minimizes partition movement** across rebalances — a consumer keeps most of its prior assignment. |
| `CooperativeStickyAssignor` | Same stickiness, but uses **incremental cooperative rebalancing** instead of the eager protocol — the modern recommended default. |

**Eager vs incremental (cooperative) rebalancing is about whether every consumer stops the world.** The original ("eager") protocol revokes *all* partitions from *all* members at the start of every rebalance, then reassigns — meaning every consumer in the group stops processing during every rebalance, even if its own assignment doesn't change. **Cooperative rebalancing** (via `CooperativeStickyAssignor`) only revokes the specific partitions that need to move, letting unaffected consumers keep processing through the rebalance, potentially across multiple rounds until assignment converges. For any group larger than a couple of consumers, cooperative rebalancing meaningfully reduces the "everyone pauses" blast radius of a single consumer restarting.

**`session.timeout.ms` and `max.poll.interval.ms` police two different failure modes — and get confused constantly:**

- **`session.timeout.ms`** — how long the group coordinator waits without a **heartbeat** before declaring a consumer dead and triggering a rebalance. Heartbeats are sent on a separate background thread at `heartbeat.interval.ms` intervals (convention: `heartbeat.interval.ms` ≈ 1/3 of `session.timeout.ms`, giving a few missed-heartbeat retries before the timeout fires). This detects **process/network failure** — the consumer process crashed, or is network-partitioned from the coordinator.
- **`max.poll.interval.ms`** — the maximum time allowed **between calls to `poll()`**. If your processing logic (inside the loop, after `poll()` returns and before you call it again) takes longer than this, the coordinator treats the consumer as stuck and boots it from the group — *even though its heartbeat thread is still alive and beating on schedule*. This detects **application-level stalls** — slow processing, not process death.

```
heartbeat thread:  ♥────♥────♥────♥────♥────♥       (independent of your poll loop)
main thread:       poll()...[slow processing]......poll()
                                  ^ if this gap > max.poll.interval.ms, you're kicked
                                    from the group even though heartbeats never stopped
```

Setting `max.poll.interval.ms` too low for genuinely slow per-batch processing (e.g., calling a slow downstream API per record) causes a group to rebalance repeatedly under normal load — the fix is either raising the limit, lowering `max.poll.records` so each batch takes less wall-clock time to process, or moving slow work off the poll thread.

## vs other systems

Unlike a traditional message queue where a broker pushes to and tracks acknowledgment per-consumer per-message, Kafka's consumer group model divides *partitions*, not individual messages, among members — so parallelism within a group is capped by partition count (see the topics lesson), and there's no per-message ack/nack; progress is tracked via offset commits at the partition level (see the offset-management lesson).

## Watch out

- **Confusing the two timeouts is the single most common consumer-group production bug.** "My consumer keeps getting rebalanced even though it's clearly alive" is almost always `max.poll.interval.ms` being too tight for actual per-poll processing time — not a `session.timeout.ms`/heartbeat problem.
- **`RangeAssignor` (the historical default) can badly skew multi-topic groups** — if a group consumes several topics with the same partition count, the same consumer tends to get the "first range" of every topic, concentrating load.
- **Switching assignors on a running group requires a rolling upgrade, not just a config change** — all members need to support the new strategy during the transition, or the group falls back to the one common strategy (or fails to form). Deploy the new assignor to the whole group before removing the old one from the supported list.

## The task

Write `stub.properties` for a consumer group named `clickstream-processors` that processes the `clickstream` topic. Requirements:

- The group uses **cooperative incremental rebalancing** so unaffected consumers keep processing through membership changes.
- Per-record processing occasionally calls a downstream service that can be slow, so the group must tolerate up to **5 minutes** between poll calls without a spurious rebalance, but each batch pulled per `poll()` is capped at **500** records to keep any single processing pass bounded.
- Heartbeat-based failure detection (real process/network death) should fire within **45 seconds**, with heartbeats sent roughly 3 times within that window.
- Offsets are committed manually after processing (this consumer does not want auto-commit — covered fully in the offset-management lesson).

Use exactly these keys:

```properties
group.id=clickstream-processors
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
session.timeout.ms=45000
heartbeat.interval.ms=15000
max.poll.interval.ms=300000
max.poll.records=500
enable.auto.commit=false
```
