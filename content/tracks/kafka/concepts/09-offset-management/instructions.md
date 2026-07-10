# Offset Management

## What you'll learn

A consumer's "progress" is entirely captured by committed offsets — and where those offsets live, when they get committed, and what happens when there's no committed offset at all are the details that decide whether a restart replays everything, skips data, or resumes cleanly. This lesson covers the `__consumer_offsets` internal topic, the sync/async commit tradeoff, the at-least-once commit-ordering discipline, and `auto.offset.reset` — including the "earliest on a new group" surprise that catches almost everyone once.

## Key concepts

**Committed offsets live in `__consumer_offsets`, an internal Kafka topic — not in the consumer, not in ZooKeeper, not anywhere external.** Every commit (`commitSync`/`commitAsync`, or an auto-commit) is itself a produce to this internal, compacted topic, keyed by `(group.id, topic, partition)`. This is why offset commits survive consumer restarts and even total group membership changes — the state is durably stored in Kafka itself, replicated like any other topic, not held in a client's memory.

**Auto-commit vs manual commit is a tradeoff between simplicity and control.** `enable.auto.commit=true` (the default) commits the latest returned offsets on a timer (`auto.commit.interval.ms`) in the background, regardless of whether your application has actually finished processing those records — this is convenient but, as covered in the delivery-semantics lesson, silently risks at-most-once behavior (committing before processing completes) unless your processing is so fast the window rarely matters. `enable.auto.commit=false` puts commit timing entirely under your control — the correct choice whenever "did we actually finish processing this batch" matters for your durability guarantee.

**The at-least-once commit discipline: commit *after* processing, never before.**

```
records = consumer.poll(timeout);
for (record : records) {
    process(record);          // do the work FIRST
}
consumer.commitSync();        // THEN commit — only now is "progress" durable
```

If the process crashes between `process()` and `commitSync()`, the next consumer to pick up that partition re-reads from the last *committed* offset — reprocessing some records (at-least-once, safe if processing is idempotent downstream) rather than silently skipping anything.

**`commitSync()` vs `commitAsync()` is a latency/reliability tradeoff, and the common production pattern uses both.** `commitSync()` blocks until the broker acknowledges the commit (or throws on failure) — safe, but adds latency to every poll loop iteration. `commitAsync()` fires the commit and moves on immediately, with a callback for failure — faster, but a failed async commit is easy to silently ignore if you don't handle the callback, and async commits can be reordered/overtaken by a later commit if you're not careful. The common pattern: use `commitAsync()` in the main loop for low-latency periodic commits, but call `commitSync()` once, in a `finally` block, right before the consumer shuts down — guaranteeing the *final* commit before exit is durable, even if it's the one time you pay the blocking cost.

**`auto.offset.reset` only matters when there's no valid committed offset to resume from** — a brand-new group, or a committed offset that's aged out of the broker's `offsets.retention.minutes` window, or an offset for a partition the group has never touched. It does **not** apply once a group has a valid committed offset — it's purely the "where do I start from scratch" policy.

| `auto.offset.reset` | Behavior when there's no valid offset |
|---|---|
| `latest` (default) | Start consuming from the **newest** record onward — anything already in the topic before the consumer's first poll is skipped entirely. |
| `earliest` | Start consuming from the **oldest retained** record — the group sees the topic's entire retained history. |
| `none` | Throw an exception instead of guessing — forces an explicit decision rather than silently picking a starting point. |

**The classic surprise: `latest` (the default) means a brand-new consumer group silently skips all pre-existing data.** Spin up a new `group.id` against a topic that's had data flowing into it for days, and with the default `auto.offset.reset=latest`, that new group sees *nothing* until the next new record arrives — no error, no warning, just an empty consumer that looks broken but is behaving exactly as configured. Anyone building a new consumer of an existing topic and expecting to backfill from history needs `auto.offset.reset=earliest` explicitly.

**Seeking and replaying** use `consumer.seek(partition, offset)` (or `seekToBeginning`/`seekToEnd`) to move a partition's read position outside the normal poll flow — the mechanism behind manual reprocessing, disaster recovery replay, or debugging by rewinding to a known point in time (often combined with `offsetsForTimes()` to find the offset closest to a wall-clock timestamp).

## vs other systems

Traditional queues (SQS, RabbitMQ) track acknowledgment per message, with the broker managing redelivery of unacked messages automatically. Kafka inverts this: the consumer explicitly manages and commits a position, and there's no broker-side "redeliver this specific unacked message" — replay means moving the position backward and re-reading everything from there forward, at the partition granularity, not the message granularity.

## Watch out

- **A new consumer group with the default `auto.offset.reset=latest` will appear to work (no errors) while silently missing all historical data** — this is one of the most common "why is my new consumer not seeing anything" support tickets in any Kafka shop.
- **Auto-commit committing before processing finishes is a silent downgrade from at-least-once to at-most-once**, even though `enable.auto.commit=true` is often assumed to be "the safe default."
- **`commitAsync()` without a final `commitSync()` on shutdown** can lose the last batch's progress — the async commit for the final batch might not have completed (or might have failed silently) before the process exits.

## The task

Configure a consumer group `payment-processors` that must process every historical record on a topic it's newly subscribing to (no data can be silently skipped), and that follows strict at-least-once commit discipline.

Write `stub.properties` with:

- `group.id=payment-processors`
- `enable.auto.commit=false` (manual commit control)
- `auto.offset.reset=earliest` (a new group must see the topic's full retained history, not just new records)
- A commented design-answer line stating the commit timing discipline: `# commit-timing=after-processing`
- A commented design-answer line stating the shutdown commit pattern: `# shutdown-commit=sync-final-commit`

Use exactly this shape:

```properties
group.id=payment-processors
enable.auto.commit=false
auto.offset.reset=earliest
# commit-timing=after-processing
# shutdown-commit=sync-final-commit
```
