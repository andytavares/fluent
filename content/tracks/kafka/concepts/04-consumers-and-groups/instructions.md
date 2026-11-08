## What you build

You write the configuration for a consumer group in `stub.properties`. Consumers pull records in a loop. The timing of that loop interacts with group membership and causes two common incidents: rebalance storms and consumers removed mid-processing. This lesson builds on **Producers**.

## Key concepts

### The poll loop is the whole consumer API

Kafka has no "message arrived" callback. You call `poll(timeout)` in a loop. It returns up to `max.poll.records` records from the partitions this consumer has.

```
while (running) {
  records = consumer.poll(
    Duration.ofMillis(500));
  for (record : records) {
    // your code
    process(record);
  }
  // acknowledge progress
  consumer.commitSync();
}
```

`poll()` is also how the consumer finds out that it must rejoin the group. So the time your processing takes between `poll()` calls matters. See `max.poll.interval.ms` below. The offset management lesson covers commits.

### A group gives each partition to one member

A consumer group is a set of consumers with the same `group.id`. Each partition goes to exactly one member. The **group coordinator**, a broker, tracks membership. It starts a **rebalance** when membership changes: a consumer joins, leaves or crashes, or the coordinator removes it for not responding. A rebalance reassigns partitions.

### The assignor decides how to divide partitions

`partition.assignment.strategy` is a list of assignor class names. The group uses the first one that all members support.

| Assignor | Behavior |
|---|---|
| `RangeAssignor` (legacy default) | Gives each consumer a contiguous range per topic. It can skew a group that reads several topics with the same partition count. |
| `RoundRobinAssignor` | Spreads partitions round-robin over all consumers. More even, but it moves almost every partition on any change. |
| `StickyAssignor` | Balances like round-robin but **moves as few partitions as possible**. A consumer keeps most of its old assignment. |
| `CooperativeStickyAssignor` | The same stickiness, with **incremental cooperative rebalancing**. It is the modern recommended choice. |

### Eager rebalancing stops every consumer; cooperative does not

The original **eager** protocol revokes *all* partitions from *all* members at the start of each rebalance, then reassigns them. Every consumer stops, even when its assignment does not change.

**Cooperative** rebalancing, through `CooperativeStickyAssignor`, revokes only the partitions that must move. Other consumers keep processing. It can take several rounds before the assignment settles. In a group of more than a few consumers, it limits the pause when one consumer restarts.

### Two timeouts catch two different failures

- **`session.timeout.ms`**: how long the coordinator waits without a **heartbeat** before it declares a consumer dead and starts a rebalance. A background thread sends heartbeats every `heartbeat.interval.ms`. The convention is about one third of `session.timeout.ms`, so a few heartbeats can fail first. This catches a crashed process or a network partition.
- **`max.poll.interval.ms`**: the maximum time **between `poll()` calls**. If processing takes longer, the coordinator removes the consumer from the group. This happens *even when the heartbeat thread still runs on time*. It catches application stalls, not process death.

```
heartbeat: ♥───♥───♥───♥───♥───♥
main:      poll()..[slow work]..poll()
           ^ gap > max.poll.interval.ms:
             removed from the group,
             heartbeats or not
```

Slow processing per batch, such as a slow downstream API call per record, can exceed a low `max.poll.interval.ms`. The group then rebalances again and again under normal load. Three fixes: raise the limit, lower `max.poll.records` so each batch is shorter, or move slow work off the poll thread.

A traditional queue tracks an ack per message per consumer. A Kafka group divides *partitions*, so the partition count caps parallelism, and offset commits per partition track progress.

## Watch out

- People confuse the two timeouts more than any other consumer setting.
- "My live consumer keeps rebalancing" almost always means `max.poll.interval.ms` is too low. It is rarely a heartbeat problem.
- `RangeAssignor` can skew a group that reads several topics. One consumer gets the first range of every topic.
- A config change alone cannot switch assignors on a running group. Use a rolling upgrade.
- During the switch, every member must support the new strategy. Otherwise the group falls back to the common one, or fails to form.
- Deploy the new assignor to the whole group before you remove the old one from the list.

## The task

Write `stub.properties` for the consumer group `clickstream-processors`. It reads the `clickstream` topic. Follow these rules:

1. Set `group.id` to `clickstream-processors`.
2. Use `CooperativeStickyAssignor`, so unaffected consumers keep processing during rebalances. Do not use `RangeAssignor`.
3. Allow up to **5 minutes** (`300000` ms) between `poll()` calls. A slow downstream service must not cause a rebalance.
4. Cap each `poll()` at **500** records, to keep each processing pass short.
5. Detect a dead process within **45 seconds** (`45000` ms).
6. Send about 3 heartbeats in that window. The heartbeat interval times 3 must not exceed the session timeout.
7. Turn off auto-commit. This consumer commits offsets by hand after processing.

The file must not contain the text `TODO`.

Use exactly this content:

```properties
group.id=clickstream-processors
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
session.timeout.ms=45000
heartbeat.interval.ms=15000
max.poll.interval.ms=300000
max.poll.records=500
enable.auto.commit=false
```
