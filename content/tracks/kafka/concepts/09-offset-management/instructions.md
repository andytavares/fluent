## What you build

You configure the consumer group `payment-processors` in `stub.properties`. It reads the full history of a topic and commits with at-least-once discipline. Committed offsets decide whether a restart replays data, skips data or resumes cleanly. This lesson builds on **Retention and Compaction** and **Delivery Semantics**.

## Key concepts

### Committed offsets live in `__consumer_offsets`

Offsets are not in the consumer, in ZooKeeper or in an external store. Each commit, manual or automatic, is a produce to the internal compacted topic `__consumer_offsets`. The key is `(group.id, topic, partition)`. Kafka replicates this topic like any other, so commits survive restarts and group membership changes.

### Auto-commit trades control for simplicity

`enable.auto.commit=true` is the default. The consumer commits the latest returned offsets on a timer, `auto.commit.interval.ms`, in the background. It does not wait until your application finishes those records. A commit before processing ends is at-most-once behavior.

`enable.auto.commit=false` gives you full control of commit timing. Use it when "did we finish this batch" matters for your guarantee.

### Commit after processing, never before

```
records = consumer.poll(timeout);
for (record : records) {
    // do the work first
    process(record);
}
// then commit: progress is now durable
consumer.commitSync();
```

A crash between `process()` and `commitSync()` is safe. The next consumer re-reads from the last committed offset. It reprocesses some records instead of skipping any. That is at-least-once, safe when downstream processing is idempotent.

### Use `commitAsync()` in the loop and `commitSync()` at shutdown

`commitSync()` blocks until the broker acknowledges the commit, or throws on failure. It is safe but adds latency to each loop.

`commitAsync()` sends the commit and continues at once, with a callback for failure. It is fast, but you can ignore a failed commit by accident. A later commit can also overtake an earlier async commit.

The common pattern: call `commitAsync()` in the main loop. Call `commitSync()` once, in a `finally` block, before the consumer closes. The final commit is then durable.

### `auto.offset.reset` applies only with no valid committed offset

It applies to a new group and to an offset older than the broker's `offsets.retention.minutes`. It also applies to a partition the group never read. A group with a valid committed offset ignores it.

- **`latest`** (default): start at the newest record. The consumer skips all records that exist before its first poll.
- **`earliest`**: start at the oldest retained record. The group sees the full retained history.
- **`none`**: throw an exception. You must make an explicit decision.

### A new group with `latest` skips all existing data

Start a new `group.id` on a topic with days of data. With the default `latest`, the group sees nothing until a new record arrives. There is no error and no warning. To backfill from history, set `auto.offset.reset=earliest`.

### Seek to replay

`consumer.seek(partition, offset)`, `seekToBeginning` and `seekToEnd` move a read position outside the normal poll flow. Use them for manual reprocessing, disaster recovery replay and debugging. `offsetsForTimes()` finds the offset closest to a wall-clock timestamp.

SQS and RabbitMQ track an acknowledgment per message and redeliver unacknowledged messages. Kafka has no per-message redelivery: to replay, move the position back and re-read the partition from there.

## Watch out

- A new group with `auto.offset.reset=latest` shows no errors but misses all historical data.
- Auto-commit before processing finishes silently turns at-least-once into at-most-once.
- `commitAsync()` with no final `commitSync()` can lose the last batch's progress at shutdown.

## The task

The consumer group `payment-processors` subscribes to a topic for the first time. It must process every historical record and commit at-least-once.

Write `stub.properties` with these lines:

1. `group.id=payment-processors`.
2. `enable.auto.commit=false` for manual commit control.
3. `auto.offset.reset=earliest`. The group must see the full retained history. Do not use `latest`.
4. A comment with the commit timing: `# commit-timing=after-processing`.
5. A comment with the shutdown pattern: `# shutdown-commit=sync-final-commit`.

Use exactly this content:

```properties
group.id=payment-processors
enable.auto.commit=false
auto.offset.reset=earliest
# commit-timing=after-processing
# shutdown-commit=sync-final-commit
```
